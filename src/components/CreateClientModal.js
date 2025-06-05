import React, { useState } from "react";
import { parseDateFromBRFormat, formatInputDateMask } from "../utils/formatters";
import InputField from "./InputField";

function CreateClientModal({ isOpen, onClose, onCreate }) {
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleBirthDateChange = (e) => {
        setBirthDate(formatInputDateMask(e.target.value));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        if (!fullName || !phoneNumber || !email || !birthDate || !password) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        const newClient = {
            fullName,
            phoneNumber,
            email,
            role: "client",
            birthDate: parseDateFromBRFormat(birthDate),
            password,
        };

        onCreate(newClient);
        onClose();

        setFullName("");
        setPhoneNumber("");
        setEmail("");
        setBirthDate("");
        setPassword("");
        setConfirmPassword("");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Adicionar Cliente</h2>
                {error && <p className="mb-4 text-red-600">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <InputField
                        label="Nome completo"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />

                    <InputField
                        label="Telefone"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />

                    <InputField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <InputField
                        label="Data de Nascimento"
                        type="text"
                        placeholder="dd/mm/aaaa"
                        value={birthDate}
                        onChange={handleBirthDateChange}
                    />

                    <InputField
                        label="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <InputField
                        label="Confirme a senha"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-olive-dark text-white rounded hover:bg-olive"
                        >
                            Criar Cliente
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateClientModal;