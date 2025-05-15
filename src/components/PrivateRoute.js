import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function PrivateRoute({ children, requiredRole }) {
  const [user, loading] = useAuthState(auth);
  const [checkingRole, setCheckingRole] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;

      if (!requiredRole) {
        setIsAuthorized(true);
        setCheckingRole(false);
        return;
      }

      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.role === requiredRole) {
            setIsAuthorized(true);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar role do usuário:", error);
      } finally {
        setCheckingRole(false);
      }
    };

    if (user) {
      checkRole();
    } else {
      setCheckingRole(false);
    }
  }, [user, requiredRole]);

  if (loading || checkingRole) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !isAuthorized) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default PrivateRoute;
