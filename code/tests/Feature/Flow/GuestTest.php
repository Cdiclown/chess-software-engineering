<?php

use App\Models\Game;

beforeEach(function () {
    \App\Models\Game::all()->each->delete();
});

it('can enter the app without logging in and play a PVB game', function(){

    // Load the dashboard page without logging in
    $this->get('/')->assertRedirect('/dashboard');

    // Ensure cannot create a PVP game
    $this->post('games', [
        'type' => 'pvp',
        'game_duration' => 60  * 60 * 2,
    ])->assertStatus(403);

    // Ensure cannot see the leaderboard
    $this->get('leaderboard')
        ->assertRedirect('login');

    // Ensure cannot see the profile
    $this->get('profile')
        ->assertRedirect('login');

    // Ensure no matches in database
    assert(0 === Game::count());

    // Create a PVB game
    $this->post('games', [
        'type' => 'pvb',
        'difficulty' => 1,
    ]) ->assertStatus(302); // This should redirect to game page

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

    // Make a move
    $gamePageAfterMove = $this->post('games/' . $game->id . '/move', [
        'move' => 'e2e4',
    ])->assertSuccessful();

    // Assert that player moved

    // Ensure that game is over after checkmate
    $game->initial_fen = 'r1b4k/pppp1ppp/2n2q2/8/3P4/2N5/PPP2PPP/R1BQR1K1 w - - 0 1';
    $game->last_fen = 'r1b4k/pppp1ppp/2n2q2/8/3P4/2N5/PPP2PPP/R1BQR1K1 w - - 0 1';
    $game->move_text = "";
    $game->pgn = "";
    $game->save();
    $game->refresh();

    // Post a move that will result in checkmate
    $gamePageAfterMove = $this->post('games/' . $game->id . '/move', [
        'move' => 'e1e8',
    ]);

    // Assert that game is over
    $game->refresh();
    assert($game->status === 'white_win');

    // Assert that now cannot make a move
    $this->post('games/' . $game->id . '/move', [
        'move' => 'e1e8',
    ])->assertStatus(400);

});
