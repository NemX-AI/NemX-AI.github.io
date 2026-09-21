import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDemoPlayback } from '../src/demo-playback.ts';

class Video extends EventTarget {
  currentTime = 0;
  playbackRate = 1;
  defaultPlaybackRate = 1;
  preservesPitch = false;
  emit(name) { this.dispatchEvent(new Event(name)); }
}

test('slow playback is ready before metadata, and manual speed survives load and replay', () => {
  const video = new Video();
  let state;
  const playback = createDemoPlayback(video, { defaultRate: 0.75 }, (next) => { state = next; });
  assert.equal(video.playbackRate, 0.75);
  assert.equal(video.defaultPlaybackRate, 0.75);
  assert.equal(video.preservesPitch, true);
  assert.deepEqual(state, { rate: 0.75, automatic: true });

  playback.setRate(0.5);
  for (const event of ['loadedmetadata', 'ratechange', 'playing', 'timeupdate', 'seeked']) {
    video.emit(event);
    assert.equal(video.playbackRate, 0.5, `keep manual choice on ${event}`);
  }
  assert.deepEqual(state, { rate: 0.5, automatic: false });
  playback.dispose();
});

test('segments follow source time through boundaries, gaps and backwards seeks', () => {
  const video = new Video();
  const playback = createDemoPlayback(video, {
    defaultRate: 0.75,
    segments: [{ start: 5, end: 10, rate: 0.5 }, { start: 10, end: 15, rate: 1 }, { start: 20, end: 25, rate: 1.25 }],
  }, () => {});
  for (const [time, rate, event] of [
    [4.99, 0.75, 'timeupdate'], [5, 0.5, 'timeupdate'], [10, 1, 'timeupdate'],
    [15, 0.75, 'timeupdate'], [20, 1.25, 'seeking'], [25, 0.75, 'seeked'],
    [7, 0.5, 'seeking'], [0, 0.75, 'playing'],
  ]) {
    video.currentTime = time;
    video.emit(event);
    assert.equal(video.playbackRate, rate, `rate at source time ${time}`);
  }
  playback.dispose();
});

test('native speed choices override segments even before ratechange is delivered; Auto resumes at current time', () => {
  const video = new Video();
  let state;
  const playback = createDemoPlayback(video, {
    defaultRate: 0.75, segments: [{ start: 10, end: 20, rate: 0.5 }],
  }, (next) => { state = next; });
  video.playbackRate = 1.5;
  video.currentTime = 12;
  video.emit('timeupdate');
  video.emit('ratechange');
  assert.deepEqual(state, { rate: 1.5, automatic: false });
  playback.setRate(null);
  video.emit('ratechange');
  assert.deepEqual(state, { rate: 0.5, automatic: true });
  video.currentTime = 20;
  video.emit('timeupdate');
  assert.equal(video.playbackRate, 0.75);
  playback.dispose();
});

test('closing removes listeners; a new player starts with its own configured speed', () => {
  const video = new Video();
  let updates = 0;
  const playback = createDemoPlayback(video, { defaultRate: 0.75 }, () => ++updates);
  playback.setRate(2);
  playback.dispose();
  const before = updates;
  video.playbackRate = 1;
  for (const event of ['loadedmetadata', 'playing', 'timeupdate', 'seeking', 'seeked', 'ratechange']) video.emit(event);
  assert.equal(updates, before);
  assert.equal(video.playbackRate, 1);
  const reopened = createDemoPlayback(video, { defaultRate: 0.75 }, () => {});
  assert.equal(video.playbackRate, 0.75);
  reopened.dispose();
});
