<?php
//
//use Illuminate\Testing\Assert;
//
//it('can get the leaderboard', function () {
//
//    // Log in as user
//    $user = \App\Models\User::factory()->create();
//    $this->actingAs($user);
//
//    // Get all users and order by ELO
//    $users = \App\Models\User::orderBy('elo', 'desc')->select(['id', 'username', 'elo'])->get();
//
//    // Get leaderboard
//    $this->get('/leaderboard')
//        ->assertInertia(fn ($page) => $page
//            ->component('Leaderboard')
//            ->has('scores')
//            ->where('scores', $users->toArray())
//        );
//});

use Illuminate\Testing\Assert;

it('can get the leaderboard', function () {

    // Log in as user
    $user = \App\Models\User::factory()->create();
    $this->actingAs($user);

    // Get all users and order by ELO
    $users = \App\Models\User::orderBy('elo', 'desc')->select(['id', 'username', 'elo'])->get();

    // Create daily challenge
    $this->get('/dashboard')->assertStatus(200);

    // Get leaderboard
    $this->get('/leaderboard')
        ->assertInertia(fn ($page) => $page
            ->component('Leaderboard')
            ->has('scores')
            ->where('scores', function ($scores) use ($users) {

                // Remove 'match_count' and 'position' from scores
                $scores = $scores->map(function ($score) {
                    return collect($score)->except(['match_count', 'position','dailyChallengeAttempts'])->toArray();
                });

                return $scores->toArray() == $users->toArray();
            })
        );
});
