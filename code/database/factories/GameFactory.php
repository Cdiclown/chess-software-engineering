<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class GameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Read pgn from txt file
        //$pgn  = file_get_contents(__DIR__."/pgn-test.txt");

        return [
            'status' => $this->faker->randomElement(['black_win','white_win']),
            'room_code' => $this->faker->unique()->randomNumber(6),
            'game_start_time' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'game_duration' => $this->faker->numberBetween(1, 100),
            //'pgn' => $pgn
        ];
    }
}
