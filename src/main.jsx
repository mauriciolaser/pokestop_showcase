import React from "react";
import ReactDOM from "react-dom";
import App from "./App.jsx";
import "./index.css"; // Aquí puedes agregar estilos globales si lo deseas

// Configuración de Google Analytics 4
if (import.meta.env.VITE_GA_ID) {
  const gaId = import.meta.env.VITE_GA_ID;

  // Definir dataLayer y gtag antes de la carga del script
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };

  // Agregar el script de Google Analytics dinámicamente
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  script.onload = () => {
    gtag('js', new Date());
    gtag('config', gaId, { send_page_view: true });
  };
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
