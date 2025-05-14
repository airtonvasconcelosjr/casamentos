import React from "react";

function Footer() {
  return (
    <footer className="bg-olive-dark text-white py-4">
      <div className="max-w-screen-xl mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Casar em Carneiros. Todos os direitos reservados.</p>
        <div className="mt-2">
          <a href="/terms" className="text-olive-light  hover:text-white text-sm mr-4">
            Termos de uso
          </a>
          <a href="/privacy" className="text-olive-light hover:text-white text-sm">
            Política de Privacidade
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
