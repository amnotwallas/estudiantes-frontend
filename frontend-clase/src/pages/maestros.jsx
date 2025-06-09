import React, { useEffect, useState } from 'react';
import './maestros.css';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://estudiantes-api-rest.onrender.com/api';

function Maestros() {
  const { user } = useAuth();
  const [maestros, setMaestros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaestros, setSelectedMaestros] = useState(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    nombre: '',
    apellido: '',
    genero: 'masculino',
    telefono: '',
    email: '',
    especialidad: ''
  });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    genero: 'masculino',
    telefono: '',
    email: '',
    especialidad: ''
  });

  const fetchMaestros = async () => {
    try {
      const res = await authService.authFetch(`${API_URL}/maestros`);
      if (!res.ok) throw new Error('Error al cargar maestros');
      const data = await res.json();
      setMaestros(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaestros();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este maestro?')) return;
    try {
      const res = await authService.authFetch(`${API_URL}/maestros/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar maestro');
      await fetchMaestros();
      setSelectedMaestros(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkEdit = async () => {
    if (!window.confirm(`¿Estás seguro de actualizar ${selectedMaestros.size} maestros?`)) return;
    try {
      const updatePromises = Array.from(selectedMaestros).map(id =>
        authService.authFetch(`${API_URL}/maestros/${id}`, {
          method: 'PUT',
          body: JSON.stringify(bulkEditData),
        })
      );
      await Promise.all(updatePromises);
      await fetchMaestros();
      setBulkEditMode(false);
      setBulkEditData({
        nombre: '',
        apellido: '',
        genero: 'masculino',
        telefono: '',
        email: '',
        especialidad: ''
      });
      setSelectedMaestros(new Set());
    } catch (err) {
      alert('Error al actualizar maestros');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar ${selectedMaestros.size} maestros?`)) return;
    try {
      const deletePromises = Array.from(selectedMaestros).map(id =>
        authService.authFetch(`${API_URL}/maestros/${id}`, {
          method: 'DELETE',
        })
      );
      await Promise.all(deletePromises);
      await fetchMaestros();
      setSelectedMaestros(new Set());
    } catch (err) {
      alert('Error al eliminar maestros');
    }
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    const maestro = maestros.find(m => m._id === id);
    if (maestro) {
      setFormData({
        nombre: maestro.nombre,
        apellido: maestro.apellido,
        genero: maestro.genero,
        telefono: maestro.telefono,
        email: maestro.email,
        especialidad: maestro.especialidad
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.authFetch(`${API_URL}/maestros/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al actualizar maestro');
      setEditingId(null);
      setFormData({
        nombre: '',
        apellido: '',
        genero: 'masculino',
        telefono: '',
        email: '',
        especialidad: ''
      });
      await fetchMaestros();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.authFetch('${API_URL}/maestros', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al crear maestro');
      setShowCreateForm(false);
      setFormData({
        nombre: '',
        apellido: '',
        genero: 'masculino',
        telefono: '',
        email: '',
        especialidad: ''
      });
      await fetchMaestros();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectMaestro = (id) => {
    setSelectedMaestros(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredMaestros.map(maestro => maestro._id);
      setSelectedMaestros(new Set(allIds));
    } else {
      setSelectedMaestros(new Set());
    }
  };

  const filteredMaestros = maestros.filter(maestro => {
    const searchLower = searchTerm.toLowerCase();
    return (
      maestro.nombre.toLowerCase().includes(searchLower) ||
      maestro.apellido.toLowerCase().includes(searchLower) ||
      maestro.email.toLowerCase().includes(searchLower) ||
      maestro.especialidad.toLowerCase().includes(searchLower)
    );
  });

  const handleBulkEditChange = (e) => {
    setBulkEditData({
      ...bulkEditData,
      [e.target.name]: e.target.value
    });
  };

  const renderBulkEditForm = () => (
    <div className="bulk-edit-form">
      <h3>Editar {selectedMaestros.size} maestro{selectedMaestros.size !== 1 ? 's' : ''}</h3>
      <div className="form-grid">
        <input
          type="text"
          name="nombre"
          value={bulkEditData.nombre}
          onChange={handleBulkEditChange}
          placeholder="Nombre (opcional)"
        />
        <input
          type="text"
          name="apellido"
          value={bulkEditData.apellido}
          onChange={handleBulkEditChange}
          placeholder="Apellido (opcional)"
        />
        <select
          name="genero"
          value={bulkEditData.genero}
          onChange={handleBulkEditChange}
        >
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </select>
        <input
          type="tel"
          name="telefono"
          value={bulkEditData.telefono}
          onChange={handleBulkEditChange}
          placeholder="Teléfono (opcional)"
        />
        <input
          type="email"
          name="email"
          value={bulkEditData.email}
          onChange={handleBulkEditChange}
          placeholder="Email (opcional)"
        />
        <input
          type="text"
          name="especialidad"
          value={bulkEditData.especialidad}
          onChange={handleBulkEditChange}
          placeholder="Especialidad (opcional)"
        />
      </div>
    </div>
  );

  const renderForm = (onSubmit) => (
    <form onSubmit={onSubmit} style={{ marginBottom: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Nombre"
          required
        />
        <input
          type="text"
          name="apellido"
          value={formData.apellido}
          onChange={handleChange}
          placeholder="Apellido"
          required
        />
        <select
          name="genero"
          value={formData.genero}
          onChange={handleChange}
          required
        >
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
          <option value="otro">Otro</option>
        </select>
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Teléfono"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="text"
          name="especialidad"
          value={formData.especialidad}
          onChange={handleChange}
          placeholder="Especialidad"
          required
        />
        <button type="submit" className="btn-action" style={{ backgroundColor: '#43869c' }}>
          {editingId ? 'Actualizar' : 'Crear'} Maestro
        </button>
      </div>
    </form>
  );

  return (
    <div className="maestros-container">
      <h1>Gestión de Maestros</h1>
      <h2>Administra los registros de los maestros</h2>

      <div className="maestros-content">
        {user?.role === 'admin' && !selectedMaestros.size && (
          <div>
            {!showCreateForm && !editingId && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="btn-action"
                style={{ backgroundColor: '#43869c' }}
              >
                Crear Nuevo Maestro
              </button>
            )}
            {showCreateForm && renderForm(handleCreate)}
            {editingId && renderForm(handleUpdate)}
          </div>
        )}

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nombre, apellido o email..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {selectedMaestros.size > 0 && (
            <span className="selected-count">
              {selectedMaestros.size} seleccionado{selectedMaestros.size !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {selectedMaestros.size > 0 && user?.role === 'admin' && (
          <div className="bulk-actions">
            {!bulkEditMode ? (
              <>
                <button 
                  onClick={() => setBulkEditMode(true)}
                  className="btn-action btn-edit"
                >
                  Editar
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="btn-action btn-delete"
                >
                  Eliminar
                </button>
              </>
            ) : (
              renderBulkEditForm()
            )}
          </div>
        )}

        {loading && <p className="loading">Cargando maestros...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredMaestros.length > 0 && selectedMaestros.size === filteredMaestros.length}
                    />
                  </th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Especialidad</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaestros.map(maestro => (
                  <tr 
                    key={maestro._id}
                    className={selectedMaestros.has(maestro._id) ? 'selected' : ''}
                  >
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedMaestros.has(maestro._id)}
                        onChange={() => handleSelectMaestro(maestro._id)}
                      />
                    </td>
                    <td>{maestro.nombre}</td>
                    <td>{maestro.apellido}</td>
                    <td>{maestro.email}</td>
                    <td>{maestro.telefono}</td>
                    <td>{maestro.especialidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Maestros;
