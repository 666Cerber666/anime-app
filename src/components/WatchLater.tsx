import React from 'react';
import { Link } from 'react-router-dom';
import useWatchLaterStore from '../store/watchLaterStore';
import Header from './Header';
import './css/WatchLater.css';
import './css/AnimeList.css';
import './css/AnimeDetail.css';

const ITEMS_PER_PAGE_DESKTOP = 10;
const ITEMS_PER_PAGE_MOBILE = 5;

const WatchLater: React.FC = () => {
  const { getSortedWatchLater } = useWatchLaterStore();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortCriterion, setSortCriterion] = React.useState('popularity');
  const [filter, setFilter] = React.useState({
    type: '',
    rating: '', 
    status: '', 
    genres: [] as string[],
    producers: [] as string[],
  });

  // Определяем количество элементов на странице в зависимости от устройства
  const itemsPerPage = window.innerWidth > 768 ? ITEMS_PER_PAGE_DESKTOP : ITEMS_PER_PAGE_MOBILE;

  const sortedWatchLater = getSortedWatchLater('weight', 'addedAt');

  const paginatedItems = sortedWatchLater.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortCriterion(event.target.value);
  };

  const totalPages = Math.ceil(sortedWatchLater.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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

  return (
    <div className="watch-later-page">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilter}
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
      <main className="anime-grid" style={{ marginTop: '60px' }}>
        {paginatedItems.map((anime) => (
          <div key={anime.mal_id} className="anime-card">
            <img src={anime.image_url || ''} alt={anime.title} />
            <div className="anime-title"><h2 className="anime-head">{anime.title}</h2></div>
            <Link to={`/anime/${anime.mal_id}`}>
              <button className="details-button">Смотреть</button>
            </Link>
          </div>
        ))}
      </main >
        {totalPages > 1 && (
        <div className="pagination">
          <ul>
            {currentPage > 1 && (
              <li>
                <button onClick={() => handlePageChange(1)}>
                  <i className="fas fa-angle-double-left" style={{ color: 'orange' }} />
                </button>
              </li>
            )}
            {currentPage > 1 && (
              <li>
                <button onClick={() => handlePageChange(currentPage - 1)}>
                  <i className="fas fa-angle-left" style={{ color: 'orange' }} />
                </button>
              </li>
            )}
            {[...Array(totalPages)].map((_, index) => (
              <li key={index + 1}>
                <button
                  onClick={() => handlePageChange(index + 1)}
                  style={{
                    backgroundColor: index + 1 === currentPage ? 'orange' : '',
                    color: index + 1 === currentPage ? 'white' : '',
                  }}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            {currentPage < totalPages && (
              <li>
                <button onClick={() => handlePageChange(currentPage + 1)}>
                  <i className="fas fa-angle-right" style={{ color: 'orange' }} />
                </button>
              </li>
            )}
            {currentPage < totalPages && (
              <li>
                <button onClick={() => handlePageChange(totalPages)}>
                  <i className="fas fa-angle-double-right" style={{ color: 'orange' }} />
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WatchLater;