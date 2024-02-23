import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import {Head} from '@inertiajs/react';
import BigLabel from "@/Components/BigLabel.jsx";
import '../../../css/Edit.css';
import '../../../css/app.css';
import Container from "react-bootstrap/Container";

export default function Edit({auth, mustVerifyEmail, status}) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile</h2>}
        >
            <Head title="Profile"/>

            <Container>

                <BigLabel className='Bigtitle'>
                    {auth.user ? "Profile" : (<>You are not logged in</>)}
                </BigLabel>

                {
                    auth.user ?
                        <>
                            <UpdateProfileInformationForm
                                status={status}
                                className="c"/>

                            <UpdatePasswordForm className="b"/>
                        </>
                    : null
                }
            </Container>

        </AuthenticatedLayout>
    );
}

