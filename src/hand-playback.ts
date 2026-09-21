import { HANDS_OPENING_PROGRESS } from './hero-choreography.ts';

type PlaybackCallbacks = {
  onFrame: () => void;
  onUnavailable: () => void;
};

// Keep playback independent of WebGL so delayed mobile loading and interrupted
// play requests follow the same lifecycle in both renderers.
export function createHandPlayback(video: HTMLVideoElement, callbacks: PlaybackCallbacks) {
  let active = false;
  let disposed = false;
  let failed = false;
  let openingPrepared = false;
  let pending = false;
  let requestVersion = 0;
  let frame: number | undefined;
  let videoFrame = false;
  let watchdog: number | undefined;
  let retry: number | undefined;
  let lastTime = -1;
  let lastProgress = performance.now();

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  const canPlay = () => active && !disposed && !failed && !document.hidden;
  const cancelFrame = () => {
    if (frame === undefined) return;
    if (videoFrame) video.cancelVideoFrameCallback(frame);
    else cancelAnimationFrame(frame);
    frame = undefined;
  };
  const cancelTimers = () => {
    window.clearTimeout(watchdog);
    window.clearTimeout(retry);
    watchdog = retry = undefined;
  };
  const unavailable = () => {
    if (!canPlay()) return;
    failed = true;
    cancelFrame();
    cancelTimers();
    video.pause();
    callbacks.onUnavailable();
  };
  const prepareOpening = () => {
    if (openingPrepared || !Number.isFinite(video.duration) || video.duration <= 0) return;
    try {
      video.currentTime = video.duration * HANDS_OPENING_PROGRESS;
      openingPrepared = true;
    } catch {
      // Some WebViews expose metadata before seeking is available. Retry on
      // canplay/seeked, keeping the contact poster until the right frame exists.
    }
  };
  const draw = () => {
    if (!canPlay() || !openingPrepared || video.seeking || video.readyState < 2) return;
    if (video.currentTime === lastTime) return;
    try {
      callbacks.onFrame();
      lastTime = video.currentTime;
      lastProgress = performance.now();
    } catch {
      unavailable();
    }
  };
  const scheduleFrame = () => {
    if (!canPlay() || video.paused || frame !== undefined) return;
    const next = () => {
      frame = undefined;
      draw();
      scheduleFrame();
    };
    videoFrame = typeof video.requestVideoFrameCallback === 'function';
    frame = videoFrame ? video.requestVideoFrameCallback(next) : requestAnimationFrame(next);
  };
  const checkProgress = () => {
    if (!canPlay()) return;
    if (performance.now() - lastProgress >= 3000) unavailable();
    else watchdog = window.setTimeout(checkProgress, 1000);
  };
  const play = () => {
    if (!canPlay()) return;
    prepareOpening();
    // Request playback even with HAVE_NOTHING. Waiting for metadata/data here
    // deadlocks WebViews that defer loading until play() is called.
    if (!video.paused || pending) { scheduleFrame(); return; }
    const version = ++requestVersion;
    pending = true;
    void video.play().catch((error: unknown) => {
      if (version !== requestVersion || !canPlay()) return;
      if (error instanceof DOMException && error.name === 'AbortError') {
        // A seek can interrupt the first request; visibility pauses are ignored
        // through requestVersion. The watchdog bounds repeated interruptions.
        retry = window.setTimeout(play, 100);
      } else unavailable();
    }).finally(() => {
      if (version === requestVersion) pending = false;
    });
  };
  const sync = () => {
    cancelFrame();
    cancelTimers();
    if (!canPlay()) {
      ++requestVersion;
      pending = false;
      video.pause();
      return;
    }
    lastProgress = performance.now();
    watchdog = window.setTimeout(checkProgress, 3000);
    play();
  };
  const onLoaded = () => { prepareOpening(); draw(); play(); scheduleFrame(); };
  const onPlaying = () => { prepareOpening(); draw(); scheduleFrame(); };
  const loadEvents = ['loadedmetadata', 'loadeddata', 'canplay', 'seeked'] as const;
  const recoveryEvents = ['pageshow', 'pointerdown', 'touchend', 'keydown'] as const;
  loadEvents.forEach((event) => video.addEventListener(event, onLoaded));
  recoveryEvents.forEach((event) => window.addEventListener(event, play, { passive: true }));
  video.addEventListener('playing', onPlaying);
  video.addEventListener('error', unavailable);
  document.addEventListener('visibilitychange', sync);
  document.addEventListener('WeixinJSBridgeReady', play);

  return {
    setActive(value: boolean) {
      if (active === value) return;
      active = value;
      sync();
    },
    dispose() {
      disposed = true;
      ++requestVersion;
      cancelFrame();
      cancelTimers();
      loadEvents.forEach((event) => video.removeEventListener(event, onLoaded));
      recoveryEvents.forEach((event) => window.removeEventListener(event, play));
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', unavailable);
      document.removeEventListener('visibilitychange', sync);
      document.removeEventListener('WeixinJSBridgeReady', play);
      video.pause();
    },
  };
}
