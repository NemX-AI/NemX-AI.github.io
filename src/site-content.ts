export type NewsItem = {
  id: string;
  date: string;
  category: string;
  title: string;
  announcement?: { label: string; text: string };
  highlight?: { value: string; label: string };
  paragraphs: string[];
  link?: { label: string; href: string };
};

export type Publication = {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  note?: string;
  image?: string;
  links: { label: string; href: string }[];
};

// Use the announcement's posting date. The homepage highlights the newest item.
export const news: NewsItem[] = [
  {
    id: 'neurips-2026-three-papers',
    date: '2026-09-25',
    category: 'Research',
    title: 'Three NemX papers accepted at NeurIPS 2026',
    announcement: { label: 'NeurIPS 2026', text: 'Three NemX papers accepted' },
    highlight: { value: '3', label: 'Papers accepted' },
    paragraphs: [
      'NemX has three papers accepted at the 2026 Conference on Neural Information Processing Systems (NeurIPS). Congratulations to everyone who contributed to this work.',
    ],
  },
];

export const newsByDate = [...news].sort((a, b) => b.date.localeCompare(a.date));

// Titles, authors and venues follow the linked publisher/proceedings records.
// For preprints, use the current arXiv record and label workshop versions separately.
export const publications: Publication[] = [
  {
    id: 'deepevidence',
    title: 'Empowering biomedical evidence exploration and synthesis with deep knowledge graph research',
    authors: 'Zifeng Wang, Zheng Chen, Ziwei Yang, Xuan Wang, Qiao Jin, Yifan Peng, Zhiyong Lu, Jimeng Sun',
    venue: 'Nature Machine Intelligence',
    year: 2026,
    image: '/media/publications/deepevidence.png',
    links: [
      { label: 'Paper', href: 'https://www.nature.com/articles/s42256-026-01266-0' },
      { label: 'Code', href: 'https://github.com/RyanWangZf/BioDSA/tree/main/biodsa/agents/deepevidence' },
      { label: 'Dataset', href: 'https://huggingface.co/datasets/zifeng-ai/DeepEvidence' },
    ],
  },
  {
    id: 'biodsbench',
    title: 'Making large language models reliable data science programming copilots for biomedical research',
    authors: 'Zifeng Wang, Benjamin Danek, Ziwei Yang, Zheng Chen, Jimeng Sun',
    venue: 'Nature Biomedical Engineering',
    year: 2026,
    note: 'Preprint title: Can Large Language Models Replace Data Scientists in Biomedical Research?',
    image: '/media/publications/biodsbench.webp',
    links: [
      { label: 'Paper', href: 'https://www.nature.com/articles/s41551-025-01587-2' },
      { label: 'Preprint', href: 'https://arxiv.org/abs/2410.21591' },
      { label: 'Code', href: 'https://github.com/RyanWangZf/BioDSBench' },
      { label: 'Dataset', href: 'https://huggingface.co/datasets/zifeng-ai/BioDSBench' },
    ],
  },
  {
    id: 'tfm-tokenizer',
    title: 'Tokenizing Single-Channel EEG with Time-Frequency Motif Learning',
    authors: 'Jathurshan Pradeepkumar, Xihao Piao, Zheng Chen, Jimeng Sun',
    venue: 'ICLR',
    year: 2026,
    image: '/media/publications/tfm-tokenizer.jpg',
    links: [
      { label: 'Paper', href: 'https://proceedings.iclr.cc/paper_files/paper/2026/hash/3dc85735f6e2fcf093e67b134fa00d21-Abstract-Conference.html' },
      { label: 'Project', href: 'https://www.jathurshanpradeepkumar.com/TFM-Tokenizer/' },
      { label: 'Code', href: 'https://github.com/Jathurshan0330/TFM-Tokenizer' },
      { label: 'Model', href: 'https://huggingface.co/Jathurshan/TFM-Tokenizer' },
    ],
  },
  {
    id: 'zipbrain',
    title: 'ZIPBrain: Can EEG Foundation Models Be Faster, Locally Deployable, but Accurate?',
    authors: 'Lingwei Li, Yirong Kan, Peng Chen, Xu Cao, Zheng Chen, Yasuhiko Nakashima',
    venue: 'arXiv preprint',
    year: 2026,
    image: '/media/publications/zipbrain.svg',
    links: [
      { label: 'Paper', href: 'https://arxiv.org/abs/2608.07033' },
    ],
  },
  {
    id: 'odebrain',
    title: 'ODEBrain: Continuous-Time EEG Graph for Modeling Dynamic Brain Networks',
    authors: 'Haohui Jia, Zheng Chen, Lingwei Zhu, Rikuto Kotoge, Jathurshan Pradeepkumar, Yasuko Matsubara, Jimeng Sun, Yasushi Sakurai, Takashi Matsubara',
    venue: 'ICLR',
    year: 2026,
    image: '/media/publications/odebrain.jpg',
    links: [
      { label: 'Paper', href: 'https://proceedings.iclr.cc/paper_files/paper/2026/hash/aebec8058f23a445353c83ede0e1ec48-Abstract-Conference.html' },
      { label: 'Preprint', href: 'https://arxiv.org/abs/2602.23285' },
      { label: 'Code', href: 'https://github.com/HHJIAnmo/ODEBRAIN' },
    ],
  },
  {
    id: 'celm',
    title: 'Neural Signals Generate Clinical Notes in the Wild',
    authors: 'Jathurshan Pradeepkumar, Zheng Chen, Jimeng Sun',
    venue: 'ICLR',
    year: 2026,
    image: '/media/publications/celm.png',
    links: [
      { label: 'Paper', href: 'https://arxiv.org/abs/2601.22197' },
      { label: 'Code', href: 'https://github.com/Jathurshan0330/CELM' },
    ],
  },
  {
    id: 'evobrain',
    title: 'EvoBrain: Dynamic Multi-Channel EEG Graph Modeling for Time-Evolving Brain Networks',
    authors: 'Rikuto Kotoge, Zheng Chen, Tasuku Kimura, Yasuko Matsubara, Takufumi Yanagisawa, Haruhiko Kishima, Yasushi Sakurai',
    venue: 'NeurIPS',
    year: 2025,
    image: '/media/publications/evobrain.jpg',
    links: [
      { label: 'Paper', href: 'https://proceedings.neurips.cc/paper_files/paper/2025/hash/d51ce6040fe3dafd260411593f05a1fa-Abstract-Conference.html' },
      { label: 'Preprint', href: 'https://arxiv.org/abs/2509.15857' },
      { label: 'Code', href: 'https://github.com/Kotoge/EvoBrain' },
    ],
  },
  {
    id: 'sodor',
    title: 'Long-Term EEG Partitioning for Seizure Onset Detection',
    authors: 'Zheng Chen, Yasuko Matsubara, Yasushi Sakurai, Jimeng Sun',
    venue: 'AAAI',
    year: 2025,
    image: '/media/publications/sodor.png',
    links: [
      { label: 'Paper', href: 'https://ojs.aaai.org/index.php/AAAI/article/view/33557' },
      { label: 'Preprint', href: 'https://arxiv.org/abs/2412.15598' },
    ],
  },
];

// Public contact addresses confirmed by the team. Drafts address both recipients.
export const contactEmails = ['NemXAI2@gmail.com', 'hezhy58@outlook.com'];
