<?php

namespace App\Http\Controllers;

use App\Enums\GameTypesEnum;
use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Game;
use App\Models\GameInfo;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class StatsController extends Controller
{
    public function stats(Request $request): Response
    {
        $userStats = GameInfo::where('user_id', $request->user()->id)
            ->where('winner', '!=', null)
            ->with('game')
            ->get();

        //group by game type
        $userStats = $userStats->groupBy('game.type');

        //iterate over pvp games
        if(!$userStats->isEmpty())
        {
            if(isset($userStats[GameTypesEnum::PVP->value]))
            {
                foreach($userStats[GameTypesEnum::PVP->value] as $key => $game){

                    //get opponent
                    $opponent = $game->game->users->where('id', '!=', $request->user()->id)->first();

                    // If no opponent (not joined) then remove the game from the list
                    if(!$opponent){
                        $userStats[GameTypesEnum::PVP->value][$key] = null;
                        continue;
                    }
                    $userStats[GameTypesEnum::PVP->value][$key]['opponent'] = $opponent;
                }

            }


            //check that each game type is present
            foreach(GameTypesEnum::cases() as $gameType){
                if(!isset($userStats[$gameType->value])){
                    $userStats[$gameType->value] = [];
                }
            }
        }
        else{
            foreach(GameTypesEnum::cases() as $gameType){
                $userStats[$gameType->value] = [];
            }
        }

        return Inertia::render('Profile/Stats', [
            'stats' => $userStats
        ]);
    }
}
