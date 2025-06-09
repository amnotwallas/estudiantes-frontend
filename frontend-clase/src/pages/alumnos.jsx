import React, { useEffect, useState } from 'react';
import './alumnos.css';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const API_URL = 'https://estudiantes-api-rest.onrender.com/api';

const CARRERAS_PREDEFINIDAS = [
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería en Informática',
  'Ingeniería en Bioquímica',
  'Contador Público',
  'Ingeniería Civil',
  'Ingeniería en Gestión Empresarial'
];

function Alumnos() {
  const { user } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnos, setSelectedAlumnos] = useState(new Set());
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    nombre: '',
    apellido: '',
    genero: 'masculino',
    telefono: '',
    email: '',
    carrera: ''
  });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    genero: 'masculino',
    telefono: '',
    email: '',
    carrera: ''
  });

  const fetchAlumnos = async () => {
    try {
      const res = await authService.authFetch(`${API_URL}/alumnos`);
      if (!res.ok) throw new Error('Error al cargar alumnos');
      const data = await res.json();
      setAlumnos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este alumno?')) return;
    try {
      const res = await authService.authFetch(`${API_URL}/alumnos/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar alumno');
      await fetchAlumnos();
      setSelectedAlumnos(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkEdit = async () => {
    if (!window.confirm(`¿Estás seguro de actualizar ${selectedAlumnos.size} alumnos?`)) return;
    try {
      const updatePromises = Array.from(selectedAlumnos).map(id =>
        authService.authFetch(`${API_URL}/alumnos/${id}`, {
          method: 'PUT',
          body: JSON.stringify(bulkEditData),
        })
      );
      await Promise.all(updatePromises);
      await fetchAlumnos();
      setBulkEditMode(false);
      setBulkEditData({
        nombre: '',
        apellido: '',
        genero: 'masculino',
        telefono: '',
        email: '',
        carrera: ''
      });
      setSelectedAlumnos(new Set());
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar ${selectedAlumnos.size} alumnos?`)) return;
    try {
      const deletePromises = Array.from(selectedAlumnos).map(id =>
        authService.authFetch(`${API_URL}/alumnos/${id}`, {
          method: 'DELETE',
        })
      );
      await Promise.all(deletePromises);
      await fetchAlumnos();
      setSelectedAlumnos(new Set());
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    const alumno = alumnos.find(a => a._id === id);
    if (alumno) {
      setFormData({
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        genero: alumno.genero,
        telefono: alumno.telefono,
        email: alumno.email,
        carrera: alumno.carrera
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Validación de campos requeridos
      if (!formData.nombre || !formData.apellido || !formData.email || !formData.carrera) {
        alert('Por favor, completa todos los campos requeridos');
        return;
      }

      const res = await authService.authFetch(`${API_URL}/alumnos/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al actualizar alumno');
      setEditingId(null);
      setFormData({
        nombre: '',
        apellido: '',
        genero: 'masculino',
        telefono: '',
        email: '',
        carrera: ''
      });
      await fetchAlumnos();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Validación de campos requeridos
      if (!formData.nombre || !formData.apellido || !formData.email || !formData.carrera) {
        alert('Por favor, completa todos los campos requeridos');
        return;
      }

      // Preparar los datos para enviar
      const alumnoData = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        genero: formData.genero,
        telefono: formData.telefono.trim(),
        email: formData.email.trim(),
        carrera: formData.carrera,
        estado: 'activo'
      };

      console.log('Intentando crear alumno con datos:', alumnoData);

      const res = await authService.authFetch(`${API_URL}/alumnos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alumnoData)
      });

      const responseData = await res.json();
      console.log('Respuesta del servidor:', responseData);

      if (!res.ok) {
        throw new Error(responseData.message || 'Error al crear alumno');
      }

      // Si todo sale bien
      setShowCreateForm(false);
      setFormData({
        nombre: '',
        apellido: '',
        genero: 'masculino',
        telefono: '',
        email: '',
        carrera: ''
      });
      await fetchAlumnos();
    } catch (err) {
      console.error('Error completo al crear alumno:', err);
      alert(`Error al crear alumno: ${err.message || 'Error desconocido'}`);
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

  const handleSelectAlumno = (id) => {
    setSelectedAlumnos(prev => {
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
      const allIds = filteredAlumnos.map(alumno => alumno._id);
      setSelectedAlumnos(new Set(allIds));
    } else {
      setSelectedAlumnos(new Set());
    }
  };

  const handleRowClick = (e, id) => {
    if (e.target.type === 'checkbox') return;
    handleSelectAlumno(id);
  };

  const filteredAlumnos = alumnos.filter(alumno => {
    const searchLower = searchTerm.toLowerCase();
    return (
      alumno.nombre.toLowerCase().includes(searchLower) ||
      alumno.apellido.toLowerCase().includes(searchLower) ||
      alumno.email.toLowerCase().includes(searchLower)
    );
  });

  const renderForm = (onSubmit) => (
    <div className="form-container">
      <h3>{editingId ? 'Editar Alumno' : 'Crear Nuevo Alumno'}</h3>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre (Requerido)"
            required
          />
        </div>
        <div className="form-group">
          <label>Apellido:</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Apellido (Requerido)"
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email (Requerido)"
            required
          />
        </div>
        <div className="form-group">
          <label>Teléfono:</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Teléfono (Requerido)"
            required
          />
        </div>
        <div className="form-group">
          <label>Género:</label>
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
        </div>
        <div className="form-group">
          <label>Carrera:</label>
          <select
            name="carrera"
            value={formData.carrera}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una carrera</option>
            {CARRERAS_PREDEFINIDAS.map((carrera, index) => (
              <option key={index} value={carrera}>{carrera}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-action" style={{ backgroundColor: '#43869c' }}>
          {editingId ? 'Actualizar' : 'Crear'} Alumno
        </button>
      </form>
    </div>
  );

  if (loading) {
    return <div className="alumnos-container">Cargando alumnos...</div>;
  }

  if (error) {
    return <div className="alumnos-container">Error: {error}</div>;
  }

  return (
    <div className="alumnos-container">
      <h1>Gestión de Alumnos</h1>
      <h2>Administra los registros de los alumnos</h2>

      <div className="alumnos-content">
        {user?.role === 'admin' && (
          <div style={{ marginBottom: '20px' }}>
            {!showCreateForm && !editingId && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="btn-action"
                style={{ backgroundColor: '#43869c' }}
              >
                Crear Nuevo Alumno
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
          {selectedAlumnos.size > 0 && user?.role === 'admin' && (
            <span className="selected-count">
              {selectedAlumnos.size} seleccionado{selectedAlumnos.size !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {selectedAlumnos.size > 0 && user?.role === 'admin' && (
          <div className="bulk-actions">
            {!bulkEditMode ? (
              <>
                <button
                  onClick={() => setBulkEditMode(true)}
                  className="btn-action btn-edit"
                >
                  Editar Seleccionados
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="btn-action btn-delete"
                >
                  Eliminar Seleccionados
                </button>
              </>
            ) : (
              <div className="bulk-edit-form">
                <h3>Editar {selectedAlumnos.size} alumno{selectedAlumnos.size !== 1 ? 's' : ''}</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    name="nombre"
                    value={bulkEditData.nombre}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, nombre: e.target.value })}
                    placeholder="Nombre del alumno (opcional)"
                  />
                  <input
                    type="text"
                    name="apellido"
                    value={bulkEditData.apellido}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, apellido: e.target.value })}
                    placeholder="Apellido del alumno (opcional)"
                  />
                  <input
                    type="email"
                    name="email"
                    value={bulkEditData.email}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, email: e.target.value })}
                    placeholder="Email (opcional)"
                  />
                  <input
                    type="tel"
                    name="telefono"
                    value={bulkEditData.telefono}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, telefono: e.target.value })}
                    placeholder="Teléfono (opcional)"
                  />
                  <select
                    name="genero"
                    value={bulkEditData.genero}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, genero: e.target.value })}
                  >
                    <option value="">Selecciona género</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                  </select>
                  <select
                    name="carrera"
                    value={bulkEditData.carrera}
                    onChange={(e) => setBulkEditData({ ...bulkEditData, carrera: e.target.value })}
                  >
                    <option value="">Selecciona una carrera</option>
                    {CARRERAS_PREDEFINIDAS.map((carrera, index) => (
                      <option key={index} value={carrera}>{carrera}</option>
                    ))}
                  </select>
                </div>
                <div className="bulk-edit-buttons">
                  <button 
                    onClick={handleBulkEdit}
                    className="btn-action btn-edit"
                  >
                    Guardar Cambios
                  </button>
                  <button 
                    onClick={() => {
                      setBulkEditMode(false);
                      setBulkEditData({
                        nombre: '',
                        apellido: '',
                        genero: 'masculino',
                        telefono: '',
                        email: '',
                        carrera: ''
                      });
                    }}
                    className="btn-action"
                    style={{ backgroundColor: '#6c757d' }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && <p className="loading">Cargando alumnos...</p>}
        {error && <p className="error">Error: {error}</p>}

        {!loading && !error && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {user?.role === 'admin' && (
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={filteredAlumnos.length > 0 && selectedAlumnos.size === filteredAlumnos.length}
                      />
                    </th>
                  )}
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Carrera</th>
                  {/* {user?.role === 'admin' && <th>Acciones</th>} */}
                </tr>
              </thead>
              <tbody>
                {filteredAlumnos.map(alumno => (
                  <tr 
                    key={alumno._id}
                    className={selectedAlumnos.has(alumno._id) ? 'selected' : ''}
                    onClick={(e) => handleRowClick(e, alumno._id)}
                    style={{ cursor: user?.role === 'admin' ? 'pointer' : 'default' }}
                  >
                    {user?.role === 'admin' && (
                      <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedAlumnos.has(alumno._id)}
                          onChange={() => handleSelectAlumno(alumno._id)}
                        />
                      </td>
                    )}
                    <td>{alumno.nombre}</td>
                    <td>{alumno.apellido}</td>
                    <td>{alumno.email}</td>
                    <td>{alumno.telefono}</td>
                    <td>{alumno.carrera || 'No asignada'}</td>
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

export default Alumnos;
