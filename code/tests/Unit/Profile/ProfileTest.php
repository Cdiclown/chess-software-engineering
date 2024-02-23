<?php

use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get('/profile');

    $response->assertOk();
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch('/profile', [
            'username' => 'osimhen',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect('/profile');

    $user->refresh();

    $this->assertSame('osimhen', $user->username);
});

//test('stats page is displayed', function () {
//    $user = User::factory()->create();
//
//    $response = $this
//        ->actingAs($user)
//        ->get('/profile/stats');
//
//    $response->assertOk();
//});
