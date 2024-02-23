<?php

namespace App\Http\Controllers;

use App\Enums\GameStatusEnum;
use App\Models\DailyChallenge;
use App\Models\GameInfo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class LeaderBoardController extends Controller
{
    public function index()
    {

        // Get date from query string
        $date = request()->query('date');

        // Get all users and order by ELO
        $leaderboardUsers = User::orderBy('elo', 'desc')->select(['id', 'username', 'elo'])->get();
        $dailyChallengeUsers = Collection::make();

        // Check if played today daily challenge
        $dailyChallenge = DailyChallenge::where('for_day', $date ?? now()->toDateString())->first();

        //iterate over users
        foreach ($leaderboardUsers as $user) {

            //get number of pvp games played
            $pvpGamesPlayed = GameInfo::where('user_id', $user->id)->whereHas('game', function ($query) {
                $query->where('type', 'pvp');
            })->count();

            if($dailyChallenge != null)
            {
                $dailyChallengeAttempts = $dailyChallenge->userAttempts()->where('user_id', $user->id)->get();
                $user['dailyChallengeAttempts'] = $dailyChallengeAttempts->count();
                foreach ($dailyChallengeAttempts as $attempt)
                {
                    if($attempt->game->status == GameStatusEnum::WHITE_WIN->value)
                    {

                        $user['dailyChallengeMovesCount'] = (!$user['dailyChallengeMovesCount'] || $user['dailyChallengeMovesCount'] > $attempt->game->gameInfos[0]->moves_count) ?
                            $attempt->game->gameInfos[0]->moves_count :
                            $user['dailyChallengeMovesCount'];

                        if($dailyChallengeUsers->where('id', $user->id)->count() == 0)
                            $dailyChallengeUsers->add($user);
                    }
                }

            }

            //set number of pvp games played
            $user->match_count = $pvpGamesPlayed;
        }

        $loggedUser = null;

        //check if user is logged
        if (auth()->check()) {

            //get logged user id
            $loggedUserId = auth()->user()->id;

            //get logged user in leaderboard
            $loggedUser = $leaderboardUsers->where('id', $loggedUserId)->first();

            //get logged user position
            $loggedUser->position = $leaderboardUsers->search(function ($user) use ($loggedUserId) {
                    return $user->id == $loggedUserId;
                }) + 1;

            // Get logged user daily challenge attempts
            if($dailyChallenge != null)
            {
                // Get logged user daily challenge attempts
                $dailyChallengeUser = $dailyChallengeUsers->where('id', $loggedUserId)->first();
                if($dailyChallengeUser != null)
                {
                    $loggedUser['dailyChallengeAttempts'] = $dailyChallengeUser['dailyChallengeAttempts'];
                    $loggedUser['dailyChallengeMovesCount'] = $dailyChallengeUser['dailyChallengeMovesCount'];
                }
            }
        }

        // Map positions
        $dailyChallengeUsers->groupBy('dailyChallengeMovesCount')
            ->values()
            ->map(function($group,$index){
                return $group->map(function($user) use ($index){
                    $user['dailyChallengePosition'] = $index + 1;
                    return $user;
                });
            }
        );

        // Rejoin all users from groups
        $dailyChallengeUsers = $dailyChallengeUsers->flatten();


        return Inertia::render('Leaderboard', [
            'scores' => $leaderboardUsers,
            'dailyScores'=> $dailyChallengeUsers->sortBy('dailyChallengeMovesCount'),
            'userScore' => $loggedUser,
            'dailyUserScore' => $loggedUser ? $dailyChallengeUsers->where('id', $loggedUser->id)->first() : null,
        ]);
    }


}
