import React, { Component } from "react";
import PropTypes from "prop-types";
import { Chess } from "chess.js"; // import Chess from  "chess.js"(default) if recieving an error about new Chess() not being a constructor
import Chessboard from "chessboardjsx";
import {parse} from "@mliebelt/pgn-parser";
import Spinner from 'react-bootstrap/Spinner';

const HIGHLIGHT_COLOR = "#ffb3b3aa";



class HumanVsBot extends Component {
    static propTypes = { children: PropTypes.func };
    initialFen = "";
    color = this.props.color == null ? "w" : this.props.color;
    gameType = this.props.gameType;
    gameModel = this.props.game;
    gameId = this.gameModel.id;
    userId = this.props.auth.user ? this.props.auth.user.id : null;

    //get time left from the array if the id is the same as the game id
    timeLeft = this.userId == null ? null : this.gameModel.game_infos.find((element) => element.user_id === this.userId).time_left;
    oppTimeLeft = this.userId == null ? null : (this.gameModel.game_infos.length === 1 ? this.timeLeft : this.gameModel.game_infos.find((element) => element.user_id !== this.userId).time_left);

    timerShouldPause = false;
    oppTimerShouldPause = false;

    state = {
        fen: this.props.position,
        // square styles for active drop square
        dropSquareStyle: {},
        // custom square styles
        squareStyles: {},
        // square with the currently clicked piece
        pieceSquare: "",
        // currently clicked square
        square: "",
        // array of past game moves
        history: [],

        turn: "w",
        warningActive: false,
        warningText: "",
        warningSpinnerVisible: false,
        user2Name: "waiting...",
        movesCount: 0,
    };


    updateMovesCount = (count) => {
        this.setState({movesCount: count});
    }


    loadPvBView = () => {
        let timerContainer = document.getElementById("timer-container");
        if (timerContainer)
            timerContainer.style.display = "none";

        let my_info = this.getMyGameInfo(this.gameModel)
        if (my_info) {
            this.updateMovesCount(my_info.moves_count);
        }
    }

    loadPvPView = () => {
        //hide undo button
        let undoButton = document.querySelector(".undo-button");
        if (undoButton != null) {
            undoButton.style.display = "none";
        }

        //set turn
        this.setState({
            turn: this.isMyTurn() ? this.color : this.color === "w" ? "b" : "w"
        });
    }

    componentDidMount() {


        this.game = new Chess(this.props.position);
        this.initialFen = this.props.position;

        //check if the pgn is created correctly
        if (this.props.game.pgn != null) {
            //get pgn from model
            let pgn = this.props.game.pgn;
            //parse pgn to get the moves
            let parsedPGN = parse(pgn, {startRule: "game"}).moves;
            //check that moves are made
            if (parsedPGN.length > 0) {

                for (let i = 0; i < parsedPGN.length; i++) {
                    //apply moves to the board
                    let move_obj = this.game.move(parsedPGN[i].notation.notation);
                }

                //update the board and history
                this.setState(({ history, pieceSquare }) => ({
                    fen: this.game.fen(),
                    history: this.game.history({ verbose: true }),
                    squareStyles: squareStyling({ pieceSquare, history })
                }));
            }
        }

        if (this.gameType === "pvp") {


            this.loadPvPView();

            if (this.isMyTurn()) {
                //check if there are moves
                if (this.game.history().length > 0) {
                    //start timer
                    this.startTimer(this.timeLeft);
                } else {
                    this.setTimer(this.timeLeft);
                }
                this.setTimer(this.oppTimeLeft, "opp");
            } else {
                if (this.game.history().length > 0) {
                    //start timer
                    this.startTimer(this.oppTimeLeft, "opp");
                } else {
                    this.setTimer(this.oppTimeLeft, "opp");
                }
                this.setTimer(this.timeLeft);
            }

            //register to websockets
            Echo.private(`game.${this.gameId}`)
                .listen('BlackPlayerJoinedEvent', (e) => {
                    //second player joined the session
                    this.gameModel.game_infos[1] = e.blackGameInfo;

                    this.handleChessboardAvailability();

                    //Hide waiting text
                    this.setState({warningActive: false, warningText: "", warningSpinnerVisible: false});
                })
                .listen('NewMoveEvent', (e) => {
                    this.applyOpponentMove(e.game.pgn)

                    this.oppTimerShouldPause = true;

                    //calculate new time
                    let myGameInfo = this.getMyGameInfo(e.game);
                    if (myGameInfo) {
                        this.timeLeft = myGameInfo.time_left;
                        this.oppTimeLeft = e.game.game_infos.find((element) => element.user_id !== this.userId).time_left;
                        this.startTimer(this.timeLeft);

                        //set turn
                        this.setState({
                            turn: this.isMyTurn() ? this.color : this.color === "w" ? "b" : "w"
                        });
                    }
                });
        } else {
            this.loadPvBView();
        }


        this.onMove();
    }

