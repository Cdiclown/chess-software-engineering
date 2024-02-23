<?php

use App\Enums\GameStatusEnum;
use App\Enums\GameTypesEnum;
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
        Schema::create('games', function (Blueprint $table) {
            $table->id();
            $table->timestamps();

            $table->enum('status', GameStatusEnum::values())->default('no_status');
            $table->enum('type', GameTypesEnum::values());
            $table->string('room_code')->unique();
            $table->longText('pgn')->nullable();
            $table->longText('move_text')->nullable();
            $table->string('initial_fen')->nullable();
            $table->string('last_fen')->nullable();
            $table->longText('captured_pieces')->nullable();
            $table->string('game_start_time')->nullable();
            $table->integer('game_duration')->nullable();  // Configured match time in seconds
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('games');
    }
};
