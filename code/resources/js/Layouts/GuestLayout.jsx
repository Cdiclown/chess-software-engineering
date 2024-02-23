import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div>

            {/* Logo */}
            <div>
                <Link href="/">
                    <ApplicationLogo/>
                </Link>
            </div>

            {/* App rendered here */}
            <div>
                {children}
            </div>
        </div>
    );
}
