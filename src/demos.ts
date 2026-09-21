export type Demo = {
  id: string;
  label: string;
  src: string;
  width: number;
  height: number;
};

export const demos: Demo[] = [
  { id: 'eeg', label: 'EEG Models', src: '/media/demos/eeg-models.mp4', width: 1920, height: 1080 },
  { id: 'bci', label: 'BCI', src: '/media/demos/bci.mp4', width: 1280, height: 960 },
  { id: 'embodied', label: 'Embodied AI', src: '/media/demos/embodied-ai.mp4?v=ced4e2ee', width: 1920, height: 1080 },
];
