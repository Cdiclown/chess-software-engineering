<?php
// @codeCoverageIgnoreStart

namespace App\Pivots;

use App\Models\DailyChallenge;
use App\Models\Game;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\Pivot;

class UserDailyChallengePivot extends Pivot
{
    protected $fillable = [
        'user_id',
        'daily_challenge_id',
        'game_id',
    ];


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function dailyChallenge()
    {
        return $this->belongsTo(DailyChallenge::class);
    }

    public function game()
    {
        return $this->belongsTo(Game::class);
    }

}
// @codeCoverageIgnoreEnd
