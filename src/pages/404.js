import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#faf9f7] to-[#e7e5e4] text-center px-4">
            <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md border border-olive-200">
                <h1 className="text-7xl font-extrabold text-olive-800 mb-4">404</h1>

                <h2 className="text-2xl font-semibold text-olive-dark mb-2">
                    Página não encontrada
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    Parece que você tentou acessar uma página que não existe
                    ou foi movida.
                    Verifique o endereço ou volte para a página inicial.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/home"
                        className="px-5 py-2.5 bg-olive-dark text-white rounded-lg shadow-md hover:bg-olive-800 transition-all duration-300"
                    >
                        Voltar para o início
                    </Link>

                    <Link
                        to="/login"
                        className="px-5 py-2.5 border border-olive-dark text-olive-dark rounded-lg hover:bg-olive-100 transition-all duration-300"
                    >
                        Fazer login
                    </Link>
                </div>
            </div>
        </div>
    );
}