    startTimer = (time, type = "my") => {
        let timer_selector = type === "opp" ? "opp-timer" : "timer";
        time = time + 1;
        let timer = document.getElementById(timer_selector);
        let page = this;

        // Sync timers with server
        axios.get('/games/' + this.gameId + '/timeleft')
            .then((response) => {

                if(response.data == [])
                    return;

                let myTime = response.data['loggedUserTimeLeft'];
                let oppTime = response.data['opponentTimeLeft'];
                console.log(myTime, oppTime);

                this.timeLeft = myTime;
                this.oppTimeLeft = oppTime;

            }).catch((error) => {
            console.log(error);
        });

        async function tick() {
            if (time <= 0 || (type === "opp" && page.oppTimerShouldPause) || (type === "my" && page.timerShouldPause)) {
                clearInterval(interval);
                if (type === "opp") {
                    page.oppTimerShouldPause = false;
                } else {
                    page.timerShouldPause = false;
                }
                return;
            }
            time--;
            timer.innerHTML = page.timeStringFromSeconds(time);
        }
        let interval = setInterval(tick, 1000);
    }

    setTimer = (time, type) => {
        let timer_selector = type === "opp" ? "opp-timer" : "timer";
        let timer = document.getElementById(timer_selector);
        timer.innerHTML = this.timeStringFromSeconds(time);
    }

    getMyGameInfo = (model) => {
        return model.game_infos.find((element) => element.user_id === this.userId);
    }

    timeStringFromSeconds = (seconds) => {
        let minutes = Math.floor(seconds / 60);
        let secondsLeft = seconds % 60;
        //add 0 if seconds are less than 10
        if (secondsLeft < 10) {
            secondsLeft = "0" + secondsLeft;
        }
        return minutes + ":" + secondsLeft;
    }

    toggleOverlay(visible) {
        let chessboardContainer = document.querySelector(".chessboard-container");
        let overlay = document.querySelector(".block-input-overlay");

        if (visible) {
            if (!overlay) {
                overlay = document.createElement("div");
                overlay.classList.add("block-input-overlay");
                overlay.style.backgroundColor = "transparent";
                overlay.style.position = "absolute";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100%";
                overlay.style.height = "100%";
                overlay.style.zIndex = "999";
                if (chessboardContainer)
                    chessboardContainer.appendChild(overlay);
            } else {
                overlay.style.display = "initial";
            }
        } else {
            if (overlay) {
                overlay.style.display = "none";
            }
        }
    }

    isMyTurn = () => {
        //get current fen color
        let fen = this.game.fen();
        //get color from fen
        let color = fen.split(" ")[1];

        return color === this.color;
    }

    // keep clicked square style and remove hint squares
    removeHighlightSquare = () => {
        this.setState(({ pieceSquare, history }) => ({
            squareStyles: squareStyling({ pieceSquare, history })
        }));
    };

    handleChessboardAvailability = () => {
        if (this.isMyTurn()) {
            if (this.gameType === "pvp") {
                if (this.gameModel.game_infos.length !== 2) {
                    this.toggleOverlay(true);
                    this.setState({warningActive: true, warningText: "Waiting for an opponent to join", warningSpinnerVisible: true});
                    return;
                }
            }
            //enable pointer events
            this.toggleOverlay(false);
        } else {
            this.toggleOverlay(true);
        }

        if (this.gameType === "pvp" && this.gameModel.game_infos.length === 2) {
            this.setState({user2Name: this.color === "b" ? this.props.auth.user.username : this.gameModel.game_infos[1].user.username});
        }
    }

