import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [role, setRole] = useState(null);
    const [name, setName] = useState("");

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setRole(data.role);
                    setName(data.name || user.displayName || "");
                }
            }
        });

        return () => unsubscribe();
    }, []);

      const listUsers = () => {
            navigate("/users", { state: { from: "home" } });
        };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-green-50 p-6">
            <div className="md:w-1/2 flex flex-col justify-center items-center text-center p-6">
                {role === "client" && (
                    <>
                        <h1 className="text-3xl font-bold text-olive-dark mb-4">
                            Olá, <span className="font-calligraphy text-6xl">{name}</span>
                        </h1>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Que alegria ter você aqui! Este é o seu espaço exclusivo para acompanhar cada detalhe da organização
                            do seu grande dia. <br /><br />
                            Nosso time preparou tudo com carinho para tornar sua experiência mais leve, tranquila e especial.
                            Aqui, você poderá visualizar orçamentos, tomar decisões importantes e garantir que tudo esteja perfeito
                            para o momento mais inesquecível da sua vida. <br /><br />
                            Sinta-se à vontade, o seu sonho começa agora!
                        </p>
                    </>
                )}

                {role === "admin" && (
                    <h1 className="text-3xl font-bold text-olive-dark mb-4">
                        Olá {name}, seja bem-vindo novamente!
                    </h1>
                )}
            </div>

            <div className="md:w-1/2 flex flex-col justify-center items-center gap-6 p-6">
                {role === "admin" && (
                    <>
                        <Link to="/users">
                            <Card title="Usuários" description="Gerencie os usuários cadastrados." />
                        </Link>
                        <Card title="Orçamentos" description="Visualize e edite os orçamentos." />
                    </>
                )}

                {role === "client" && (
                    <Card title="Orçamentos" description="Veja seus orçamentos disponíveis." />
                )}
            </div>
        </div>
    );
}

export default Home;
