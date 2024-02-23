<?php

namespace App\Models;

use App\Pivots\UserDailyChallengePivot;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DailyChallenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'initial_fen',
        'for_day',
    ];

    protected $casts = [
        'for_day' => 'datetime',
    ];


    public function userAttempts(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(UserDailyChallengePivot::class);
    }

    public function getAttemptsForUser(User $user): int
    {
        return $this->userAttempts()->where('user_id', $user->id)->count();
    }
}
