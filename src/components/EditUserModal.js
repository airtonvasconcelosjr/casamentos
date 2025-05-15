import React, { useState, useEffect } from "react";
import { parseDateToBRFormat, parseDateFromBRFormat, formatInputDateMask } from '../utils/formatters';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import InputField from "./InputField";

function EditUserModal({ user, isOpen, onClose, onSave }) {
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [userLogged] = useAuthState(auth);

    useEffect(() => {
        if (user) {
            console.log(user);
            setFullName(user.fullName || "");
            setPhoneNumber(user.phoneNumber || "");
            setEmail(user.email || "");
            setRole(user.role || "client");
            setBirthDate(parseDateToBRFormat(user.birthDate || user.dob || ""));
        }
    }, [user]);

    const handleBirthDateChange = (e) => {
        setBirthDate(formatInputDateMask(e.target.value));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formattedBirthDate = parseDateFromBRFormat(birthDate);

        const updatedUser = {
            ...user,
            fullName,
            phoneNumber,
            role,
            birthDate: formattedBirthDate || user.birthDate
        };

        onSave(updatedUser);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Editar Usuário</h2>
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
                        disabled={true}
                        onChange={() => { }}
                    />

                    <InputField
                        label="Data de Nascimento"
                        type="text"
                        placeholder="dd/mm/aaaa"
                        value={birthDate}
                        onChange={handleBirthDateChange}
                    />

                    {userLogged?.email === "airton.vasconcelosjr@gmail.com" && (
                        <div className="mb-4">
                            <label className="block text-gray-700">Função</label>
                            <select
                                className="w-full border border-gray-300 rounded p-2"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <option value="client">Cliente</option>
                                <option value="admin">Administrador</option>
                                <option value="staff">Funcionário</option>
                            </select>
                        </div>
                    )}

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
                            Salvar
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}

export default EditUserModal;