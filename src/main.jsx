import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import "./index.css"; // Aquí puedes agregar estilos globales si lo deseas

// Configuración de Google Analytics 4
if (import.meta.env.VITE_GA_ID) {
  const gaId = import.meta.env.VITE_GA_ID;

  // Agregar el script de Google Analytics dinámicamente
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  script.onload = () => {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args) { window.dataLayer.push(args); }

    gtag('js', new Date());
    gtag('config', gaId);
  };
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
