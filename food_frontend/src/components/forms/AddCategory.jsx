import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AddCategory() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState(null);

  if (!user || user.username !== 'admin') {
    console.log(user);
    return <p>Доступ запрещен: только администраторы могут добавлять категории.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post('/categories/', { name, slug });
      alert('Категория успешно добавлена');
      setName('');
      setSlug('');
    } catch (err) {
      setError('Ошибка при добавлении категории.');
    }
  };

  return (
    <div className="container-fluid mt-4">
      <h3>Добавить новую категорию</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название категории</label>
          <input 
            type="text" 
            className="form-control" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Slug категории</label>
          <input 
            type="text" 
            className="form-control" 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Добавить</button>
      </form>
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}
