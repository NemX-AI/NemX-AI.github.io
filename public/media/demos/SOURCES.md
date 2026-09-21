# Demo media processing

## EEG Models — 2026-09-21

The team supplied a 1920×1080 recording. The previously published MP4 used the
same compressed video packets as that recording (video SHA-256:
`2fc0f11bb55bcdae4f54da7f1e302be07119beddfa281709ea8a29fc9a8d5b34`).
Its text softness was already present in the source.

The current derivative applies mild temporal/spatial denoising and contrast
adaptive sharpening only to the white analysis panel, then Lanczos resampling
to 2560×1440. This is a processed upscale, not additional captured detail.
No text, values, clinical imagery, or existing privacy masking were replaced.
The source timeline, 60 fps playback and original AAC audio are retained.

FFmpeg 7.1 filter graph, applied to the previously published MP4:

```text
[0:v]split[base][text];
[text]crop=1848:288:40:770,hqdn3d=0.5:0.5:0.75:0.75,cas=strength=0.25[clear];
[base][clear]overlay=40:770,scale=2560:1440:flags=lanczos,format=yuv420p[out]
```

Encoding: libx264, preset slow, CRF 16, maxrate 16M, bufsize 32M,
High profile / level 5.1, AAC stream copy, MP4 faststart.

- File: `eeg-models.mp4`, 18,285,535 bytes, 15.72 seconds.
- SHA-256: `6e3431a7fe08941fbf3d2dce3b6054186d42da0cf744072023760697674f92a5`.
- Original and derivative audio packet SHA-256:
  `885d6647ed648d66ad6aa3770d1635a4bd928a0353cf06e99749493f20cc7be2`.

The optional Text details view displays an enlarged live crop from this same
recording. It does not reconstruct or infer the text.
