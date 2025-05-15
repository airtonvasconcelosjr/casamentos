import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPencil, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { formatPhoneNumber, formatDateBR } from '../utils/formatters';
import EditUserModal from "../components/EditUserModal";
import { doc, updateDoc, deleteDoc, setDoc, serverTimestamp, orderBy } from "firebase/firestore";
import DeleteUserModal from "../components/DeleteUserModal";
import { toast } from "react-toastify";
import CreateUserModal from "../components/CreateUserModal";
import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";


function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLogged] = useAuthState(auth);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

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
            // 1. Primeiro excluímos o documento do Firestore
            await deleteDoc(doc(db, "users", user.id));
            
            // 2. Tentamos excluir o usuário da autenticação
            // Para isso, precisamos de acesso administrativo ou estar autenticado como o usuário
            // Aqui vamos usar uma função que pode ser implementada no Firebase Functions
            try {
                // Esta é uma abordagem simplificada que funciona apenas para administradores
                // Em um ambiente de produção, você deve usar Firebase Functions
                const adminAuth = getAuth();
                const userToDelete = adminAuth.currentUser;
                
                if (userToDelete && userToDelete.uid === user.id) {
                    await deleteUser(userToDelete);
                } else {
                    console.log("Não foi possível excluir o usuário do Auth diretamente. Um Cloud Function seria necessário.");
                    // Aqui você poderia chamar uma Cloud Function que faria essa exclusão
                }
            } catch (authError) {
                console.error("Erro ao excluir usuário da autenticação:", authError);
                // Continuamos mesmo se houver erro na exclusão da autenticação
                // para não interromper a experiência do usuário
            }
            
            // 3. Atualizamos o estado da interface
            setUsers(prev => prev.filter(u => u.id !== user.id));
            setIsDeleteOpen(false);
            console.log("Usuário excluído com sucesso:", user.fullName);
            toast.success("Usuário excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            toast.error("Erro ao excluir usuário.");
        }
    };

    const handleCreateUser = async (newUser) => {
        try {
            const { email, password, fullName, phoneNumber, birthDate, role } = newUser;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            await setDoc(doc(db, "users", userId), {
                email,
                fullName,
                phoneNumber,
                birthDate,
                role: role || 'client',
                createdAt: serverTimestamp(),
            });

            setUsers(prev => [...prev, {
                id: userId,
                email,
                fullName,
                phoneNumber,
                birthDate,
                role: role || 'client',
                createdAt: serverTimestamp(),
            }]);

            toast.success("Usuário criado com sucesso!");
            setIsCreateOpen(false);
        } catch (error) {
            console.error("Erro ao criar usuário:", error.message);
            toast.error(`Erro ao criar usuário: ${error.message}`);
        }
    };

    useEffect(() => {
        async function fetchUsers() {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "users"), orderBy("createdAt", "desc"));
                const usersList = [];
                querySnapshot.forEach((doc) => {
                    usersList.push({ id: doc.id, ...doc.data() });
                });
                setUsers(usersList);
                console.log(usersList);
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
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/home">
                        <button className="flex items-center gap-2 text-olive-dark hover:underline">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-2xl hover:scale-125" />
                        </button>
                    </Link>
                    <h1 className="text-4xl font-bold text-olive-dark">Usuários</h1>
                </div>

                <button
                    className="bg-olive-dark text-white px-4 py-2 rounded hover:bg-olive"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <FontAwesomeIcon icon={faPlus} className="text-md hover:scale-125 mr-2" />
                    Adicionar Usuário
                </button>

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
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-gray-200 hover:bg-green-100">
                                    <td className="py-4 px-6 text-olive-dark font-medium">{user.fullName || "—"}</td>
                                    <td>{formatPhoneNumber(user.phoneNumber || "—")}</td>
                                    <td className="py-4 px-6 text-gray-700">{user.email || "—"}</td>
                                    <td className="py-4 px-6 text-gray-700">{formatDateBR(user.birthDate)}</td>
                                    <td className="py-4 px-6 capitalize">
                                        {user.role === "client" ? "Cliente" : user.role || "—"}
                                    </td>
                                    <td className="py-4 px-6 flex items-center gap-4">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="text-olive hover:text-black transition"
                                            title="Editar"
                                        >
                                            <FontAwesomeIcon icon={faPencil} />
                                        </button>

                                        <button
                                            onClick={() => handleDeleteClick({ id: user.id, fullName: user.fullName })}
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
            <CreateUserModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreateUser}
            />
        </div>
    );
}

export default UsersList;