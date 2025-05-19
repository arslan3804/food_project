import { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AddArticle() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState(null);

  if (!user || user.username !== 'admin') {
    return <p>Доступ запрещен: только администраторы могут добавлять статьи.</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tagList = tags.split(',').map(tag => tag.trim());

    try {
      await api.post('/articles/', { 
        title, description, content, url, image_url: imageUrl, video_url: videoUrl, 
        source, category, tags: tagList 
      });
      alert('Статья успешно добавлена');
      setTitle('');
      setDescription('');
      setContent('');
      setUrl('');
      setImageUrl('');
      setVideoUrl('');
      setCategory('');
      setTags('');
      setSource('');
    } catch (err) {
      setError('Ошибка при добавлении статьи.');
    }
  };

  return (
    <div className="container mt-4">
      <h3>Добавить новую статью</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Заголовок</label>
          <input 
            type="text" 
            className="form-control" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Описание</label>
          <textarea 
            className="form-control" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Контент</label>
          <textarea 
            className="form-control" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>URL статьи</label>
          <input 
            type="url" 
            className="form-control" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>URL изображения</label>
          <input 
            type="url" 
            className="form-control" 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>URL видео</label>
          <input 
            type="url" 
            className="form-control" 
            value={videoUrl} 
            onChange={(e) => setVideoUrl(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Slug категории</label>
          <input 
            type="text" 
            className="form-control" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Теги (через запятую)</label>
          <input 
            type="text" 
            className="form-control" 
            value={tags} 
            onChange={(e) => setTags(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label>Источник (URL)</label>
          <input 
            type="url" 
            className="form-control" 
            value={source} 
            onChange={(e) => setSource(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Добавить статью</button>
      </form>
      {error && <p className="text-danger">{error}</p>}
    </div>
  );
}
