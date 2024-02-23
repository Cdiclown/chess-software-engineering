<?php

namespace App\Models;

use App\Enums\GameStatusEnum;
use App\Enums\GameTypesEnum;
use Chess\FenToBoard;
use Chess\Play\SanPlay;
use Chess\UciEngine\Stockfish;
use Chess\Variant\Classical\Board;
use Chess\Variant\Classical\PGN\AN\Color;
use Chovanec\Rating\Rating;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Log;
use Str;

/**
 * @property string $status
 * @property string $pgn
 * @property string $initial_fen
 * @property string $move_text
 */
class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'status',
        'room_code',
        'pgn',
        'last_fen',
        'type',
        'move_text',
        'initial_fen',
        'game_start_time',
        'game_duration'
    ];

    protected $casts = [
        'type' => GameTypesEnum::class
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */
    public function gameInfos(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(GameInfo::class);
    }

    public function users(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'game_infos');
    }

    /*
    |--------------------------------------------------------------------------
    | Helper functions
    |--------------------------------------------------------------------------
    */
    public function generateInitialFen($difference = 0): void
    {
        $board = FenToBoard::create($this->generateRandomFENString($difference));
        $this->initial_fen = $board->toFen();
        $this->last_fen = $this->initial_fen;
        $this->save();
    }

    public function playAiMove(): void
    {
        // Check if match is over
        if($this->status == 'white_win' || $this->status == 'black_win')
        {
            return;
        }

        // Load status from pgn
        $board = $this->getBoard();

        // Initialize stockfish
        $stockfish = (new Stockfish($board))
            ->setOptions([
                'Skill Level' => 1
            ])
            ->setParams([
                'depth' => 2
            ]);

        // Play move
        $lan = $stockfish->play($board->toFen());
        // Clean lan, keeping only letters and numbers (sometimes stockfish returns lan with \n)
        $lan = preg_replace('/[^a-zA-Z0-9]/', '', $lan);

        // Play move on board
        $board->playLan('b', $lan);

        //check if game is over
        if($board->isMate() || $board->isStalemate()) {
            $this->setWinner(Color::B);
        }

        // Save to database
        $this->saveBoardOnDb($board);
    }

    public function getBoard()
    {
        // Get game from database
        $game = Game::find($this->id);

        // Check if move_text is null
        if($game->move_text == null) {

            // If move_text is null, this is the first move, just create board from initial FEN
            return FenToBoard::create($game->initial_fen);
        }
        else
        {
            // Create board from initial FEN and play move_text
            $board = FenToBoard::create($game->initial_fen);
            return (new SanPlay($game->move_text,$board))
                ->validate()
                ->getBoard();
        }
    }

    /**
     * Plays move as logged user on current game
     * @param $move
     * @return void
     */
    public function playMove($move): void
    {
        // Check if user is logged
        $userIsLogged = User::isLoggedIn();

        // Get player color
        $playerColor = !$userIsLogged ? 'w' : $this->getLoggedUserPlayerInfo()->color;

        // Get board
        $board = $this->getBoard();

        // Play move
        $board->playLan($playerColor, $move);

        // Get game info
        $game_info = null;
        if ($userIsLogged) {
            $game_info = $this->gameInfos()->where('user_id', User::getLoggedUser()->id)->first();
        }

        // Check if with this move, current player won on stalemated the opponent
         if($board->isMate() || $board->isStalemate()) {

            // Get logged player color
            $loggedPlayerColor = auth()->user() == null ? 'w' : $this->getLoggedUserPlayerInfo()->color;
            $this->setWinner($loggedPlayerColor);
        }

        // Update game infos if user is logged
        if ($userIsLogged) {

            // Update match start time if not set
            if ($this->game_start_time == null) {
                $this->game_start_time = now();
            }

            // Update last move at
            $game_info->last_move_at = now();

            // Increment moves count
            $game_info->moves_count++;
            $game_info->save();
        }
        // Save to database
        $this->saveBoardOnDb($board);
    }


    public function saveBoardOnDb($board): void
    {
        // Update game last FEN
        $this->last_fen = $board->toFen();

        // Update move text
        $this->move_text = $board->getMovetext();

        // Build pgn with FEN and move text
        $this->pgn = $this->move_text ? "[Site \"Osi-Chess\"]\n[FEN \"" . $this->initial_fen . "\"]\n" . $this->move_text : null;

        // Save game
        $this->save();
    }

    /**
     * Generates a random FEN string
     * @param int $difference
     * @return string
     */
    public static function generateRandomFenString(int $difference = 0) : string {

        // Assign values to pieces
        $pieceValues = [
            'k' => 0,
            'q' => 9,
            'r' => 5,
            'b' => 3,
            'n' => 3,
            'p' => 1,
            'K' => 0,
            'Q' => 9,
            'R' => 5,
            'B' => 3,
            'N' => 3,
            'P' => 1,
        ];

        // Calculate values for white and black pieces
        $whiteValue = 39 + floor($difference / 2);
        $blackValue = 39 - ceil($difference / 2);

        // Initialize pieces without kings
        $whitePieces = ["P", "N", "B", "R", "Q"];
        $blackPieces = ["p", "n", "b", "r", "q"];

        // Initialize piece arrays
        $whiteConfiguration = [];
        $blackConfiguration = [];

        // Add the king to the configuration
        $whiteConfiguration[] = 'K';
        $blackConfiguration[] = 'k';

        for ($i = 0; $i < 15; $i++) {
            self::addPiece($whitePieces, $whiteConfiguration, $whiteValue, 15 - $i, $pieceValues);
            self::addPiece($blackPieces, $blackConfiguration, $blackValue, 15 - $i, $pieceValues);
        }

        // Shuffle the order of pieces
        shuffle($whiteConfiguration);
        shuffle($blackConfiguration);

        //find black king position
        $blackKingPosition = array_search('k', $blackConfiguration);
        //check if is not in the 4th position
        if($blackKingPosition != 4) {
            $newPos = 4;
            $blackConfiguration[$blackKingPosition] = $blackConfiguration[$newPos];
            $blackConfiguration[$newPos] = 'k';
        }

        //find white king position
        $whiteKingPosition = array_search('K', $whiteConfiguration);
        //check if is not in the 12th position
        if($whiteKingPosition != 12) {
            $newPos = 12;
            $whiteConfiguration[$whiteKingPosition] = $whiteConfiguration[$newPos];
            $whiteConfiguration[$newPos] = 'K';
        }

        $whiteConfiguration = implode("", $whiteConfiguration);
        $whiteConfiguration = substr($whiteConfiguration, 0, 8) . "/" . substr($whiteConfiguration, 8, 8);
        $blackConfiguration = implode("", $blackConfiguration);
        $blackConfiguration = substr($blackConfiguration, 0, 8) . "/" . substr($blackConfiguration, 8, 8);

        // Generate the FEN string
        return $blackConfiguration . "/8/8/8/8/" . $whiteConfiguration . " w - - 0 1";
    }

    public static function addPiece(&$pieces, &$configuration, &$value, $piecesLeft, $values) {
        //select random piece from available
        $index = array_rand($pieces, 1);
        $piece = $pieces[$index];

        if ($value - $values[$piece] >= $piecesLeft - 1) {
            $value = $value - $values[$piece];
            $configuration[] = $piece;
            return $piece;
        } else {
            //remove piece from available
            unset($pieces[$index]);
            return self::addPiece($pieces, $configuration, $value, $piecesLeft, $values);
        }
    }

    public function isPvb(): bool
    {
        return $this->type == GameTypesEnum::PVB;
    }

    public function isPvp(): bool
    {
        return $this->type == GameTypesEnum::PVP;
    }

    public function undo(): void
    {
        // Get board
        $board = $this->getBoard();

        // Undo move
        $board->undo();
        $board->undo();

        // If player is logged update game infos
        if(User::isLoggedIn())
        {
            // Get game info
            $game_info = $this->getLoggedUserPlayerInfo();

            // Decrement moves count
            $game_info->moves_count++;
            $game_info->save();
        }

        // Save to database
        $this->saveBoardOnDb($board);
    }

    public function getLoggedUserPlayerInfo(): ?GameInfo
    {
        if(User::isLoggedIn())
        {
            return $this->gameInfos()->where('user_id', User::getLoggedUser()->id)->first();
        }
        return null;
    }

    public function getOpponentPlayerInfo(): ?GameInfo
    {
        if(User::isLoggedIn())
        {
            return $this->gameInfos()->where('user_id', '!=', User::getLoggedUser()->id)->first();
        }
        return null;
    }

    public function isPlayerInGame(): bool
    {
        return $this->getLoggedUserPlayerInfo() != null;
    }

    public function opponentJoined(): bool
    {
        return $this->getOpponentPlayerInfo() != null;
    }

    public static function generateUniqueRoomCode(): string
    {
        $room_code = strtoupper(Str::random(5));
        while(Game::where('room_code', $room_code)->first() != null){
            // @codeCoverageIgnoreStart
            $room_code = strtoupper(strtoupper(Str::random(5)));
            // @codeCoverageIgnoreEnd
        }
        return $room_code;
    }

    public function isCreatedByGuest(): bool
    {
        return $this->gameInfos()->count() == 0;
    }

    public function setWinner(string $winnerColor): void
    {
        // Get game infos
        $whiteGameInfo = $this->gameInfos()->where('color', Color::W)->first();
        $blackGameInfo = $this->gameInfos()->where('color', Color::B)->first();

        // Set winner
        if($winnerColor == 'w')
        {
            $this->status = GameStatusEnum::WHITE_WIN->value;
            $this->save();

            if($whiteGameInfo != null)
            {
                $whiteGameInfo->winner = 1;
                $whiteGameInfo->save();
            }
            if($blackGameInfo != null)
            {
                $blackGameInfo->winner = 0;
                $blackGameInfo->save();
            }

        }
        else
        {
            $this->status = GameStatusEnum::BLACK_WIN->value;
            $this->save();

            if($whiteGameInfo != null)
            {
                $whiteGameInfo->winner = 0;
                $whiteGameInfo->save();
            }
            if($blackGameInfo != null)
            {
                $blackGameInfo->winner = 1;
                $blackGameInfo->save();
            }
        }

        // Update ELO
        if($whiteGameInfo != null && $blackGameInfo != null)
        {
            // Get white user and black user
            $whiteUser = $whiteGameInfo->user;
            $blackUser = $blackGameInfo->user;
            $result = $winnerColor == Color::W ? 1 : 0;

            // Calc new ratings
            $ratings = new Rating($whiteUser->ELO, $blackUser->ELO, $result, 1 - $result);
            //Log::error();
            $whiteUser->ELO = $ratings->getNewRatings()['a'];
            $blackUser->ELO = $ratings->getNewRatings()['b'];
            $whiteUser->save();
            $blackUser->save();
        }

        $this->save();

    }

    public function endGame()
    {
        // End game
        $color = $this->getLoggedUserPlayerInfo() != null ? $this->getLoggedUserPlayerInfo()->color : Color::W;
        $this->setWinner($color == Color::W ? Color::B : Color::W);
    }

    public function getLoggedUserTimeLeft()
    {
        // Get player info
        $loggedUserPlayerInfo = $this->getLoggedUserPlayerInfo();
        $opponentPlayerInfo = $this->getOpponentPlayerInfo();
        if($loggedUserPlayerInfo == null || $opponentPlayerInfo == null)
        {
            return null;
        }

        // Update time left
        $turnColor = $this->status == GameStatusEnum::WHITE_TURN->value ? Color::W : Color::B;
        if ($loggedUserPlayerInfo->color == $turnColor) {
            return $loggedUserPlayerInfo->time_left - (now()->diffInSeconds($opponentPlayerInfo->last_move_at));
        } else {
            return $loggedUserPlayerInfo->time_left;
        }

    }

    public function getOpponentTimeLeft()
    {
        // Get player info
        $loggedUserPlayerInfo = $this->getLoggedUserPlayerInfo();
        $opponentPlayerInfo = $this->getOpponentPlayerInfo();
        if($loggedUserPlayerInfo == null || $opponentPlayerInfo == null)
        {
            return null;
        }

        // Update time left
        $turnColor = $this->status == GameStatusEnum::WHITE_TURN->value ? Color::W : Color::B;
        if ($opponentPlayerInfo->color == $turnColor) {
            return $opponentPlayerInfo->time_left - (now()->diffInSeconds($loggedUserPlayerInfo->last_move_at));
        } else {
            return $opponentPlayerInfo->time_left;
        }
    }

    public function updateLoggedUserTimeLeft(): void
    {
        // Get player info
        $loggedUserPlayerInfo = $this->getLoggedUserPlayerInfo();
        $opponentPlayerInfo = $this->getOpponentPlayerInfo();

        // Update time left
        $loggedUserPlayerInfo->time_left = $loggedUserPlayerInfo->time_left - (now()->diffInSeconds($opponentPlayerInfo->last_move_at));
        $loggedUserPlayerInfo->save();
    }



}
