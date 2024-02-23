import {useEffect} from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import {Head, Link, useForm} from '@inertiajs/react';
import '../../../css/RegisterStyle.css';
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import BigLabel from "@/Components/BigLabel.jsx";
import SmallLabel from "@/Components/SmallLabel.jsx";


export default function Register() {
    const {data, setData, post, processing, errors, reset} = useForm({
        name: '',
        username: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'));
    };

    return (

        <div className={'auth-wrapper'}>

            <Container fluid="xs">

                {/* Logo */}
                <Row>
                    <img src='/images/loghetto.png' className={'auth-logo'} alt={'logo'}></img>
                </Row>

                {/* Label */}
                <Row style={{textAlign:'center', marginBottom:'10px'}}>
                    <BigLabel>Create an account</BigLabel>
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
                        <InputError message={errors.username} />
                    </Row>

                        <Row>

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            style={{textTransform:'none'}}
                            placeholder='password'
                            value={data.password}
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />

                    </Row>

                    <Row>
                        <InputError message={errors.password} className="mt-2"/>
                    </Row>

                    <Row>

                        <TextInput
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            placeholder='confirm password'
                            style={{textTransform:'none'}}
                            value={data.password_confirmation}
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />

                    </Row>

                    <Row>
                        <InputError message={errors.password_confirmation} className="mt-2"/>
                    </Row>

                    {/* Submit */}
                    <Row>
                        <PrimaryButton disabled={processing}>
                            Register
                        </PrimaryButton>
                    </Row>
                </form>

                {/* Already registered? */}
                <Row style={{textAlign: 'center'}}>
                    <SmallLabel> Already registered?
                        <Link className={'link-blue'}
                            style={{marginLeft: '5px'}}
                            href={route('login')}>Log in
                        </Link>
                    </SmallLabel>
                </Row>

            </Container>

        </div>
    );
}
