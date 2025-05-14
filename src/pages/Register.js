import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [error, setError] = useState("");
    const [emailInUse, setEmailInUse] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        if (!fullName || !phoneNumber || !birthDate) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: fullName,
            });

            await setDoc(doc(db, "users", user.uid), {
                email: email,
                fullName: fullName,
                phoneNumber: phoneNumber,
                birthDate: birthDate,
            });

            navigate("/home", { state: { from: "register" } });
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setEmailInUse(true);
            } else {
                setError("Erro ao criar usuário: " + err.message);
                setEmailInUse(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Criar Conta</h2>
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-gray-700">E-mail</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 mt-1 border rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Senha</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 mt-1 border rounded-md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700">Confirmar Senha</label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 mt-1 border rounded-md"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Nome Completo</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 mt-1 border rounded-md"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Número de Celular</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 mt-1 border rounded-md"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Data de Nascimento</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 mt-1 border rounded-md"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
                    >
                        Criar Conta
                    </button>
                </form>

                {emailInUse && (
                    <p className="text-sm mt-2 text-center">
                        Este e-mail já está em uso.{" "}
                        <a href="/" className="text-blue-500 hover:underline">
                            Faça login aqui
                        </a>.
                    </p>
                )}
            </div>
        </div>
    );
}

export default Register;