    // show possible moves
    highlightSquare = (sourceSquare, squaresToHighlight) => {
        const highlightStyles = [sourceSquare, ...squaresToHighlight].reduce(
            (a, c) => {
                return {
                    ...a,
                    ...{
                        [c]: {
                            backgroundColor: HIGHLIGHT_COLOR,
                        }
                    },
                    ...squareStyling({
                        history: this.state.history,
                        pieceSquare: this.state.pieceSquare
                    })
                };
            },
            {}
        );

        this.setState(({ squareStyles }) => ({
            squareStyles: { ...squareStyles, ...highlightStyles }
        }));
    };
    handleStepBackButtonStatus = () => {

        let undoButton = document.querySelector(".undo-button");
        //check if the fen is the initial one, or it's the black turn
        if (undoButton == null) {
            return;
        }

        if (this.initialFen.split(" ")[0] === this.game.fen().split(" ")[0] || this.game.turn() === "b" || this.undoPerformed) {

            if (!undoButton.classList.contains("disabled")) {
                undoButton.classList.add("disabled");
                this.undoPerformed = false;
            }
        } else {
            if (undoButton.classList.contains("disabled")) {
                undoButton.classList.remove("disabled");
            }
        }
    }
    getPiecePositions = (piece) => {
        return [].concat(...this.game.board()).map((p, index) => {
            if (p !== null && p.type === piece.type && p.color === piece.color) {
                return index
            }
        }).filter(Number.isInteger).map((piece_index) => {
            const row = 'abcdefgh'[piece_index % 8]
            const column = Math.ceil((64 - piece_index) / 8)
            return row + column
        })
    }
    handleCheck = () => {
        function removeCheckClass() {
            if (document.querySelector(".check") != null) {
                document.querySelector(".check").classList.remove("check");
            }
        }

        if (this.game.isCheck()){
            //start removing the class
            removeCheckClass();

            //check which color is in check
            let kingPos = "";
            if (this.game.turn() === "w"){
                kingPos = this.getPiecePositions({type: "k", color: "w"});
            } else {
                kingPos = this.getPiecePositions({type: "k", color: "b"});
            }

            let kingEl = document.querySelector("div[data-squareid='" + kingPos + "']");
            if (kingEl != null) {
                kingEl.classList.add("check");
            }

        } else {
            removeCheckClass();
        }
    }

    applyOpponentMove = (gamePgn) => {

        let lastMove = parse(gamePgn, {startRule: "game"}).moves[parse(gamePgn, {startRule: "game"}).moves.length - 1].notation.notation;
        this.game.move(lastMove);

        this.setState(({ history, pieceSquare }) => ({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
            squareStyles: squareStyling({ pieceSquare, history })
        }));

        this.onMove();
    }

    requestMove = (moveLan) => {

        //return if it's not your turn to move
        if (!this.isMyTurn) {
            return;
        }

        //abstract component for nested function handle
        let page = this;

        if (page.gameType === "pvp" ) {

            //check if there are more than 1 moves
            if (page.game.history().length > 1) {
                //pause timer
                page.timerShouldPause = true;
            }
        }

        axios.post('/games/' + this.gameModel.id + '/move', {
            move: moveLan
        }).then(function (response) {
            //do not apply move if game is pvp
            if (page.gameType === "pvp") {

                page.oppTimerShouldPause = false;

                //start opponent time
                page.startTimer(page.oppTimeLeft, "opp");

                //set opponent color
                page.setState({
                    turn: page.color === "w" ? "b" : "w"
                });
                return;
            }


            if (response.data.game_infos.length > 0) {
                //update moves count
                page.updateMovesCount(response.data.game_infos[0].moves_count);
            }

            //apply bot move
            page.applyOpponentMove(response.data.pgn);
        }, function (error) {

            //undo move
            page.game.undo();
            page.setState(({ history }) => ({
                fen: page.game.fen(),
                history: page.game.history({ verbose: true }),
            }));

            if (error.response.data.error) alert(error.response.data.error);

            //start timer
            page.startTimer(page.timeLeft);
        });
    }

    onMove = () => {
        this.handleStepBackButtonStatus();
        this.handleChessboardAvailability();

        //check if it's checkmate
        if (this.game.isCheckmate() || this.game.isStalemate()) {
            //check if white is in checkmate
            if (this.isMyTurn()) {
                this.setState({warningActive: true, warningText: "Checkmate! You lost!", warningSpinnerVisible: false});
                //stop timer
                this.timerShouldPause = true;
            } else {
                this.setState({warningActive: true, warningText: "Checkmate! You won!", warningSpinnerVisible: false});
                //stop timer
                this.timerShouldPause = true;
            }
        }


        this.handleCheck();
    }

