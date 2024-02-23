<?php

namespace App\Http\Controllers;

use App\Enums\GameTypesEnum;
use App\Events\BlackPlayerJoinedEvent;
use App\Events\NewMoveEvent;
use App\Http\Requests\NewMoveRequest;
use App\Models\Game;
use Chess\FenToBoard;
use Chess\Variant\Classical\PGN\AN\Color;
use App\Enums\GameStatusEnum;
use App\Http\Requests\CreateGameRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Str;

class GameController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Create new game
     * @param CreateGameRequest $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function create(CreateGameRequest $request)
    {

        // Create new game
        $game = Game::create([
            'status' => GameStatusEnum::NO_STATUS,
            'room_code' => Game::generateUniqueRoomCode(),
            'type' => $request->type,
            'game_duration' => $request->game_duration,
        ]);

        // Create game info object if logged user is creating the game
        if (User::isLoggedIn()) {

            // Create game info for white player
            $game->gameInfos()->create([
                'user_id' => User::getLoggedUser()->id,
                'color' => Color::W,
                'difficulty' => $request->difficulty,
            ]);
        } // If guest, save in cache his ownership of the game and send cookie to the client
        else {

            // Generate secret and save in cache and cookie
            $secret = Str::random(40);
            \Cookie::queue('game_' . $game->id . '_owner', $secret, 60 * 48);
            Cache::put('game_' . $game->id . '_owner', $secret, 60 * 60 * 48);
        }

        // Generate initial FEN
        $game->generateInitialFen($request->type == GameTypesEnum::PVB->value ? -$request->difficulty : 0);

        // Black player infos are created when black player joins the game

        // Now redirect to game page
        return Inertia::location('/games/' . $game->id);
    }

    /**
     * Load the game page when game is already created
     * @param $gameId
     * @return Response|\Symfony\Component\HttpFoundation\Response
     */
    public function show($gameId)
    {
        // Get game object
        $game = Game::find($gameId);

        // Check if game exists
        if ($game == null)
            return $this->dashboard();

        // PVB
        if ($game->isPvb() && $game->isCreatedByGuest()) {

            // Check if not testing environment
            if (app()->environment() != 'testing') {

                // Check if guest is owner
                $secret = \Cookie::get('game_' . $game->id . '_owner');
                if (($secret == null || $secret != Cache::get('game_' . $game->id . '_owner'))) {
                    // If not owner, redirect to dashboard
                    return $this->dashboard();
                }
            }
        }
        // PVP
        else{

            // @codeCoverageIgnoreStart


            // Guest trying to join a PVP game
            if (!User::isLoggedIn())
            {
                return $this->dashboard();
            }

            // Create black player only if
            if ($game->gameInfos->count() == 1 && !$game->isPlayerInGame())   // black player is not already present
            {

                // Create game info for black player
                $game->gameInfos()->create([
                    'user_id' => User::getLoggedUser()->id,
                    'color' => Color::B,
                    'difficulty' => $game->gameInfos[0]->difficulty,
                ]);

                // Send ws event to white player
                broadcast(new BlackPlayerJoinedEvent($game->getLoggedUserPlayerInfo()->load('user')))->toOthers();

                // Set game status to white turn
                $game->status = GameStatusEnum::WHITE_TURN->value;
                $game->save();

            } // Game is full and logged user is not player

            // Game is full and logged user is not player
            else if (!$game->isPlayerInGame()) {
               return Inertia::location('/dashboard');
            }

            // @codeCoverageIgnoreEnd
        }

        // Load game infos
        $game->load('gameInfos.user');

        // Update time left if PVP
        if ($game->isPvp() && $game->status != GameStatusEnum::NO_STATUS->value)
        {
            // Get time left
            $firstGameinfo = $game->gameInfos[0];
            if($firstGameinfo->user_id == User::getLoggedUser()->id)
            {
                $game['gameInfos'][0]['time_left'] = $game->getLoggedUserTimeLeft();
                if($game->gameInfos->count() > 1)
                    $game['gameInfos'][1]['time_left'] = $game->getOpponentTimeLeft();
            }
            else{
                $game['gameInfos'][1]['time_left'] = $game->getLoggedUserTimeLeft();
                $game['gameInfos'][0]['time_left'] = $game->getOpponentTimeLeft();
            }
        }

        // Return game page
        return Inertia::render('Game', [
            'game' => $game
        ]);
    }

    /**
     * Post new move and return updated game state (if versus AI then AI will make a move)
     * @return JsonResponse
     */
    public function move(NewMoveRequest $request, $gameId)
    {
        // Get game
        $game = Game::find($gameId);

        // If PVP and other player is not in game, return error
        if ($game->isPvp() && !$game->opponentJoined())
            return response()->json(['error' => 'Other player is not in game'], 400);

        // If match is closed return error (can't play move)
        if ($game->status == GameStatusEnum::WHITE_WIN->value || $game->status == GameStatusEnum::BLACK_WIN->value)
            return response()->json(['error' => 'Match is closed'], 400);

        // Play requested move
        $game->playMove($request->move);


        // PVB
        if ($game->type == GameTypesEnum::PVB) {
            $game->playAiMove();
        }
        // PVP
        else {

            // Switch black and white turn
            if ($game->status == GameStatusEnum::WHITE_TURN->value)
                $game->status = GameStatusEnum::BLACK_TURN->value;
            else
                $game->status = GameStatusEnum::WHITE_TURN->value;
            $game->save();


            // Update current player time left
            $game->updateLoggedUserTimeLeft();
            $game->load('gameInfos.user');

            // Send move to other player with ws
            broadcast(new NewMoveEvent($game))->toOthers();
        }

        $game->load('gameInfos.user');
        return response()->json($game);
    }

    public function undo($gameId)
    {
        // Get game
        $game = Game::find($gameId);

        // Ensure match is PVB
        if ($game->type != GameTypesEnum::PVB)
            return response()->json(['error' => 'Match is not PVB'], 400);

        // Undo move
        $game->undo();
        $game->load('gameInfos.user');

        return response()->json($game);
    }

    public function resign($gameId)
    {
        // Get game
        $game = Game::find($gameId);

        // Check if logged player is in game
        $playerInGame = $game->getLoggedUserPlayerInfo() != null;
        if (!$playerInGame)
            return response()->json(['error' => 'Player is not in game'], 400);

        // Resign
        $game->endGame();

        return response()->json($game);
    }

    /**
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function dashboard(): \Symfony\Component\HttpFoundation\Response
    {
        return Inertia::location('/dashboard');
    }

    public function dailychallenge()
    {
        // Get daily challenge
        $dailyChallenge = \App\Models\DailyChallenge::where('for_day', now()->toDateString())->first();

        // Check if user can play daily challenge
        if($dailyChallenge == null || $dailyChallenge->getAttemptsForUser(User::getLoggedUser()) >= 3)
            return response()->json(['error' => 'Daily challenge not available'], 400);

        // Check if user has an open daily challenge game
        $userAttempts = $dailyChallenge->userAttempts()->where('user_id', User::getLoggedUser()->id)->get();
        foreach ($userAttempts as $attempt)
        {
            if($attempt->game->status == GameStatusEnum::NO_STATUS->value)
                return Inertia::location('/games/' . $attempt->game->id);
        }

        // Create game for daily challenge
        $game = Game::create([
            'status' => GameStatusEnum::NO_STATUS,
            'room_code' => Game::generateUniqueRoomCode(),
            'type' => GameTypesEnum::PVB,
            'game_duration' => 0,
        ]);

        // Create game info for white player
        $game->gameInfos()->create([
            'user_id' => User::getLoggedUser()->id,
            'color' => Color::W,
            'difficulty' => 0,
        ]);

        // Set fen
        $game->initial_fen = $dailyChallenge->initial_fen;
        $game->save();

        // Increase attempts for user
        $dailyChallenge->userAttempts()->create([
            'user_id' => User::getLoggedUser()->id,
            'daily_challenge_id' => $dailyChallenge->id,
            'game_id' => $game->id,
        ]);

        // Return daily challenge
        return Inertia::location('/games/' . $game->id);
    }

    public function timeLeft($gameId)
    {
        // Get game
        $game = Game::find($gameId);

        if($game->status == GameStatusEnum::NO_STATUS->value)
            return response()->json([]);

        $loggedUserTimeLeft = $game->getLoggedUserTimeLeft();
        $opponentTimeLeft = $game->getOpponentTimeLeft();

        return response()->json([
            'loggedUserTimeLeft' => $loggedUserTimeLeft,
            'opponentTimeLeft' => $opponentTimeLeft,
        ]);

    }
}
