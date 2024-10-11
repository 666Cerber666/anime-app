import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/AnimeList.css';
import './css/AnimeDetail.css';
import './css/WatchLater.css';

interface Genre {
  mal_id: number;
  name: string;
}

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: {
    type: string;
    rating: string;
    status: string;
    genres: string[];
    producers: string[];
  }) => void;
  filter: {
    type: string;
    rating: string;
    status: string;
    genres: string[];
    producers: string[];
  };
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onFilterChange,
  filter,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [genresList, setGenresList] = useState<Genre[]>([]);

  useEffect(() => {
    fetch('https://api.jikan.moe/v4/genres/anime')
      .then((response) => response.json())
      .then((data) => {
        setGenresList(data.data);
      })
      .catch((error) => {
        console.error('Error fetching genres list:', error);
      });
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;

    // Обновление фильтров
    onFilterChange({ ...filter, [name]: value });
  };

  const handleGenreChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedGenres = Array.from(event.target.selectedOptions, (option) => option.value);
    onFilterChange({ ...filter, genres: selectedGenres }); // Передаем выбранные жанры
  };

  const handleProducerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProducers = Array.from(event.target.selectedOptions, (option) => option.value);
    onFilterChange({ ...filter, producers: selectedProducers }); // Передаем выбранные производители
  };

  return (
    <header className="header">
      <div className="background-head">
        <Link className="linkhead" to={`/`}>
          <div className="logo"></div>
          <h2>AniGo</h2>
        </Link>
        <div className="search-filter-container">
          <div className="search-input-container">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Поиск"
              className="search-input"
            />
            <button className="search-button">Поиск</button>
          </div>
          <button className="search-button" onClick={() => setIsFilterOpen(true)}>
            Фильтр
          </button>
        </div>
        {isFilterOpen && (
          <div className="filter-dialog">
            <h2>Фильтр</h2>
            <div className="filter-container">
              <select
                name="type"
                value={filter.type}
                onChange={handleChange}
                className="filter-select"
              >
                <option value="">Все типы</option>
                <option value="tv">ТВ</option>
                <option value="movie">Фильм</option>
                <option value="ova">OVA</option>
              </select>
              <select
                name="rating"
                value={filter.rating}
                onChange={handleChange}
                className="filter-select"
              >
                <option value="">Все рейтинги</option>
                <option value="g">G</option>
                <option value="pg">PG</option>
                <option value="r">R</option>
              </select>
              <select
                name="status"
                value={filter.status}
                onChange={handleChange}
                className="filter-select"
              >
                <option value="">Все статусы</option>
                <option value="upcoming">Онгоинг</option>
                <option value="airing">Завершено</option>
              </select>
            </div>
            <button className="watchlater-button" onClick={() => setIsFilterOpen(false)}>
              Закрыть
            </button>
          </div>
        )}
        <div className="header-right">
          <Link to="/watch-later">
            <button className="watchlater-button">Смотреть позже</button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
