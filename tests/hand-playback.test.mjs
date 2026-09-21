import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHandPlayback } from '../src/hand-playback.ts';

function setup(t) {
  let now = 0;
  let nextId = 0;
  const timers = new Map();
  const frames = new Map();
  const doc = Object.assign(new EventTarget(), { hidden: false });
  const win = Object.assign(new EventTarget(), {
    setTimeout(fn, delay) { const id = ++nextId; timers.set(id, { fn, due: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
  });
  const replacements = {
    document: doc,
    window: win,
    requestAnimationFrame(fn) { const id = ++nextId; frames.set(id, fn); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  const restore = [];
  for (const [key, value] of Object.entries(replacements)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    restore.push(() => original ? Object.defineProperty(globalThis, key, original) : delete globalThis[key]);
  }
  t.mock.method(performance, 'now', () => now);
  class Video extends EventTarget {
    paused = true;
    seeking = false;
    readyState = 0;
    duration = NaN;
    currentTime = 0;
    playCalls = 0;
    attributes = new Map();
    result = () => Promise.resolve();
    setAttribute(name, value) { this.attributes.set(name, value); }
    play() { ++this.playCalls; this.paused = false; return this.result(); }
    pause() { this.paused = true; }
    emit(name) { this.dispatchEvent(new Event(name)); }
  }
  const video = new Video();
  const drawn = [];
  let unavailable = 0;
  const playback = createHandPlayback(video, {
    onFrame: () => drawn.push(video.currentTime),
    onUnavailable: () => ++unavailable,
  });
  t.after(() => { playback.dispose(); restore.forEach((fn) => fn()); });
  return {
    video, playback, drawn, doc,
    get unavailable() { return unavailable; },
    advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) {
        if (timer.due <= now) { timers.delete(id); timer.fn(); }
      }
    },
    frame() {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((fn) => fn(now));
    },
  };
}

test('cold mobile load starts without waiting for metadata or loadeddata', (t) => {
  const s = setup(t);
  s.playback.setActive(true);
  assert.equal(s.video.playCalls, 1);
  assert.equal(s.video.muted, true);
  assert.equal(s.video.defaultMuted, true);
  assert.equal(s.video.playsInline, true);
  assert.deepEqual(s.drawn, []);
  s.video.duration = 12;
  s.video.emit('loadedmetadata');
  assert.equal(s.video.currentTime, 6, 'start at fingertip contact');
  s.video.readyState = 2;
  s.video.emit('canplay'); // loadeddata is deliberately absent.
  s.video.currentTime = 7;
  s.frame();
  assert.deepEqual(s.drawn, [6, 7]);
  assert.equal(s.unavailable, 0);
});

test('an offscreen pause invalidates a late rejected play request', async (t) => {
  const s = setup(t);
  let reject;
  s.video.result = () => new Promise((_, fail) => { reject = fail; });
  s.playback.setActive(true);
  s.playback.setActive(false);
  s.video.result = () => Promise.resolve();
  s.playback.setActive(true);
  reject(new DOMException('interrupted by pause', 'AbortError'));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(s.video.playCalls, 2);
  assert.equal(s.video.paused, false);
  assert.equal(s.unavailable, 0);
});

test('a browser autoplay denial selects the automatic image fallback', async (t) => {
  const s = setup(t);
  s.video.result = () => Promise.reject(new DOMException('gesture required', 'NotAllowedError'));
  s.playback.setActive(true);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(s.unavailable, 1);
  assert.equal(s.video.paused, true);
  s.video.emit('canplay');
  assert.equal(s.video.playCalls, 1, 'do not repeatedly request blocked media');
});

test('a silent decoder stall cannot leave the contact poster stuck indefinitely', (t) => {
  const s = setup(t);
  s.playback.setActive(true);
  s.advance(3000);
  assert.equal(s.unavailable, 1);
  assert.equal(s.video.paused, true);
});

test('decoded frames refresh the deadline; hidden time does not trigger fallback', (t) => {
  const s = setup(t);
  s.video.duration = 12;
  s.video.readyState = 2;
  s.playback.setActive(true);
  s.video.emit('playing');
  s.advance(2000);
  s.video.currentTime = 8;
  s.frame();
  s.advance(1000);
  assert.equal(s.unavailable, 0);
  s.doc.hidden = true;
  s.doc.dispatchEvent(new Event('visibilitychange'));
  s.advance(10000);
  assert.equal(s.unavailable, 0);
  s.doc.hidden = false;
  s.doc.dispatchEvent(new Event('visibilitychange'));
  assert.equal(s.video.paused, false);
  s.advance(3000); // Now visibly stalled.
  assert.equal(s.unavailable, 1);
});

test('an early seek failure retries when the decoder becomes ready', (t) => {
  const s = setup(t);
  let canSeek = false;
  let position = 0;
  Object.defineProperty(s.video, 'currentTime', {
    get: () => position,
    set(value) {
      if (!canSeek) throw new DOMException('not ready', 'InvalidStateError');
      position = value;
    },
  });
  s.video.duration = 12;
  s.video.readyState = 2;
  s.playback.setActive(true);
  s.video.emit('playing');
  assert.deepEqual(s.drawn, []);
  canSeek = true;
  s.video.emit('canplay');
  assert.deepEqual(s.drawn, [6]);
});

test('cleanup removes recovery listeners and pending timers', (t) => {
  const s = setup(t);
  s.playback.setActive(true);
  s.playback.dispose();
  s.advance(10000);
  s.video.emit('canplay');
  s.doc.dispatchEvent(new Event('WeixinJSBridgeReady'));
  assert.equal(s.video.playCalls, 1);
  assert.equal(s.unavailable, 0);
});
