export const EXTERNAL_JOB_SOURCES = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    buildUrl: (keyword) =>
      `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}`,
  },
  {
    id: 'upwork',
    name: 'Upwork',
    buildUrl: (keyword) =>
      `https://www.upwork.com/nx/jobs/search/?q=${encodeURIComponent(keyword)}`,
  },
  {
    id: 'workingnomads',
    name: 'Working Nomads',
    buildUrl: (keyword) =>
      `https://www.workingnomads.com/jobs?search=${encodeURIComponent(keyword)}`,
  },
  {
    id: 'flexjobs',
    name: 'FlexJobs',
    buildUrl: (keyword) =>
      `https://www.flexjobs.com/search?search=${encodeURIComponent(keyword)}`,
  },
  {
    id: 'bumeran',
    name: 'Bumeran',
    buildUrl: (keyword) =>
      `https://www.bumeran.com.ar/empleos-busqueda-${encodeURIComponent(keyword)}.html`,
  },
  {
    id: 'computrabajo',
    name: 'Computrabajo',
    buildUrl: (keyword) =>
      `https://ar.computrabajo.com/trabajo-de-${encodeURIComponent(keyword)}`,
  },
];