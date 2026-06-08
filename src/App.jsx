import { useState } from 'react';
import './App.css';
import { searchRemotiveJobs } from './services/remotiveApi';

function App() {
  const [keyword, setKeyword] = useState('');
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setErrorMessage('Ingresá una palabra clave para buscar.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const results = await searchRemotiveJobs(keyword);

      setJobs(results);
    } catch (error) {
      console.error(error);
      setErrorMessage('Ocurrió un error al buscar empleos. Revisá tu conexión o intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
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
              <th>Link</th>
            </tr>
          </thead>

          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  Todavía no hay resultados. Ingresá una keyword y buscá empleos.
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
                    <button
                      className="link-button"
                      onClick={() => window.electronAPI.openExternalLink(job.url)}
                    >
                      Ver oferta
                    </button>
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

export default App;