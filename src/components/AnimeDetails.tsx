import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from './Header';
import useWatchLaterStore from '../store/watchLaterStore';
import './css/AnimeList.css';
import './css/AnimeDetail.css';

interface Episode {
  mal_id: number;
  title: string;
  url: string;
  aired: string;
}

interface AnimeDetailData {
  mal_id: number;
  title: string;
  title_english: string;
  title_japanese: string;
  synopsis: string;
  score: number;
  scored_by: number;
  favorites: number;
  trailer: {
    url: string;
  };
  images: {
    webp: {
      image_url: string;
    };
  };
  genres: { mal_id: number; type: string; name: string; url: string }[];
  themes: { mal_id: number; type: string; name: string; url: string }[];
  producers: { mal_id: number; type: string; name: string; url: string }[];
  rating: string;
  status: string;
  aired: {
    from: string;
    to: string;
  };
  episodes: Episode[];
}

const AnimeDetail: React.FC = () => {
  const { mal_id } = useParams<{ mal_id: string }>();
  const [anime, setAnime] = useState<AnimeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | ''>('');
  const [filter, setFilter] = useState({
    type: '',
    rating: '', 
    status: '', 
    genres: [] as string[],
    producers: [] as string[],
  });

  const addWatchLater = useWatchLaterStore((state) => state.addWatchLater);
  const removeWatchLater = useWatchLaterStore((state) => state.removeWatchLater);
  const watchLater = useWatchLaterStore((state) => state.watchLater);

  useEffect(() => {
    fetch(`https://api.jikan.moe/v4/anime/${mal_id}`)
      .then((response) => response.json())
      .then((data) => {
        setAnime(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching anime details:', error);
        setLoading(false);
      });
  }, [mal_id]);

  const handleWatchLater = () => {
    if (anime) {
      const isAlreadyAdded = watchLater.some((item) => item.mal_id === anime.mal_id);
      if (isAlreadyAdded) {
        removeWatchLater(anime.mal_id);
        setNotification('Аниме удалено из списка "Посмотреть позже".');
        setNotificationType('error');
      } else {
        addWatchLater({
          mal_id: anime.mal_id,
          title: anime.title,
          image_url: anime.images.webp.image_url,
          weight: 1,
          addedAt: new Date()
        });
        setNotification('Аниме добавлено в список "Посмотреть позже".');
        setNotificationType('success');
      }

      // Показать уведомление на 3 секунды
      setTimeout(() => {
        setNotification('');
        setNotificationType('');
      }, 3000);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilter = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilter((prevFilter) => ({ ...prevFilter, [name]: value }));
  };

  const handleGenreFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    const newGenres = [...filter.genres];
    if (newGenres.includes(value)) {
      newGenres.splice(newGenres.indexOf(value), 1);
    } else {
      newGenres.push(value);
    }
    setFilter((prevFilter) => ({ ...prevFilter, genres: newGenres }));
  };
  
  const handleProducerFilter = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    const newProducers = [...filter.producers];
    if (newProducers.includes(value)) {
      newProducers.splice(newProducers.indexOf(value), 1);
    } else {
      newProducers.push(value);
    }
    setFilter((prevFilter) => ({ ...prevFilter, producers: newProducers }));
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!anime) {
    return <div>Данные об аниме не найдены.</div>;
  }

  return (
    <div>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilter}
        filter={filter}
      />
              {notification && (
          <div
            className={`notification ${notificationType === 'success' ? 'success' : notificationType === 'error' ? 'error' : ''}`}
          >
            <p>{notification}</p>
          </div>
        )}
      <div className="anime-detail-container">
        <div className="anime-details">
          <div className="anime-header">
            <h1 className="anime-title">{anime.title}</h1>
            <img
              src={anime.images.webp.image_url}
              alt={anime.title}
              className="anime-image"
            />
            <button className="watchlater-button" onClick={handleWatchLater}>
              {watchLater.some((item) => item.mal_id === anime.mal_id)
            ? 'Удалить из списка "Посмотреть позже"'
            : 'Добавить в список "Посмотреть позже"'}</button>
          </div>
          {anime.trailer?.url && (
            <div className="trailer">
              <h2>Трейлер</h2>
              <iframe
                src={anime.trailer.url.replace('watch?v=', 'embed/')}
                title={anime.title}
                width="560"
                height="315"
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
        <div className="anime-info">
          <div className="info-block">
            <h3>Основная информация</h3>
            <p><strong>Оригинальный заголовок:</strong> {anime.title_japanese}</p>
            <p><strong>Переведенный заголовок:</strong> {anime.title_english}</p>
            <p><strong>Синопсис:</strong> {anime.synopsis}</p>
            <p><strong>Рейтинг:</strong> {anime.rating}</p>
            <p><strong>Оценка:</strong> {anime.score}</p>
            <p><strong>Количество оценок:</strong> {anime.scored_by}</p>
            <p><strong>Любимцы:</strong> {anime.favorites}</p>
          </div>
          <div className="info-block">
            <h3>Жанры и Темы</h3>
            <p><strong>Жанры:</strong> {anime.genres.map((genre) => genre.name).join(', ')}</p>
            <p><strong>Темы:</strong> {anime.themes.map((theme) => theme.name).join(', ')}</p>
          </div>
          <div className="info-block">
            <h3>Производители и Эпизоды</h3>
            <p><strong>Продюсеры:</strong> {anime.producers.map((producer) => producer.name).join(', ')}</p>
            <p><strong>Эпизоды:</strong> {anime.episodes.length}</p>
            <p><strong>Статус:</strong> {anime.status}</p>
            <p><strong>Дата выпуска:</strong> {new Date(anime.aired.from).toLocaleDateString()} — {new Date(anime.aired.to).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetail;
