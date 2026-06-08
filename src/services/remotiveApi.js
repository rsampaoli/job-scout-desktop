export async function searchRemotiveJobs(keyword) {
    const cleanKeyword = keyword.trim().toLowerCase();

    if (!cleanKeyword) {
        return [];
    }

    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(cleanKeyword)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('No se pudieron obtener empleos desde Remotive.');
    }

    const data = await response.json();

    const normalizedJobs = data.jobs.map((job) => ({
        id: job.id,
        title: job.title || '',
        company: job.company_name || '',
        source: 'Remotive',
        publishedAt: formatDate(job.publication_date),
        keyword: cleanKeyword,
        url: job.url,
        location: job.candidate_required_location || 'No especificada',
        category: job.category || '',
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