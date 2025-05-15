import React from "react";

function DeleteUserModal({ isOpen, onClose, onConfirm, user }) {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-red-600 mb-4">Confirmar Exclusão</h2>
                <p className="mb-6 text-gray-700">
                    Tem certeza que deseja excluir o usuário <strong>{user.fullName}</strong>?
                    Essa ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(user)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteUserModal;
