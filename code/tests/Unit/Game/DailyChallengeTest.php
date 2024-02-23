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
use App\Models\DailyChallenge;
use App\Models\Game;
use App\Models\User;
use App\Pivots\UserDailyChallengePivot;


// Create daily challenge
beforeEach(function () {

    $this->game = Game::create([
        'status' => GameStatusEnum::NO_STATUS,
        'room_code' => '1111',
        'type' => GameTypesEnum::PVP,
        'game_duration' => 10
    ]);

    User::factory()->create();
});

// Clean up database
afterEach(function () {

    UserDailyChallengePivot::each(function ($userDailyChallengePivot) {
        $userDailyChallengePivot->delete();
    });
    DailyChallenge::each(function ($dailyChallenge) {
        $dailyChallenge->delete();
    });
    User::each(function ($user) {
        $user->delete();
    });
    Game::each(function ($game) {
        $game->delete();
    });
});

it('can load daily challenge', function() {

    // Load dashboard to create daily challenge
    $this->get('/dashboard')->assertStatus(200);

    // Can get as logged user
    $this->actingAs(User::first())->get('/dailychallenge')->assertRedirect();

    // Ensure daily challenge is created
    $this->assertNotNull(DailyChallenge::first());

});
