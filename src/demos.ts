import type { DemoPlayback } from './demo-playback';
import type { DemoDetailRegion } from './DemoDetail';

export type Demo = {
  id: string;
  label: string;
  src: string;
  width: number;
  height: number;
  playback: DemoPlayback;
  detailRegion?: DemoDetailRegion;
};

export const demos: Demo[] = [
  {
    id: 'eeg', label: 'EEG Models', src: '/media/demos/eeg-models.mp4?v=6e3431a7', width: 2560, height: 1440,
    playback: { defaultRate: 0.75 },
    // Normalized bounds of the white AI analysis panel in the source recording.
    detailRegion: { x: 40 / 1920, y: 770 / 1080, width: 1848 / 1920, height: 288 / 1080 },
  },
  { id: 'bci', label: 'BCI', src: '/media/demos/bci.mp4', width: 1280, height: 960, playback: { defaultRate: 0.75 } },
  { id: 'embodied', label: 'Embodied AI', src: '/media/demos/embodied-ai.mp4?v=ced4e2ee', width: 1920, height: 1080, playback: { defaultRate: 0.75 } },
];
