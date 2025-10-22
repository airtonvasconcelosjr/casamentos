import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Capa from "../assets/capa.jpeg";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.from === "logout") {
            const timer = setTimeout(() => {
                toast.info("Usuário deslogado com sucesso!");
                window.history.replaceState({}, document.title);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/home", { state: { from: "login" } });
        } catch (err) {
            setError("E-mail ou senha inválidos.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-white via-olive-50 to-white">
            {/* Desktop background image with overlay */}
            <div
                className="hidden md:block w-1/2 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${Capa})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>

            {/* Mobile background image with overlay */}
            <div
                className="absolute inset-0 md:hidden"
                style={{
                    backgroundImage: `url(${Capa})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed",
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>


            <div className="flex-1 flex items-center justify-center p-6 md:p-0">
                <div className="bg-white p-8 md:p-8 rounded-3xl shadow-xl w-full max-w-md transform transition-all duration-700 ease-in-out animate-fade-slide">
                    <h1 className="text-3xl font-bold mb-4 text-center text-olive-dark drop-shadow-sm">
                        CASAR EM CARNEIROS
                    </h1>
                    <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700">E-mail</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-dark focus:shadow-lg transition duration-300"
                                placeholder="email@exemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700">Senha</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 mt-1 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-dark focus:shadow-lg transition duration-300"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-olive-dark text-white py-3 rounded-xl hover:bg-olive transition-colors duration-300 disabled:opacity-50"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