    undoPerformed = false;
    stepBack = () => {
        //check if the fen is the initial one
        if (this.initialFen === this.state.fen) {
            return;
        }
        //check if it is white's turn
        if (this.game.turn() === "b") {
            return;
        }

        //undo the move
        this.game.undo();
        this.game.undo();
        this.setState(({ history }) => ({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
        }));

        let page= this;

        //request step back
        axios.post('/games/' + this.gameModel.id + '/undo')
        .then(function (response) {

            if (response.data.game_infos.length > 0) {
                //update moves count
                page.updateMovesCount(response.data.game_infos[0].moves_count);
            }
        }).catch(function (error) {
            console.log(error);
        });

        //set undo performed
        this.undoPerformed = true;

        //signal that the move was made
        this.onMove();
    }
    onDrop = ({ sourceSquare, targetSquare }) => {

        //Handle move validation => it crashes the app without it
        try {
            // see if the move is legal
            let move = this.game.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q" // always promote to a queen for example simplicity
            });
        }
        catch (err) {
            return;
        }


        //update the board and history
        this.setState(({ history, pieceSquare }) => ({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
            squareStyles: squareStyling({ pieceSquare, history })
        }));
        this.onMove();

        this.requestMove(sourceSquare + targetSquare);
    };
    onMouseOverSquare = square => {

        // get list of possible moves for this square
        let moves = this.game.moves({
            square: square,
            verbose: true
        });

        // exit if there are no moves available for this square
        if (moves.length === 0) {
            //TODO highlight only the square
            return;
        }

        let squaresToHighlight = [];
        for (var i = 0; i < moves.length; i++) {
            squaresToHighlight.push(moves[i].to);
        }
        this.highlightSquare(square, squaresToHighlight);
    };
    onMouseOutSquare = square => this.removeHighlightSquare(square);
    // central squares get diff dropSquareStyles
    onDragOverSquare = square => {
        this.setState({
            dropSquareStyle: {boxShadow: "inset 0 0 1px 4px rgb(255, 255, 0)"}
        });
    };
    onSquareClick = square => {

        this.setState(({ history }) => ({
            squareStyles: squareStyling({ pieceSquare: square, history }),
            pieceSquare: square
        }));

        //check if the source square is empty
        if (this.state.pieceSquare.toString() === "") {
            //timer of 100ms
            setTimeout(() => {
                if (this.state.pieceSquare.toString() === "") {
                    return;
                }
            }, 100);
        }

        //non-empty square clicked
        this.onMouseOverSquare(square);

        //check if the square is the same as the last one
        if (this.state.pieceSquare === square) {
            return;
        }

        try {
            let move = this.game.move({
                from: this.state.pieceSquare,
                to: square,
                promotion: "q" // always promote to a queen for example simplicity
            });
        }
        catch (err) {
            return;
        }

        this.setState({
            fen: this.game.fen(),
            history: this.game.history({ verbose: true }),
            pieceSquare: ""
        });

        this.onMove();

        this.requestMove(this.state.pieceSquare + square)
    };
    render() {
        const { fen, dropSquareStyle, squareStyles } = this.state;
        let color = this.state.turn;
        let movesCount = this.state.movesCount;

        return <div key={"hvb-container"} className={"chessboard-container"}>
            {[this.props.children[0]({movesCount: movesCount, gameType: this.gameType, isUserLoggedIn: this.props.auth.user != null}),
                this.props.children[1]({warningActive: this.state.warningActive, warningText: this.state.warningText, warningSpinnerVisible: this.state.warningSpinnerVisible}),
                this.props.children[2]({
                    user2: this.gameType === "pvb" ? "Stockfish" : this.state.user2Name,
                    gameType: this.gameType
                }),
            this.props.children[3]({
            squareStyles,
            position: fen,
            onMouseOverSquare: this.onMouseOverSquare,
            onMouseOutSquare: this.onMouseOutSquare,
            onDrop: this.onDrop,
            dropSquareStyle,
            onDragOverSquare: this.onDragOverSquare,
            onSquareClick: this.onSquareClick,
        }),this.props.children[4]({
                    user1: this.gameType === "pvp" ? this.gameModel.game_infos[0].user.username : (this.props.auth.user ? this.props.auth.user.username : "guest"),
            }),this.props.children[5], this.props.children[6]({
            stepBack: this.stepBack
        }), this.props.children[7]({
            color: color,
            myColor: this.color,
        })]}</div>;
    }
}



