import React, {useState, useEffect} from 'react';
import {RBCGame} from '../Components/Chessboard.jsx';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout.jsx';
import '../../css/game.css';
import {func} from "prop-types";
import {parse} from '@mliebelt/pgn-parser'

export default function Game({auth, game}) {




    // Get the initial FEN string from the game object, if this is the first move a PGN string is not present so we get the last FEN string
    let initialFen = game.pgn && game.type === "pvb" ?
        parse(game.pgn, {startRule: "game"}).tags.FEN :
        game.initial_fen;

    //convert game to string
    console.log(game);
    console.log(auth);


    let gameInfo = game.game_infos.filter((info) => {
        return info.user_id === auth.user.id
    })

    if (gameInfo) {
        gameInfo = gameInfo[0];
    }

    let gameType = game.type;
    let color;
    if (gameType === "pvp") {
        if (gameInfo) {
            color = gameInfo.color;
            console.log(game.room_code);
        } else {
            alert("error");
        }
    }



    /**PRATICAMENTE COME FUNZIONA**/
    // Questa pagina può essere invocata in due modi diversi:
    // Se viene effettuata la /api/games viene creata una nuova partita e viene ritornato modello della nuova partita contenente la pgn vuota
    // Se viene effettuata la /api/games/{id} viene ritornato il modello della partita con id {id} con la pgn aggiornata

    // Per mandare una mossa è necessario chiamare la /api/games/{id}/move con il body {move: "e4e6"} dove move è la LAN della mossa da effettuare
    // Il server risponderà con il modello della partita aggiornato e la mossa lan effettuata dall'avversario.

    function copyLink() {
        //get server url
        let url = window.location.href;
        let path = url.substring(0, url.lastIndexOf('/'));
        path = path + "/" + game.room_code + "/join";
        navigator.clipboard.writeText(path);
    }

    function resign() {

        //send confirmation alert
        let confirmation = confirm("Are you sure you want to resign?");
        if (!confirmation) {
            return;
        }

        axios.post('/games/' + game.id + '/resign');
        //redirect to home
        window.location.href = "/";
    }

    return (
        <AuthenticatedLayout user={auth.user}>
            {/*
            SUMMARY:
            - The Game component is the main component of the app.
            - It contains the board and the pieces.
            - It also contains the logic of the game.

            \param position: the START position of the pieces on the board.
                It could be a FEN string or a piece array object.
            */}
            <div style={{position:'relative'}}>
                <div className={'game-wrapper'}>
                    <RBCGame auth={auth} gameType={gameType} color={color} position={initialFen} game={game}/>
                </div>
                {
                    gameType === "pvp" ?
                        <div className={"link-container"}>
                            <p>Game code</p>
                            <p style={{fontWeight:'bold', fontSize:'2rem'}}>{game.room_code}</p>
                            <button onClick={copyLink}>Copy invite link</button>
                        </div>
                    : null
                }
                {
                    auth.user ?
                        <button onClick={resign} className={"resign-button"}>Resign</button>
                    : null
                }
            </div>
        </AuthenticatedLayout>
    );



}
