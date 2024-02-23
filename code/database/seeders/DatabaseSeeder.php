<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\GameInfo;
use Database\Factories\GameInfoFactory;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // In production, we don't want to seed the database with test users
        if (!app()->isLocal()) {
            return;
        }

        $this->call(UserSeeder::class);
        $this->call(GameSeeder::class);
        $this->call(GameInfoSeeder::class);
    }
}
