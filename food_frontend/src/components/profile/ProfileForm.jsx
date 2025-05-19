import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileForm() {
  const { checkAuth } = useAuth();

  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    address: ''
  });

  const [formFields, setFormFields] = useState({
    first_name: '',
    last_name: '',
    address: ''
  });

  const [message, setMessage] = useState('');

  // Загрузка данных пользователя
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await api.get('/users/me/');
        setUserData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          address: data.address || ''
        });
      } catch (err) {
        console.error('Ошибка загрузки профиля', err);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (field) => {
    const value = formFields[field].trim();
    if (!value) {
      setMessage(`Поле "${field}" не может быть пустым.`);
      return;
    }

    try {
      const payload = { [field]: value };
      const { data } = await api.patch('/users/me/', payload);

      setUserData(prev => ({ ...prev, [field]: data[field] || '' }));
      setFormFields(prev => ({ ...prev, [field]: '' }));
      setMessage(`Профиль успешно обновлен.`);
      checkAuth();
    } catch (err) {
      console.error(err);
      setMessage(`Ошибка при обновлении "${field}".`);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Мой профиль</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {/* Отображение текущих данных */}
      <div className="mb-4">
        <strong>Имя:</strong> {userData.first_name || '—'}
        <div className="input-group mt-2">
          <input
            type="text"
            className="form-control"
            name="first_name"
            value={formFields.first_name}
            onChange={handleChange}
            placeholder="Новое имя"
          />
          <button
            className="btn btn-outline-primary"
            onClick={() => handleSubmit('first_name')}
          >
            Обновить имя
          </button>
        </div>
      </div>

      <div className="mb-4">
        <strong>Фамилия:</strong> {userData.last_name || '—'}
        <div className="input-group mt-2">
          <input
            type="text"
            className="form-control"
            name="last_name"
            value={formFields.last_name}
            onChange={handleChange}
            placeholder="Новая фамилия"
          />
          <button
            className="btn btn-outline-primary"
            onClick={() => handleSubmit('last_name')}
          >
            Обновить фамилию
          </button>
        </div>
      </div>

      <div className="mb-4">
        <strong>Адрес:</strong> {userData.address || '—'}
        <div className="input-group mt-2">
          <input
            type="text"
            className="form-control"
            name="address"
            value={formFields.address}
            onChange={handleChange}
            placeholder="Новый адрес"
          />
          <button
            className="btn btn-outline-primary"
            onClick={() => handleSubmit('address')}
          >
            Обновить адрес
          </button>
        </div>
      </div>
    </div>
  );
}
