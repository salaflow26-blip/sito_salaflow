# Fits a music track to the launch video: brings it to 120 BPM (one bar = 2 s), puts a downbeat where the
# first feature starts (bar 4 = 8 s) and the strong part of the track from there on, adds whooshes on the cuts,
# fades out at the end. Usage: python3 scripts/music.py in.mp3 public/music/name.mp3 [--anchor SECONDS]
# Tracks come from Mixkit (Stock Music Free License: free for commercial use, social media and ads).
import sys, subprocess, tempfile, os, numpy as np, librosa, warnings
warnings.filterwarnings('ignore')
FF = os.environ.get('FF', '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2')
SR = 48000
BAR = 2.0                       # seconds per bar at 120 BPM
TOTAL = 31 * BAR                # 62 s
FIRST = 4 * BAR                 # first feature cut
CUTS = [2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28.5]

src, dst = sys.argv[1], sys.argv[2]
anchor_arg = float(sys.argv[sys.argv.index('--anchor') + 1]) if '--anchor' in sys.argv else None

def decode(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)

x = decode(src); mono = x.mean(1); dur = len(mono) / SR
y = librosa.resample(mono, orig_sr=SR, target_sr=22050)
onset = librosa.onset.onset_strength(y=y, sr=22050, hop_length=256)
tempo, beats = librosa.beat.beat_track(onset_envelope=onset, sr=22050, hop_length=256, units='time', tightness=200)
beats = np.asarray(beats)
# straight-line fit of the beat grid gives the real tempo
k = np.arange(len(beats)); per, t0 = np.polyfit(k, beats, 1)
grid = t0 + per * np.arange(int((dur - t0) / per) + 1)
# downbeat phase: the beat of the bar with the most low-end punch
low = librosa.onset.onset_strength(y=y, sr=22050, hop_length=256, fmax=200)
ot = librosa.frames_to_time(np.arange(len(low)), sr=22050, hop_length=256)
at = np.interp(grid, ot, low)
phase = int(np.argmax([at[p::4].mean() for p in range(4)]))
downs = grid[phase::4]
a = per / 0.5                   # speed factor that makes one beat 0.5 s
need_before, need_after = FIRST * a, (TOTAL - FIRST) * a + 0.3
rms = librosa.feature.rms(y=y, hop_length=512)[0]; rt = librosa.frames_to_time(np.arange(len(rms)), sr=22050, hop_length=512)
sm = np.convolve(rms, np.ones(40) / 40, mode='same')
if anchor_arg is not None:
    anchor = downs[np.argmin(np.abs(downs - anchor_arg))]
else:
    # first downbeat where the track is at full strength, leaving room for the intro before it and the rest after
    strong = rt[np.argmax(sm > 0.8 * sm.max())]
    ok = [d for d in downs if d >= need_before and d + need_after <= dur]
    anchor = min(ok, key=lambda d: abs(d - strong)) if ok else downs[np.argmin(np.abs(downs - need_before))]
start = anchor - need_before
seg = x[max(0, int(start * SR)):int((anchor + need_after) * SR)]
if start < 0: seg = np.vstack([np.zeros((int(-start * SR), 2)), seg])
with tempfile.TemporaryDirectory() as td:
    a_in, a_out = os.path.join(td, 'i.f32'), os.path.join(td, 'o.f32')
    seg.astype(np.float32).tofile(a_in)
    subprocess.run([FF, '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', a_in, '-filter:a', f'atempo={a:.5f}', '-f', 'f32le', a_out], check=True)
    out = np.fromfile(a_out, dtype=np.float32).reshape(-1, 2).astype(np.float64)
N = int(TOTAL * SR)
out = np.vstack([out, np.zeros((max(0, N - len(out)), 2))])[:N] * 0.9
rng = np.random.default_rng(7)
def whoosh(t, d=.42, gain=.06):
    n = int(d * SR); w = rng.standard_normal(n); fc = np.linspace(700, 6500, n); al = np.exp(-2 * np.pi * fc / SR); z = np.zeros(n); p = 0.0
    for i in range(n): p = al[i] * p + (1 - al[i]) * w[i]; z[i] = p
    z = z * np.sin(np.linspace(0, np.pi, n)) ** 2 / (np.abs(z).max() + 1e-9) * gain
    s = max(0, int((t - d * .7) * SR)); e = min(N, s + n); out[s:e] += z[:e - s, None]
for c in CUTS: whoosh(c * BAR, gain=.09 if c in (2, 28.5) else .06)
fi = int(.25 * SR); out[:fi] *= np.linspace(0, 1, fi)[:, None]
fo = int(3.0 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.6
out *= min(1, .95 / np.abs(out).max())
with tempfile.NamedTemporaryFile(suffix='.f32') as f:
    out.astype(np.float32).tofile(f.name)
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', f.name, '-c:a', 'libmp3lame', '-b:a', '192k', dst], check=True)
print(f'{os.path.basename(src)}: {60 / per:.2f} BPM -> 120 (x{a:.4f}), downbeat phase {phase}, anchor {anchor:.2f}s, from {start:.2f}s -> {dst}')
