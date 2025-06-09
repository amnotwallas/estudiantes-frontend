import React, { useEffect, useState } from 'react';
import './carreras.css';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

// Carreras predefinidas
const CARRERAS_PREDEFINIDAS = [
  {
    nombre: 'Ingeniería en Sistemas Computacionales',
    descripcion: 'Forma profesionales capaces de diseñar, desarrollar e implementar sistemas computacionales y software para resolver problemas en diversos ámbitos.',
    duracion: 4,
    modalidad: 'Presencial',
    tieneAlumnos: true,
    numAlumnos: 0
  },
  {
    nombre: 'Ingeniería en Informática',
    descripcion: 'Prepara profesionales para el desarrollo de soluciones tecnológicas, gestión de sistemas de información y desarrollo de software.',
    duracion: 4,
    modalidad: 'Presencial',
    tieneAlumnos: true,
    numAlumnos: 0
  },
  {
    nombre: 'Ingeniería en Bioquímica',
    descripcion: 'Forma profesionales capaces de aplicar conocimientos de química y biología para el desarrollo de procesos industriales y biotecnológicos.',
    duracion: 4,
    modalidad: 'Presencial',
    tieneAlumnos: true,
    numAlumnos: 0
  },
  {
    nombre: 'Contador Público',
    descripcion: 'Prepara profesionales para la gestión financiera, contable y fiscal de organizaciones públicas y privadas.',
    duracion: 4,
    modalidad: 'Presencial',
    tieneAlumnos: true,
    numAlumnos: 0
  },
  {
    nombre: 'Ingeniería Civil',
    descripcion: 'Forma profesionales para el diseño, construcción y mantenimiento de obras civiles como edificios, puentes y carreteras.',
    duracion: 4,
    modalidad: 'Presencial',
    tieneAlumnos: true,
    numAlumnos: 0
  },
  {
    nombre: 'Ingeniería en Gestión Empresarial',
    descripcion: 'Prepara profesionales para la gestión y optimización de procesos empresariales, recursos y proyectos.',
    duracion: 4,
    modalidad: 'Presencial',
    tieneAlumnos: true,
    numAlumnos: 0
  }
];

