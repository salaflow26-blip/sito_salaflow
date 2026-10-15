# Adds sound effects on top of a music track: python3 scripts/sfx.py music.mp3 out.mp3 kind@frame [kind@frame …]
# kinds: whoosh (peaks on the frame), impact (a deep hit), pop (a notification), tap (a finger on glass), hit (a soft accent).
# Frames are at 30 fps. Everything is synthesised here, nothing is sampled.
import os, subprocess, sys, tempfile
import numpy as np

FF = os.environ.get('FF', '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2')
SR, FPS = 48000, 30
rng = np.random.default_rng(3)


def decode(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)


def lowpass(x, fc):
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.zeros_like(x); p = 0.0
    for i in range(len(x)):
        p = a[i] * p + (1 - a[i]) * x[i]; y[i] = p
    return y


def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def whoosh(d=0.55):
    n = int(d * SR)
    z = lowpass(rng.standard_normal(n), np.linspace(500, 7000, n) ** 1.0)
    z *= np.sin(np.linspace(0, np.pi, n)) ** 2
    return z / (np.abs(z).max() + 1e-9) * 0.22, int(n * 0.7)  # sound, offset of its peak


def impact():
    n = int(2.2 * SR); t = np.arange(n) / SR
    sub = np.sin(2 * np.pi * (52 * t - 14 * t * t)) * np.exp(-t / 0.55)
    thump = lowpass(rng.standard_normal(n), 900) * np.exp(-t / 0.05) * 3
    tail = lowpass(rng.standard_normal(n), 2500) * np.exp(-t / 0.7) * 0.25
    s = sub + thump + tail
    return s / np.abs(s).max() * 0.55, int(0.005 * SR)


def pop():
    n = int(0.16 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (880 * t + 1600 * t * t)) * env(n, 0.003, 0.04)
    return s * 0.12, 0


def tap():
    n = int(0.06 * SR)
    s = lowpass(rng.standard_normal(n), 3500) * env(n, 0.001, 0.012)
    s += np.sin(2 * np.pi * 180 * np.arange(n) / SR) * env(n, 0.001, 0.02) * 0.6
    return s / np.abs(s).max() * 0.2, 0


def hit():
    n = int(0.9 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * (70 * t - 10 * t * t)) * np.exp(-t / 0.25) + lowpass(rng.standard_normal(n), 1500) * np.exp(-t / 0.04)
    return s / np.abs(s).max() * 0.28, 0


KINDS = {'whoosh': whoosh, 'impact': impact, 'pop': pop, 'tap': tap, 'hit': hit}

src, dst, *events = sys.argv[1:]
out = decode(src)
for e in events:
    kind, at = e.split('@')
    s, peak = KINDS[kind]()
    start = int(int(at) / FPS * SR) - peak
    a, b = max(0, start), min(len(out), start + len(s))
    if b > a:
        out[a:b] += s[a - start:b - start, None]
out *= min(1, 0.97 / np.abs(out).max())
with tempfile.NamedTemporaryFile(suffix='.f32') as f:
    out.astype(np.float32).tofile(f.name)
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', f.name, '-c:a', 'libmp3lame', '-b:a', '192k', dst], check=True)
print(f'{len(events)} effects -> {dst}')
