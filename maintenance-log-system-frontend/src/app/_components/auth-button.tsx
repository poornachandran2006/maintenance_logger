'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiLogIn, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthButtonProps {
    darkMode: boolean;
}

export default function AuthButton({ darkMode }: AuthButtonProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const res = await fetch('https://maintenance-log-system-backend-1.onrender.com/api/auth/status', {
                    credentials: 'include',
                });

                if (!res.ok) throw new Error('Auth check failed');

                const data = await res.json();
                setIsLoggedIn(data.authenticated);

                console.log('Auth status:', data);
            } catch (error) {
                console.error('Auth check error:', error);
                setIsLoggedIn(false);
            }
        };

        checkAuthStatus();

        const handleStorageChange = () => checkAuthStatus();
        window.addEventListener('storage', handleStorageChange);

        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://maintenance-log-system-backend-1.onrender.com/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Logout failed');

            setIsLoggedIn(false);
            toast.success('Logged out successfully!');
            router.refresh(); // Force refresh to update all components
        } catch (error) {
            console.error('Logout error:', error);
            toast.error(error instanceof Error ? error.message : 'Logout failed');
        } finally {
            setLoading(false);
        }
    };

    console.log('Rendering AuthButton, isLoggedIn:', isLoggedIn);

    if (isLoggedIn) {
        return (
            <button
                onClick={handleLogout}
                disabled={loading}
                className={`flex items-center space-x-2 border px-4 py-2 rounded-lg transition-colors cursor-pointer ${darkMode
                        ? 'border-gray-600 hover:bg-gray-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                <FiLogOut className="h-5 w-5" />
                <span>{loading ? 'Logging out...' : 'Log Out'}</span>
            </button>
        );
    }

    return (
        <Link href="/signin">
            <button
                className={`flex items-center space-x-2 border px-4 py-2 rounded-lg transition-colors cursor-pointer ${darkMode
                        ? 'border-gray-600 hover:bg-gray-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
            >
                <FiLogIn className="h-5 w-5" />
                <span>Sign In</span>
            </button>
        </Link>
    );
}