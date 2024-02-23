import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import '../../../css/stats.css';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { Row, Col, Card } from 'react-bootstrap';
import {useState} from "react";

export default function Stats({ auth, stats }) {
    let pvbStats = stats.pvb;
    let pvbWins = pvbStats.filter(stat => stat.winner).length;
    let pvbWinsPercentage = pvbWins / pvbStats.length * 100;
    let pvpStats = stats.pvp;

    // Remove null values from pvpStats
    pvpStats = pvpStats.filter(stat => stat !== null);
    console.log(pvpStats);

    let pvpWins = pvpStats.filter(stat => stat.winner).length;
    let pvpWinsPercentage = pvpWins / pvpStats.length * 100;

    const [tabSelection, setTabSelection] = useState('pvp');



    function changeTabSection(selection) {
        setTabSelection(selection);
    }

    function isPvb() {
        return tabSelection === "pvb";
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile</h2>}>
            <Head title="Stats"/>
            <div className={"stats-container"}>
                <nav className={"stats-nav"}>
                    <h2>Statistics</h2>
                    <div onClick={() => {changeTabSection("pvp")}} className={ tabSelection === "pvp" ? "selected-stats-nav-section" : "" + " stats-nav-section"}>
                        <a>Multiplayer games</a>
                    </div>
                    <div onClick={() => {changeTabSection("pvb")}} className={ tabSelection === "pvb" ? "selected-stats-nav-section" : "" + " stats-nav-section"}>
                        <a>Practice games</a>
                    </div>
                </nav>
                <div className='content'>
                    <h1>{isPvb() ? "Practice" : "Multiplayer" } Games</h1>
                    <h4>HUMAN VS {isPvb() ? "BOT" : "HUMAN" }</h4>
                    {
                        isPvb() && pvbStats.length > 0 || !isPvb() && pvpStats.length > 0 ?
                            <div>
                                <div className="progress-bar-container">
                                    <div className={"progress-bar-stats"}>
                                        <p>{isPvb() ? pvbWins : pvpWins} Wins - {isPvb() ? pvbStats.length - pvbWins : pvpStats.length - pvpWins} Losses</p>
                                    </div>
                                    <ProgressBar>
                                        <ProgressBar variant="success" now={isPvb() ? pvbWinsPercentage : pvpWinsPercentage} label={`${isPvb() ? pvbWinsPercentage : pvpWinsPercentage}%`}/>
                                        <ProgressBar variant="danger" now={100 - (isPvb() ? pvbWinsPercentage : pvpWinsPercentage)} label={`${100 - (isPvb() ? pvbWinsPercentage : pvpWinsPercentage)}%`}/>
                                    </ProgressBar>
                                </div>

                                {
                                    isPvb() ?
                                        <table>
                                            <tr>
                                                <th><div className="phrase">Satus</div></th>
                                                <th><div className="phrase">Moves</div></th>
                                                <th><div className="phrase">Duration</div></th>
                                                <th><div className="phrase">Date</div></th>
                                            </tr>
                                            {
                                                pvbStats.map((stat) => (
                                                    <tr className={"stats-tab-row"}>
                                                        <td style={{color: stat.winner ? 'green' : 'red'}}>{stat.winner ? "W" : "L"}</td>
                                                        <td>{stat.moves_count}</td>
                                                        <td>{
                                                            Math.floor((((new Date(stat.last_move_at)) - (new Date(stat.game.game_start_time))) / 1000) / 60)
                                                        }  min</td>
                                                        <td>{(new Date(stat.game.game_start_time)).toLocaleDateString()}</td>
                                                    </tr>
                                                ))
                                            }

                                        </table>
                                    :
                                        <div>
                                            <h4 className={"stats-my-elo-label"}>My ELO points: {auth.user.ELO}</h4>
                                            <table>
                                                <tr>
                                                    <th><div className="phrase">Satus</div></th>
                                                    <th><div className="phrase">Moves</div></th>
                                                    <th><div className="phrase">Duration</div></th>
                                                    <th><div className="phrase">Date</div></th>
                                                    <th><div className="phrase">Opponent</div></th>
                                                    <th><div className="phrase">Opponent ELO</div></th>
                                                </tr>
                                                {
                                                    pvpStats.map((stat) => (
                                                        <tr className={"stats-tab-row"}>
                                                            <td style={{color: stat.winner ? 'green' : 'red'}}>{stat.winner ? "W" : "L"}</td>
                                                            <td>{stat.moves_count}</td>
                                                            <td>{stat.last_move_at ? Math.floor((((new Date(stat.last_move_at)) - (new Date(stat.game.game_start_time))) / 1000) / 60) : "0"} min</td>
                                                            <td>{(new Date(stat.game.game_start_time)).toLocaleDateString()}</td>
                                                            {stat.opponent !== null &&
                                                                <td>{stat.opponent.username}</td>
                                                            }
                                                            {stat.opponent !== null &&
                                                                <td>{stat.opponent.ELO}</td>
                                                            }

                                                        </tr>
                                                    ))
                                                }
                                            </table>
                                        </div>

                                }
                            </div>
                        :
                            <div>
                                <p className={"stats-placeholder"}>No games played yet</p>
                            </div>
                    }
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
