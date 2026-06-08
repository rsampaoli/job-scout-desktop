import { searchRemotiveJobs } from './remotiveApi';
import { searchRemoteOkJobs } from './remoteOkApi';
import { searchArbeitnowJobs } from './arbeitnowApi';

export async function searchJobs(keyword) {
  const searches = await Promise.allSettled([
    searchRemotiveJobs(keyword),
    searchRemoteOkJobs(keyword),
    searchArbeitnowJobs(keyword),
  ]);

  const successfulResults = searches
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value);

  return removeDuplicateJobs(sortJobsByDate(successfulResults));
}

function removeDuplicateJobs(jobs) {
  const uniqueJobsByUrl = new Map();

  jobs.forEach((job) => {
    if (!job.url) {
      return;
    }

    if (!uniqueJobsByUrl.has(job.url)) {
      uniqueJobsByUrl.set(job.url, job);
    }
  });

  return Array.from(uniqueJobsByUrl.values());
}

function sortJobsByDate(jobs) {
  return [...jobs].sort((a, b) => {
    const dateA = a.publishedAtRaw ? new Date(a.publishedAtRaw).getTime() : 0;
    const dateB = b.publishedAtRaw ? new Date(b.publishedAtRaw).getTime() : 0;

    return dateB - dateA;
  });
}