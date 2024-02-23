import { useRef } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import BigLabel from '@/Components/BigLabel';
import SmallLabel from '@/Components/SmallLabel';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack'

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section style={{borderRadius:'10px', marginTop:'20px'}} className={"bg-dark p-5"}>
            <header>
                <h2 className="title">Edit Password</h2>

                <SmallLabel className="paragraph">
                    Ensure your account is using a long, random password to stay secure.
                </SmallLabel>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <Stack direction="horizontal" gap={3}>
                    <div>
                        <TextInput
                            id="current_password"
                            placeholder="Current Password"
                            style={{marginBottom:'0', textAlign:'start', paddingLeft:'10px', textTransform:'none'}}
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            className="Textinput"
                            autoComplete="current-password"/>
                        <InputError message={errors.current_password} className="mt-2" />
                    </div>
                    <div>
                       <TextInput
                            id="password"
                            placeholder="New Password"
                            style={{marginBottom:'0', textAlign:'start', paddingLeft:'10px', textTransform:'none'}}
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className="Textinput"
                            autoComplete="new-password"/>
                        <InputError message={errors.password} className="mt-2" />
                    </div>
                    <div>
                        <TextInput
                            id="password_confirmation"
                            placeholder="Confirm new password"
                            style={{marginBottom:'0', textAlign:'start', paddingLeft:'10px', textTransform:'none'}}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type="password"
                            className="Textinput"
                            autoComplete="new-password"/>
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>
                    <div>
                        <PrimaryButton disabled={processing}>Save</PrimaryButton>
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0">
                            <SmallLabel className="text-sm text-gray-600">Saved.</SmallLabel>
                        </Transition>
                    </div>
                </Stack>
            </form>
        </section>
    );
}