function RBCGame(props) {

    return (
        <div>
            <HumanVsBot style={{color:"red"}} auth={props.auth} color={props.color} position={props.position} game={props.game} gameType={props.gameType}>
                {({movesCount, gameType, isUserLoggedIn}) => {
                    if (gameType === "pvp") return null;
                    return (
                        <div id={"moves-count-container"}>
                            {
                                isUserLoggedIn ?
                                    <p>Moves: {movesCount}</p>
                                    :
                                    <p style={{opacity:'0.6'}}>Log in to show moves count</p>
                            }
                        </div>
                    );
                }}
                {({warningActive, warningText, warningSpinnerVisible}) => {
                    return (
                        <div style={{display: warningActive ? "flex" : "none"}} className={"waring-container"}>
                            <h1 className={"warning-text"}>{warningText}</h1>
                            {
                                warningSpinnerVisible ?
                                    <Spinner animation="border" role="status" size="sm"></Spinner>
                                : null
                            }
                        </div>
                    );
                }}
                {
                    ({user2, gameType}) => {
                        return (
                            <div style={{marginTop:'0', marginBottom:'10px'}} className={"user-data-container"}>
                                <div className={"user-data-username-container"}>
                                    {
                                        gameType === "pvb" ?
                                            <img src="/images/boticon.svg" alt={"user-icon"}/>
                                        :
                                            <img src="/images/usericon.svg" alt={"user-icon"}/>
                                    }
                                    <p>{user2}</p>
                                </div>
                                <div></div>
                            </div>
                        );
                    }
                }
                {({
                      position,
                      onDrop,
                      onMouseOverSquare,
                      onMouseOutSquare,
                      squareStyles,
                      dropSquareStyle,
                      onDragOverSquare,
                      onSquareClick,
                      onSquareRightClick,
                      allowDrag
                  }) => (
                    <Chessboard
                        id="humanVsHuman"
                        width={320}
                        position={position}
                        onDrop={onDrop}
                        onMouseOverSquare={onMouseOverSquare}
                        onMouseOutSquare={onMouseOutSquare}
                        boardStyle={{
                            borderRadius: "5px",
                            boxShadow: `0 5px 15px rgba(0, 0, 0, 0.5)`
                        }}
                        squareStyles={squareStyles}
                        dropSquareStyle={dropSquareStyle}
                        onDragOverSquare={onDragOverSquare}
                        onSquareClick={onSquareClick}
                        onSquareRightClick={onSquareRightClick}
                    />
                )}
                {
                    ({user1}) => {
                        return (
                            <div className={"user-data-container"}>
                                <div></div>
                                <div className={"user-data-username-container"}>
                                    <p>{user1}</p>
                                    <img src="/images/usericon.svg" alt={"user-icon"}/>
                                </div>
                            </div>
                        );
                    }
                }
                {
                    <div id={"timer-container"}>
                        <div>
                            <p className={"timer-title"}>YOUR TIME LEFT</p>
                            <p id={"timer"}></p>
                        </div>
                        <div>
                            <p className={"timer-title"}>OPP TIME LEFT</p>
                            <p id={"opp-timer"}></p>
                        </div>
                    </div>
                }
                {({ stepBack }) => (
                    <button className={`undo-button disabled`} onClick={stepBack}>Undo</button>
                )}
                {({color, myColor }) => {
                    let colorString = color === "w" ? "White" : "Black";
                    return (
                        <div id={"turn-container"}>
                            <p>{colorString} turn {myColor === color ? "(you)" : ""}</p>
                        </div>
                    );
                }}
            </HumanVsBot>
        </div>
    );
}

//export also HumanVsBot
export {HumanVsBot, RBCGame};

const squareStyling = ({ pieceSquare, history }) => {
    const sourceSquare = history.length && history[history.length - 1].from;
    const targetSquare = history.length && history[history.length - 1].to;

    return {
        [pieceSquare]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
        ...(history.length && {
            [sourceSquare]: {
                backgroundColor: "rgba(255, 255, 0, 0.4)"
            }
        }),
        ...(history.length && {
            [targetSquare]: {
                backgroundColor: "rgba(255, 255, 0, 0.4)"
            }
        })
    };
};
