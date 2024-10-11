// src/components/AnimeList.tsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './css/AnimeList.css';
import '../App.css';
import debounce from 'lodash.debounce';

interface Anime {
  mal_id: number;
  images: {
    webp: {
      image_url: string;
    };
  };
  title: string;
  type: string;
  rating: string;
  season: string;
  status: string;
  genres: { mal_id: number; type: string; name: string; url: string }[];
  producers: { mal_id: number; type: string; name: string; url: string }[];
  score: number;
}

interface Filter {
  type: string;
  rating: string;
  status: string;
  genres: string[];
  excludedGenres: string[];
  producers: string[];
  orderBy: string;
  sort: string;
  startDate: string;
}

const AnimeList: React.FC = () => {
  const [showFooter, setShowFooter] = useState(false);
  const [showPagination, setShowPagination] = useState(false);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortCriterion, setSortCriterion] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({
    type: '',
    rating: '',
    status: '',
    genres: [] as string[],
    excludedGenres: [] as string[],
    producers: [] as string[],
    orderBy: '',
    sort: '',
    startDate: '',
  });

  const renderStars = (score: number) => {
    const stars = Math.round(score / 2);
    return (
      <div className="stars">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={`star ${index < stars ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortCriterion = event.target.value;
    setSortCriterion(newSortCriterion);
    setFilter((prevFilter) => ({ ...prevFilter, orderBy: newSortCriterion }));
  };

  const fetchAnimeList = useCallback(debounce((pageNumber: number) => {
    const sortBy = sortCriterion;
    const sortOrder = filter.sort === 'asc' ? 'asc' : 'desc';
    const genres = filter.genres.length > 0 ? filter.genres.join(',') : ''; // Проверяем, есть ли выбранные жанры
    const producers = filter.producers.join(',');

    const url = `https://api.jikan.moe/v4/anime?page=${pageNumber}&q=${searchQuery}&genres=${genres}&producers=${producers}&type=${filter.type}&rating=${filter.rating}&status=${filter.status}&order_by=${sortBy}&sort=${sortOrder}&limit=24`;

    console.log('Fetching URL:', url); // Логируем URL для отладки

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setAnimeList(data.data || []);
        setTotalPages(data.pagination?.last_visible_page || 0);
        setShowPagination(totalPages > 1);
      })
      .catch((error) => {
        console.error("Error fetching anime list:", error);
      });
}, 1000), [sortCriterion, searchQuery, filter]);


  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return; // предотвращаем навигацию на недопустимые страницы
    setPage(newPage);
    fetchAnimeList(newPage);
  };

  const handleScroll = () => {
    const scrollHeight = document.body.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const clientHeight = window.innerHeight;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setShowFooter(true);
    } else {
      setShowFooter(false);
    }
  };

  useEffect(() => {
    fetchAnimeList(page);
  }, [page, fetchAnimeList, searchQuery, filter]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilter: Omit<Filter, 'excludedGenres' | 'orderBy' | 'sort' | 'startDate'>) => {
    setPage(1); // Сброс страницы
    setFilter((prevFilter) => ({
      ...prevFilter,
      ...newFilter,
    }));
    fetchAnimeList(1); // Получите данные для первой страницы с новыми фильтрами
  };
  

  // Функции для пагинации
  const renderPaginationButtons = () => {
    const buttons = [];

    // Кнопка "Первая страница"
    if (page > 1) {
      buttons.push(
        <li key="first">
          <button onClick={() => handlePageChange(1)}>
            <i className="fas fa-angle-double-left" style={{ color: 'orange' }} />
          </button>
        </li>
      );
    }

    // Кнопка "Предыдущая страница"
    if (page > 1) {
      buttons.push(
        <li key="prev">
          <button onClick={() => handlePageChange(page - 1)}>
            <i className="fas fa-chevron-left" style={{ color: 'orange' }} />
          </button>
        </li>
      );
    }

    // Номера страниц
    const pageNumbers = Array.from({ length: 3 }, (_, i) => page - 1 + i).filter(pageNumber => pageNumber > 0 && pageNumber <= totalPages);
    pageNumbers.forEach(pageNumber => {
      buttons.push(
        <li key={pageNumber}>
          <button onClick={() => handlePageChange(pageNumber)} className={pageNumber === page ? 'active' : ''}>
            {pageNumber}
          </button>
        </li>
      );
    });

    // Кнопка "Следующая страница"
    if (page < totalPages) {
      buttons.push(
        <li key="next">
          <button onClick={() => handlePageChange(page + 1)}>
            <i className="fas fa-chevron-right" style={{ color: 'orange' }} />
          </button>
        </li>
      );
    }

    // Кнопка "Последняя страница"
    if (page < totalPages) {
      buttons.push(
        <li key="last">
          <button onClick={() => handlePageChange(totalPages)}>
            <i className="fas fa-angle-double-right" style={{ color: 'orange' }} />
          </button>
        </li>
      );
    }

    return buttons;
  };

  return (
    <div>
      <Header
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
        filter={filter}
      />
      <div className="sort-controls">
        <label htmlFor="sort">Сортировать по: </label>
        <select id="sort" value={sortCriterion} onChange={handleSortChange}>
          <option value="popularity">Популярность</option>
          <option value="score">Оценка</option>
          <option value="members">Количество оценок</option>
          <option value="favorites">Количество избранных</option>
          <option value="episodes">Количество эпизодов</option>
          <option value="start_date">Дата начала</option>
          <option value="end_date">Дата окончания</option>
        </select>
      </div>
      <main className="anime-grid">
        {animeList.map((anime, index) => (
          <div key={index} className="anime-card">
            <img src={anime.images?.webp?.image_url || ''} alt={anime.title} />
            <h2 className="anime-head">{anime.title}{renderStars(anime.score)}</h2>
            <div className="anime-body">
              Тип: {anime.type}<br />
              Рейтинг: {anime.rating}<br />
              Сезон: {anime.season}<br />
              Статус: {anime.status}<br />
              Жанры: {anime.genres?.slice(0, 2).map((genre) => genre.name).join(', ') || 'Нет данных'}<br />
              Производители: {anime.producers?.slice(0, 2).map((producer) => producer.name).join(', ') || 'Нет данных'}
            </div>
            <Link to={`/anime/${anime.mal_id}`}>
              <button className="details-button">Смотреть</button>
            </Link>
          </div>
        ))}
      </main>
      <Footer showFooter={showFooter} showPagination={showPagination} />
      <div className="pagination">
        <ul>
          {renderPaginationButtons()}
        </ul>
      </div>
    </div>
  );
};

export default AnimeList;
