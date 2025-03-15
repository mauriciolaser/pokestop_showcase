import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Showcase from "./Showcase.jsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Se requiere el parámetro city */}
        <Route path=":city" element={<Showcase />} />
        {/* Ruta catch-all para no especificar ciudad */}
        <Route path="*" element={<div className="not-found">404 - No se ha especificado una ciudad</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
