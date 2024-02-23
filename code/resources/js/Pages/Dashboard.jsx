import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {Head, Link, router} from '@inertiajs/react';
import TestForm from "@/Components/TestForm.jsx";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
// import '../../css/NewGame.css';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import {Input} from "postcss";
import TextInput from "@/Components/TextInput.jsx";
import PrimaryButton from "@/Components/PrimaryButton.jsx";

export default function Dashboard({auth, dailyChallenge, attemptsForUser}) {

    function newPvb(e) {
        e.preventDefault();

        // Get difficulty
        let difficulty = document.getElementById("difficulty-input").value;

        // Create the game
        router.post('/games', {
                type: 'pvb',
                difficulty: difficulty,
            },
            {
                onError: (errors) => {
                    alert('Non é stato possibile creare la partita: ' + Object.values(errors)[0]);
                },
                onSuccess: (response) => {
                    //console.log(response);
                }
            }
        );
    }

    function newPvp() {

        // Convert hours and minutes to seconds
        let hours = document.getElementById("hours-input").value;
        let minutes = document.getElementById("minutes-input").value;
        let seconds = (hours * 60 * 60) + (minutes * 60);

        router.post('/games', {
                game_duration: seconds,
                type: 'pvp',
            },
            {
                onError: (errors) => {
                    alert('Non é stato possibile creare la partita: ' + Object.values(errors)[0]);
                },
            }
        );
    }

    function joinGame() {
        let code = document.getElementById("room-code-input").value;

        if (code === "") {
            return;
        }


        router.get('/games/' + code + '/join', {}, {
            onSuccess: (response) => {
                console.log(response);
            },
            onError: (response) => {
                console.log(response);
            }
        });
    }

    return (
        <AuthenticatedLayout user={auth.user} dailyChallenge={dailyChallenge} attemptsForUser={attemptsForUser}>
            <nav style={{display: 'none'}} className="top-bar">
                <i className="bi bi-trophy-fill" id="trophy-logo"></i>
                <Button variant="link" id="rankings-link">Rankings</Button>
                <Image src="" alt="User profile logo" id="user-logo" roundedCircle/>
                <span id="username">
                    {auth.user ? auth.user.username : (<>You are not logged in</>)}
                </span>
            </nav>




            <Container style={{marginTop: '20px'}}>




                <h1 id="title" className={'font-bold mb-0 text-center text-3xl'}>OsiChess</h1>
                <h2 className={"mt-0 text-center opacity-75"} id="subtitle">Really bad chess</h2>
                <br></br>
                <Row>

                    {/* SinglePlayer */}
                    <Col id="col-content" sm={12} md={6}>
                        <Container>
                            <Form onSubmit={newPvb}>
                                <br></br>
                                <h5 style={{textAlign: 'center'}} className={'dashboard-game-title'}>Singleplayer</h5>
                                <br></br>

                                {/* Difficulty */}
                                <label className={'w-100'} >
                                    Select difficulty:
                                    <div className={'slider-container'}>
                                        {/* Perfect range is from -46 to 46 but it's too unbalanced so we limited it to -30 30 */}
                                        <input type={'range'} min={-30} max={30} defaultValue={0} className={'w-100 cursor-pointer'}
                                               id={'difficulty-input'}/>
                                        <div className={"flex flex-row slider-labels-container"}>
                                            <div className={"diff-0-slider"}>
                                                <div>
                                                    0
                                                </div>
                                                <div>
                                                    You have better pieces
                                                </div>
                                            </div>
                                            <div className={"text-center diff-50-slider"}>
                                                <div>
                                                    50
                                                </div>
                                                <div>
                                                    Equal piece quality
                                                </div>
                                            </div>
                                            <div className={"text-end diff-100-slider"}>
                                                <div>
                                                    100
                                                </div>
                                                <div>
                                                    The AI has better pieces
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                                <Button type={'submit'} variant="primary" className={'w-100'}>Start match</Button>
                            </Form>
                        </Container>
                    </Col>

                    {/* MultiPlayer */}
                    <Col id="col-content" sm={12} md={6}>
                        <Container>
                        <br></br>
                        <h5 style={{textAlign: 'center'}} className={'dashboard-game-title'}>Multiplayer</h5>
                        <br></br>
                        {
                            auth.user ?
                                <div>
                                    <Row>
                                        <Col>
                                            <Form.Label for="hours-input">Insert game time hours</Form.Label>
                                            <Form.Control className={"bg-transparent text-white"} required type="number" placeholder="Hours"
                                                          id="hours-input"
                                                          min="0" max="5"/>
                                        </Col>
                                        <br></br>
                                        <Col>
                                            <Form.Label for="minutes-input">Insert game time minutes</Form.Label>
                                            <Form.Control className={"bg-transparent text-white"} required type="number" placeholder="Minutes"
                                                          id="minutes-input"
                                                          min="0" max="59"/>
                                        </Col>
                                    </Row>
                                    <Button variant="primary" onClick={newPvp} className={'w-100'}>Create a new
                                        game</Button>
                                    <br></br>

                                    <Row>
                                        <span style={{width:'100%',margin: 'auto', textAlign:'center'}}>
                                            Or
                                        </span>
                                    </Row>

                                    <Row>
                                        <Col style={{margin: 'auto'}} md={'9'}>
                                            <TextInput style={{width: '100%', margin: 'auto'}} id={"room-code-input"}
                                                       placeholder={"Room Code"}></TextInput>
                                        </Col>
                                        <Col md={'3'}>
                                            <Button variant="primary" onClick={joinGame}
                                                    className={'w-100'}>Join</Button>
                                        </Col>
                                    </Row>
                                </div>
                                :
                                <div style={{textAlign: 'center'}}>
                                    Log in to play multiplayer
                                </div>
                        }
                        </Container>
                    </Col>
                </Row>

                <Row style={{marginTop:'20px'}}>
                    <p style={{textAlign:'center'}}>
                        Prova anche a giocare con il nostro bot Telegram, invia /start a <a className={'link-blue'} target={'_blank'} href="https://t.me/osi_chess_sw_bot">@osi_chess_sw_bot</a>
                    </p>

                </Row>
            </Container>
            {/*<div style={{display:'flex', gap:'30px', alignItems:'center', justifyContent:'center'}}>*/}
            {/*    <Button onClick={newPvb} style={{width:'300px'}} variant="primary">Play VS Bot</Button>*/}
            {/*    <div style={{display:'flex',  flexFlow:'column'}}>*/}
            {/*        <Button onClick={newPvp} variant="primary">Create match</Button>*/}
            {/*        <TextInput id={"room-code-input"} placeholder={"Room Code"}></TextInput>*/}
            {/*        <Button onClick={joinGame} variant="primary">Join match</Button>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </AuthenticatedLayout>
    );
}
