import React from "react";

function DeleteCustomerModal({ isOpen, onClose, onConfirm, customer }) {
    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-fade-slide">
                <h2 className="text-xl font-bold text-red-600 mb-4 text-center">
                    Confirmar Exclusão
                </h2>
                <p className="mb-6 text-gray-700 text-center leading-relaxed">
                    Tem certeza que deseja excluir o cliente{" "}
                    <strong className="text-gray-900">{customer.fullName}</strong>?<br />
                    Essa ação <span className="font-semibold">não poderá ser desfeita</span>.
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(customer)}
                        className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}
export default DeleteCustomerModal;