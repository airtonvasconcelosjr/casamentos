import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

function Home() {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.from) {
            const timer = setTimeout(() => {
                if (location.state.from === "login") {
                    toast.success("Bem-vindo de volta ao painel!");
                } else if (location.state.from === "register") {
                    toast.success("Conta criada com sucesso! Seja bem-vindo(a)!");
                } else if (location.state.from === "home") {
                    toast.success("Usario deslogado com sucesso!");
                }
                window.history.replaceState({}, document.title);
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [location]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <h1 className="text-3xl font-bold text-olive-dark">Bem-vindo ao painel do casamento!</h1>
        </div>
    );
}

export default Home;