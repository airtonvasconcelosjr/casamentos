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
        <div className="min-h-screen flex">
            <div
                className="w-1/2 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${Capa})` }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>

            <div className="w-1/2 flex items-center justify-center bg-white relative z-10">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-700">E-mail</label>
                            <input
                                type="email"
                                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-olive text-white py-2 rounded-md hover:bg-olive-dark transition-colors disabled:opacity-50"
                        >
                            {loading ? "Entrando..." : "Entrar"}
                        </button>
                    </form>
                    <Link to="/register" className="text-olive-dark hover:text-olive mt-4 text-sm block text-center">
                        Cadastrar-se
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
