import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "react-toastify";

function CreateOrcamentoModal({ isOpen, onClose, onOrcamentoCreated, orcamentoToEdit }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        clienteSelecionado: "",
        papelClienteSelecionado: "noivo",
        nomeNoivo: "",
        nomeNoiva: "",
        dataCasamento: "",
        numeroConvidados: 0,
        assessoriaCerimonial: { descricao: "", valor: 0 },
        igreja: { descricao: "", valor: 0 },
        localRecepcao: { descricao: "", valor: 0 },
        buffet: { descricao: "", valor: 0 },
        decoracao: { descricao: "", valor: 0 },
        musica: { descricao: "", valor: 0 },
        convites: { descricao: "", valor: 0 },
        outros: { descricao: "", valor: 0 }
    });

    useEffect(() => {
        if (orcamentoToEdit) {
            const parseFirestoreDate = (firestoreDate) => {
                if (!firestoreDate) return '';
                if (firestoreDate.seconds) {
                    return new Date(firestoreDate.seconds * 1000).toISOString().split('T')[0];
                } else if (typeof firestoreDate === 'string') {
                    return firestoreDate.split('T')[0];
                } else if (firestoreDate instanceof Date) {
                    return firestoreDate.toISOString().split('T')[0];
                }
                return '';
            };

            setFormData({
                clienteSelecionado: orcamentoToEdit.cliente?.id || "",
                papelClienteSelecionado: orcamentoToEdit.cliente?.papel || "noivo",
                nomeNoivo: orcamentoToEdit.nomeNoivo || "",
                nomeNoiva: orcamentoToEdit.nomeNoiva || "",
                dataCasamento: parseFirestoreDate(orcamentoToEdit.dataCasamento),
                numeroConvidados: orcamentoToEdit.numeroConvidados || 0,
                assessoriaCerimonial: orcamentoToEdit.servicos?.assessoriaCerimonial || { descricao: "", valor: 0 },
                igreja: orcamentoToEdit.servicos?.igreja || { descricao: "", valor: 0 },
                localRecepcao: orcamentoToEdit.servicos?.localRecepcao || { descricao: "", valor: 0 },
                buffet: orcamentoToEdit.servicos?.buffet || { descricao: "", valor: 0 },
                decoracao: orcamentoToEdit.servicos?.decoracao || { descricao: "", valor: 0 },
                musica: orcamentoToEdit.servicos?.musica || { descricao: "", valor: 0 },
                convites: orcamentoToEdit.servicos?.convites || { descricao: "", valor: 0 },
                outros: orcamentoToEdit.servicos?.outros || { descricao: "", valor: 0 }
            });
        } else {
            resetForm();
        }
    }, [orcamentoToEdit]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const usersList = usersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(usersList);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar usuários:", error);
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData.clienteSelecionado) {
            const clienteSelecionado = users.find(user => user.id === formData.clienteSelecionado);
            if (clienteSelecionado) {
                if (formData.papelClienteSelecionado === "noivo") {
                    setFormData(prev => ({
                        ...prev,
                        nomeNoivo: clienteSelecionado.fullName || ""
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        nomeNoiva: clienteSelecionado.fullName || ""
                    }));
                }
            }
        }
    }, [formData.clienteSelecionado, formData.papelClienteSelecionado, users]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleServiceChange = (service, field, value) => {
        setFormData({
            ...formData,
            [service]: {
                ...formData[service],
                [field]: value,
            },
        });
    };

    const calculateTotalValue = () => {
        const services = ['assessoriaCerimonial', 'igreja', 'localRecepcao', 'buffet', 'decoracao', 'musica', 'convites', 'outros'];
        return services.reduce((total, service) => total + Number(formData[service].valor), 0);
    };

    const nextStep = (e) => {
        if (e) e.preventDefault();
        setStep(prev => prev + 1);
    };

    const prevStep = (e) => {
        if (e) e.preventDefault();
        setStep(prev => prev - 1);
    };

    const resetForm = () => {
        setFormData({
            clienteSelecionado: "",
            papelClienteSelecionado: "noivo",
            nomeNoivo: "",
            nomeNoiva: "",
            dataCasamento: "",
            numeroConvidados: 0,
            assessoriaCerimonial: { descricao: "", valor: 0 },
            igreja: { descricao: "", valor: 0 },
            localRecepcao: { descricao: "", valor: 0 },
            buffet: { descricao: "", valor: 0 },
            decoracao: { descricao: "", valor: 0 },
            musica: { descricao: "", valor: 0 },
            convites: { descricao: "", valor: 0 },
            outros: { descricao: "", valor: 0 }
        });
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const clienteSelecionado = users.find(user => user.id === formData.clienteSelecionado);
            const valorTotal = calculateTotalValue();

            const orcamentoData = {
                cliente: {
                    id: formData.clienteSelecionado,
                    nome: clienteSelecionado?.fullName || "",
                    email: clienteSelecionado?.email || "",
                    telefone: clienteSelecionado?.phoneNumber || "",
                    papel: formData.papelClienteSelecionado
                },
                nomeNoivo: formData.nomeNoivo,
                nomeNoiva: formData.nomeNoiva,
                dataCasamento: new Date(formData.dataCasamento),
                numeroConvidados: Number(formData.numeroConvidados),
                valorTotalConfirmado: valorTotal,
                valorMedioPrevisto: valorTotal,
                status: "ativo",
                servicos: {
                    assessoriaCerimonial: { ...formData.assessoriaCerimonial, status: "ativo" },
                    igreja: { ...formData.igreja, status: "ativo" },
                    localRecepcao: { ...formData.localRecepcao, status: "ativo" },
                    buffet: { ...formData.buffet, status: "ativo" },
                    decoracao: { ...formData.decoracao, status: "ativo" },
                    musica: { ...formData.musica, status: "ativo" },
                    convites: { ...formData.convites, status: "ativo" },
                    outros: { ...formData.outros, status: "ativo" }
                },
                updatedAt: serverTimestamp()
            };

            if (!orcamentoToEdit) {
                orcamentoData.createdAt = serverTimestamp();
            }

            if (orcamentoToEdit) {
                await updateDoc(doc(db, "orcamentos", orcamentoToEdit.id), orcamentoData);
                toast.success("Orçamento atualizado com sucesso!");
            } else {
                const docRef = await addDoc(collection(db, "orcamentos"), orcamentoData);
                orcamentoData.id = docRef.id;
                toast.success("Orçamento criado com sucesso!");
            }

            resetForm();
            onClose();
            onOrcamentoCreated?.(orcamentoData);
        } catch (error) {
            console.error("Erro ao salvar orçamento:", error);
            toast.error(`Erro ao ${orcamentoToEdit ? 'atualizar' : 'criar'} orçamento. Tente novamente.`);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-olive-dark mb-6">Dados do Casal</h2>
                        {loading ? (
                            <div className="text-center py-4">Carregando usuários...</div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Selecionar Cliente
                                        </label>
                                        <select
                                            name="clienteSelecionado"
                                            className="w-full p-2 border border-gray-300 rounded"
                                            value={formData.clienteSelecionado}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Selecione um cliente</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.fullName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Cliente é
                                        </label>
                                        <select
                                            name="papelClienteSelecionado"
                                            className="w-full p-2 border border-gray-300 rounded"
                                            value={formData.papelClienteSelecionado}
                                            onChange={handleChange}
                                        >
                                            <option value="noivo">Noivo</option>
                                            <option value="noiva">Noiva</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome do Noivo
                                        </label>
                                        <input
                                            type="text"
                                            name="nomeNoivo"
                                            className="w-full p-2 border border-gray-300 rounded"
                                            value={formData.nomeNoivo}
                                            onChange={handleChange}
                                            readOnly={formData.papelClienteSelecionado === "noivo"}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome da Noiva
                                        </label>
                                        <input
                                            type="text"
                                            name="nomeNoiva"
                                            className="w-full p-2 border border-gray-300 rounded"
                                            value={formData.nomeNoiva}
                                            onChange={handleChange}
                                            readOnly={formData.papelClienteSelecionado === "noiva"}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Data do Casamento
                                        </label>
                                        <input
                                            type="date"
                                            name="dataCasamento"
                                            className="w-full p-2 border border-gray-300 rounded"
                                            value={formData.dataCasamento}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número de Convidados
                                        </label>
                                        <input
                                            type="number"
                                            name="numeroConvidados"
                                            className="w-full p-2 border border-gray-300 rounded"
                                            value={formData.numeroConvidados}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-olive-dark mb-6">Serviços Principais</h2>
                        <div className="space-y-4">
                            {[
                                { key: 'assessoriaCerimonial', label: 'Assessoria e Cerimonial' },
                                { key: 'igreja', label: 'Igreja' },
                                { key: 'localRecepcao', label: 'Local de Recepção' },
                                { key: 'buffet', label: 'Buffet' }
                            ].map(({ key, label }) => (
                                <div key={key} className="p-4 bg-white rounded-lg shadow">
                                    <h3 className="font-bold text-lg mb-2 text-olive-dark">{label}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descrição
                                            </label>
                                            <textarea
                                                className="w-full p-2 border border-gray-300 rounded"
                                                value={formData[key].descricao}
                                                onChange={(e) => handleServiceChange(key, "descricao", e.target.value)}
                                                rows="2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Valor (R$)
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border border-gray-300 rounded"
                                                value={formData[key].valor}
                                                onChange={(e) => handleServiceChange(key, "valor", Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-olive-dark mb-6">Serviços Complementares</h2>
                        <div className="space-y-4">
                            {[
                                { key: 'decoracao', label: 'Decoração' },
                                { key: 'musica', label: 'Música' },
                                { key: 'convites', label: 'Convites' },
                                { key: 'outros', label: 'Outros Serviços' }
                            ].map(({ key, label }) => (
                                <div key={key} className="p-4 bg-white rounded-lg shadow">
                                    <h3 className="font-bold text-lg mb-2 text-olive-dark">{label}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descrição
                                            </label>
                                            <textarea
                                                className="w-full p-2 border border-gray-300 rounded"
                                                value={formData[key].descricao}
                                                onChange={(e) => handleServiceChange(key, "descricao", e.target.value)}
                                                rows="2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Valor (R$)
                                            </label>
                                            <input
                                                type="number"
                                                className="w-full p-2 border border-gray-300 rounded"
                                                value={formData[key].valor}
                                                onChange={(e) => handleServiceChange(key, "valor", Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-olive-light rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Valor Total do Orçamento</h3>
                            <div className="text-2xl font-bold text-olive-dark">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calculateTotalValue())}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-green-50 rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
                <div className="flex justify-between items-center border-b border-gray-200 p-4 bg-olive-dark text-white">
                    <h2 className="text-xl font-bold">
                        {orcamentoToEdit ? 'Editar' : 'Novo'} Orçamento - Etapa {step} de 3
                    </h2>
                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="text-white hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {renderStep()}

                    <div className="flex justify-between p-4 border-t border-gray-200 bg-gray-50">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Anterior
                            </button>
                        )}

                        <div className="ml-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    resetForm();
                                    onClose();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded mr-2 hover:bg-gray-100"
                            >
                                Cancelar
                            </button>

                            {step < 3 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-4 py-2 bg-olive-dark text-white rounded hover:bg-olive"
                                >
                                    Próximo
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-olive-dark text-white rounded hover:bg-olive"
                                >
                                    {orcamentoToEdit ? 'Atualizar' : 'Criar'} Orçamento
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateOrcamentoModal;