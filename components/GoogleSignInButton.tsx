'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/lib/session';

declare global {
    interface Window {
        google: any;
    }
}

export default function GoogleSignInButton({ text = "Sign in with Google" }: { text?: string }) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load Google script dynamically
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.onload = () => {
            initializeGoogleSignIn();
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initializeGoogleSignIn = () => {
        if (!window.google || !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
            console.warn("Google Sign-In not initialized: specific client ID required");
            return;
        }

        try {
            window.google.accounts.id.initialize({
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                callback: handleGoogleCallback,
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            // Use a wrapper div for the button to control styling better if needed
            window.google.accounts.id.renderButton(
                document.getElementById('google-btn-wrapper'),
                { theme: 'outline', size: 'large', width: '100%', text: 'continue_with' }
            );
        } catch (e) {
            console.error("Error initializing Google Sign-In:", e);
        }
    };

    const handleGoogleCallback = async (response: any) => {
        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Google sign in failed');
            }

            const data = await res.json();

            // Store tokens
            localStorage.setItem('auth_token', data.token);
            if (data.refreshToken) {
                localStorage.setItem('refresh_token', data.refreshToken);
            }
            localStorage.setItem('invoice-generator-current-user', JSON.stringify(data.user));
            document.cookie = `auth_token=${data.token}; path=/; max-age=${15 * 60}; SameSite=Lax`;

            createSession(data.user);

            window.location.href = '/dashboard';
        } catch (err: any) {
            console.error('Google login error:', err);
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    {error}
                </div>
            )}

            {/* Container for Google's rendered button */}
            <div id="google-btn-wrapper" className="w-full h-[40px] flex justify-center"></div>

            {/* Fallback/Loading state if script hasn't loaded or ID missing */}
            {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <div className="text-xs text-center text-gray-400 mt-2">
                    Configure NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google Sign-In
                </div>
            )}
        </div>
    );
}