function Carreras() {
  const { user } = useAuth();
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCarreras, setSelectedCarreras] = useState(new Set());
  const [selectedCarrera, setSelectedCarrera] = useState(null);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    modalidad: ''
  });
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracion: '',
    modalidad: ''
  });
  const [alumnosCarrera, setAlumnosCarrera] = useState([]);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  console.log('Componente Carreras montado');
  console.log('Estado inicial:', { carreras, loading, error });

  const fetchCarreras = async () => {
    console.log('Iniciando fetchCarreras');
    try {
      setLoading(true);
      setError(null);
      
      // Intentar obtener carreras del backend
      try {
        console.log('Intentando obtener carreras del backend');
        const res = await authService.authFetch('http://localhost:3000/api/carreras');
        console.log('Respuesta del backend:', res);
        
        if (res.ok) {
          const data = await res.json();
          console.log('Datos recibidos del backend:', data);
          
          if (Array.isArray(data) && data.length > 0) {
            console.log('Usando carreras del backend');
            const carrerasProcesadas = data.map(carrera => ({
              ...carrera,
              tieneAlumnos: carrera.alumnos && Array.isArray(carrera.alumnos) && carrera.alumnos.length > 0,
              numAlumnos: carrera.alumnos && Array.isArray(carrera.alumnos) ? carrera.alumnos.length : 0
            }));
            setCarreras(carrerasProcesadas);
            return;
          }
        }
      } catch (err) {
        console.log('Error al obtener carreras del backend:', err);
      }

      // Si no hay carreras en el backend o hay error, usar las predefinidas
      console.log('Usando carreras predefinidas');
      const carrerasPredefinidas = CARRERAS_PREDEFINIDAS.map((carrera, index) => ({
        ...carrera,
        _id: `predefinida-${index + 1}`
      }));
      console.log('Carreras predefinidas procesadas:', carrerasPredefinidas);
      setCarreras(carrerasPredefinidas);
    } catch (err) {
      console.error('Error general en fetchCarreras:', err);
      setError(err.message || 'Error al cargar las carreras');
    } finally {
      console.log('Finalizando fetchCarreras');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect ejecutado');
    fetchCarreras();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta carrera?')) return;
    try {
      const res = await authService.authFetch(`http://localhost:3000/api/carreras/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Error al eliminar carrera');
      await fetchCarreras();
      setSelectedCarreras(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBulkEdit = async () => {
    if (!window.confirm(`¿Estás seguro de actualizar ${selectedCarreras.size} carreras?`)) return;
    try {
      const updatePromises = Array.from(selectedCarreras).map(id =>
        authService.authFetch(`http://localhost:3000/api/carreras/${id}`, {
          method: 'PUT',
          body: JSON.stringify(bulkEditData),
        })
      );
      await Promise.all(updatePromises);
      await fetchCarreras();
      setBulkEditMode(false);
      setBulkEditData({
        nombre: '',
        descripcion: '',
        duracion: '',
        modalidad: ''
      });
      setSelectedCarreras(new Set());
    } catch (err) {
      alert('Error al actualizar carreras');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar ${selectedCarreras.size} carreras?`)) return;
    try {
      const deletePromises = Array.from(selectedCarreras).map(id =>
        authService.authFetch(`http://localhost:3000/api/carreras/${id}`, {
          method: 'DELETE',
        })
      );
      await Promise.all(deletePromises);
      await fetchCarreras();
      setSelectedCarreras(new Set());
    } catch (err) {
      alert('Error al eliminar carreras');
    }
  };

  const handleEdit = async (id) => {
    setEditingId(id);
    const carrera = carreras.find(c => c._id === id);
    if (carrera) {
      setFormData({
        nombre: carrera.nombre,
        descripcion: carrera.descripcion,
        duracion: carrera.duracion,
        modalidad: carrera.modalidad
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.authFetch(`http://localhost:3000/api/carreras/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al actualizar carrera');
      setEditingId(null);
      setFormData({
        nombre: '',
        descripcion: '',
        duracion: '',
        modalidad: ''
      });
      await fetchCarreras();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.authFetch('http://localhost:3000/api/carreras', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Error al crear carrera');
      setShowCreateForm(false);
      setFormData({
        nombre: '',
        descripcion: '',
        duracion: '',
        modalidad: ''
      });
      await fetchCarreras();
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
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSelectCarrera = async (id) => {
    setSelectedCarreras(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
        setSelectedCarrera(null);
        setAlumnosCarrera([]);
      } else {
        newSet.clear();
        newSet.add(id);
        const carrera = carreras.find(c => c._id === id);
        setSelectedCarrera(carrera);
        if (carrera) {
          fetchAlumnosCarrera(carrera.nombre);
        }
      }
      return newSet;
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = carreras.map(carrera => carrera._id);
      setSelectedCarreras(new Set(allIds));
    } else {
      setSelectedCarreras(new Set());
    }
  };

  const fetchAlumnosCarrera = async (nombreCarrera) => {
    try {
      setLoadingAlumnos(true);
      const res = await authService.authFetch(`http://localhost:3000/api/alumnos/carrera/${encodeURIComponent(nombreCarrera)}`);
      if (!res.ok) throw new Error('Error al cargar los alumnos de la carrera');
      const data = await res.json();
      setAlumnosCarrera(data);
    } catch (err) {
      console.error('Error al cargar alumnos de la carrera:', err);
      setAlumnosCarrera([]);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const filteredCarreras = carreras.filter(carrera => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      carrera.nombre.toLowerCase().includes(searchLower) ||
      carrera.descripcion.toLowerCase().includes(searchLower) ||
      carrera.modalidad.toLowerCase().includes(searchLower) ||
      carrera.duracion.toString().includes(searchLower) ||
      (carrera.tieneAlumnos ? 'con alumnos' : 'sin alumnos').includes(searchLower)
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
      <h3>Editar {selectedCarreras.size} carrera{selectedCarreras.size !== 1 ? 's' : ''}</h3>
      <div className="form-grid">
        <input
          type="text"
          name="nombre"
          value={bulkEditData.nombre}
          onChange={handleBulkEditChange}
          placeholder="Nombre (opcional)"
        />
        <textarea
          name="descripcion"
          value={bulkEditData.descripcion}
          onChange={handleBulkEditChange}
          placeholder="Descripción (opcional)"
        />
        <input
          type="number"
          name="duracion"
          value={bulkEditData.duracion}
          onChange={handleBulkEditChange}
          placeholder="Duración en años (opcional)"
        />
        <select
          name="modalidad"
          value={bulkEditData.modalidad}
          onChange={handleBulkEditChange}
        >
          <option value="">Seleccione modalidad (opcional)</option>
          <option value="Presencial">Presencial</option>
          <option value="En línea">En línea</option>
          <option value="Híbrida">Híbrida</option>
        </select>
      </div>
      <div className="bulk-edit-buttons">
        <button onClick={handleBulkEdit} className="btn-primary">Guardar Cambios</button>
        <button onClick={() => setBulkEditMode(false)} className="btn-secondary">Cancelar</button>
      </div>
    </div>
  );

  const renderForm = (onSubmit) => (
    <form onSubmit={onSubmit} className="carreras-form">
      <div className="form-group">
        <label htmlFor="nombre">Nombre de la Carrera:</label>
        <input
          type="text"
          id="nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="descripcion">Descripción:</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="duracion">Duración (años):</label>
        <input
          type="number"
          id="duracion"
          name="duracion"
          value={formData.duracion}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="modalidad">Modalidad:</label>
        <select
          id="modalidad"
          name="modalidad"
          value={formData.modalidad}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione una modalidad</option>
          <option value="Presencial">Presencial</option>
          <option value="En línea">En línea</option>
          <option value="Híbrida">Híbrida</option>
        </select>
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn-primary">
          {editingId ? 'Actualizar Carrera' : 'Agregar Carrera'}
        </button>
        <button type="button" onClick={() => {
          setEditingId(null);
          setShowCreateForm(false);
          setFormData({
            nombre: '',
            descripcion: '',
            duracion: '',
            modalidad: ''
          });
        }} className="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );

  const renderCarreraDetalles = () => {
    if (!selectedCarrera) return null;

    return (
      <div className="carrera-detalles">
        <div className="carrera-info">
          <h2>{selectedCarrera.nombre}</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Descripción:</span>
              <p>{selectedCarrera.descripcion}</p>
            </div>
            <div className="info-item">
              <span className="label">Duración:</span>
              <p>{selectedCarrera.duracion} años</p>
            </div>
            <div className="info-item">
              <span className="label">Modalidad:</span>
              <p>{selectedCarrera.modalidad}</p>
            </div>
            <div className="info-item">
              <span className="label">Estado:</span>
              <p>
                <span className={`status-badge ${alumnosCarrera.length > 0 ? 'active' : 'inactive'}`}>
                  {alumnosCarrera.length > 0 ? 'Con alumnos' : 'Sin alumnos'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="alumnos-carrera">
          <h3>Alumnos Inscritos</h3>
          {loadingAlumnos ? (
            <div className="loading">Cargando alumnos...</div>
          ) : alumnosCarrera.length > 0 ? (
            <div className="alumnos-grid">
              {alumnosCarrera.map(alumno => (
                <div key={alumno._id} className="alumno-card">
                  <div className="alumno-info">
                    <h4>{alumno.nombre} {alumno.apellido}</h4>
                    <p className="alumno-email">{alumno.email}</p>
                    <p className="alumno-telefono">{alumno.telefono}</p>
                    <p className="alumno-genero">
                      Género: {alumno.genero === 'masculino' ? 'Masculino' : 
                             alumno.genero === 'femenino' ? 'Femenino' : 'Otro'}
                    </p>
                  </div>
                  <div className="alumno-estado">
                    <span className={`status-badge ${alumno.estado === 'activo' ? 'active' : 'inactive'}`}>
                      {alumno.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-data-message">
              No hay alumnos inscritos en esta carrera
            </div>
          )}
        </div>
      </div>
    );
  };

  console.log('Renderizando componente. Estado actual:', { carreras, loading, error });

  if (loading) {
    console.log('Mostrando estado de carga');
    return (
      <div className="loading-container">
        <div className="loading">Cargando carreras...</div>
      </div>
    );
  }

  if (error) {
    console.log('Mostrando estado de error:', error);
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error al cargar las carreras</h3>
          <p>{error}</p>
          <button onClick={fetchCarreras} className="btn-primary">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  console.log('Renderizando tabla con carreras:', carreras);

  return (
    <div className="carreras-container">
      <div className="carreras-header">
        <h1>Gestión de Carreras</h1>
        <div className="carreras-actions">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción, modalidad..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
            disabled={showCreateForm || editingId}
          >
            Nueva Carrera
          </button>
        </div>
      </div>

      {(showCreateForm || editingId) && renderForm(editingId ? handleUpdate : handleCreate)}

      {selectedCarreras.size > 0 && !bulkEditMode && (
        <div className="bulk-actions">
          <button 
            onClick={() => setBulkEditMode(true)} 
            className="btn-edit"
            disabled={editingId || showCreateForm}
          >
            Editar Carrera
          </button>
          <button 
            onClick={handleBulkDelete} 
            className="btn-delete"
            disabled={editingId || showCreateForm}
          >
            Eliminar Carrera
          </button>
        </div>
      )}

      {bulkEditMode && renderBulkEditForm()}

      {renderCarreraDetalles()}

      <div className="carreras-list">
        {filteredCarreras.length === 0 ? (
          <div className="no-data-message">
            {searchTerm ? 'No se encontraron carreras que coincidan con la búsqueda' : 'No hay carreras registradas'}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedCarreras.size === filteredCarreras.length && filteredCarreras.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Duración</th>
                <th>Modalidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarreras.map((carrera) => (
                <tr 
                  key={carrera._id} 
                  className={selectedCarreras.has(carrera._id) ? 'selected' : ''}
                >
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedCarreras.has(carrera._id)}
                      onChange={() => handleSelectCarrera(carrera._id)}
                    />
                  </td>
                  <td>{carrera.nombre}</td>
                  <td className="descripcion-cell">{carrera.descripcion}</td>
                  <td>{carrera.duracion} años</td>
                  <td>{carrera.modalidad}</td>
                  <td>
                    <span className={`status-badge ${carrera.tieneAlumnos ? 'active' : 'inactive'}`}>
                      {carrera.tieneAlumnos ? 'Con alumnos' : 'Sin alumnos'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Carreras; 