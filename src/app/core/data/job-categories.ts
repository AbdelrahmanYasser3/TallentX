export type JobCategory =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'uiux'
  | 'devops'
  | 'qa'
  | 'product'
  | 'data'
  | 'mobile'
  | 'aiml'
  | 'support';

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  fullstack: 'Full Stack',
  uiux: 'UI/UX',
  devops: 'DevOps',
  qa: 'QA & Testing',
  product: 'Product',
  data: 'Data & Analytics',
  mobile: 'Mobile',
  aiml: 'AI / ML',
  support: 'IT Support',
};

export const JOB_CATEGORY_OPTIONS: { value: JobCategory | ''; label: string }[] = [
  { value: '', label: 'All categories' },
  ...Object.entries(JOB_CATEGORY_LABELS).map(([value, label]) => ({
    value: value as JobCategory,
    label,
  })),
];
