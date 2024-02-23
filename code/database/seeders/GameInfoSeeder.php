<?php

namespace Database\Seeders;

use App\Enums\GameStatusEnum;
use App\Models\Game;
use App\Models\User;
use Chess\Variant\Classical\PGN\AN\Color;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GameInfoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (Game::all() as $game){

            // Choose 2 players at random
            $players = User::all()->random(2);

            // Create 2 game infos, one for each player
            $whiteGameInfo = $game->gameInfos()->create([
                'user_id' => $players[0]->id,
                'color' => Color::W,
                'moves_count' => rand(2, 40),
                'winner' => $game->status == GameStatusEnum::WHITE_WIN,
            ]);
            $blackGameInfo = $game->gameInfos()->create([
                'user_id' => $players[1]->id,
                'color' => Color::B,
                'moves_count' => rand(2, 40),
                'winner' => $game->status == GameStatusEnum::BLACK_WIN,
            ]);
        }
    }
}
