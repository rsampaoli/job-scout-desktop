import { useState } from 'react';
import './App.css';
import { searchRemotiveJobs } from './services/remotiveApi';

const JOB_METADATA_STORAGE_KEY = 'jobScout.jobMetadata';

function App() {
  const [keyword, setKeyword] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setErrorMessage('Ingresá una palabra clave para buscar.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      setHasSearched(true);

      const results = await searchRemotiveJobs(keyword);
      const savedMetadata = getSavedJobMetadata();

      const resultsWithSavedMetadata = results.map((job) => {
        const metadata = savedMetadata[job.url];

        return {
          ...job,
          status: metadata?.status || job.status || 'new',
          isFavorite: metadata?.isFavorite || false,
        };
      });

      setJobs(resultsWithSavedMetadata);

    } catch (error) {
      console.error(error);
      setErrorMessage('Ocurrió un error al buscar empleos. Revisá tu conexión o intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateJobMetadata = (jobUrl, metadataToUpdate) => {
    const savedMetadata = getSavedJobMetadata();
    const currentMetadata = savedMetadata[jobUrl] || {};

    const updatedMetadataForJob = {
      ...currentMetadata,
      ...metadataToUpdate,
    };

    const updatedMetadata = {
      ...savedMetadata,
      [jobUrl]: updatedMetadataForJob,
    };

    localStorage.setItem(
      JOB_METADATA_STORAGE_KEY,
      JSON.stringify(updatedMetadata)
    );

    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.url === jobUrl
          ? { ...job, ...metadataToUpdate }
          : job
      )
    );
  };

  const handleOpenJob = (job) => {
    updateJobMetadata(job.url, { status: 'seen' });

    if (window.electronAPI?.openExternalLink) {
      window.electronAPI.openExternalLink(job.url);
      return;
    }

    window.open(job.url, '_blank', 'noopener,noreferrer');
  };

  const toggleFavorite = (job) => {
    updateJobMetadata(job.url, {
      isFavorite: !job.isFavorite,
    });
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeStatusFilter === 'all') {
      return true;
    }

    if (activeStatusFilter === 'favorite') {
      return job.isFavorite;
    }

    return job.status === activeStatusFilter;
  });

  const dashboardStats = {
    total: jobs.length,
    new: jobs.filter((job) => job.status === 'new').length,
    seen: jobs.filter((job) => job.status === 'seen').length,
    favorite: jobs.filter((job) => job.isFavorite === true).length,
    lastKeyword: hasSearched ? keyword.trim() : '-',
  };

  return (
    <main className="app">
      <section className="dashboard-header">
        <div>
          <h1>JobScout Desktop</h1>
          <p>Buscador de ofertas laborales por palabra clave.</p>
        </div>
      </section>

      <section className="search-panel">
        <input
          type="text"
          placeholder="Ej: drupal, php, react, hiring..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />

        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar empleos'}
        </button>
      </section>

      {errorMessage && (
        <section className="error-message">
          {errorMessage}
        </section>
      )}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-label">Total de ofertas</span>
          <strong className="stat-value">{dashboardStats.total}</strong>
          <small className="stat-helper">Resultados de la búsqueda actual</small>
        </article>

        <article className="stat-card">
          <span className="stat-label">Vistas</span>
          <strong className="stat-value">{dashboardStats.seen}</strong>
          <small className="stat-helper">Ofertas ya revisadas</small>
        </article>

        <article className="stat-card">
          <span className="stat-label">Favoritas</span>
          <strong className="stat-value">{dashboardStats.favorite}</strong>
          <small className="stat-helper">Guardadas para seguimiento</small>
        </article>

        <article className="stat-card stat-card-wide">
          <span className="stat-label">Última búsqueda</span>
          <strong className="stat-value stat-keyword">{dashboardStats.lastKeyword}</strong>
          <small className="stat-helper">Keyword utilizada más recientemente</small>
        </article>
      </section>

      <section className="results-panel">
        <div className="results-header">
          <h2>Resultados</h2>
          <span>
            {filteredJobs.length} de {jobs.length} ofertas
          </span>
        </div>

        <div className="status-filters">
          <button
            type="button"
            className={activeStatusFilter === 'all' ? 'filter-button active' : 'filter-button'}
            onClick={() => setActiveStatusFilter('all')}
          >
            Todos
          </button>

          <button
            type="button"
            className={activeStatusFilter === 'new' ? 'filter-button active' : 'filter-button'}
            onClick={() => setActiveStatusFilter('new')}
          >
            Nuevos
          </button>

          <button
            type="button"
            className={activeStatusFilter === 'seen' ? 'filter-button active' : 'filter-button'}
            onClick={() => setActiveStatusFilter('seen')}
          >
            Vistos
          </button>

          <button
            type="button"
            className={activeStatusFilter === 'favorite' ? 'filter-button active' : 'filter-button'}
            onClick={() => setActiveStatusFilter('favorite')}
          >
            Favoritos
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Empleo</th>
              <th>Empresa</th>
              <th>Fuente</th>
              <th>Publicado</th>
              <th>Ubicación</th>
              <th>Keyword</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  {getEmptyStateMessage(hasSearched, jobs.length, activeStatusFilter)}
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.url}>
                  <td>{job.title}</td>
                  <td>{job.company}</td>
                  <td>{job.source}</td>
                  <td>{job.publishedAt}</td>
                  <td>{job.location}</td>
                  <td>{job.keyword}</td>

                  <td>
                    <span className={`status-badge status-${job.status}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </td>

                  <td>
                    <div className="actions-cell">
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => handleOpenJob(job)}
                      >
                        Ver
                      </button>

                      <button
                        type="button"
                        className={job.isFavorite ? 'favorite-button is-active' : 'favorite-button'}
                        onClick={() => toggleFavorite(job)}
                        title={job.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}>
                        {job.isFavorite ? '★' : '☆'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function getSavedJobMetadata() {
  const savedMetadata = localStorage.getItem(JOB_METADATA_STORAGE_KEY);

  if (!savedMetadata) {
    return {};
  }

  try {
    return JSON.parse(savedMetadata);
  } catch (error) {
    console.error('No se pudieron leer los datos guardados de ofertas:', error);
    return {};
  }
}

function getStatusLabel(status) {
  const labels = {
    new: 'Nuevo',
    seen: 'Visto',
  };

  return labels[status] || 'Nuevo';
}

function getEmptyStateMessage(hasSearched, totalJobs, activeStatusFilter) {
  if (!hasSearched) {
    return 'Todavía no hay resultados. Ingresá una keyword y buscá empleos.';
  }

  if (totalJobs === 0) {
    return 'No encontramos ofertas para esa búsqueda. Probá con otra keyword.';
  }

  const filterLabels = {
    new: 'nuevas',
    seen: 'vistas',
    favorite: 'favoritas',
  };

  return `No hay ofertas ${filterLabels[activeStatusFilter] || ''} para mostrar.`;
}

export default App;