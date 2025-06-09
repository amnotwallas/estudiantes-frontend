import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Register.css'
import ErrorForm from '../components/ErrorForm'
import { useAuth } from '../context/AuthContext'

function Register() {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    genero: '',
    telefono: '',
    usuario: '',
    password: '',
    confirmarPassword: '',
    tipoUsuario: '',
    carrera: '',
    especialidad: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const carrerasAlumno = [
    'Ingeniería en Sistemas Computacionales',
    'Ingeniería en Informática',
    'Ingeniería en Bioquímica',
    'Contador Público',
    'Ingeniería Civil',
    'Ingeniería en Gestión Empresarial'
  ];

  const carrerasMaestro = [
    'Ingeniero en Sistemas Computacionales',
    'Ingeniero Industrial',
    'Ingeniero en Gestión Empresarial',
    'Ingeniero Civil',
    'Contador Público',
    'Ingeniero Bioquímico',
    'Ingeniero en Informática'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    const dataToSend = {
      username: formData.usuario,
      password: formData.password,
      role: formData.tipoUsuario,
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      genero: formData.genero,
      telefono: formData.telefono,
    };

    if (formData.tipoUsuario === 'alumno') {
      dataToSend.carrera = formData.carrera;
    } else if (formData.tipoUsuario === 'maestro') {
      dataToSend.especialidad = formData.especialidad;
    }

    try {
      await register(dataToSend);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  return (
    <div className='register-page'>
      <div className='register-container'>
        <h2>Registro</h2>
        {error && <ErrorForm message={error} />}
        {authError && <ErrorForm message={authError} />}
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor="nombre">Nombre</label>
            <input 
              type="text" 
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder='Tu nombre'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="apellido">Apellido</label>
            <input 
              type="text" 
              id="apellido"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              placeholder='Tu apellido'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder='tu@email.com'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="genero">Género</label>
            <select
              id="genero"
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona tu género</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div className='form-group'>
            <label htmlFor="telefono">Teléfono</label>
            <input 
              type="tel" 
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder='Tu número de teléfono'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="usuario">Nombre de Usuario</label>
            <input 
              type="text" 
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder='Elige un nombre de usuario'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder='Crea una contraseña segura'
              required
              minLength={6}
            />
          </div>

          <div className='form-group'>
            <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
            <input 
              type="password" 
              id="confirmarPassword"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleChange}
              placeholder='Confirma tu contraseña'
              required
              minLength={6}
            />
          </div>

          <div className='form-group'>
            <label htmlFor="tipoUsuario">Tipo de Usuario</label>
            <select
              id="tipoUsuario"
              name="tipoUsuario"
              value={formData.tipoUsuario}
              onChange={handleChange}
              required
              className='select-tipo-usuario'
            >
              <option value="">Selecciona tu tipo de usuario</option>
              <option value="alumno">Alumno</option>
              <option value="maestro">Maestro</option>
            </select>
          </div>

          {(formData.tipoUsuario === 'alumno') && (
            <div className='form-group'>
              <label htmlFor="carrera">
                Carrera
              </label>
              <select
                id="carrera"
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                required
                className='select-tipo-usuario'
              >
                <option value="">
                  Selecciona tu carrera
                </option>
                {carrerasAlumno.map((carrera, index) => (
                  <option key={index} value={carrera}>
                    {carrera}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(formData.tipoUsuario === 'maestro') && (
            <div className='form-group'>
              <label htmlFor="especialidad">
                Especialidad
              </label>
              <select
                id="especialidad"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleChange}
                required
                className='select-tipo-usuario'
              >
                <option value="">
                  Selecciona tu especialidad
                </option>
                {carrerasMaestro.map((especialidad, index) => (
                  <option key={index} value={especialidad}>
                    {especialidad}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className='btn-register'
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className='register-footer'>
            <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register 