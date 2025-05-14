import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

function Header() {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    const handleSignOut = () => {
        auth.signOut();
        navigate("/login", { state: { from: "logout" } });
    };

    return (
        <header className="bg-olive-dark text-white py-4 px-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Casar em Carneiros</h1>
                {user && (
                    <div className="flex items-center space-x-4">
                        <span className="text-sm">{user.email}</span>
                        <button
                            onClick={handleSignOut}
                            className="bg-olive-light text-black py-1 px-3 rounded-md hover:bg-gray-100"
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;