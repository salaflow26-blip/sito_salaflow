# Music for the Remotion launch video: the demo track from bar 5, bars 11-13 looped three times, then its ending;
# whooshes on the cuts, fade in/out. Writes public/music.wav; encode to public/music.mp3 with ffmpeg.
# Needs ../sorgenti/build/music.raw (made by ../sorgenti/build.sh from demo.mp4).
import numpy as np, wave, sys
SR = 48000; BAR = 2.1413; B0 = 0.163
CUTS = [2, 4, 5.25, 6.5, 7.75, 9, 10.25, 11, 12, 13, 14, 15, 16, 17, 18.25]
END = 20.75 * BAR; N = int(END * SR)
m = np.fromfile('../sorgenti/build/music.raw', dtype=np.float32).reshape(-1, 2).astype(np.float64)
at = lambda b: int(round((B0 + b * BAR) * SR))
x = int(.012 * SR); r = np.linspace(0, 1, x)[:, None]
loop = m[at(11):at(13)]
parts = [m[at(5):at(11)], loop, loop, loop, m[at(13):]]  # bars 11-13 three times stretch the track to the video length
mus = parts[0]
for p in parts[1:]: mus = np.vstack([mus[:-x], mus[-x:] * (1 - r) + p[:x] * r, p[x:]])
if len(mus) < N: mus = np.vstack([mus, np.zeros((N - len(mus), 2))])
out = mus[:N] * 0.85
if 'energy' in sys.argv:
    for k in range(int(END / BAR) + 1):
        s = out[int(k * BAR * SR):int((k + 1) * BAR * SR)]
        if len(s): print(k, round(float(np.sqrt((s ** 2).mean())), 4), '#' * int(np.sqrt((s ** 2).mean()) * 300))
    sys.exit()
rng = np.random.default_rng(7)
def whoosh(t, dur=.42, gain=.07):
    n = int(dur * SR); xx = rng.standard_normal(n); fc = np.linspace(700, 6500, n); al = np.exp(-2 * np.pi * fc / SR); y = np.zeros(n); p = 0.0
    for i in range(n): p = al[i] * p + (1 - al[i]) * xx[i]; y[i] = p
    y = y * np.sin(np.linspace(0, np.pi, n)) ** 2 / (np.abs(y).max() + 1e-9) * gain
    s = max(0, int((t - dur * .7) * SR)); e = min(N, s + n); out[s:e] += y[:e - s, None]
for c in CUTS: whoosh(c * BAR, gain=.1 if c in (2, 18.25) else .07)
fi = int(.15 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(1.8 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
out *= min(1, .98 / np.abs(out).max())
w = wave.open('public/music.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes()); w.close()
print('public/music.wav', round(END, 3), 's')
