export async function searchRemoteOkJobs(keyword) {
  const cleanKeyword = keyword.trim().toLowerCase();

  if (!cleanKeyword) {
    return [];
  }

  const response = await fetch('https://remoteok.com/api');

  if (!response.ok) {
    throw new Error('No se pudieron obtener empleos desde Remote OK.');
  }

  const data = await response.json();

  const jobs = Array.isArray(data) ? data.slice(1) : [];

  const normalizedJobs = jobs.map((job) => ({
    id: `remoteok-${job.id}`,
    title: job.position || '',
    company: job.company || '',
    source: 'Remote OK',
    publishedAt: formatDate(job.date),
    publishedAtRaw: job.date || '',
    keyword: cleanKeyword,
    url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
    location: job.location || 'Remote',
    category: '',
    tags: job.tags || [],
    description: job.description || '',
    status: 'new',
    isFavorite: false,
  }));

  return normalizedJobs.filter((job) => matchesKeyword(job, cleanKeyword));
}

function matchesKeyword(job, keyword) {
  const searchableText = [
    job.title,
    job.company,
    job.location,
    job.category,
    job.description,
    ...job.tags,
  ]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(keyword);
}

function formatDate(dateString) {
  if (!dateString) {
    return 'Sin fecha';
  }

  const publicationDate = new Date(dateString);
  const today = new Date();

  if (Number.isNaN(publicationDate.getTime())) {
    return 'Sin fecha';
  }

  const diffInMs = today - publicationDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Hoy';
  }

  if (diffInDays === 1) {
    return 'Hace 1 día';
  }

  return `Hace ${diffInDays} días`;
}