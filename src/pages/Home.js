import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useUser } from "../contexts/UserContext";
import Card from "../components/Card";
import backgroundImage from "../assets/casamento-na-praia.jpg";
import FireworksEffect from "../components/FireworksEffect";

function Home() {
    const location = useLocation();
    const { userData, loading } = useUser();
    const { fullName, role } = userData;

    useEffect(() => {
        if (location.state?.from) {
            const timer = setTimeout(() => {
                if (location.state.from === "login") {
                    toast.success("Bem-vindo de volta ao painel!");
                } else if (location.state.from === "register") {
                    toast.success("Conta criada com sucesso! Seja bem-vindo(a)!");
                } else if (location.state.from === "home") {
                    toast.success("Usuário deslogado com sucesso!");
                }
                window.history.replaceState({}, document.title);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [location]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-dark mx-auto"></div>
                    <p className="mt-4 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-green-50 p-6">
            {/* Parte esquerda */}
            <div className="md:w-1/2 flex flex-col justify-center items-center text-center p-10 md:p-6">
                {role === "admin" && (
                    <h1 className="text-3xl font-bold text-olive-dark mb-4">
                        Olá {fullName}, seja bem-vindo(a) novamente!
                    </h1>
                )}
            </div>

            {/* Parte direita */}
            <div className="relative w-full md:w-1/2 flex flex-col justify-center items-center gap-6 overflow-hidden rounded-lg shadow-lg p-6 h-[60vh] md:h-auto">

                {/* Imagem de fundo */}
                <img
                    src={backgroundImage}
                    alt="Fundo decorativo"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none select-none"
                />

                {/* Conteúdo (cards) fica sobre a imagem */}
                <div className="relative w-full z-30 flex flex-col justify-center items-center gap-6">
                    {role === "admin" && (
                        <>
                            <Link to="/users" className="w-full max-w-md">
                                <Card title="Usuários" description="Gerencie os usuários cadastrados." />
                            </Link>
                            <Link to="/orcamentos" className="w-full max-w-md">
                                <Card title="Orçamentos" description="Visualize e edite os orçamentos." />
                            </Link>
                             <Link to="/clientes" className="w-full max-w-md">
                                <Card title="Clientes" description="Gerencie/ cadastre clientes." />
                            </Link>
                        </>
                    )}

                    {role !== "admin" && (
                        <div className="w-full max-w-md">
                            <Card title="Orçamentos" description="Veja seus orçamentos disponíveis." />
                            <Card title="Clientes" description="Gerencie/ cadastre clientes." />
                        </div>
                    )}
                </div>
                <FireworksEffect className="opacity-40" />
            </div>
        </div>
    );
}

export default Home;