import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const [users, setUsers] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await authService.authFetch('http://localhost:3000/api/users');
            if (!res.ok) throw new Error('Error al cargar usuarios');
            const data = await res.json();
            setUsers(data);
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

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await authService.authFetch('http://localhost:3000/api/users', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Error al crear usuario');
            await fetchUsers();
            setShowCreateForm(false);
            setFormData({ username: '', password: '', role: 'user' });
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await authService.authFetch(`http://localhost:3000/api/users/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Error al actualizar usuario');
            await fetchUsers();
            setEditingId(null);
            setFormData({ username: '', password: '', role: 'user' });
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUsers = async () => {
        if (!selectedUsers.size) return;

        if (!window.confirm(`¿Estás seguro de eliminar ${selectedUsers.size} usuarios?`)) {
            return;
        }

        try {
            const deletePromises = Array.from(selectedUsers).map(id =>
                authService.authFetch(`http://localhost:3000/api/users/${id}`, {
                    method: 'DELETE'
                })
            );

            await Promise.all(deletePromises);
            await fetchUsers();
            setSelectedUsers(new Set());
            alert('Usuarios eliminados exitosamente');
        } catch (error) {
            console.error('Error al eliminar usuarios:', error);
            alert(error.message || 'Error al eliminar usuarios');
        }
    };

    const handleSelectUser = (id) => {
        setSelectedUsers(prev => {
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
            const allIds = users.map(user => user._id);
            setSelectedUsers(new Set(allIds));
        } else {
            setSelectedUsers(new Set());
        }
    };

    const handleRowClick = (e, id) => {
        if (e.target.type === 'checkbox') return;
        handleSelectUser(id);
    };

    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderForm = (onSubmit) => (
        <div className="form-container">
            <h3>{editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Usuario:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!editingId}
                        placeholder={editingId ? "Dejar en blanco para mantener la actual" : ""}
                    />
                </div>
                <div className="form-group">
                    <label>Rol:</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="admin">Administrador</option>
                        <option value="user">Usuario</option>
                    </select>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary">
                        {editingId ? 'Guardar' : 'Crear'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => {
                            setEditingId(null);
                            setShowCreateForm(false);
                            setFormData({ username: '', password: '', role: 'user' });
                        }}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="dashboard-container">
            <h1>Gestión de Usuarios</h1>
            <h2>Administra los usuarios del sistema</h2>

            <div className="dashboard-content">
                <div style={{ marginBottom: '20px' }}>
                    {!showCreateForm && !editingId && (
                        <button 
                            onClick={() => setShowCreateForm(true)}
                            className="btn-action"
                            style={{ backgroundColor: '#43869c' }}
                        >
                            Crear Nuevo Usuario
                        </button>
                    )}
                    {showCreateForm && renderForm(handleCreate)}
                    {editingId && renderForm(handleUpdate)}
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar por nombre de usuario, rol o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {selectedUsers.size > 0 && (
                        <span className="selected-count">
                            {selectedUsers.size} seleccionado{selectedUsers.size !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {selectedUsers.size > 0 && (
                    <div className="bulk-actions">
                        {selectedUsers.size === 1 && (
                            <button
                                onClick={() => {
                                    const userId = Array.from(selectedUsers)[0];
                                    const userToEdit = users.find(u => u._id === userId);
                                    if (userToEdit) {
                                        setEditingId(userId);
                                        setFormData({
                                            username: userToEdit.username,
                                            password: '',
                                            role: userToEdit.role
                                        });
                                    }
                                }}
                                className="btn-action btn-edit"
                            >
                                Editar Usuario
                            </button>
                        )}
                        <button
                            onClick={handleDeleteUsers}
                            className="btn-action btn-delete"
                        >
                            Eliminar Seleccionados
                        </button>
                    </div>
                )}

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th className="checkbox-cell">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length}
                                    />
                                </th>
                                <th>Usuario</th>
                                <th>Rol</th>
                                <th>ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr 
                                    key={user._id}
                                    className={selectedUsers.has(user._id) ? 'selected' : ''}
                                    onClick={(e) => handleRowClick(e, user._id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td className="checkbox-cell" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.has(user._id)}
                                            onChange={() => handleSelectUser(user._id)}
                                        />
                                    </td>
                                    <td>{user.username}</td>
                                    <td>{user.role}</td>
                                    <td>{user._id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
