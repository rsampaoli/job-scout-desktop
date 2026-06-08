import { useState } from 'react';
import './App.css';
import { searchRemotiveJobs } from './services/remotiveApi';

const JOB_STATUSES_STORAGE_KEY = 'jobScout.jobStatuses';

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
      const savedStatuses = getSavedJobStatuses();

      const resultsWithSavedStatuses = results.map((job) => ({
        ...job,
        status: savedStatuses[job.url] || job.status || 'new',
      }));

      setJobs(resultsWithSavedStatuses);
    } catch (error) {
      console.error(error);
      setErrorMessage('Ocurrió un error al buscar empleos. Revisá tu conexión o intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateJobStatus = (jobUrl, newStatus) => {
    const savedStatuses = getSavedJobStatuses();

    const updatedStatuses = {
      ...savedStatuses,
      [jobUrl]: newStatus,
    };

    localStorage.setItem(
      JOB_STATUSES_STORAGE_KEY,
      JSON.stringify(updatedStatuses)
    );

    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.url === jobUrl
          ? { ...job, status: newStatus }
          : job
      )
    );
  };

  const handleOpenJob = (job) => {
    updateJobStatus(job.url, 'seen');

    if (window.electronAPI?.openExternalLink) {
      window.electronAPI.openExternalLink(job.url);
      return;
    }

    window.open(job.url, '_blank', 'noopener,noreferrer');
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeStatusFilter === 'all') {
      return true;
    }

    return job.status === activeStatusFilter;
  });

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
                        className="link-button"
                        onClick={() => updateJobStatus(job.url, 'favorite')}
                      >
                        Favorito
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

function getSavedJobStatuses() {
  const savedStatuses = localStorage.getItem(JOB_STATUSES_STORAGE_KEY);

  if (!savedStatuses) {
    return {};
  }

  try {
    return JSON.parse(savedStatuses);
  } catch (error) {
    console.error('No se pudieron leer los estados guardados:', error);
    return {};
  }
}

function getStatusLabel(status) {
  const labels = {
    new: 'Nuevo',
    seen: 'Visto',
    favorite: 'Favorito',
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