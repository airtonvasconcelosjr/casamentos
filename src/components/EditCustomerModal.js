import React, { useState, useEffect } from "react";
import { parseDateToBRFormat, parseDateFromBRFormat, formatInputDateMask } from '../utils/formatters';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, updateDoc, setDoc, collection, addDoc } from "firebase/firestore";
import InputField from "./InputField";

function EditCustomerModal({ Customer, isOpen, onClose, onSave }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [userLogged] = useAuthState(auth);

    useEffect(() => {
        if (Customer) {
            setFullName(Customer.fullName || "");
            setEmail(Customer.email || "");
            setPhone(Customer.phone || "");
            setBirthDate(parseDateToBRFormat(Customer.birthDate || ""));
        }
    }, [Customer]);

    const handleBirthDateChange = (e) => {
        setBirthDate(formatInputDateMask(e.target.value));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formattedBirthDate = parseDateFromBRFormat(birthDate);
        const updatedCustomer = {
            ...Customer,
            fullName,
            email,
            phone,
            birthDate: formattedBirthDate,
            updatedBy: userLogged?.email || "unknown",
            updatedAt: new Date(),
        };

        try {
            if (Customer?.id) {
                // Atualiza um parceiro existente
                const CustomerRef = doc(db, "Customers", Customer.id);
                await updateDoc(CustomerRef, updatedCustomer);
            } else {
                // Cria um novo parceiro
                const CustomersCollection = collection(db, "Customers");
                await addDoc(CustomersCollection, updatedCustomer);
            }

            onSave(updatedCustomer);
            onClose();
        } catch (error) {
            console.error("Erro ao salvar parceiro:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Editar Parceiro</h2>
                <form onSubmit={handleSubmit}>
                    <InputField
                        label="Nome completo"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />

                    <InputField
                        label="E-mail"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <InputField
                        label="Telefone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />

                    <InputField
                        label="Data de Nascimento"
                        type="text"
                        placeholder="dd/mm/aaaa"
                        value={birthDate}
                        onChange={handleBirthDateChange}
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
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditCustomerModal;
