# Audio for episodio.html:  python3 mix_episodio.py <episode id>  -> build/mix_ep_<id>.wav
# Music: the demo track from its drop (bar 9); bars 11-12 loop as long as the episode needs, then the
# track carries on from bar 13 into its ending. Same timeline as episodio.html (reads build/ep/<id>/steps.json):
# a tap click on every finger tap, a soft whoosh on every new screen, a lift at the end card.
import sys, json, numpy as np, wave
ID = sys.argv[1]
SR = 48000; BAR = 2.1413; B0 = 0.163; BEAT = BAR / 4
steps = json.load(open(f'build/ep/{ID}/steps.json'))
INTRO = OUTRO = 8 * BEAT
T0 = []; t = INTRO
for s in steps: T0.append(t); t += s.get('b', 8) * BEAT
ENDT = t; END = t + OUTRO; N = int(END * SR)
m = np.fromfile('build/music.raw', dtype=np.float32).reshape(-1, 2).astype(np.float64)
at = lambda b: int(round((B0 + b * BAR) * SR))
# drop (bar 9-11), then 11-13 looped with short crossfades, then 13.. to the end of the track
x = int(.012 * SR); r = np.linspace(0, 1, x)[:, None]
parts = [m[at(9):at(11)]]
tail = m[at(13):]
need = N - len(parts[0]) - len(tail)
loop = m[at(11):at(13)]
while need > 0:
    parts.append(loop); need -= len(loop)
parts.append(tail)
music = parts[0]
for p in parts[1:]:
    music = np.vstack([music[:-x], music[-x:] * (1 - r) + p[:x] * r, p[x:]])
if len(music) < N: music = np.vstack([music, np.zeros((N - len(music), 2))])
out = music[:N] * 0.62
rng = np.random.default_rng(3)
def whoosh(t, dur=.5, gain=.07):
    n = int(dur * SR); xx = rng.standard_normal(n); fc = np.linspace(700, 6000, n); a = np.exp(-2 * np.pi * fc / SR); y = np.zeros(n); p = 0.0
    for i in range(n): p = a[i] * p + (1 - a[i]) * xx[i]; y[i] = p
    y = y * np.sin(np.linspace(0, np.pi, n)) ** 2 / (np.abs(y).max() + 1e-9) * gain
    s = max(0, int((t - dur * .7) * SR)); e = min(N, s + n); out[s:e] += y[:e - s, None]
def tap(t, gain=.2, f1=1900, f2=3100):
    n = int(.05 * SR); tt = np.arange(n) / SR; y = (np.sin(2 * np.pi * f1 * tt) * .6 + np.sin(2 * np.pi * f2 * tt) * .4) * np.exp(-tt * 90) * gain
    s = int(t * SR); e = min(N, s + n); out[s:e] += y[:e - s, None]
whoosh(INTRO, dur=.7, gain=.12)
for i, s in enumerate(steps):
    if i: whoosh(T0[i])
    d = s.get('b', 8) * BEAT; tp = s.get('taps', [])
    for k, q in enumerate(tp):
        press = q['kind'] == 'press'
        a = T0[i] + d - BEAT * (len(tp) - k) * (2 if press else 1)
        tap(a)
        if press: tap(a + 2 * BEAT, gain=.14, f1=1400, f2=2300)
whoosh(ENDT, dur=.8, gain=.12)
fi = int(.2 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(1.4 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
pk = np.abs(out).max(); out *= min(1, .98 / pk)
w = wave.open(f'build/mix_ep_{ID}.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out * 32767).astype('<i2').tobytes()); w.close()
print(f'build/mix_ep_{ID}.wav', round(END, 2), 's')
