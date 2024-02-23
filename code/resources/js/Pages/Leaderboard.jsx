import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Card} from "react-bootstrap";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import "../../css/leaderboard.css";
import {useState} from "react";

export default function Leaderboard({auth, scores, userScore, dailyScores, dailyUserScore}) {

    //get param date from url
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');


    if (new Date(date) > new Date()) {
        //redirect to today if date is in the future
        window.location.href = "/leaderboard";
    }

    const [tabSelection, setTabSelection] = useState(date ? 'daily' : "global");
    function changeTabSection(selection) {
        setTabSelection(selection);
    }



    function changeDate(offset = -1) {

        //remove one day from date
        let dateObj = new Date(date ? date : Date.now());
        dateObj.setDate(dateObj.getDate() + offset);
        let newDate = dateObj.toISOString().slice(0, 10);

        //check if new date is in the future
        if (new Date(newDate) > new Date()) {
            return;
        }

        window.location.href = "/leaderboard?date=" + newDate;
    }


    console.log(dailyScores);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Leaderboard</h2>}>
            <div className="flex">
                <nav className={"leaderboard-nav"}>
                    <h2>Leaderboards</h2>
                    <div onClick={() => {
                        changeTabSection("global")
                    }} className={tabSelection === "global" ? "selected-leaderboard-nav-section" : "" + " leaderboard-nav-section"}>
                        <a>Global</a>
                    </div>
                    <div onClick={() => {
                        changeTabSection("daily")
                    }} className={tabSelection === "daily" ? "selected-leaderboard-nav-section" : "" + " leaderboard-nav-section"}>
                        <a>Daily Challenge</a>
                    </div>
                </nav>
                <Container className={"leaderboard-container overflow-y-scroll"}>
                    {
                        tabSelection === "global" ?
                            <div>
                                {/* Heading */}
                                <Row>
                                    <Col>
                                        <h1>Global</h1>
                                    </Col>
                                </Row>

                                {/* Leaderboard */}
                                <Container className={"leaderboard-table-container"}>
                                    <table>
                                        <tr>
                                            <th>
                                                <div className="phrase">Position</div>
                                            </th>
                                            <th>
                                                <div className="phrase">User</div>
                                            </th>
                                            <th>
                                                <div className="phrase">Matches</div>
                                            </th>
                                            <th>
                                                <div className="phrase">ELO points</div>
                                            </th>
                                        </tr>
                                        {
                                            scores.map((score, index) => (
                                                <tr className={"leaderboard-tab-row"}>
                                                    <td>{index + 1}</td>
                                                    <td>{score.username}</td>
                                                    <td>{score.match_count}</td>
                                                    <td>{score.elo}</td>
                                                </tr>
                                            ))
                                        }
                                    </table>
                                    {
                                        userScore ?
                                            <div className={"leaderboard-user-row"}>
                                                <p>{userScore.position}</p>
                                                <p>YOU</p>
                                                <p>{userScore.match_count}</p>
                                                <p>{userScore.elo}</p>
                                            </div>
                                            : null
                                    }
                                </Container>
                            </div>
                            :
                            <div>
                                {/* Heading */}
                                <div className={"flex items-center justify-between"}>
                                    <Col>
                                        <h1>Daily Challenge</h1>
                                    </Col>
                                    <div className={"flex"}>
                                        <div onClick={ () => {changeDate(-1)}} className={"flex justify-center items-center"} style={{backgroundColor: "lightgray", padding: '3px', borderTopLeftRadius:"5px", borderBottomLeftRadius:"5px", cursor:'pointer'}}>
                                            <img style={{width: '20px', height: '20px'}}
                                                 src={"/images/arrow.svg"}></img>
                                        </div>
                                        <div className={"flex justify-center items-center"} style={{backgroundColor:"dimgray", padding:"0 5px"}}>
                                            <p style={{margin:0}}>{date ? date : "Today"}</p>
                                        </div>
                                        <div onClick={ () => {changeDate(1)}} className={"flex justify-center items-center"} style={{backgroundColor: "lightgray", padding: '3px', borderTopRightRadius:'5px', borderBottomRightRadius:'5px', cursor:'pointer'}}>
                                            <img style={{width: '20px', height: '20px', transform: "scaleX(-1)"}}
                                                 src={"/images/arrow.svg"}></img>
                                        </div>
                                    </div>
                                </div>

                                {/* Leaderboard */}
                                <Container className={"leaderboard-table-container"}>
                                    {
                                        dailyScores && dailyScores.length > 0 ?
                                            <table>
                                            <tr>
                                                    <th>
                                                        <div className="phrase">Position</div>
                                                    </th>
                                                    <th>
                                                        <div className="phrase">User</div>
                                                    </th>
                                                    <th>
                                                        <div className="phrase">Attempts</div>
                                                    </th>
                                                    <th>
                                                        <div className="phrase">Moves Count</div>
                                                    </th>
                                                </tr>
                                                {
                                                    dailyScores.map((score, index) => (
                                                        <tr className={"leaderboard-tab-row"}>
                                                            <td>{score.dailyChallengePosition}</td>
                                                            <td>{score.username}</td>
                                                            <td>{score.dailyChallengeAttempts}</td>
                                                            <td>{score.dailyChallengeMovesCount}</td>
                                                        </tr>
                                                    ))
                                                }
                                            </table>
                                        :
                                            <div style={{backgroundColor:'#00000055', width:'100%', borderRadius:'10px', padding:'20px 10px', marginTop:'20px'}}>
                                                No records for this day</div>
                                    }
                                    {
                                        dailyUserScore ?
                                            <div className={"leaderboard-user-row"}>
                                                <p>{userScore.dailyChallengePosition}</p>
                                                <p>YOU</p>
                                                <p>{userScore.dailyChallengeAttempts}</p>
                                                <p>{userScore.dailyChallengeMovesCount}</p>
                                            </div>
                                            : null
                                    }
                                </Container>
                            </div>
                    }
                </Container>
            </div>
        </AuthenticatedLayout>
    );


}
