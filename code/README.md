# Osi-Chess APP

## Description

## Running in browser
Ensure to have docker installed on your system and a bash terminal. If you are using windows, you can use the WSL2 terminal.

Run the following command to start the app:
```bash
./scripts/start-local.sh
```
This will prepare all the necessary docker images and start the app. You can access the app in your browser at http://localhost:8000

The app will listen for changes in the uncompiled js assets and recompile them automatically.

## Creating test users
Ensure to have the app running before running this command.
To create test users, and apply the necessary migrations, run the following command:
```bash
sail artisan app:init
```

Note: in a local environment, this will populate the database with test data.
IN A PRODUCTION ENVIRONMENT, THIS WILL DELETE ALL DATA IN THE DATABASE, RE-APPLY THE DATABASE MIGRATIONS AND CREATE ESSENTIAL DATA

After running this command, you can login with the following credentials:
- Email:    a@a.it
- Password: password

## Running tests
Ensure to have the app running before running this command and to be inside the osi-chess-app directory.
To run the test, you should open a shell inside the application container. To do so, run the following command:
```bash
sail shell
```

Once inside the container, you can run the tests with the following command:
```bash
./vendor/bin/pest
```
### Creating a new game

To create a new game, you should send a POST request to the following endpoint:
```
/games
```

This invocation will redirect the user from configuration page to the game page.

Only the host player game info object is created during this request.
If the game is pvp, the black player game info will be created at join time.
If the game is pvb, no game info object is created at all.

If the player is not logged in, the game info object will not created but the ownership of the game will be assigned to him using a cookie.
A guest player cannot play a PVP game, he can only play a PVB game.
### Resuming-joining a game

This logic is also triggered when the game is created, the user
is immediately redirected to the game page.

To resume a started game you should send a GET request to the endpoint
```
/games/{gameId}
```

The game page is rendered and if logged user is one of the players
the game is resumed, otherwise he joins as a spectator.

If the match is PVP and a black player is missing, 
the joining player is assigned to the black player.

If a guest player tries to join an existing game but he did not create it, he is redirected to the dashboard.
The ownership of a game by a guest player is determined by a cookie set when the game is created.

## Join existing game by room code
To join an existing game, you should send a GET request to the following endpoint:
```
/games/{gameId}/join
```

This just redirects the user to the game page, resolving game id from the room code.


### PGN Example
When the value of the tag SetUp is 1, the initial position is loaded from the FEN parameter.
```
[Event "F/S Return Match"]
[Site "Belgrade, Serbia JUG"]
[Date "1992.11.04"]
[Round "29"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[SetUp "1"]
[FEN "1r6/7P/5ppn/P1Q3bk/3P3P/1N1pR3/8/2K3B1 w - - 0 1"]
[Result "1/2-1/2"]

1. d5 d2 2. d6 d1=Q 3. d7 Qd5+ 4. Kb6 Qd6+ 5. Kb7 Qd5+ 6. Kb8 Qb5+ 7. Kc8 Qc6+ 8. Kd8 Ke6 9. Ke8 Qxd7+ 10. Kf8 Qf7#
```

### Moving a piece
To move a piece, you should send a POST request to the following endpoint:
```
/games/{gameId}/move
```
The request body should contain the LAN (long algebraic notation) of the move.

request body example (json):
```json
{
    "move": "e2e4"
}
```

The backend will validate the move and, if valid, will update the game state and return:
- The game object and the game info nested object of the player who made the move
- The move made by the bot or player

response body example:
```
{
    game: {},
    move: "e2e4"
}
```

Steps of each move
- Validate move (if invalid, return error)
- Check for mate (if mate, return special response and close game)
- Check for stale mate (if stale mate, return special response and close game)
- TODO check what to do when only kings remain

When a move is made, if the user is logged in, the table game_info is updated
with the new number of moves made by the player.

### Step-back
Each player can step-back a move by sending a POST request to the following endpoint:
```
/games/{gameId}/step-back
```
Note that this can only be done a limited number of times.
If the player has already stepped back the maximum number of times, the request will fail.
If the player can step-back, the backend will update the game state and return the FEN of the new board state.
TODO: finisci behaviour anche contro il giocatore

### Game endings
When a move is made, the server validates the presence of a checkmate,
in that case instead of returning a move to the player, it returns a special response with the winner of the game.

response body example:
in case the user wins
```
{
    game: {},
    fen: "pppppppp/pppppppp/8/8/8/8/8/8 w ---1q"
    move: "#"
}
```
in case the opponent makes the winning move
```
{
    game: {},
    fen: "pppppppp/pppppppp/8/8/8/8/8/8 w ---1q"
    move: "e5e6#"
}
```

## LAN (long algebraic notation)

### Legend
- **K** = King
- **Q** = Queen
- **R** = Rook
- **B** = Bishop
- **N** = Knight
- **P** = Pawn (or no letter)
- **x** = capture
- **+** = check
- **!** = checkmate
- **=** = promotion
- **O-O** = king-side castling
- **O-O-O** = queen-side castling

### Colors
Upper case letters are used for white pieces, lower case letters are used for black pieces.

### Coordinates
The board is represented as a 8x8 matrix, where the first index is the row and the second index is the column.
The rows are numbered from 1 to 8, starting from the bottom of the board.
The columns are numbered from a to h, starting from the left of the board.

A move is represented by the starting and ending coordinates of the piece.
Example: **e2e4** (white pawn moves from e2 to e4)

### Promotion
**e7e8Q** (white pawn moves from e7 to e8 and promotes to queen)


# Testing

## Unit tests

Per creare un test di unità bisogna creare un file nella cartella code/osi-chess-app/test/Jest

In caso di un componente React, il file deve essere all'interno della sotto-cartella Components
In caso invece di una pagina, il file deve essere all'interno della sotto-cartella Pages

Il nome del file deve essere il nome del componente o della pagina seguito da .test.js

Una volta creato il test si può eseguire con il comando per testarlo
```bash
npm run test
```

Questo creerà nella rispettiva cartella una cartella aggiuntiva chiamata __snapshots__, se definite la funzione di matchSnapshot
questa conterrà i file di snapshot dei componenti e delle pagine testate.

Una volta creata questa snapshot ogni volta che si eseguirà il comando per testare il componente o la pagina,
verrà confrontato il file di snapshot con il componente o la pagina testata, se ci sono differenze il test fallirà.

### Aggiornamento delle snapshot

Se volete aggiornare il file di snapshot, dovete eliminare la snapshot precedentemente creata
e far ripartire il comando di test.



