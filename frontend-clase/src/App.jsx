import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Carreras from './pages/carreras';
import Alumnos from './pages/alumnos';
import Maestros from './pages/maestros';
import Reinscripcion from './pages/Reinscripcion';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/carreras" 
            element={
              <ProtectedRoute>
                <Carreras />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/alumnos" 
            element={
              <ProtectedRoute>
                <Alumnos />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/maestros" 
            element={
              <ProtectedRoute>
                <Maestros />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/reinscripcion" 
            element={
              <ProtectedRoute>
                <Reinscripcion />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
