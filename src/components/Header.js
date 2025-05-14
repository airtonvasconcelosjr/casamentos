import React, { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    verifyBeforeUpdateEmail
} from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import InputField from "../components/InputField";

Modal.setAppElement("#root");

function Header() {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setPhoneNumber(userData.phoneNumber || "");
                    setBirthDate(userData.birthDate || "");
                }
                setDisplayName(user.displayName || "");
                setNewEmail(user.email || "");
            }
        };

        fetchUserData();
    }, [user]);

    const handleSignOut = () => {
        auth.signOut();
        navigate("/login", { state: { from: "logout" } });
    };

    const handleEditClick = () => {
        setDisplayName(user?.displayName || "");
        setNewEmail(user?.email || "");
        setIsModalOpen(true);
    };

    const checkEmailExists = async (email) => {
        try {
            setIsCheckingEmail(true);

            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);

            const exists = querySnapshot.docs.some(doc => doc.id !== user.uid);

            setIsCheckingEmail(false);
            return exists;
        } catch (error) {
            console.error("Erro ao verificar email:", error);
            setIsCheckingEmail(false);
            return false;
        }
    };

    const handleSaveChanges = async () => {
        if (!user) return;

        try {
            if (newEmail !== user.email) {
                if (!currentPassword) {
                    toast.error("Informe sua senha atual para mudar o e-mail.");
                    return;
                }

                const emailExists = await checkEmailExists(newEmail);
                if (emailExists) {
                    toast.error("Este e-mail já está sendo usado por outra conta.");
                    return;
                }

                setIsUpdatingEmail(true);

                try {
                    const credential = EmailAuthProvider.credential(user.email, currentPassword);
                    await reauthenticateWithCredential(user, credential);
                    await verifyBeforeUpdateEmail(user, newEmail);

                    toast.info(
                        "Um e-mail de verificação foi enviado para o novo endereço. " +
                        "Por favor, verifique sua caixa de entrada e clique no link para confirmar a alteração."
                    );
                } catch (error) {
                    handleEmailUpdateError(error);
                    setIsUpdatingEmail(false);
                    return;
                }
            }

            await updateProfile(user, { displayName });

            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                displayName,
                phoneNumber,
                birthDate,
                email: user.email,
            }, { merge: true });

            toast.success("Perfil atualizado com sucesso!");
            setIsModalOpen(false);
            setCurrentPassword("");
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast.error(`Erro ao atualizar perfil: ${error.message}`);
        } finally {
            setIsUpdatingEmail(false);
        }
    };

    const handleEmailUpdateError = (error) => {
        console.error("Erro ao reautenticar/atualizar e-mail:", error);
        switch (error.code) {
            case "auth/operation-not-allowed":
                toast.error("Esta operação não é permitida. Contate o administrador do sistema.");
                break;
            case "auth/requires-recent-login":
                toast.error("Por segurança, faça login novamente para alterar o e-mail.");
                auth.signOut();
                navigate("/login");
                break;
            case "auth/invalid-email":
                toast.error("O formato do e-mail é inválido.");
                break;
            case "auth/email-already-in-use":
                toast.error("Este e-mail já está sendo usado por outra conta.");
                break;
            case "auth/wrong-password":
            case "auth/invalid-credential":
                toast.error("Senha incorreta.");
                break;
            default:
                toast.error(`Erro ao atualizar e-mail: ${error.message}`);
        }
    };

    return (
        <header className="bg-olive-dark text-white py-4 px-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Casar em Carneiros</h1>
                {user && (
                    <div className="flex items-center space-x-4">
                        <span className="text-sm">{user.displayName}</span>
                        <FontAwesomeIcon
                            icon={faPencil}
                            className="white mr-6 w-3 cursor-pointer"
                            onClick={handleEditClick}
                        />
                        <button
                            onClick={handleSignOut}
                            className="bg-olive-light text-black py-1 px-3 ml-2 rounded-md hover:bg-gray-100"
                        >
                            Sair
                        </button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => !isUpdatingEmail && !isCheckingEmail && setIsModalOpen(false)}
                contentLabel="Editar Perfil"
                className="modal-container w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-300"
                overlayClassName="modal-overlay"
            >
                <div className="modal-content p-6 bg-white rounded-lg">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>
                        <FontAwesomeIcon
                            icon={faTimes}
                            onClick={() => setIsModalOpen(false)}
                            className="text-black w-3 mb-4 cursor-pointer transform hover:scale-125 transition-transform duration-150"
                        />
                    </div>

                    <InputField
                        label="Nome"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={isUpdatingEmail || isCheckingEmail}
                    />

                    <InputField
                        label="Número de telefone"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={isUpdatingEmail || isCheckingEmail}
                    />

                    <InputField
                        label="Data de Nascimento"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        disabled={isUpdatingEmail || isCheckingEmail}
                    />

                    <InputField
                        label="E-mail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={isUpdatingEmail || isCheckingEmail}
                    />
                    {newEmail !== user?.email && (
                        <p className="text-xs text-gray-600 mt-1">
                            Será enviado um e-mail de verificação para o novo endereço.
                        </p>
                    )}

                    <InputField
                        label="Senha atual (para mudar e-mail)"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        disabled={isUpdatingEmail || isCheckingEmail}
                    />

                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="bg-gray-300 text-black py-1 px-3 rounded-md hover:bg-gray-400"
                            disabled={isUpdatingEmail || isCheckingEmail}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="bg-olive-light text-black py-1 px-3 rounded-md hover:bg-gray-100"
                            disabled={isUpdatingEmail || isCheckingEmail}
                        >
                            {isUpdatingEmail || isCheckingEmail ? "Processando..." : "Salvar"}
                        </button>
                    </div>
                </div>
            </Modal>
        </header>
    );
}

export default Header;