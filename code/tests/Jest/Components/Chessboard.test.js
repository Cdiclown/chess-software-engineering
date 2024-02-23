/**
 * @jest-environment jsdom
 */

import renderer, {act} from 'react-test-renderer';
import {HumanVsBot, RBCGame} from "../../../resources/js/Components/Chessboard.jsx";
import Chessboard from "chessboardjsx";
import React from "react";
import { mount, shallow, configure } from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import toJson from "enzyme-to-json";
import {parse} from '@mliebelt/pgn-parser'
import MockEcho from 'mock-echo';


configure({ adapter: new Adapter() });

//override window.alert to prevent error
window.alert = () => {};

let wrapper;

let game = {
    "id":25,
    "created_at":"2023-11-19T15:03:08.000000Z",
    "updated_at":"2023-11-19T15:03:16.000000Z",
    "type":"pvb",
    "room_code":"TODO:2611",
    "pgn":"[Site \"Osi-Chess\"]\n[FEN \"qrrqbrqk/qbrnrnqq/8/8/8/8/PNBPRBPP/BBBRPKPR w - -\"]\n1.Rxe7 Qxg2+ 2.Ke2 Be4",
    "move_text":"1.Rxe7 Qxg2+ 2.Ke2 Be4",
    "initial_fen":"qrrqbrqk/qbrnrnqq/8/8/8/8/PNBPRBPP/BBBRPKPR w - -",
    "last_fen":"qrrqbrqk/q1rnRn1q/8/8/8/5b2/PNBPKBqP/BBBRP1PR w - -",
    "captured_pieces":null,
    "can_undo":1,
    "game_infos":[
        {
            "color":"w",
            "game_id":25,
            "last_move_at":"2023-11-22T11:10:08.000000Z",
            "move_count":2,
            "time_left":1800,
            "user_id":1,
        }
    ]
};

let mockEcho;

beforeEach(() => {

    document.body.innerHTML = '';

    mockEcho = new MockEcho()
    global.Echo = mockEcho

    let initialFen = game.pgn ?
        parse(game.pgn, {startRule: "game"}).tags.FEN :
        game.initial_fen;

    let auth = game.type === "pvp" ?
        {
            user: {
                id: 1,
                username: "osi"
            }
        }: {
        user: null,
        }

    wrapper = mount(<RBCGame auth={auth} position={initialFen} color={"w"} game={game} gameType={game.type} />, { attachTo: document.body });
});

afterEach(() => {
    delete global.Echo
})

it("pvb chessboard renders correctly", () => {
    console.log("STARTING TEST: pvb chessboard renders correctly");
    let snapshot = toJson(wrapper);
    //create snapshot
    expect(snapshot).toMatchSnapshot();
});

it('square highlight works correctly', () => {

    console.log("STARTING TEST: square highlight works correctly");
    wrapper.find(Chessboard).props().onSquareClick("a2");
    wrapper.update();
    let snapshot = toJson(wrapper);
    expect(snapshot).toMatchSnapshot();
});

it ('undo works correctly', () => {
    console.log("STARTING TEST: undo works correctly");

    //access humanVsBot component
    let humanVsBot = wrapper.find(HumanVsBot).instance();
    //trigger undo function
    humanVsBot.stepBack();

    wrapper.update();
    let snapshot = toJson(wrapper);
    expect(snapshot).toMatchSnapshot();
    game.type = "pvp";
});

it ("pvp chessboard and timers works correctly", () => {
    console.log("STARTING TEST: pvp chessboard renders correctly");
    let snapshot = toJson(wrapper);
    expect(snapshot).toMatchSnapshot();

    jest.useFakeTimers();
    //wait 3 seconds
    jest.advanceTimersByTime(3000);

    //find stoptimer boolean
    let instance = wrapper.find(HumanVsBot).instance();
    expect(instance.timerShouldPause).toBe(false);

});


