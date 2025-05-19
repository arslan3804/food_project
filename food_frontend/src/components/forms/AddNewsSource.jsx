import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AddNewsSource() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);

  if (!user || user.username !== 'admin') {
    return <p>Доступ запрещен: только администраторы могут добавлять источники.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/sources/', { name, url, is_active: isActive });
      alert('Источник успешно добавлен');
      setName('');
      setUrl('');
      setIsActive(true);
    } catch (err) {
      setError('Ошибка при добавлении источника.');
    }
  };

  return (
    <div className="container-fluid mt-4">
      <h3>Добавить новый источник</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название источника</label>
          <input 
            type="text" 
            className="form-control" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>URL источника</label>
          <input 
            type="url" 
            className="form-control" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            required 
          />
        </div>
        <div className="form-check">
          <input 
            type="checkbox" 
            className="form-check-input" 
            checked={isActive} 
            onChange={(e) => setIsActive(e.target.checked)} 
          />
          <label className="form-check-label">Активен</label>
        </div>
        <button type="submit" className="btn btn-primary mt-3">Добавить</button>
      </form>
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}
