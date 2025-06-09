import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setShowMenu(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuContainer = document.querySelector('.menu-container');
      if (menuContainer && !menuContainer.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const getBrandText = () => {
    if (location.pathname === '/alumnos') return 'Gestión de Alumnos';
    if (location.pathname === '/maestros') return 'Gestión de Maestros';
    if (location.pathname === '/carreras') return 'Gestión de Carreras';
    if (location.pathname === '/dashboard') return 'Panel de Control';
    if (location.pathname === '/reinscripcion') return 'Gestión de Reinscripciones';
    return 'Sistema Escolar';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">{getBrandText()}</Link>
      </div>
      
      <div className="navbar-links">
        {user ? (
          <>
            <div className="user-info">
              <span className="user-greeting">Hola,</span>
              <span className="user-name">{user.username}</span>
              <span className="user-role">({user.role === 'admin' ? 'Administrador' : 'Usuario'})</span>
            </div>

            <div className="user-menu">
              <div className="menu-container">
                <button 
                  className="menu-button"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <span className="menu-icon">⚙️</span>
                  <span className="menu-arrow">▼</span>
                </button>
                {showMenu && (
                  <div className="dropdown-menu">
                    <div className="menu-header">
                      <span className="menu-title">Menú de Opciones</span>
                    </div>
                    <div className="menu-divider"></div>
                    <Link to="/dashboard" className="menu-item">
                      <span className="menu-icon">📊</span>
                      Usuarios
                    </Link>
                    <Link to="/alumnos" className="menu-item">
                      <span className="menu-icon">👨‍🎓</span>
                      Alumnos
                    </Link>
                    <Link to="/maestros" className="menu-item">
                      <span className="menu-icon">👨‍🏫</span>
                      Maestros
                    </Link>
                    <Link to="/carreras" className="menu-item">
                      <span className="menu-icon">🎓</span>
                      Carreras
                    </Link>
                    <Link to="/reinscripcion" className="menu-item">
                      <span className="menu-icon">📝</span>
                      Reinscripción
                    </Link>
                    <div className="menu-divider"></div>
                    <button onClick={handleLogout} className="menu-item logout">
                      <span className="menu-icon">🚪</span>
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/login" className={`nav-link ${isActive('/login')}`}>
              Iniciar sesión
            </Link>
            <Link to="/register" className={`nav-link register ${isActive('/register')}`}>
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar