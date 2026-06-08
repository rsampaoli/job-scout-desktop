export async function searchArbeitnowJobs(keyword) {
  const cleanKeyword = keyword.trim().toLowerCase();

  if (!cleanKeyword) {
    return [];
  }

  const response = await fetch('https://www.arbeitnow.com/api/job-board-api');

  if (!response.ok) {
    throw new Error('No se pudieron obtener empleos desde Arbeitnow.');
  }

  const data = await response.json();
  const jobs = data.data || [];

  const normalizedJobs = jobs.map((job) => ({
    id: `arbeitnow-${job.slug}`,
    title: job.title || '',
    company: job.company_name || '',
    source: 'Arbeitnow',
    publishedAt: formatUnixDate(job.created_at),
    publishedAtRaw: job.created_at ? new Date(job.created_at * 1000).toISOString() : '',
    keyword: cleanKeyword,
    url: job.url,
    location: Array.isArray(job.location)
      ? job.location.join(', ')
      : job.location || 'No especificada',
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

function formatUnixDate(unixTimestamp) {
  if (!unixTimestamp) {
    return 'Sin fecha';
  }

  const publicationDate = new Date(unixTimestamp * 1000);
  const today = new Date();

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