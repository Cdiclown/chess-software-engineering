import {useEffect} from 'react';
import {Head, Link, useForm} from '@inertiajs/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import TextInput from "@/Components/TextInput.jsx";
import InputError from "@/Components/InputError.jsx";
import PrimaryButton from "@/Components/PrimaryButton.jsx";
import SmallLabel from "@/Components/SmallLabel.jsx";
import BigLabel from "@/Components/BigLabel.jsx";

export default function Login({status, canResetPassword}) {

    const {data, setData, post, processing, errors, reset} = useForm({
        username: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'));
    };

    return (


        <div className={'auth-wrapper'}>

            <Container fluid="xs">

                {/* Logo */}
                <Row>
                    <img src='/images/loghetto.png' className={'auth-logo'} alt={'logo'}></img>
                </Row>

                {/* Without login */}
                <Row>
                    <Link href={route('dashboard')}>
                        <PrimaryButton disabled={processing} style={{width: '100%'}}>
                            Continue without login

                        </PrimaryButton>
                    </Link>
                </Row>

                {/* Divider */}
                <Row>
                    <div style={{display:'flex', flexDirection:'row'}}>
                        <div className={'divider'}/>
                        <span style={{color:'white', lineHeight:'38px', margin:'0 10px'}}>Or</span>
                        <div  className={'divider'}/>
                    </div>
                </Row>

                {/* Label */}
                <Row style={{textAlign:'center', marginBottom:'10px'}}>
                    <BigLabel>Log in</BigLabel>
                </Row>

                <form onSubmit={submit}>


                    {/* Username */}
                    <Row>
                        <TextInput
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={data.username}
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('username', e.target.value)}

                        />
                    </Row>

                    <Row>
                        <InputError message={errors.username}/>
                    </Row>

                    {/* Password */}
                    <Row>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                            style={{textTransform:'none'}}
                            value={data.password}
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />

                    </Row>

                    <Row>
                        <InputError message={errors.password}/>
                    </Row>
                    <Row>
                        <PrimaryButton disabled={processing} type={'submit'}>
                            Log in
                        </PrimaryButton>
                    </Row>

                    <Row>
                        <SmallLabel>Don't have an account yet?<Link className={'link-blue'} style={{marginLeft: '5px'}}
                            href={route('register')}>Register</Link>
                        </SmallLabel>
                    </Row>
                </form>
                <Row>


                </Row>

            </Container>

        </div>
    );


    // <div className='login-wrapper'>
    {/*    <Head title="Log in"/>*/
    }

    {/*    <div className={'login-form'}>*/
    }
    {/*        <img src='/images/loghetto.png' alt="error"></img>*/
    }

    {/*        <Link href={route('dashboard')} className='login-link'>*/
    }
    {/*            <PrimaryButton disabled={processing} style={{width: '100%'}}>*/
    }
    {/*                Continue without login*/
    }
    {/*            </PrimaryButton>*/
    }
    {/*        </Link>*/
    }

    {/*        <div className="login-bho">*/
    }
    {/*            <div className="login-line"></div>*/
    }
    {/*            <span className="login-or">Or</span>*/
    }
    {/*            <div className="login-line"></div>*/
    }
    {/*        </div>*/
    }

    {/*       */
    }
    {/*    </div>*/
    }
    {/*</div>*/
    }

}
