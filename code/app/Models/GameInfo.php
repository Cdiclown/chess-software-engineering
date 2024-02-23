<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameInfo extends Model
{
    protected $fillable = [
        'game_id',
        'user_id',
        'color',
        'moves_count',
        'winner',
        'last_move_at',
        'time_left',
        'difficulty',
    ];


    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    |
    */
    // @codeCoverageIgnoreStart
    public function game(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function user() : \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    // @codeCoverageIgnoreEnd


    /*
    |--------------------------------------------------------------------------
    | Custom methods
    |--------------------------------------------------------------------------
    |
    */
    public static function boot(): void
    {
        parent::boot();

        static::created(function($model)
        {
            $model->time_left = Game::find($model->game_id)->game_duration;
            $model->save();
        });
    }
}
