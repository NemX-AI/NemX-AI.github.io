export type DemoPlayback = {
  defaultRate: number;
  // Times use the original video timeline; intervals are [start, end).
  segments?: { start: number; end: number; rate: number }[];
};

export type DemoPlaybackState = { rate: number; automatic: boolean };

export function createDemoPlayback(
  video: HTMLVideoElement,
  settings: DemoPlayback,
  onChange: (state: DemoPlaybackState) => void,
) {
  let manualRate: number | null = null;
  let appliedRate = video.playbackRate;

  const report = () => onChange({ rate: video.playbackRate, automatic: manualRate === null });
  const applyRate = () => {
    const segment = settings.segments?.find(({ start, end }) =>
      video.currentTime >= start && video.currentTime < end);
    appliedRate = manualRate ?? segment?.rate ?? settings.defaultRate;
    if (video.playbackRate !== appliedRate) video.playbackRate = appliedRate;
    report();
  };
  const rememberNativeChoice = () => {
    // A native player/fullscreen speed choice also overrides the automatic plan.
    if (video.playbackRate !== appliedRate) {
      manualRate = video.playbackRate;
      appliedRate = manualRate;
    }
  };
  const sync = () => { rememberNativeChoice(); applyRate(); };
  const onRateChange = () => { rememberNativeChoice(); report(); };

  video.defaultPlaybackRate = settings.defaultRate;
  video.preservesPitch = true;
  const syncEvents = ['loadedmetadata', 'playing', 'timeupdate', 'seeking', 'seeked'];
  syncEvents.forEach((event) => video.addEventListener(event, sync));
  video.addEventListener('ratechange', onRateChange);
  applyRate();

  return {
    setRate(rate: number | null) {
      manualRate = rate;
      applyRate();
    },
    dispose() {
      syncEvents.forEach((event) => video.removeEventListener(event, sync));
      video.removeEventListener('ratechange', onRateChange);
    },
  };
}
