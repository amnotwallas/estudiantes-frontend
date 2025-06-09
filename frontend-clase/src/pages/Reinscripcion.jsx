import React, { useEffect, useState } from 'react';
import './Reinscripcion.css';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import ErrorForm from '../components/ErrorForm';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configurar autoTable
const setupAutoTable = () => {
  if (typeof window !== 'undefined') {
    const { jsPDF } = window;
    if (jsPDF && !jsPDF.API.autoTable) {
      jsPDF.API.autoTable = autoTable;
    }
  }
};

// Ejecutar la configuración
setupAutoTable();

function Reinscripcion() {
  const { user } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumnos, setSelectedAlumnos] = useState(new Set());
  const [selectedAlumno, setSelectedAlumno] = useState(null);
  const [showReinscripcionForm, setShowReinscripcionForm] = useState(false);
  const [showInscripcionForm, setShowInscripcionForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    semestre: '',
    fechaReinscripcion: '',
    estado: 'activo',
    observaciones: ''
  });
  const [selectedAlumnoForAction, setSelectedAlumnoForAction] = useState(null);
  const [nuevoAlumnoData, setNuevoAlumnoData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    carrera: '',
    genero: 'masculino',
    telefono: '',
    semestre: '1',
    estado: 'activo'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4); // Cambiado de 10 a 4 alumnos por página

  const fetchAlumnos = async () => {
    try {
      const res = await authService.authFetch('http://localhost:3000/api/alumnos');
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSelectAlumno = (alumno) => {
    setSelectedAlumnos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alumno._id)) {
        newSet.delete(alumno._id);
        if (selectedAlumnoForAction?._id === alumno._id) {
          setSelectedAlumnoForAction(null);
        }
      } else {
        newSet.add(alumno._id);
        setSelectedAlumnoForAction(alumno);
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

  const handleEdit = (alumno) => {
    setSelectedAlumno(alumno);
    setEditingId(alumno._id);
    setShowReinscripcionForm(true);
    // Cargar datos de la última reinscripción del alumno
    fetchUltimaReinscripcion(alumno._id);
  };

  const fetchUltimaReinscripcion = async (alumnoId) => {
    try {
      const res = await authService.authFetch(`http://localhost:3000/api/reinscripciones/alumno/${alumnoId}`);
      if (!res.ok) throw new Error('Error al cargar reinscripciones');
      const data = await res.json();
      if (data.length > 0) {
        const ultimaReinscripcion = data[data.length - 1];
        setFormData({
          semestre: ultimaReinscripcion.semestre,
          fechaReinscripcion: new Date(ultimaReinscripcion.fechaReinscripcion).toISOString().split('T')[0],
          estado: ultimaReinscripcion.estado,
          observaciones: ultimaReinscripcion.observaciones || ''
        });
      } else {
        // Si no hay reinscripciones previas, establecer valores por defecto
        const today = new Date().toISOString().split('T')[0];
        setFormData({
          semestre: '',
          fechaReinscripcion: today,
          estado: 'activo',
          observaciones: ''
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (alumnoId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reinscripción?')) {
      return;
    }

    try {
      const res = await authService.authFetch(`http://localhost:3000/api/reinscripciones/${alumnoId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Error al eliminar la reinscripción');
      
      await fetchAlumnos();
      alert('Reinscripción eliminada exitosamente');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar ${selectedAlumnos.size} reinscripciones?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedAlumnos).map(id =>
        authService.authFetch(`http://localhost:3000/api/reinscripciones/${id}`, {
          method: 'DELETE'
        })
      );

      await Promise.all(deletePromises);
      setSelectedAlumnos(new Set());
      await fetchAlumnos();
      alert('Reinscripciones eliminadas exitosamente');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlumno) return;

    try {
      const reinscripcionData = {
        alumnoId: selectedAlumno._id,
        ...formData
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:3000/api/reinscripciones/${editingId}`
        : 'http://localhost:3000/api/reinscripciones';

      const res = await authService.authFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reinscripcionData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al procesar la reinscripción');
      }

      // Limpiar el formulario y actualizar la lista
      setShowReinscripcionForm(false);
      setSelectedAlumno(null);
      setEditingId(null);
      setFormData({
        semestre: '',
        fechaReinscripcion: '',
        estado: 'activo',
        observaciones: ''
      });
      await fetchAlumnos();
      alert(editingId ? 'Reinscripción actualizada exitosamente' : 'Reinscripción procesada exitosamente');

    } catch (err) {
      setError(err.message);
    }
  };

  const handleInscripcionSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar datos antes de enviar
      if (!nuevoAlumnoData.nombre || !nuevoAlumnoData.apellido || !nuevoAlumnoData.email || 
          !nuevoAlumnoData.carrera || !nuevoAlumnoData.telefono || !nuevoAlumnoData.genero) {
        throw new Error('Por favor complete todos los campos requeridos');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nuevoAlumnoData.email)) {
        throw new Error('Por favor ingrese un email válido');
      }

      // Validar formato de teléfono (mínimo 10 dígitos)
      const telefonoRegex = /^\d{10,}$/;
      if (!telefonoRegex.test(nuevoAlumnoData.telefono.replace(/\D/g, ''))) {
        throw new Error('Por favor ingrese un número de teléfono válido (mínimo 10 dígitos)');
      }

      // Primero crear el alumno
      const alumnoData = {
        nombre: nuevoAlumnoData.nombre.trim(),
        apellido: nuevoAlumnoData.apellido.trim(),
        email: nuevoAlumnoData.email.trim(),
        telefono: nuevoAlumnoData.telefono.trim(),
        genero: nuevoAlumnoData.genero,
        carrera: nuevoAlumnoData.carrera,
        estado: nuevoAlumnoData.estado
      };

      console.log('Enviando datos del alumno:', alumnoData);

      const alumnoRes = await authService.authFetch('http://localhost:3000/api/alumnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(alumnoData)
      });

      const alumnoResponseData = await alumnoRes.json();

      if (!alumnoRes.ok) {
        throw new Error(alumnoResponseData.message || 'Error al crear el alumno');
      }

      console.log('Respuesta del servidor:', alumnoResponseData);

      // Luego crear la reinscripción
      const reinscripcionData = {
        alumnoId: alumnoResponseData._id,
        semestre: nuevoAlumnoData.semestre,
        fechaReinscripcion: new Date().toISOString().split('T')[0],
        estado: 'activo',
        observaciones: 'Inscripción inicial'
      };

      console.log('Enviando datos de reinscripción:', reinscripcionData);

      const reinscripcionRes = await authService.authFetch('http://localhost:3000/api/reinscripciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(reinscripcionData)
      });

      const reinscripcionResponseData = await reinscripcionRes.json();

      if (!reinscripcionRes.ok) {
        // Si falla la reinscripción, intentar eliminar el alumno creado
        try {
          await authService.authFetch(`http://localhost:3000/api/alumnos/${alumnoResponseData._id}`, {
            method: 'DELETE'
          });
        } catch (deleteError) {
          console.error('Error al limpiar alumno después de fallo en reinscripción:', deleteError);
        }
        throw new Error(reinscripcionResponseData.message || 'Error al crear la reinscripción inicial');
      }

      // Limpiar el formulario y actualizar la lista
      setShowInscripcionForm(false);
      setNuevoAlumnoData({
        nombre: '',
        apellido: '',
        email: '',
        carrera: '',
        genero: 'masculino',
        telefono: '',
        semestre: '1',
        estado: 'activo'
      });
      await fetchAlumnos();
      alert('Alumno inscrito exitosamente');

    } catch (err) {
      console.error('Error en inscripción:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    }
  };

  const handleNuevoAlumnoChange = (e) => {
    setNuevoAlumnoData({
      ...nuevoAlumnoData,
      [e.target.name]: e.target.value
    });
  };

  const handleReinscribir = (alumno) => {
    setSelectedAlumno(alumno);
    setEditingId(null);
    setShowReinscripcionForm(true);
    setFormData({
      semestre: '',
      fechaReinscripcion: new Date().toISOString().split('T')[0],
      estado: 'activo',
      observaciones: ''
    });
  };

  const filteredAlumnos = alumnos.filter(alumno => {
    const searchTermLower = searchTerm.toLowerCase().trim();
    if (!searchTermLower) return true;

    return (
      alumno.nombre?.toLowerCase().includes(searchTermLower) ||
      alumno.apellido?.toLowerCase().includes(searchTermLower) ||
      alumno.email?.toLowerCase().includes(searchTermLower) ||
      alumno.carrera?.toLowerCase().includes(searchTermLower) ||
      alumno.telefono?.includes(searchTermLower) ||
      `${alumno.nombre} ${alumno.apellido}`.toLowerCase().includes(searchTermLower)
    );
  });

  // Calcular índices para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAlumnos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);

  // Función para cambiar de página
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll al inicio de la lista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Función para generar el array de números de página
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Número máximo de páginas a mostrar en la navegación

    if (totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Si hay muchas páginas, mostrar un subconjunto
      if (currentPage <= 3) {
        // Cerca del inicio
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        // Cerca del final
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // En medio
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }

    return pageNumbers;
  };

  // Actualizar la página actual cuando cambie el término de búsqueda
  useEffect(() => {
    setCurrentPage(1); // Resetear a la primera página cuando cambie la búsqueda
  }, [searchTerm]);

  const renderReinscripcionForm = () => {
    if (!selectedAlumno || !showReinscripcionForm) return null;

    return (
      <div className="reinscripcion-form-container">
        <div className="reinscripcion-form">
          <h3>{editingId ? 'Editar' : 'Nueva'} Reinscripción</h3>
          <div className="alumno-info">
            <p><strong>Nombre:</strong> {selectedAlumno.nombre} {selectedAlumno.apellido}</p>
            <p><strong>Carrera:</strong> {selectedAlumno.carrera}</p>
            <p><strong>Email:</strong> {selectedAlumno.email}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="semestre">Semestre:</label>
              <select
                id="semestre"
                name="semestre"
                value={formData.semestre}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona el semestre</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}° Semestre</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaReinscripcion">Fecha de Reinscripción:</label>
              <input
                type="date"
                id="fechaReinscripcion"
                name="fechaReinscripcion"
                value={formData.fechaReinscripcion}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado:</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <option value="activo">Activo</option>
                <option value="baja">Baja</option>
                <option value="egresado">Egresado</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="observaciones">Observaciones:</label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Observaciones adicionales..."
                rows="3"
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar' : 'Procesar'} Reinscripción
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => {
                  setShowReinscripcionForm(false);
                  setSelectedAlumno(null);
                  setEditingId(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderInscripcionForm = () => {
    if (!showInscripcionForm) return null;

    const carreras = [
      'Ingeniería en Sistemas Computacionales',
      'Ingeniería en Informática',
      'Ingeniería en Bioquímica',
      'Contador Público',
      'Ingeniería Civil',
      'Ingeniería en Gestión Empresarial'
    ];

    return (
      <div className="reinscripcion-form-container">
        <div className="reinscripcion-form">
          <h3>Inscripción de Nuevo Alumno</h3>
          <form onSubmit={handleInscripcionSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre:</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={nuevoAlumnoData.nombre}
                onChange={handleNuevoAlumnoChange}
                required
                placeholder="Nombre del alumno"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido:</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={nuevoAlumnoData.apellido}
                onChange={handleNuevoAlumnoChange}
                required
                placeholder="Apellido del alumno"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={nuevoAlumnoData.email}
                onChange={handleNuevoAlumnoChange}
                required
                placeholder="Email del alumno"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono:</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={nuevoAlumnoData.telefono}
                onChange={handleNuevoAlumnoChange}
                required
                placeholder="Teléfono del alumno"
              />
            </div>

            <div className="form-group">
              <label htmlFor="genero">Género:</label>
              <select
                id="genero"
                name="genero"
                value={nuevoAlumnoData.genero}
                onChange={handleNuevoAlumnoChange}
                required
              >
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="carrera">Carrera:</label>
              <select
                id="carrera"
                name="carrera"
                value={nuevoAlumnoData.carrera}
                onChange={handleNuevoAlumnoChange}
                required
              >
                <option value="">Seleccione una carrera</option>
                {carreras.map(carrera => (
                  <option key={carrera} value={carrera}>{carrera}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="semestre">Semestre Inicial:</label>
              <select
                id="semestre"
                name="semestre"
                value={nuevoAlumnoData.semestre}
                onChange={handleNuevoAlumnoChange}
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num}° Semestre</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado:</label>
              <select
                id="estado"
                name="estado"
                value={nuevoAlumnoData.estado}
                onChange={handleNuevoAlumnoChange}
                required
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-primary">
                Inscribir Alumno
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setShowInscripcionForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const generatePDF = async (alumno) => {
    console.log('Iniciando generación de PDF para alumno:', alumno);
    try {
      if (!alumno || !alumno._id) {
        console.error('Error: Alumno no válido o sin ID', alumno);
        throw new Error('No se ha seleccionado un alumno válido');
      }

      // Crear una nueva instancia de jsPDF
      const doc = new jsPDF();
      
      // Verificar que autoTable esté disponible
      if (typeof doc.autoTable !== 'function') {
        // Intentar configurar autoTable nuevamente
        setupAutoTable();
        if (typeof doc.autoTable !== 'function') {
          throw new Error('No se pudo inicializar autoTable correctamente');
        }
      }

      console.log('Documento PDF y autoTable inicializados correctamente');
      
      doc.setFontSize(20);
      doc.text('Información del Alumno', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('Instituto Tecnológico Superior de Ciudad Hidalgo', 105, 30, { align: 'center' });
      
      doc.setFontSize(14);
      doc.text('Datos Personales', 20, 45);
      
      doc.setFontSize(12);
      const datosPersonales = [
        ['Nombre:', `${alumno.nombre || ''} ${alumno.apellido || ''}`],
        ['Email:', alumno.email || 'No disponible'],
        ['Teléfono:', alumno.telefono || 'No disponible'],
        ['Género:', alumno.genero === 'masculino' ? 'Masculino' : 
                   alumno.genero === 'femenino' ? 'Femenino' : 'No especificado'],
        ['Carrera:', alumno.carrera || 'No disponible'],
        ['Estado:', alumno.estado === 'activo' ? 'Activo' : 'Inactivo']
      ];

      doc.autoTable({
        startY: 50,
        head: [],
        body: datosPersonales,
        theme: 'grid',
        styles: { fontSize: 11 },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: 'bold' },
          1: { cellWidth: 140 }
        },
        didDrawPage: (data) => {
          // Añadir numeración de página aquí si no hay pie de página general
        }
      });

      try {
        console.log(`Intentando obtener reinscripciones para alumno ID: ${alumno._id}`);
        const reinscripcionRes = await authService.authFetch(`http://localhost:3000/api/reinscripciones/alumno/${alumno._id}`);
        
        if (!reinscripcionRes.ok) {
          const errorText = await reinscripcionRes.text();
          console.error('Error en la respuesta de la API de reinscripciones:', reinscripcionRes.status, errorText);
          throw new Error(`Error al obtener las reinscripciones: ${reinscripcionRes.status} ${errorText}`);
        }
        
        const reinscripciones = await reinscripcionRes.json();
        console.log('Reinscripciones obtenidas:', reinscripciones);

        const ultimaReinscripcion = reinscripciones && reinscripciones.length > 0 ? 
          reinscripciones[reinscripciones.length - 1] : null;

        if (ultimaReinscripcion) {
          console.log('Última reinscripción encontrada:', ultimaReinscripcion);
          doc.setFontSize(14);
          doc.text('Información de Reinscripción', 20, doc.lastAutoTable.finalY + 20);
          
          doc.setFontSize(12);
          const fechaReinscripcion = ultimaReinscripcion.fechaReinscripcion ? 
            new Date(ultimaReinscripcion.fechaReinscripcion).toLocaleDateString() : 
            'No disponible';

          const datosReinscripcion = [
            ['Semestre:', ultimaReinscripcion.semestre || 'No disponible'],
            ['Fecha de Reinscripción:', fechaReinscripcion],
            ['Estado:', ultimaReinscripcion.estado || 'No disponible'],
            ['Observaciones:', ultimaReinscripcion.observaciones || 'Sin observaciones']
          ];

          doc.autoTable({
            startY: doc.lastAutoTable.finalY + 25,
            head: [],
            body: datosReinscripcion,
            theme: 'grid',
            styles: { fontSize: 11 },
            columnStyles: {
              0: { cellWidth: 60, fontStyle: 'bold' },
              1: { cellWidth: 120 }
            },
            didDrawPage: (data) => {
              // Añadir numeración de página aquí si no hay pie de página general
            }
          });
        } else {
          console.log('No hay información de reinscripción disponible para este alumno.');
          doc.setFontSize(12);
          doc.text('No hay información de reinscripción disponible', 20, doc.lastAutoTable.finalY + 20);
        }
      } catch (error) {
        console.error('Error al obtener o procesar reinscripciones para PDF:', error);
        doc.setFontSize(12);
        doc.text(`No se pudo obtener la información de reinscripción: ${error.message || 'Error desconocido'}`, 20, doc.lastAutoTable.finalY + 20);
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      const nombreArchivo = `alumno_${(alumno.nombre || 'sin_nombre')}_${(alumno.apellido || 'sin_apellido')}.pdf`
        .replace(/[^a-z0-9_]/gi, '_')
        .toLowerCase();

      console.log('Guardando PDF como:', nombreArchivo);
      doc.save(nombreArchivo);
    } catch (error) {
      console.error('Error fatal al generar el PDF:', error);
      alert(`Error al generar el PDF: ${error.message || 'Error desconocido'}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Cargando alumnos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error al cargar los alumnos</h3>
          <p>{error}</p>
          <button onClick={fetchAlumnos} className="btn-primary">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reinscripcion-container">
      <h1>Gestión de Reinscripciones</h1>
      
      <div className="reinscripcion-content">
        <div className="reinscripcion-actions">
          <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, email, carrera o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="action-buttons">
            <button 
              onClick={() => {
                setSelectedAlumno(null);
                setShowInscripcionForm(true);
                setNuevoAlumnoData({
                  nombre: '',
                  apellido: '',
                  email: '',
                  carrera: '',
                  genero: 'masculino',
                  telefono: '',
                  semestre: '1',
                  estado: 'activo'
                });
              }}
              className="btn-primary"
            >
              Inscripción
            </button>
            {selectedAlumnoForAction && (
              <>
                <button
                  onClick={() => handleReinscribir(selectedAlumnoForAction)}
                  className="btn-reinscribir"
                >
                  Reinscribir
                </button>
                <button
                  onClick={() => generatePDF(selectedAlumnoForAction)}
                  className="btn-download"
                >
                  Descargar PDF
                </button>
              </>
            )}
            {selectedAlumnos.size > 0 && (
              <button 
                onClick={handleBulkDelete}
                className="btn-delete"
              >
                Eliminar Seleccionados ({selectedAlumnos.size})
              </button>
            )}
          </div>
        </div>

        {renderInscripcionForm()}
        {renderReinscripcionForm()}

        <div className="alumnos-grid">
          {currentItems.map(alumno => (
            <div 
              key={alumno._id} 
              className={`alumno-card ${selectedAlumnos.has(alumno._id) ? 'selected' : ''}`}
            >
              <div className="alumno-card-header">
                <input
                  type="checkbox"
                  checked={selectedAlumnos.has(alumno._id)}
                  onChange={() => handleSelectAlumno(alumno)}
                  className="alumno-checkbox"
                />
                <div className="alumno-info">
                  <div className="alumno-info-header">
                    <h3>{alumno.nombre} {alumno.apellido}</h3>
                  </div>
                  <div className="alumno-details">
                    <span className="alumno-detail-label">Email:</span>
                    <span className="alumno-detail-value">{alumno.email}</span>
                    
                    <span className="alumno-detail-label">Teléfono:</span>
                    <span className="alumno-detail-value">{alumno.telefono}</span>
                    
                    <span className="alumno-detail-label">Carrera:</span>
                    <span className="alumno-detail-value">{alumno.carrera}</span>
                    
                    <span className="alumno-detail-label">Género:</span>
                    <span className="alumno-detail-value">
                      {alumno.genero === 'masculino' ? 'Masculino' : 
                       alumno.genero === 'femenino' ? 'Femenino' : 'Otro'}
                    </span>
                    
                    <span className="alumno-detail-label">Estado:</span>
                    <span className={`status-badge ${alumno.estado === 'activo' ? 'active' : 'inactive'}`}>
                      {alumno.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Anterior
            </button>

            {getPageNumbers().map((number, index) => {
              // Agregar puntos suspensivos cuando hay saltos en la numeración
              if (index > 0 && number - getPageNumbers()[index - 1] > 1) {
                return (
                  <React.Fragment key={`ellipsis-${number}`}>
                    <span className="pagination-ellipsis">...</span>
                    <button
                      onClick={() => handlePageChange(number)}
                      className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                    >
                      {number}
                    </button>
                  </React.Fragment>
                );
              }
              return (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Siguiente
            </button>
          </div>
        )}

        <div className="pagination-info">
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAlumnos.length)} de {filteredAlumnos.length} alumnos
        </div>
      </div>
    </div>
  );
}

export default Reinscripcion; 