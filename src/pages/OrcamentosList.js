import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { formatCurrencyBR, formatDateBR, calculateDaysRemaining } from "../utils/formatters";
import { Link } from "react-router-dom";
import CreateOrcamentoModal from "../components/CreateOrcamentoModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPencil, faTrash, faPlus, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import DeleteOrcamentoModal from "../components/DeleteOrcamentoModal";
import { toast } from "react-toastify";
import { generateOrcamentoPdf } from "../utils/pdfGenerator";

function OrcamentosList() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [orcamentoToEdit, setOrcamentoToEdit] = useState(null);
  const [orcamentoToDelete, setOrcamentoToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRole(data.role);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchOrcamentos = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "orcamentos"));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const now = Date.now() / 1000;

      const futuros = [];
      const realizados = [];

      for (const item of list) {
        const seconds = item.dataCasamento?.seconds
          ? item.dataCasamento.seconds
          : new Date(item.dataCasamento).getTime() / 1000;

        if (!seconds || isNaN(seconds)) {
          realizados.push(item);
        } else if (seconds >= now) {
          futuros.push(item);
        } else {
          realizados.push(item);
        }
      }

      futuros.sort((a, b) => {
        const aDate = a.dataCasamento?.seconds || new Date(a.dataCasamento).getTime() / 1000;
        const bDate = b.dataCasamento?.seconds || new Date(b.dataCasamento).getTime() / 1000;
        return aDate - bDate;
      });

      const sortedList = [...futuros, ...realizados];

      console.log("Orçamentos ordenados:", sortedList);
      setOrcamentos(sortedList);
    } catch (error) {
      console.error("Erro ao buscar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setOrcamentoToEdit(null);
    setIsCreateOpen(false);
  };

  const handleOrcamentoCreated = (newOrcamento) => {
    setOrcamentos(prev => [{
      id: newOrcamento.id,
      ...newOrcamento
    }, ...prev]);
  };

  const handleEditClick = (orcamento) => {
    setOrcamentoToEdit(orcamento);
    setIsCreateOpen(true);
  };

  const handleDeleteClick = (orcamento) => {
    setOrcamentoToDelete(orcamento);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteOrcamento = async () => {
    try {
      await deleteDoc(doc(db, "orcamentos", orcamentoToDelete.id));
      setOrcamentos(prev => prev.filter(o => o.id !== orcamentoToDelete.id));
    } catch (error) {
      console.error("Erro ao excluir orçamento:", error);
      toast.error("Erro ao excluir orçamento.");
    } finally {
      toast.info("Orçamento excluído com sucesso!");
      setIsDeleteModalOpen(false);
      setOrcamentoToDelete(null);
    }
  };

  const handleGeneratePdf = (orcamento) => {
    generateOrcamentoPdf(orcamento);
  };

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  const getStatusColor = (status, isRealizado = false) => {
    if (isRealizado) return "text-gray-800";

    switch (status?.toLowerCase()) {
      case "ativo":
        return "text-green-600";
      case "cancelado":
        return "text-red-600";
      case "pausado":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="p-8 bg-green-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link to="/home">
            <button className="flex items-center gap-2 text-olive-dark hover:underline">
              <FontAwesomeIcon icon={faChevronLeft} className="text-2xl hover:scale-125" />
            </button>
          </Link>
          <h1 className="text-4xl font-bold text-olive-dark">Orçamentos</h1>
        </div>

        <button
          className="bg-olive-dark text-white px-4 py-2 rounded hover:bg-olive"
          onClick={() => setIsCreateOpen(true)}
        >
          <FontAwesomeIcon icon={faPlus} className="text-md hover:scale-125 mr-2" />
          Novo orçamento
        </button>
      </div>

      {loading ? (
        <p>Carregando orçamentos...</p>
      ) : orcamentos.length === 0 ? (
        <p>Nenhum orçamento encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-olive-dark text-white">
              <tr>
                <th className="py-3 px-4 text-left">Nome Noiva</th>
                <th className="py-3 px-4 text-left">Nome Noivo</th>
                <th className="py-3 px-4 text-left">Cliente</th>
                <th className="py-3 px-4 text-left">Telefone</th>
                <th className="py-3 px-4 text-left">Data Casamento</th>
                <th className="py-3 px-4 text-left">Dias pro Casamento</th>
                <th className="py-3 px-4 text-left">Valor Orçado</th>
                <th className="py-3 px-4 text-left">Status</th>
                {role === "admin" && <th className="py-3 px-4 text-left">Ações</th>}

              </tr>
            </thead>
            <tbody>
              {orcamentos.map(o => (
                <tr key={o.id} className="border-b hover:bg-green-100">
                  <td className="py-3 px-4">{o.nomeNoiva}</td>
                  <td className="py-3 px-4">{o.nomeNoivo}</td>
                  <td className="py-3 px-4">{o.cliente?.nome}</td>
                  <td className="py-3 px-4">{o.cliente?.telefone}</td>
                  <td className="py-3 px-4">{formatDateBR(o.dataCasamento)}</td>
                  <td className={`py-3 px-4 ${calculateDaysRemaining(o.dataCasamento).className}`}>
                    {calculateDaysRemaining(o.dataCasamento).text}
                  </td>
                  <td className="py-3 px-4">{formatCurrencyBR(o.valorTotalConfirmado)}</td>
                  <td className={`py-3 px-4 font-semibold ${getStatusColor(
                    o.status,
                    calculateDaysRemaining(o.dataCasamento).text === "Realizado"
                  )
                    }`}>
                    {calculateDaysRemaining(o.dataCasamento).text === "Realizado" ? "Realizado" : o.status}
                  </td>
                  {role === "admin" && (
                    <td className="py-3 px-4 flex gap-4">
                      <button
                        title="Editar"
                        className="text-olive hover:text-blue-600 hover:scale-110 transition-all"
                        onClick={() => handleEditClick(o)}
                      >
                        <FontAwesomeIcon icon={faPencil} />
                      </button>

                      <button
                        title="Gerar PDF"
                        className="text-olive hover:text-amber-600 hover:scale-110 transition-all"
                        onClick={() => handleGeneratePdf(o)}
                      >
                        <FontAwesomeIcon icon={faFilePdf} />
                      </button>

                      <button
                        title="Excluir"
                        className="text-olive hover:text-red-600 hover:scale-110 transition-all"
                        onClick={() => handleDeleteClick(o)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  )}

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <CreateOrcamentoModal
        isOpen={isCreateOpen}
        onClose={handleCloseModal}
        onOrcamentoCreated={handleOrcamentoCreated}
        orcamentoToEdit={orcamentoToEdit}
      />

      <DeleteOrcamentoModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteOrcamento}
      />
    </div>
  );
}

export default OrcamentosList;
