<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('game_infos', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->foreignId('game_id')->references('id')->on('games')->cascadeOnDelete();
            $table->foreignId('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->char('color', 1)->default('w');
            $table->integer('moves_count')->default(0);
            $table->boolean('winner')->nullable();
            $table->integer('difficulty')->nullable();
            $table->integer('step_back_left')->default(3);
            $table->unsignedInteger('time_left')->nullable();
            $table->dateTime('last_move_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_infos');
    }
};
