import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPencil, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { formatPhoneNumber, formatDateBR } from '../utils/formatters';
import EditUserModal from "../components/EditUserModal";
import DeleteUserModal from "../components/DeleteUserModal";
import CreateUserModal from "../components/CreateUserModal";
import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";
import { toast } from "react-toastify";

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLogged] = useAuthState(auth);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

    // Verificar se o usuário logado é admin
    const isAdmin = userLogged?.email === "airton.vasconcelosjr@gmail.com";

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

            try {
                const adminAuth = getAuth();
                const userToDeleteAuth = adminAuth.currentUser;

                if (userToDeleteAuth && userToDeleteAuth.uid === user.id) {
                    await deleteUser(userToDeleteAuth);
                } else {
                    console.log("Não foi possível excluir o usuário do Auth diretamente. Um Cloud Function seria necessário.");
                }
            } catch (authError) {
                console.error("Erro ao excluir usuário da autenticação:", authError);
            }

            setUsers(prev => prev.filter(u => u.id !== user.id));
            setIsDeleteOpen(false);
            toast.success("Usuário excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            toast.error("Erro ao excluir usuário.");
        }
    };

    const handleCreateUser = async (newUser) => {
        try {
            const { email, password, fullName, phoneNumber, birthDate } = newUser;

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid;

            const newUser = {
                id: userId,
                email,
                fullName,
                phoneNumber,
                birthDate,
                role: 'staff',
                createdAt: serverTimestamp(),
            };

            await setDoc(doc(db, "users", userId), newUser);

            setUsers(prev => [...prev, newUser]);
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

    const filteredUsers = isAdmin
        ? users
        : users.filter(user => user.role === "User");

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    const pageTitle = isAdmin ? "Usuários" : "usuários";
    const addButtonText = "Adicionar usuário";

    return (
        <div className="min-h-screen bg-green-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/home">
                        <button className="flex items-center gap-2 text-olive-dark hover:underline">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-2xl hover:scale-125" />
                        </button>
                    </Link>
                    <h1 className="text-2xl md:text-4xl font-bold text-olive-dark truncate">{pageTitle}</h1>
                </div>

                {isAdmin && (
                    <button
                        className="bg-olive-dark text-white px-4 py-2 rounded hover:bg-olive"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-md hover:scale-125 mr-2" />
                        <span className="hidden md:inline ml-2">{addButtonText}</span>
                    </button>
                )}
            </div>

            {loading ? (
                <p className="text-lg text-gray-700">Carregando {pageTitle.toLowerCase()}...</p>
            ) : filteredUsers.length === 0 ? (
                <p className="text-lg text-gray-700">Nenhum {pageTitle.toLowerCase().slice(0, -1)} encontrado.</p>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full bg-white shadow-md rounded-lg">
                            <thead className="bg-olive-dark text-white">
                                <tr>
                                    <th className="py-3 px-6 text-left">Nome</th>
                                    <th className="py-3 px-6 text-left">Telefone</th>
                                    <th className="py-3 px-6 text-left">Email</th>
                                    <th className="py-3 px-6 text-left">Nascimento</th>
                                    {isAdmin && <th className="py-3 px-6 text-left">Função</th>}
                                    <th className="py-3 px-6 text-left">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-200 hover:bg-green-100">
                                        <td className="py-4 px-6 text-olive-dark font-medium">{user.fullName || "—"}</td>
                                        <td className="py-4 px-6 text-gray-700">{formatPhoneNumber(user.phoneNumber || "—")}</td>
                                        <td className="py-4 px-6 text-gray-700">{user.email || "—"}</td>
                                        <td className="py-4 px-6 text-gray-700">{formatDateBR(user.birthDate)}</td>
                                        {isAdmin && (
                                            <td className="py-4 px-6 capitalize">
                                                {user.role === "Staff" ? "Usuário" :
                                                    user.role === "client" ? "Cliente" :
                                                        user.role === "admin" ? "Administrador" :
                                                            user.role || "—"}
                                            </td>
                                        )}
                                        <td className="py-4 px-6 flex items-center gap-4">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="text-olive hover:text-black transition"
                                                title="Editar"
                                            >
                                                <FontAwesomeIcon icon={faPencil} />
                                            </button>

                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteClick({ id: user.id, fullName: user.fullName })}
                                                    className="text-red-600 hover:text-red-800 transition"
                                                    title="Excluir"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="flex flex-col md:hidden gap-4">
                        {currentUsers.map((user) => (
                            <div key={user.id} className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-olive-dark">{user.fullName}</span>
                                    <div className="flex gap-4">
                                        <button onClick={() => handleEditClick(user)}>
                                            <FontAwesomeIcon icon={faPencil} size="lg" className="text-olive" />
                                        </button>
                                        {isAdmin && (
                                            <button onClick={() => handleDeleteClick({ id: user.id, fullName: user.fullName })}>
                                                <FontAwesomeIcon icon={faTrash} size="lg" className="text-red-600" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700">
                                    <p><span className="font-semibold">Telefone:</span> {formatPhoneNumber(user.phoneNumber || "—")}</p>
                                    <p><span className="font-semibold">Email:</span> {user.email || "—"}</p>
                                    <p><span className="font-semibold">Dt Nascimento:</span> {formatDateBR(user.birthDate)}</p>
                                    {isAdmin && (
                                        <p><span className="font-semibold">Função:</span> {user.role === "User" ? "usuário" : user.role === "user" ? "Usuário" : user.role === "admin" ? "Administrador" : "—"}</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Mobile Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between mt-4">
                                <button
                                    className="bg-olive-dark text-white px-4 py-2 rounded disabled:opacity-50"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    Anterior
                                </button>
                                <span className="self-center text-sm">{currentPage} / {totalPages}</span>
                                <button
                                    className="bg-olive-dark text-white px-4 py-2 rounded disabled:opacity-50"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    Próximo
                                </button>
                            </div>
                        )}

                    </div>
                </>
            )}

            <EditUserModal
                user={selectedUser}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleEditSave}
            />
            {isAdmin && (
                <DeleteUserModal
                    isOpen={isDeleteOpen}
                    onClose={() => setIsDeleteOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    user={userToDelete}
                />
            )}
            {isAdmin && (
                <CreateUserModal
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    onCreate={handleCreateUser}
                />
            )}
        </div>
    );
}

export default UsersList;
