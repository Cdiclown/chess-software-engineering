<?php


use App\Models\User;

test('users can update their profile', function () {

    // Create a test user and ensure that the username is not 'test'
    $user = User::factory()->create();
    expect($user->username)->not()->toBe('test');

    // Change the username to 'test' and ensure that the username is now 'test'
    $this->actingAs($user)->patch('/profile', [
        'username' => 'test',
    ]);
    expect($user->fresh()->username)->toBe('test');
});

test('user can change their password', function (){

    // Create a test user and ensure that the password is not 'password'
    $user = User::factory()->create();
    $oldPassword = $user->password;

    // Change the password to 'password' and ensure that the password is now 'password'
    $this->actingAs($user)->put('/password', [
        'current_password' => 'password',
        'password' => 'password2',
        'password_confirmation' => 'password2',
    ]);
    expect($user->password)->not()->toBe($oldPassword);
});
