import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'
import ErrorForm from '../components/ErrorForm'
import { useAuth } from '../context/AuthContext'

function Login() {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.usuario, formData.password);
      console.log('Login exitoso');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
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
    <div className='container-login'>
      <div className='login-card'>
        <div className='login-header'>
          <h1>Bienvenido</h1>
          <p>Inicia sesión para continuar</p>
        </div>
        
        {authError && <ErrorForm message={authError} />}
        
        <form className='form-login' onSubmit={handleSubmit}>
          <div className='form-group'>
            <label htmlFor="usuario">Usuario</label>
            <input 
              type="text" 
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              placeholder='Ingresa tu usuario'
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
              placeholder='Ingresa tu contraseña'
              required
            />
          </div>

          <button 
            type="submit" 
            className='btn-login'
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>

          <div className='login-footer'>
            <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link></p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login