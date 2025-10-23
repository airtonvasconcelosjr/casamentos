import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPencil, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { formatPhoneNumber, formatDateBR } from '../utils/formatters';
import EditCustomerModal from "../components/EditCustomerModal";
import DeleteCustomerModal from "../components/DeleteCustomerModal";
import CreateCustomerModal from "../components/CreateCustomerModal";
import { toast } from "react-toastify";

function CustomersList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 5;

    const handleEditClick = (customer) => {
        setSelectedCustomer(customer);
        setIsEditOpen(true);
    };

    const handleEditSave = async (updatedCustomer) => {
        try {
            const customerRef = doc(db, "customers", updatedCustomer.id);
            await updateDoc(customerRef, {
                fullName: updatedCustomer.fullName,
                email: updatedCustomer.email,
                phoneNumber: updatedCustomer.phoneNumber,
                birthDate: updatedCustomer.birthDate
            });

            setCustomers(prevCustomers =>
                prevCustomers.map(customer =>
                    customer.id === updatedCustomer.id ? { ...customer, ...updatedCustomer } : customer
                )
            );
            toast.success("Cliente atualizado com sucesso!");
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error);
            toast.error("Erro ao atualizar cliente.");
        }
    };

    const handleDeleteClick = (customer) => {
        setCustomerToDelete(customer);
        setIsDeleteOpen(true);
    };

    const handleDeleteConfirm = async (customer) => {
        try {
            await deleteDoc(doc(db, "customers", customer.id));
            setCustomers(prev => prev.filter(u => u.id !== customer.id));
            setIsDeleteOpen(false);
            toast.success("Cliente excluído com sucesso!");
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            toast.error("Erro ao excluir cliente.");
        }
    };

    const handleCreateClient = async (newClient) => {
        try {
            const { email, fullName, phoneNumber, birthDate } = newClient;

            // Cria um novo documento na coleção "customers"
            const newCustomerRef = doc(collection(db, "customers"));
            const newCustomer = {
                id: newCustomerRef.id,
                email,
                fullName,
                phoneNumber,
                birthDate,
                createdAt: serverTimestamp(),
            };

            await setDoc(newCustomerRef, newCustomer);
            setCustomers(prev => [...prev, newCustomer]);
            toast.success("Cliente criado com sucesso!");
            setIsCreateOpen(false);
        } catch (error) {
            console.error("Erro ao criar cliente:", error.message);
            toast.error(`Erro ao criar cliente: ${error.message}`);
        }
    };

    useEffect(() => {
        async function fetchCustomers() {
            setLoading(true);
            try {
                const querySnapshot = await getDocs(collection(db, "customers"));
                const customersList = [];
                querySnapshot.forEach((doc) => {
                    customersList.push({ id: doc.id, ...doc.data() });
                });
                setCustomers(customersList);
            } catch (error) {
                console.error("Erro ao buscar clientes:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchCustomers();
    }, []);

    const totalPages = Math.ceil(customers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCustomers = customers.slice(startIndex, endIndex);
    const addButtonText = "Adicionar Cliente";

    return (
        <div className="min-h-screen bg-green-50 p-8">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/home">
                        <button className="flex items-center gap-2 text-olive-dark hover:underline">
                            <FontAwesomeIcon icon={faChevronLeft} className="text-2xl hover:scale-125" />
                        </button>
                    </Link>
                    <h1 className="text-2xl md:text-4xl font-bold text-olive-dark truncate">Clientes</h1>
                </div>

                <button
                    className="bg-olive-dark text-white px-4 py-2 rounded hover:bg-olive"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <FontAwesomeIcon icon={faPlus} className="text-md hover:scale-125 mr-2" />
                    <span className="hidden md:inline ml-2">{addButtonText}</span>
                </button>
            </div>

            {loading ? (
                <p className="text-lg text-gray-700">Carregando clientes...</p>
            ) : customers.length === 0 ? (
                <p className="text-lg text-gray-700">Nenhum cliente encontrado.</p>
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
                                    <th className="py-3 px-6 text-left">Dt de Nascimento</th>
                                    <th className="py-3 px-6 text-left">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-gray-200 hover:bg-green-100">
                                        <td className="py-4 px-6 text-olive-dark font-medium">{customer.fullName || "—"}</td>
                                        <td className="py-4 px-6 text-gray-700">{formatPhoneNumber(customer.phoneNumber || "—")}</td>
                                        <td className="py-4 px-6 text-gray-700">{customer.email || "—"}</td>
                                        <td className="py-4 px-6 text-gray-700">{formatDateBR(customer.birthDate)}</td>
                                        <td className="py-4 px-6 flex items-center gap-4">
                                            <button
                                                onClick={() => handleEditClick(customer)}
                                                className="text-olive hover:text-black transition"
                                                title="Editar"
                                            >
                                                <FontAwesomeIcon icon={faPencil} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick({ id: customer.id, fullName: customer.fullName })}
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
                    </div>

                    {/* Mobile Cards */}
                    <div className="flex flex-col md:hidden gap-4">
                        {currentCustomers.map((customer) => (
                            <div key={customer.id} className="bg-white p-4 rounded-xl shadow-md flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-olive-dark">{customer.fullName}</span>
                                    <div className="flex gap-4">
                                        <button onClick={() => handleEditClick(customer)}>
                                            <FontAwesomeIcon icon={faPencil} size="lg" className="text-olive" />
                                        </button>
                                        <button onClick={() => handleDeleteClick({ id: customer.id, fullName: customer.fullName })}>
                                            <FontAwesomeIcon icon={faTrash} size="lg" className="text-red-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700">
                                    <p><span className="font-semibold">Telefone:</span> {formatPhoneNumber(customer.phoneNumber || "—")}</p>
                                    <p><span className="font-semibold">Email:</span> {customer.email || "—"}</p>
                                    <p><span className="font-semibold">Dt Nascimento:</span> {formatDateBR(customer.birthDate)}</p>
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

            <EditCustomerModal
                customer={selectedCustomer}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSave={handleEditSave}
            />
            <DeleteCustomerModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                customer={customerToDelete}
            />
            <CreateCustomerModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreate={handleCreateClient}
            />
        </div>
    );
}

export default CustomersList;
