<?php

/*
|--------------------------------------------------------------------------
| Game Unit Test
|--------------------------------------------------------------------------
|
| This file should contain unit tests for the Game model.
| It should test all the functions which are responsible for the game logic.
|
*/

use App\Enums\GameStatusEnum;
use App\Enums\GameTypesEnum;
use App\Models\Game;


// Create game before each test
beforeEach(function () {
    $this->game = Game::create([
        'status' => GameStatusEnum::NO_STATUS,
        'room_code' => '1111',
        'type' => GameTypesEnum::PVP,
        'game_duration' => 10
    ]);
});

// Delete game after each test
afterEach(function () {
    $this->game->delete();
});

it('can generate initial fen',function(){

    // Ensure that no FEN is set
    expect($this->game->initial_fen)->toBeNull();

    // Generate initial FEN with method
    $this->game->generateInitialFen();

    // Ensure that FEN is set
    expect($this->game->initial_fen)->not->toBeNull();

    // Ensure that FEN is valid
    $board = \Chess\FenToBoard::create($this->game->initial_fen);
    expect($board->toFen())->toBe($this->game->initial_fen);
});

it('can retrieve game info from game',function(){

    // Create game info
    $user = \App\Models\User::factory()->create();
    $gameInfo = $this->game->gameInfos()->create([
        'color' => 'w',
        'user_id' => $user->id,
    ]);

    // Retrieve game info from game
    $gameInfoFromGame = $this->game->gameInfos()->first();

    // Ensure that game info is retrieved
    expect($gameInfoFromGame->id)->toBe($gameInfo->id);
});

it('can generate unique room code', function (){

    /** @var Game $game */
    $game = $this->game;

    // Generate room code
    $roomCode = $game->generateUniqueRoomCode();

    // Ensure that room code is generated
    expect($roomCode)->not->toBeNull();
});



it('can play AI move',function(){

    /** @var Game $game */
    $game = $this->game;

    // Edit game info to be pvb and set default chessboard position
    $game->type = GameTypesEnum::PVB;
    $game->initial_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    $game->save();

    // Play LAN first move as white (not AI)
    $game->playMove('c2c4');
    $boardBeforeAiMove = $game->getBoard();
    expect($boardBeforeAiMove)->not->toBeNull();

    // Check if AI played move
    $game->playAiMove();
    $boardAfterAiMove = $game->getBoard();

    // Ensure that AI played move
    expect($boardBeforeAiMove->getMovetext())->not->toBe($boardAfterAiMove->getMovetext());
});

it('can undo move',function(){

    /** @var Game $game */
    $game = $this->game;

    // Edit game info to be pvb and set default chessboard position
    $game->type = GameTypesEnum::PVB;
    $game->initial_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    $game->save();

    // Play LAN first move as white (not AI)
    $game->playMove('c2c4');
    $boardBeforeAiMove = $game->getBoard();
    expect($boardBeforeAiMove)->not->toBeNull();

    // Check if AI played move
    $game->playAiMove();
    $boardAfterAiMove = $game->getBoard();

    // Ensure that AI played move
    expect($boardBeforeAiMove->getMovetext())->not->toBe($boardAfterAiMove->getMovetext());

    // Undo move
    $game->undo();

    // Ensure that move is undone
    expect($game->getBoard()->getMovetext())->toBe('');
});


it('can detect pvb or pvp', function (){

    /** @var Game $game */
    $game = $this->game;
    $game->type = GameTypesEnum::PVB;
    $game->save();

    // Ensure that game is pvb
    expect($game->isPvb())->toBeTrue();

    // Change to pvp
    $game->type = GameTypesEnum::PVP;
    $game->save();

    // Ensure that game is pvp
    expect($game->isPvp())->toBeTrue();
});

it('can retrieve correct player info', function (){

    /** @var Game $game */
    $game = $this->game;
    $game->type = GameTypesEnum::PVP;
    $game->save();

    // Create user and log in with it
    $user = \App\Models\User::factory()->create();
    \Illuminate\Support\Facades\Auth::login($user);

    // Create game info for logged user
    $game->gameInfos()->create([
        'user_id' => $user->id,
        'color' => 'w',
    ]);

    // Create game info for other user
    $otherUser = \App\Models\User::factory()->create();
    $game->gameInfos()->create([
        'user_id' => $otherUser->id,
        'color' => 'b',
    ]);

    // Ensure that logged user is retrieved
    expect($game->getLoggedUserPlayerInfo()->user_id)->toBe($user->id);

    // Ensure that other user is retrieved
    expect($game->getOpponentPlayerInfo()->user_id)->toBe($otherUser->id);

});


//it('can detect checkmate, stalemate while playing with bot', function(){
//
//    /** @var Game $game */
//    $game = $this->game;
//
//    // Edit game info to be pvb and set default chessboard position
//    $game->type = GameTypesEnum::PVB;
//    $game->initial_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
//    $game->save();
//
//    // Play LAN first move as white (not AI)
//    $game->playMove('c2c4');
//    $boardBeforeAiMove = $game->getBoard();
//    expect($boardBeforeAiMove)->not->toBeNull();
//
//    // Check if AI played move
//    $this->game->playAiMove();
//    $boardAfterAiMove = $game->getBoard();
//
//    // Ensure that AI played move
//    expect($boardBeforeAiMove->getMovetext())->not->toBe($boardAfterAiMove->getMovetext());
//
//
//});
