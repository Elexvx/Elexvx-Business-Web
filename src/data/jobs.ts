import { hrContactEmail } from './contact';

interface Job {
  id: string;
  title: string;
  location?: string;
  type?: string;
  experience?: string;
  salary?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
  applyUrl?: string;
}

export const jobApplicationHref = `mailto:${hrContactEmail}`;

export const jobsData: Record<string, Job> = {};

export const jobs = Object.values(jobsData);
