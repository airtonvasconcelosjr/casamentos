import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser deve ser usado dentro de um UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user] = useAuthState(auth);
    const [userData, setUserData] = useState({
        fullName: '',
        phoneNumber: '',
        birthDate: '',
        role: null,
        email: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userDoc = await getDoc(userRef);

                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserData({
                            fullName: data.fullName || user.displayName || '',
                            phoneNumber: data.phoneNumber || '',
                            birthDate: data.birthDate || '',
                            role: data.role,
                            email: user.email || ''
                        });
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                }
            } else {
                setUserData({
                    fullName: '',
                    phoneNumber: '',
                    birthDate: '',
                    role: null,
                    email: ''
                });
            }
            setLoading(false);
        };

        fetchUserData();
    }, [user]);

    const updateUserData = (newData) => {
        setUserData(prevData => ({
            ...prevData,
            ...newData
        }));
    };

    const value = {
        userData,
        updateUserData,
        loading,
        user
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};