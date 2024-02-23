<?php

use App\Models\Game;
use Chess\Media\BoardToPng;

beforeEach(function () {
    \App\Models\User::all()->each->delete();
});

it('can enter the app as logged user, play PVP, see leaderboard and profile', function () {

    // Create logged user
    $whitePlayer = \App\Models\User::factory()->create();
    $this->actingAs($whitePlayer);

    // Ensure can see the dashboard
    $this->get('/')
        ->assertRedirect('/dashboard');

    // Ensure can see the leaderboard
    $this->get('leaderboard')
        ->assertInertia(fn ($page) => $page
            ->component('Leaderboard')
        );

    // Ensure can see the profile
    $this->get('profile')
        ->assertInertia(fn ($page) => $page
            ->component('Profile/Edit')
        );

    // Ensure can see the stats
    $this->get('/profile/stats')
        ->assertInertia(fn ($page) => $page
            ->component('Profile/Stats')
        );

    // Ensure can logout
    $this->post('logout')
        ->assertRedirect('/');

    // Ensure cannot see the leaderboard
    $this->get('leaderboard')
        ->assertRedirect('login');

});
