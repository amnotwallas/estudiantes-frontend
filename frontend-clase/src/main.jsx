import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from './Layout.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Alumnos from './pages/alumnos.jsx'
import Maestros from './pages/maestros.jsx'
import Carreras from './pages/carreras.jsx'
import Reinscripcion from './pages/Reinscripcion.jsx'
import ProtectedRoute from './components/ProtectedRoute'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route 
              path='/dashboard' 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/alumnos' 
              element={
                <ProtectedRoute>
                  <Alumnos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/maestros' 
              element={
                <ProtectedRoute>
                  <Maestros />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/carreras' 
              element={
                <ProtectedRoute>
                  <Carreras />
                </ProtectedRoute>
              } 
            />
            <Route 
              path='/reinscripcion' 
              element={
                <ProtectedRoute>
                  <Reinscripcion />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
