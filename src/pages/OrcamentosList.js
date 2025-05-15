import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { formatCurrencyBR } from "../utils/formatters";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faPlus, faTrash, faPencil } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { formatDateBR } from '../utils/formatters';

function OrcamentosList() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrcamentos() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "orcamentos"));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrcamentos(list);
      } catch (error) {
        console.error("Erro ao buscar orçamentos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrcamentos();
  }, []);


  const getStatusColor = (status) => {
    switch (status) {
      case "ativo": return "text-green-600";
      case "cancelado": return "text-red-600";
      case "pausado": return "text-yellow-600";
      default: return "text-gray-600";
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

        <button className="bg-olive-dark text-white px-4 py-2 rounded hover:bg-olive">
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
                <th className="py-3 px-4 text-left">Cliente</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Data Criação</th>
                <th className="py-3 px-4 text-left">Data Casamento</th>
                <th className="py-3 px-4 text-left">Valor Confirmado</th>
                <th className="py-3 px-4 text-left">Valor Previsto</th>
                <th className="py-3 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orcamentos.map(o => (
                <tr key={o.id} className="border-b hover:bg-green-100">
                  <td className="py-3 px-4">{o.cliente?.nome || "—"}</td>
                  <td className="py-3 px-4">{o.cliente?.email || "—"}</td>
                  <td className="py-3 px-4">{formatDateBR(o.dataCriacao)}</td>
                  <td className="py-3 px-4">{formatDateBR(o.dataCasamento)}</td>
                  <td className="py-3 px-4">{formatCurrencyBR(o.valorTotalConfirmado)}</td>
                  <td className="py-3 px-4">{formatCurrencyBR(o.valorMedioPrevisto)}</td>
                  <td className={`py-3 px-4 font-semibold ${getStatusColor(o.status)}`}>
                    {o.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default OrcamentosList;
