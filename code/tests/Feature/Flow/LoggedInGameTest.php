<?php

use App\Models\Game;
use Chess\Media\BoardToPng;

beforeEach(function () {
    \App\Models\Game::all()->each->delete();
});

it('can enter the app as logged user, play PVP, see leaderboard and profile', function () {

    // Create logged user
    $whitePlayer = \App\Models\User::factory()->create();
    $this->actingAs($whitePlayer);


    // Ensure no matches in database
    assert(0 === Game::count());

    // Create a PVP game
    $this->post('games', [
        'type' => 'pvp',
        'game_duration' => 60  * 60 * 2,
    ]) ->assertRedirect();

    // Ensure game is created
    assert(1 === Game::count());

    // Ensure can see the game page
    $game = Game::first();
    $gamePageBeforeMove = $this->get('games/' . $game->id);
    $gamePageBeforeMove->assertInertia(fn ($page) => $page
            ->component('Game')
        );

    // Set canonical board
    $game->initial_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    $game->save();

    // Create black player
    $blackPlayer = \App\Models\User::factory()->create();

    // Join game as black player
    $this->actingAs($blackPlayer);
    $this->get('games/' . $game->room_code . '/join')
        ->assertRedirect('games/' . $game->id);

    // Get game again
    $this->get('games/' . $game->id)
        ->assertInertia(fn ($page) => $page
            ->component('Game')
            ->where('game.game_infos.0.user.id', $whitePlayer->id)
            ->where('game.game_infos.1.user.id', $blackPlayer->id)
        );

    // Ensure now there are 2 game infos
    assert(2 === $game->gameInfos->count());

    // Altern between players and finish game
    $players = [$whitePlayer, $blackPlayer];

    // Stolen from internet
    $moves = ['e2e4', 'e7e6', 'd2d4', 'd7d5', 'b1c3', 'd5e4', 'c3e4', 'b8d7', 'g1f3', 'g8f6', 'e4f6',
        'd7f6', 'c1e3', 'f6d5', 'e3d2', 'c7c5', 'f1b5', 'c8d7', 'b5d7', 'd8d7', 'c2c4', 'd5b6',
        'a1c1', 'f8e7', 'd4c5', 'e7c5', 'b2b4', 'c5e7', 'c4c5', 'b6d5', 'f3e5', 'd7c7', 'd1a4',
        'e8f8', 'e5c4', 'h7h5', 'e1g1', 'h5h4', 'h2h3', 'h8h5', 'f1e1', 'a7a6', 'a4d1', 'h5f5',
        'd1e2', 'a8d8', 'a2a3', 'f8g8', 'c4e5', 'e7f6', 'e5f3', 'c7c6', 'c1d1', 'c6a4', 'd2c1',
        'd8d7', 'e2d3', 'd5b6', 'd3d7', 'f6a1','d7d5', 'g8f8', 'd5d7','a4b3' , 'd7d8'];
    foreach($moves as $i => $move)
    {
        // Update player
        $playerIndex = ($i) % 2;

        // Log in as player
        $this->actingAs($players[$playerIndex]);

        // Make a move
        $gamePageAfterMove = $this->post('games/' . $game->id . '/move', [
            'move' => $move,
        ]);

        // Ensure that the board has changed
        assert($gamePageBeforeMove !== $gamePageAfterMove);


        // Update board
        $gamePageBeforeMove = $gamePageAfterMove;
    }

    // Save game png for debugging
    //(new BoardToPng($game->getBoard()))->output('.');


    // Ensure game is finished
    $game->refresh();
    assert($game->status === 'white_win');
});
