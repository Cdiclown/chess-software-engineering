<?php

use Illuminate\Testing\Assert;

beforeEach(function () {
    \App\Models\Game::all()->each->delete();
});


it('can create a pvb game', function () {

    // Ensure no game are present in database
    Assert::assertCount(0, \App\Models\Game::all());

    // Ensure cannot create game without difficulty
    $this->post('games', [
        'type' => 'pvb',
    ])->assertRedirect();

    // Ensure game is not created
    Assert::assertCount(0, \App\Models\Game::all());

    $this->post('games', [
        'type' => 'pvb',
        'difficulty' => 1,
    ])
        ->assertRedirect(); // This should redirect to game page

    // Ensure game is created
    Assert::assertCount(1, \App\Models\Game::all());
});

it('can resign game', function () {

    // Login
    $user = \App\Models\User::factory()->create();
    $this->actingAs($user);

    // Ensure no game are present in database
    Assert::assertCount(0, \App\Models\Game::all());

    // Ensure cannot create game without difficulty
    $this->post('games', [
        'type' => 'pvb',
    ])->assertRedirect();

    // Ensure game is not created
    Assert::assertCount(0, \App\Models\Game::all());

    $this->post('games', [
        'type' => 'pvb',
        'difficulty' => 1,
    ])
        ->assertRedirect(); // This should redirect to game page

    // Ensure game is created
    Assert::assertCount(1, \App\Models\Game::all());

    // Resign game
    $game = \App\Models\Game::first();
    $this->post('games/' . $game->id . '/resign')->assertSuccessful();

    // Ensure game is closed
    $game->refresh();
    Assert::assertEquals(\App\Enums\GameStatusEnum::BLACK_WIN->value, $game->status);
});

it('can create a pvp game as logged user',function(){

    // Ensure no game are present in database
    Assert::assertCount(0, \App\Models\Game::all());

    // Create logged user
    $user = \App\Models\User::factory()->create();
    $this->actingAs($user);

    // Try creating without time
    $this->post('games', [
        'type' => 'pvp',
    ])->assertRedirect();

    // Ensure game is not created
    Assert::assertCount(0, \App\Models\Game::all());

    // Try creating with time
    $this->post('games', [
        'type' => 'pvp',
        'game_duration' => 60  * 60 * 2,
    ])->assertRedirect(); // This should redirect to game page

    // Ensure game is created
    Assert::assertCount(1, \App\Models\Game::all());

    // Remove user
    $user->delete();
});

it('cannot create a pvp game as guest',function(){

    // Ensure no game are present in database
    Assert::assertCount(0, \App\Models\Game::all());

    $this->post('games', [
        'type' => 'pvp',
    ])
        ->assertStatus(403);

    // Ensure game is not created
    Assert::assertCount(0, \App\Models\Game::all());
});

it('can load game page from created game and move a piece', function(){

    // Create game as logged user
    $user = \App\Models\User::factory()->create();
    $this->actingAs($user);

    // Create game
    $this->post('games', [
        'type' => 'pvb',
        'difficulty' => 1,
    ]) ->assertRedirect();

    // Load game page
    $game = \App\Models\Game::first();
    $this->get('games/' . $game->id)
        ->assertInertia(fn ($page) => $page
            ->component('Game')
            ->has('game')
            ->has('game.game_infos')
            ->has('game.game_infos.0.user')
            ->where('game.id', $game->id)
        );

    // Force set initial fen to canonical board
    $game->initial_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    // Move a piece
    $this->post('games/' . $game->id . '/move', [
        'move' => 'e2e4'
    ])->assertSuccessful();

    // Check that move_text is not null
    $game->refresh();
    Assert::assertNotNull($game->move_text);

    // Remove user
    $user->delete();
});
