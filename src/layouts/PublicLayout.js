import React from "react";
import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <div className="min-h-screen">
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;