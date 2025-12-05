'use client';

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

    // 🔹 Check login status when component loads
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const res = await fetch(
                    "https://maintenance-log-system-backend-1.onrender.com/api/auth/status",
                    { credentials: "include" }
                );

                if (res.ok) {
                    const data = await res.json();
                    setIsLoggedIn(data.authenticated === true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (err) {
                setIsLoggedIn(false);
            }
        };

        checkAuthStatus();
    }, []);

    // 🔹 Logout handler
    const handleLogout = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                "https://maintenance-log-system-backend-1.onrender.com/api/auth/logout",
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            if (res.ok) {
                setIsLoggedIn(false);
                toast.success("Logged out successfully!");
                router.push("/signin");
                router.refresh(); // Force refresh UI
            } else {
                toast.error("Logout failed.");
            }
        } catch {
            toast.error("Logout error.");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 If logged in → show logout button
    if (isLoggedIn) {
        return (
            <button
                onClick={handleLogout}
                disabled={loading}
                className={`flex items-center space-x-2 border px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    darkMode
                        ? "border-gray-600 hover:bg-gray-800"
                        : "border-gray-300 hover:bg-gray-100"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
                <FiLogOut className="h-5 w-5" />
                <span>{loading ? "Logging out..." : "Log Out"}</span>
            </button>
        );
    }

    // 🔹 If not logged in → show sign in button
    return (
        <Link href="/signin">
            <button
                className={`flex items-center space-x-2 border px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    darkMode
                        ? "border-gray-600 hover:bg-gray-800"
                        : "border-gray-300 hover:bg-gray-100"
                }`}
            >
                <FiLogIn className="h-5 w-5" />
                <span>Log Out</span>
            </button>
        </Link>
    );
}
