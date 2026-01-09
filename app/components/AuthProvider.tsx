'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import { auth } from '@/lib/firebase';
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';

export type UserRole = 'user' | 'moderator' | 'admin';

interface AuthContextType {
    user: User | null;
    userRole: UserRole;
    isAdmin: boolean;
    isModerator: boolean;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    isLoginModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRole: 'user',
    isAdmin: false,
    isModerator: false,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { },
    openLoginModal: () => { },
    closeLoginModal: () => { },
    isLoginModalOpen: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole>('user');
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const isAdmin = userRole === 'admin';
    const isModerator = userRole === 'moderator' || userRole === 'admin';

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Sync user with backend and get role
                try {
                    const response = await fetch('/api/auth/sync', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName,
                            photoURL: currentUser.photoURL,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Auth sync response:', data);
                        console.log('User role from API:', data.user?.role);
                        setUserRole(data.user?.role || 'user');
                    } else if (response.status === 403) {
                        // User is banned
                        const data = await response.json();
                        console.error('Account banned:', data.reason);
                        if (auth) await firebaseSignOut(auth);
                        alert('Your account has been banned. Reason: ' + (data.reason || 'Violation of terms'));
                    } else {
                        console.error('Auth sync failed:', response.status);
                    }
                } catch (error) {
                    console.error('Failed to sync user with backend:', error);
                }
            } else {
                setUserRole('user');
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setIsLoginModalOpen(false); // Close modal on success
        } catch (error) {
            console.error('Error signing in with Google', error);
            throw error;
        }
    };

    const logout = async () => {
        if (!auth) return;
        try {
            await firebaseSignOut(auth);
            setUserRole('user');
        } catch (error) {
            console.error('Error signing out', error);
            throw error;
        }
    };

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    return (
        <AuthContext.Provider value={{
            user,
            userRole,
            isAdmin,
            isModerator,
            loading,
            signInWithGoogle,
            logout,
            openLoginModal,
            closeLoginModal,
            isLoginModalOpen
        }}>
            {children}
            <AuthModal />
        </AuthContext.Provider>
    );
}

