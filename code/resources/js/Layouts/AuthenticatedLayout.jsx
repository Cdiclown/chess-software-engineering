import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';
import PrimaryButton from "@/Components/PrimaryButton.jsx";

export default function Authenticated({ user, dailyChallenge, children, attemptsForUser  }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [dailyChallengePopupOpen, setDailyChallengePopupOpen] = useState(false);
    console.log(dailyChallenge);
    console.log(attemptsForUser);


    return (
        <div>
            <nav className={'app-nav relative'}>

                <div className={'app-nav-link-section'}>
                    {/* Logo */}
                    <Link href={route('dashboard')} style={{height: '100%'}}>
                        <ApplicationLogo/>
                    </Link>


                    {
                        window.location.href.includes("leaderboard") ?
                            null
                            :
                            <Link className={"nav-link-text"} href={'/leaderboard'}>
                                <svg width="38" height="34" viewBox="0 0 38 34" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M36.4167 4.25H29.5556V1.59375C29.5556 0.710547 28.8497 0 27.9722 0H10.0278C9.15035 0 8.44444 0.710547 8.44444 1.59375V4.25H1.58333C0.705903 4.25 0 4.96055 0 5.84375V9.5625C0 11.9332 1.48438 14.3703 4.08368 16.2496C6.16181 17.757 8.68854 18.7133 11.3406 19.0187C13.4122 22.4785 15.8333 23.9062 15.8333 23.9062V28.6875H12.6667C10.3378 28.6875 8.44444 30.0621 8.44444 32.4062V33.2031C8.44444 33.6414 8.80069 34 9.23611 34H28.7639C29.1993 34 29.5556 33.6414 29.5556 33.2031V32.4062C29.5556 30.0621 27.6622 28.6875 25.3333 28.6875H22.1667V23.9062C22.1667 23.9062 24.5878 22.4785 26.6594 19.0187C29.3181 18.7133 31.8448 17.757 33.9163 16.2496C36.509 14.3703 38 11.9332 38 9.5625V5.84375C38 4.96055 37.2941 4.25 36.4167 4.25ZM6.55104 12.8031C4.94132 11.6344 4.22222 10.3328 4.22222 9.5625V8.5H8.45764C8.52361 10.6648 8.84028 12.5641 9.30208 14.2242C8.3059 13.8789 7.37569 13.4008 6.55104 12.8031ZM33.7778 9.5625C33.7778 10.6316 32.6101 11.9598 31.449 12.8031C30.6243 13.4008 29.6875 13.8789 28.6913 14.2242C29.1531 12.5641 29.4698 10.6648 29.5358 8.5H33.7778V9.5625Z"
                                        fill="#888888"/>
                                </svg>
                                Leaderboard
                            </Link>
                    }

                    {
                        dailyChallenge && user ?
                            <p onClick={() => {
                                setDailyChallengePopupOpen(true)
                            }} className={"nav-link-text"} style={{textDecoration:'underline', margin:'0'}}>
                                Daily challenge
                            </p>
                        :
                            null
                    }


                </div>


                {/* Navigation links */}

                {/* User drop-down */}
                {
                    user ?
                        <Dropdown>
                            <Dropdown.Trigger>
                                <div className={"flex items-center gap-2 cursor-pointer"}>
                                    <button className={"text-white font-bold bg-transparent border-none"} type="button">
                                        {user.username}
                                    </button>
                                    <img className={"w-11"} src="/images/usericon.svg" alt={user.username}/>
                                </div>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <Dropdown.Link href={route('profile.stats')}>Stats</Dropdown.Link>
                                <Dropdown.Link style={{color: "red", border: "none", backgroundColor: 'oldlace'}}
                                               href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                        :
                        <Link replace href={route('login')}>
                            <PrimaryButton type="button">Log in</PrimaryButton>
                        </Link>

                }


            </nav>

            {/* App */}
            <div>
                {children}
            </div>

            {/* Daily challenge popup */}
            {
                dailyChallengePopupOpen ?
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: '#000000aa',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '20px',
                            padding: '30px 50px'
                        }}>
                            <h1 style={{textAlign: 'center', color: 'black'}}>Daily challenge</h1>

                            {
                                attemptsForUser > 0 ?
                                    <p className={"text-center text-black"}>{attemptsForUser} attempts left</p>
                                :
                                    <p className={"text-center text-black"}>0 attempts left, try again tomorrow</p>
                            }

                            <div style={{
                                pointerEvents: attemptsForUser > 0 ? 'auto' : 'none',
                                opacity: attemptsForUser > 0 ? '1' : '0.5',
                                backgroundColor: 'lightskyblue',
                                width: '100%',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                                <a href={'/dailychallenge/'} style={{
                                    border: 'none',
                                    color: 'white',
                                    padding: '5px 10px',
                                    textAlign: 'center',
                                    width: '100%',
                                }}>
                                    Play
                                </a>
                            </div>


                            <button style={{
                                border: 'none',
                                backgroundColor: 'lightgray',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                width: '100%'
                            }} onClick={() => {
                                setDailyChallengePopupOpen(false)
                            }}>Close
                            </button>
                        </div>
                    </div>
                : null
            }

        </div>
    );
}
