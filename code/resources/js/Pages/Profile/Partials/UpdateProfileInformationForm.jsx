import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import SmallLabel from '@/Components/SmallLabel';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';


export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        username: user.username,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section style={{borderRadius:'10px', marginTop:'20px'}} className={"bg-dark p-5"}>
            <header>
                <h2 className="title">Edit username</h2>
                <SmallLabel>Update your account's profile Username.</SmallLabel>
            </header>
            <form onSubmit={submit} className="mt-6 space-y-6">
            <Stack direction="horizontal" gap={3}>

                    <div>
                        <TextInput
                            id="username"
                            style={{marginBottom:'0', textAlign:'start', paddingLeft:'10px'}}
                            className="textInput"
                            placeholder="New Username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            isFocused
                            autoComplete="username"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>


                <div >
                    <PrimaryButton disabled={processing} className='button'>Edit</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <SmallLabel className="text-sm text-gray-600">Saved.</SmallLabel>
                    </Transition>
                </div>
            </Stack>
            </form>
        </section>
    );
}

