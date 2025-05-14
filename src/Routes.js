import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import AuthLayout from "./layouts/AuthLayout";
import PublicLayout from "./layouts/PublicLayout";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Rotas públicas com layout simples (sem header e footer) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Rotas autenticadas com layout completo (com header e footer) */}
        <Route element={<AuthLayout />}>
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          {/* Aqui você pode adicionar outras rotas autenticadas no futuro */}
        </Route>

        {/* Rota para capturar URLs inválidas */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;