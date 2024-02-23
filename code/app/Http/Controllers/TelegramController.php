<?php

// @codeCoverageIgnoreStart


namespace App\Http\Controllers;

use App\Enums\GameStatusEnum;
use App\Enums\GameTypesEnum;
use App\Models\Game;
use App\Models\GameInfo;
use App\Models\User;
use Chess\Media\BoardToPng;
use Chess\Variant\Classical\PGN\AN\Color;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Telegram\Bot\FileUpload\InputFile;
use Telegram\Bot\Laravel\Facades\Telegram;

// @codeCoverageIgnoreStart

class TelegramController extends Controller
{
    public function start(User $user, string $chatId)
    {
        Telegram::sendMessage([
            'chat_id' => $chatId,
            'text' =>  'Welcome to OsiChess! ' .PHP_EOL. 'Start a new game by typing /startgame'
        ]);
    }

    public function startGame(User $user, int $chatId)
    {
        if(self::checkAlreadyStartedGame($user, $chatId)){
            return;
        }

        // Prompt difficulty
        Telegram::sendMessage([
            'chat_id' => $chatId,
            'text' =>  'Choose difficulty' . PHP_EOL
                . '1 - You have far better pieces' . PHP_EOL
                . '2 - You have better pieces' . PHP_EOL
                . '3 - Equal match' . PHP_EOL
                . '4 - AI has better pieces' . PHP_EOL
                . '5 - AI has far better pieces',
            'reply_markup' => json_encode([
                'inline_keyboard' => [
                    [
                        ['text' => '1', 'callback_data' => '20'],
                        ['text' => '2', 'callback_data' => '10'],
                        ['text' => '3', 'callback_data' => '0'],
                        ['text' => '4', 'callback_data' => '-10'],
                        ['text' => '5', 'callback_data' => '-20'],
                    ]
                ]
            ])
        ]);
    }

    public function createNewGame(User $user, string $chatId, string $difficulty)
    {
        if(self::checkAlreadyStartedGame($user, $chatId)){
            return;
        }

        // Actually create the game
        $game = Game::create([
            'status' => GameStatusEnum::NO_STATUS,
            'room_code' => Game::generateUniqueRoomCode(),
            'type' => GameTypesEnum::PVB,
        ]);

        // Create game info for white player
        $game->gameInfos()->create([
            'user_id' => $user->id,
            'color' => Color::W,
            'difficulty' => $difficulty,
        ]);

        // Generate initial FEN
        $game->generateInitialFen($difficulty);

        // Send board to user as image
        self::sendActiveChessboard($user, $chatId);
    }

    public function endActiveGame(User $user, int $chatId)
    {

        // Check if user has an active game already
        $activeGame = self::getActiveGame($user);
        if(!$activeGame){
            Telegram::sendMessage([
                'chat_id' => $chatId,
                'text' =>  'You do not have an active game'
            ]);
            return;
        }

        // End game
        $activeGame->endGame();

        Telegram::sendMessage([
            'chat_id' => $chatId,
            'text' =>  'Game ended'
        ]);
    }

    public function makeMove(User $user, int $chatId, string $move)
    {
        $game = self::getActiveGame($user);

        // Play requested move
        $game->playMove(strtolower($move));
        $game->playAiMove();

        // Send board to user as image
        self::sendActiveChessboard($user, $chatId);
    }


    public function commandNotFound(string $chatId)
    {
        Telegram::sendMessage([
            'chat_id' => $chatId,
            'text' =>  'Command not found or move not valid, type /start for a list of commands'
        ]);
    }


    private static function checkAlreadyStartedGame(User $user, string $chatId)
    {
        // Check if user has an active game already
        $activeGame = self::getActiveGame($user);
        if($activeGame){

            // Prompt in order to
            Telegram::sendMessage([
                'chat_id' => $chatId,
                'text' =>  'You already have an active game, what do you want to do?',
                'reply_markup' => json_encode([
                    'inline_keyboard' => [
                        [
                            ['text' => 'Continue', 'callback_data' => '/continue'],
                            ['text' => 'End', 'callback_data' => '/end'],
                        ]
                    ]
                ])
            ]);
            return true;
        }

        return false;
    }

    private static function getActiveGame(User $user) : ?Game
    {
        // Check if user has an active game already
        $activeGameInfo = $user->gameInfos()->where('winner', null)->first();
        return $activeGameInfo?->game;
    }

    private static function sendActiveChessboard(User $user, $chatId)
    {
        $game = self::getActiveGame($user);
        if(!$game){
            return;
        }

        // Create board image to temporary file
        $tmpDir = sys_get_temp_dir();
        $fileName = 'osi-game-'.$game->id;
        $path = $tmpDir . '/' . $fileName . '.png';
        (new BoardToPng($game->getBoard()))->output($tmpDir,$fileName);

        // Send board to user as image
        Telegram::sendPhoto([
            'chat_id' => $chatId,
            'photo' => InputFile::create($path),
        ]);

        // Send text
        Telegram::sendMessage([
            'chat_id' => $chatId,
            'text' =>  'Your turn, send your move in algebraic notation (e.g. e2e4)'
        ]);
    }

    public function continueActiveGame(User $user, int $chatId)
    {
        // Check if user has an active game already
        $activeGame = self::getActiveGame($user);
        if(!$activeGame){
            Telegram::sendMessage([
                'chat_id' => $chatId,
                'text' =>  'You do not have an active game'
            ]);
            return;
        }

        // Send board to user as image
        self::sendActiveChessboard($user, $chatId);
    }
}

// @codeCoverageIgnoreEnd

