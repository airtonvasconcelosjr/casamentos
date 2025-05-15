import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { formatPhoneNumber, formatDateBR } from '../utils/formatters';
import EditUserModal from "../components/EditUserModal";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import DeleteUserModal from "../components/DeleteUserModal";
import { toast } from "react-toastify";

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLogged] = useAuthState(auth);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);


    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsEditOpen(true);
    };

    const handleEditSave = async (updatedUser) => {
        try {
            const userRef = doc(db, "users", updatedUser.id);
            await updateDoc(userRef, {
                fullName: updatedUser.fullName,
                phoneNumber: updatedUser.phoneNumber,
                birthDate: updatedUser.birthDate
            });

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === updatedUser.id ? { ...user, ...updatedUser } : user
                )
            );
            toast.success("Usuário atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error);
            toast.error("Erro ao atualizar usuário.");
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async (user) => {
        try {
            await deleteDoc(doc(db, "users", user.id));
            setUsers(prev => prev.filter(u => u.id !== user.id));
            setIsDeleteOpen(false);
            console.log("Usuário excluído com sucesso:", user.fullName);
            toast.success("Usuário excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            toast.error("Erro ao excluir usuário.");
        }
    };

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const usersList = [];
                querySnapshot.forEach((doc) => {
                    usersList.push({ id: doc.id, ...doc.data() });
                });
                setUsers(usersList);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    const filteredUsers = userLogged?.email === "airton.vasconcelosjr@gmail.com"
        ? users
        : users.filter(user => user.role === "client");

    return (
        <div className="min-h-screen bg-green-50 p-8">
            <div className="flex items-center mb-8">
                <Link to="/home">
                    <button
                        className="flex items-center gap-2 text-olive-dark hover:underline"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} className="mr-4 text-2xl hover:scale-125" />
                    </button>
                </Link>
                <h1 className="text-4xl font-bold text-olive-dark">Lista de Usuários</h1>
            </div>

            {loading ? (
                <p className="text-lg text-gray-700">Carregando usuários...</p>
            ) : filteredUsers.length === 0 ? (
                <p className="text-lg text-gray-700">Nenhum usuário encontrado.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-olive-dark text-white">
                            <tr>
                                <th className="py-3 px-6 text-left">Nome</th>
                                <th className="py-3 px-6 text-left">Telefone</th>
                                <th className="py-3 px-6 text-left">Email</th>
                                <th className="py-3 px-6 text-left">Dt de Nascimento</th>
                                <th className="py-3 px-6 text-left">Função</th>
                                <th className="py-3 px-6 text-left">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(({ id, fullName: name, phoneNumber, email, birthDate, role }) => (
                                <tr key={id} className="border-b border-gray-200 hover:bg-green-100">
                                    <td className="py-4 px-6 text-olive-dark font-medium">{name || "—"}</td>
                                    <td>{formatPhoneNumber(phoneNumber || "—")}</td>
                                    <td className="py-4 px-6 text-gray-700">{email || "—"}</td>
                                    <td className="py-4 px-6 text-gray-700">{formatDateBR(birthDate)}</td>
                                    <td className="py-4 px-6 capitalize">
                                        {role === "client" ? "Cliente" : role || "—"}
                                    </td>
                                    <td className="py-4 px-6 flex items-center gap-4">
                                        <button
                                            onClick={() => handleEditClick({ id, fullName: name, phoneNumber, email, birthDate, role })}
                                            className="text-olive hover:text-black transition"
                                            title="Editar"
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteClick({ id, fullName: name })}
                                            className="text-red-600 hover:text-red-800 transition"
                                            title="Excluir"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <EditUserModal
                        user={selectedUser}
                        isOpen={isEditOpen}
                        onClose={() => setIsEditOpen(false)}
                        onSave={handleEditSave}
                    />
                    <DeleteUserModal
                        isOpen={isDeleteOpen}
                        onClose={() => setIsDeleteOpen(false)}
                        onConfirm={handleDeleteConfirm}
                        user={userToDelete}
                    />

                </div>
            )}
        </div>
    );
}

export default UsersList;
