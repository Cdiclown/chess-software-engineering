<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Default user to login
        User::create([
            'username' => 'osi',
            'password' => bcrypt('password'),
        ]);

        // Random users
        User::factory()->count(config('seeder.user_count'))->create();
    }
}
