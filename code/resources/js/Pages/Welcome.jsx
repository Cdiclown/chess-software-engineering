import {Head, Link} from '@inertiajs/react';

export default function Welcome({auth}) {
    return (
        <div>
            <Head title="Welcome" />


            { auth.user ?

                // Logged in
                (<Link href={route('dashboard')}>
                    Dashboard
                </Link>)

                :

                // Not logged in
                (<div>
                    <Link href={route('login')}>
                        Log in
                    </Link>

                    <Link href={route('register')}>
                        Register
                    </Link>

                    <Link href={route('dashboard')}>
                        Continue without registration
                    </Link>
                </div>)

            }

            <h1>
                Qua ci mettiamo una bellissima landing page con i pezzi degli scacchi che fluttuano nel vuoto
            </h1>
        </div>
    );
}
