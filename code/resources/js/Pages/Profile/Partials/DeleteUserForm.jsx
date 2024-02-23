import { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import BigLabel from '@/Components/BigLabel';
import SmallLabel from '@/Components/SmallLabel';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack'

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <BigLabel className="title">Delete Account</BigLabel>
                </header>
                <Stack direction="horizontal" gap={3}>
                <div >
                <SmallLabel className="paragraph">
                    Once your account is deleted, all of its resources and data will be permanently deleted. Before
                    deleting your account, please download any data or information that you wish to retain.
                </SmallLabel>
                </div>
                <div><Button  variant="outline-danger" className='Button' onClick={confirmUserDeletion}>Delete Account</Button></div>
  

      
                </Stack>    

                
           

            

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6">
                    <BigLabel className="title">
                        Are you sure you want to delete your account?
                    </BigLabel>

                    <SmallLabel className="paragraph">
                        Once your account is deleted, all of its resources and data will be permanently deleted. Please
                        enter your password to confirm you would like to permanently delete your account.
                    </SmallLabel>

                    <div className="mt-6">
                        <InputLabel htmlFor="password" value="Password" className="sr-only" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            placeholder="your password"
                            className="Textinput"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                    
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <Stack direction="horizontal" gap={3}>

                    <div className="mt-6 flex justify-end">
                        <SecondaryButton onClick={closeModal}>Cancel</SecondaryButton>
                    </div>
                    <div>
                        <Button variant="outline-danger"className="Button" disabled={processing}>
                            Delete Account
                            </Button>
                    </div>
                    </Stack>
                </form>
            </Modal>
        </section>
    );
}
