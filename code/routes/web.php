<?php

use App\Http\Controllers\GameController;
use App\Http\Controllers\LeaderBoardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TelegramController;
use App\Models\DailyChallenge;
use App\Models\Game;
use App\Models\User;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return redirect(route('dashboard'));
    //return Inertia::render('Welcome');
});

Route::get('/dashboard', function () {

    // Detect if daily challenge exists
    $dailyChallenge = DailyChallenge::where('for_day', date('Y-m-d'))->first();
    if (!$dailyChallenge)
    {
        $dailyChallenge = DailyChallenge::create([
            'initial_fen' => Game::generateRandomFenString(random_int(-15,15)),
            'for_day' => date('Y-m-d')
        ]);
    }

    $loggedUser = User::isLoggedIn() ? User::getLoggedUser() : null;

    return Inertia::render('Dashboard', [
        'dailyChallenge' => $dailyChallenge,
        'attemptsForUser' => $loggedUser ? 3 - $dailyChallenge->getAttemptsForUser(User::getLoggedUser()) : null,
    ]);
})->name('dashboard');


Route::get('game', function () {
    return Inertia::render('Game');
})->name('game');

Route::get('test', function(){
    return Inertia::render('TestPage');
});

/*
|--------------------------------------------------------------------------
| Profile
|--------------------------------------------------------------------------
*/
Route::group([
    'middleware' => 'auth',
    'prefix' => 'profile'
], function () {
    Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/stats', [\App\Http\Controllers\StatsController::class, 'stats'])->name('profile.stats');
    Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Daily challenge
Route::prefix('dailychallenge')->group(function () {
    Route::get('/', [GameController::class, 'dailychallenge']);
});

/*
|--------------------------------------------------------------------------
| Game
|--------------------------------------------------------------------------
*/
Route::group([
    /*'middleware' => 'auth',*/
    'prefix' => 'games'
],
    function () {

    // Create new game
    Route::post('/', [GameController::class, 'create']);

    // Load game page
    Route::get('/{gameId}', [GameController::class, 'show']);

    // Resign game
    Route::post('/{gameId}/resign', [GameController::class, 'resign']);

    // Post new move and return updated game state (if versus AI then AI will make a move)
    Route::post('/{gameId}/move', [GameController::class, 'move']);

    // Get time left for players
    Route::get('/{gameId}/timeleft', [GameController::class, 'timeLeft']);

    // Join existing game (just redirect to game page)
    Route::get('/{roomCode}/join', function ($roomCode){

        $game = Game::where('room_code', $roomCode)->first();

        // Return if trying to join own game
        if (!$game)
            return Inertia::location('/dashboard');

        // Get game object by roomCode
        return Inertia::location("/games/{$game->id}");
    });

    // Undo move in pvb
    Route::post('/{gameId}/undo', [GameController::class, 'undo']);

    //Route::get('/test', [GameController::class, 'test']);
});

/*
|--------------------------------------------------------------------------
| Leaderboard
|--------------------------------------------------------------------------
*/
Route::group([
    'prefix' => 'leaderboard',
    'middleware' => 'auth'
], function () {
    Route::get('/', [LeaderboardController::class, 'index'])->name('leaderboard.index');
});

/*
|--------------------------------------------------------------------------
| Telegram
|--------------------------------------------------------------------------
*/
Route::group([
    'prefix' => 'telegram'
], function () {

    Route::post('/webhook', function(){

        // Get updates
        $updates = Telegram::getWebhookUpdate();

        // Detect if callback query
        $isCallBack = $updates->callbackQuery != null;

        // Get username
        $username = $isCallBack ? $updates->callbackQuery->from->username : $updates->message->from->username;

        // Check if user exists
        $telegramUsername = $username . ' (Telegram)';
        $user = User::where('username', $telegramUsername)->first();

        // If user does not exist, create new user
        if (!$user){
            $user = User::create([
                'username' => $telegramUsername,
                'password' => Hash::make(Str::random(24)),
            ]);
        }

        // Get parameters
        $command = $isCallBack ? $updates->callbackQuery->data : $updates->message->text;
        $chatId = $isCallBack ? $updates->callbackQuery->message->chat->id : $updates->message->chat->id;

        // Hide keyboard if started with previous commands
        if($isCallBack){
            Telegram::editMessageReplyMarkup([
                'chat_id' => $chatId,
                'message_id' => $updates->callbackQuery->message->messageId,
                'reply_markup' => null
            ]);
        }

        // Take action based on command
        $controller = new TelegramController();
        switch ($command){

            case '/start':
                $controller->start($user, $chatId);
                break;

            case '/startgame':
                $controller->startGame($user, $chatId);
                break;

            case '/resign':
            case '/end':
                $controller->endActiveGame($user, $chatId);
                break;

            case '/continue':
                $controller->continueActiveGame($user, $chatId);
                break;

            default:

                // Check if command is a number (this means a new match with that difficulty)
                if(is_numeric($command))
                {
                    $controller->createNewGame($user, $chatId, $command);
                    break;
                }

                // Check if valid move command
                if(preg_match('/^[a-h][1-8][a-h][1-8]$/i', $command))
                {
                    $controller->makeMove($user, $chatId, $command);
                    break;
                }

                // Command not found
                $controller->commandNotFound($chatId);
                break;
        }
    });
});


require __DIR__.'/auth.php';
