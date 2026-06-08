import { useState } from 'react';
import './App.css';
import { searchRemotiveJobs } from './services/remotiveApi';

function App() {
  const [keyword, setKeyword] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

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

      setJobs(results);
    } catch (error) {
      console.error(error);
      setErrorMessage('Ocurrió un error al buscar empleos. Revisá tu conexión o intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateJobStatus = (jobId, newStatus) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) =>
        job.id === jobId
          ? { ...job, status: newStatus }
          : job
      )
    );
  };

  const handleOpenJob = (job) => {
    updateJobStatus(job.id, 'seen');

    if (window.electronAPI?.openExternalLink) {
      window.electronAPI.openExternalLink(job.url);
      return;
    }

    window.open(job.url, '_blank', 'noopener,noreferrer');
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

      <section className="results-panel">
        <div className="results-header">
          <h2>Resultados</h2>
          <span>{jobs.length} ofertas encontradas</span>
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
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  {hasSearched
                    ? 'No encontramos ofertas para esa búsqueda. Probá con otra keyword.'
                    : 'Todavía no hay resultados. Ingresá una keyword y buscá empleos.'}
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id}>
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
                        onClick={() => updateJobStatus(job.id, 'favorite')}
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

function getStatusLabel(status) {
  const labels = {
    new: 'Nuevo',
    seen: 'Visto',
    favorite: 'Favorito',
  };

  return labels[status] || 'Nuevo';
}

export default App;