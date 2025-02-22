// src/components/Admin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import TagInfo from './TagInfo';
import TagChart from './TagChart';
import UpdateTag from './UpdateTag';
import axios from 'axios';

// Importamos estilos
import './Admin.css';

// Importamos las funciones del servicio
import {
  getImportStatus,
  deleteAllImages,
  startImport,
  stopImport,
  clearDatabase
} from '../services/adminService';

// Importamos nuestro UserCard
import UserCard from './UserCard';

// Importamos el componente de estadísticas
import AdminStats from './AdminStats';

Modal.setAppElement('#root');

const API_URL = process.env.REACT_APP_API_URL;

const Admin = () => {
  const navigate = useNavigate();

  // Estados básicos
  const [loggedUser, setLoggedUser] = useState("nombredeusuario");
  const [userId, setUserId] = useState(null);

  // Estados de loading
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [clearDbLoading, setClearDbLoading] = useState(false);

  // Estados de modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [clearDbModalOpen, setClearDbModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  // Mensajes y estado de import
  const [modalMessage, setModalMessage] = useState('');
  const [jobId, setJobId] = useState(null);
  const [importStatus, setImportStatus] = useState('');

  // Estado para refrescar la lista de tags
  const [tagRefreshFlag, setTagRefreshFlag] = useState(false);

  // Al montar, leemos username y userId de localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) setLoggedUser(storedUser);

    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) setUserId(storedUserId);
  }, []);

  // Monitoreamos la importación en curso (si jobId existe)
  useEffect(() => {
    let interval;
    if (jobId) {
      interval = setInterval(async () => {
        try {
          const response = await getImportStatus(jobId);
          if (response.data.success) {
            setImportStatus(response.data.status);
            if (
              response.data.status === "completed" ||
              response.data.status === "stopped"
            ) {
              clearInterval(interval);
              setJobId(null);
              setModalMessage("Importación completada.");
            }
          }
        } catch (error) {
          console.error("Error consultando estado de importación:", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [jobId]);

  // Función para refrescar la lista de tags (toggle)
  const handleTagsUpdate = () => {
    setTagRefreshFlag(prev => !prev);
  };

  // Botón "Borrar todas las imágenes" (Nuke database)
  const handleDeleteAllImages = async () => {
    if (loggedUser !== 'admin') return;
    setDeleteLoading(true);
    try {
      const response = await deleteAllImages();
      setModalMessage(
        response.data.success
          ? "Se borraron todas las imágenes."
          : "Error al borrar imágenes."
      );
    } catch (error) {
      setModalMessage("Error al borrar imágenes.");
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setStatusModalOpen(true);
    }
  };

  // Botón "Exportar"
  const handleExport = () => {
    if (!userId) {
      setModalMessage("No se encontró user_id.");
      setStatusModalOpen(true);
      return;
    }
    window.open(
      `${process.env.REACT_APP_API_URL}?action=exportImages&user_id=${userId}`,
      '_blank'
    );
  };

  // Botón "Importar imágenes"
  const handleImportImages = async () => {
    if (loggedUser !== 'admin') return;
    if (!userId) {
      setModalMessage("No se encontró user_id en localStorage.");
      setStatusModalOpen(true);
      return;
    }
    try {
      setImportLoading(true);
      const response = await startImport(userId);
      if (response.data.success) {
        setJobId(response.data.job_id);
        setImportStatus("running");
        setModalMessage("La importación ha comenzado. Puedes cerrar esta ventana");
        setImportModalOpen(false);
        setStatusModalOpen(true);
      } else {
        setModalMessage(response.data.message || "Error al iniciar la importación.");
        setImportModalOpen(false);
        setStatusModalOpen(true);
      }
    } catch (error) {
      setModalMessage("Error al importar imágenes.");
      setImportModalOpen(false);
      setStatusModalOpen(true);
    } finally {
      setImportLoading(false);
    }
  };

  // Botón "Cancelar Import"
  const handleCancelImport = async () => {
    if (!jobId) return;
    try {
      const response = await stopImport(jobId);
      if (response.data.success) {
        setImportStatus("stopped");
        setModalMessage("Importación detenida.");
      } else {
        setModalMessage("Error deteniendo la importación.");
      }
    } catch (error) {
      setModalMessage("Error deteniendo la importación.");
    } finally {
      setStatusModalOpen(true);
    }
  };

  // Botón "Limpiar Database"
  const handleClearDatabase = async () => {
    if (loggedUser !== 'admin') return;
    setClearDbLoading(true);
    try {
      const response = await clearDatabase();
      setModalMessage(
        response.data.success
          ? response.data.message || "Base de datos limpia exitosamente."
          : "Error al limpiar la base de datos."
      );
    } catch (error) {
      setModalMessage("Error al limpiar la base de datos.");
    } finally {
      setClearDbLoading(false);
      setClearDbModalOpen(false);
      setStatusModalOpen(true);
    }
  };

  // Botón "Cerrar sesión"
  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    window.location.href = "/image_tagger/login";
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin</h2>
      </div>

      <UserCard userId={userId} username={loggedUser} />

      <div className="admin-buttons">
        {loggedUser === 'admin' && (
          <button
            onClick={() => setDeleteModalOpen(true)}
            disabled={deleteLoading}
            className="delete-button"
          >
            {deleteLoading ? "Borrando..." : "Nuke database ☢️"}
          </button>
        )}
        <button
          onClick={handleExport}
          disabled={deleteLoading || importLoading}
          className="export-button"
        >
          Exportar
        </button>
        {loggedUser === 'admin' && (
          <button
            onClick={() => setImportModalOpen(true)}
            disabled={importLoading || jobId}
            className="import-button"
          >
            {importLoading ? "Importando..." : "Importar imágenes"}
          </button>
        )}
        {loggedUser === 'admin' && (
          <button
            onClick={() => setClearDbModalOpen(true)}
            disabled={clearDbLoading}
            className="clear-db-button"
          >
            {clearDbLoading ? "Limpiando..." : "Limpiar Database"}
          </button>
        )}
        <button onClick={handleLogout} className="logout-button">
          Cerrar sesión
        </button>
      </div>

      {/* Modales de confirmación y estado */}
      <Modal
        isOpen={deleteModalOpen}
        onRequestClose={() => setDeleteModalOpen(false)}
        className="admin-modal"
      >
        <h2>¿Borrar todas las imágenes?</h2>
        <button onClick={handleDeleteAllImages} className="admin-modal-confirm-button">
          Sí, borrar
        </button>
        <button onClick={() => setDeleteModalOpen(false)} className="admin-modal-cancel-button">
          Cancelar
        </button>
      </Modal>

      <Modal
        isOpen={importModalOpen}
        onRequestClose={() => setImportModalOpen(false)}
        className="admin-modal"
      >
        <h2>¿Importar imágenes?</h2>
        <button onClick={handleImportImages} className="admin-modal-confirm-button">
          Sí, importar
        </button>
        <button onClick={() => setImportModalOpen(false)} className="admin-modal-cancel-button">
          Cancelar
        </button>
      </Modal>

      <Modal
        isOpen={clearDbModalOpen}
        onRequestClose={() => setClearDbModalOpen(false)}
        className="admin-modal"
      >
        <h2>
          Se borrarán imágenes y tags. Tendrás que importar nuevamente las imágenes.
        </h2>
        <button onClick={handleClearDatabase} className="admin-modal-confirm-button">
          Continuar
        </button>
        <button onClick={() => setClearDbModalOpen(false)} className="admin-modal-cancel-button">
          Cancelar
        </button>
      </Modal>

      <Modal
        isOpen={statusModalOpen}
        onRequestClose={() => setStatusModalOpen(false)}
        className="admin-modal"
      >
        <h2>{modalMessage}</h2>
        {modalMessage === "La importación ha comenzado. Puedes cerrar esta ventana" ? (
          <button
            onClick={() => setStatusModalOpen(false)}
            className="admin-modal-confirm-button"
          >
            Continuar
          </button>
        ) : jobId && importStatus === "running" ? (
          <>
            <p>Estado: {importStatus}</p>
            <button onClick={handleCancelImport} className="admin-modal-cancel-button">
              Cancelar
            </button>
            <button onClick={() => setStatusModalOpen(false)} className="admin-modal-cancel-button">
              Cerrar
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              setStatusModalOpen(false);
              if (
                modalMessage === "Se borraron todas las imágenes." ||
                modalMessage === "Error al borrar imágenes." ||
                modalMessage === "Base de datos limpia exitosamente." ||
                modalMessage === "Importación completada." ||
                modalMessage.includes("Se han borrado los registros de imágenes")
              ) {
                navigate('/gallery');
              }
            }}
            className="admin-modal-confirm-button"
          >
            Continuar
          </button>
        )}
      </Modal>

      {jobId && importStatus === "running" && (
        <div className="import-status-banner">
          <p>Importación en curso...</p>
        </div>
      )}

      <AdminStats />
      
      <div className="admin-tag-components-container">
        <div className="admin-tag-row">
          <TagInfo refreshFlag={tagRefreshFlag} />
          <UpdateTag onUpdate={handleTagsUpdate} />
        </div>
        <div className="admin-tag-row">
          <TagChart />
        </div>
      </div>
    </div>
  );
};

export default Admin;
