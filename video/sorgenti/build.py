import subprocess, sys, os

FF = os.environ.get("FFMPEG", "ffmpeg")
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build")
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "demo.mp4")
XF = 0.4  # crossfade length

# (name, kind, duration, demo_start)
SCENES = [
    ("hook", "card", 3.2, None),
    ("logo", "card", 3.0, None),
    ("map", "clip", 3.5, 0.0),
    ("walkin", "clip", 3.5, 3.5),
    ("search", "clip", 4.0, 18.5),
    ("grid", "clip", 3.0, 25.8),
    ("allergens", "clip", 3.0, 32.0),
    ("comanda", "clip", 3.5, 39.5),
    ("locanda", "clip", 3.0, 14.5),
    ("end", "card", 5.5, None),
]
# card layers: (png prefix, fade-in start)
CARD_LAYERS = {
    "hook": [("hook1", 0.15), ("hook2", 1.25)],
    "logo": [("logo1", 0.1), ("logo2", 0.8)],
    "end": [("end1", 0.15), ("end2", 0.8), ("end3", 1.2), ("end4", 1.7)],
}
FMT = {
    "h": dict(W=1920, H=1080, scale=1.0, px=1100, py=0),
    "v": dict(W=1080, H=1920, scale=1.3, px=150, py=32),
}
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", "30"]


def run(args):
    r = subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + args)
    if r.returncode:
        sys.exit(r.returncode)


def slide(inp, out, st, dy=24):
    # fade the layer in and let it rise dy px over 0.5s
    return (f"[{inp}]format=rgba,fade=t=in:st={st}:d=0.5:alpha=1[{out}f];",
            f"overlay=0:'if(lt(t,{st}),{dy},{dy}*max(0,1-(t-{st})/0.5))'")


def scene(name, kind, dur, start, k):
    f = FMT[k]
    out = f"{D}/seg_{name}_{k}.mp4"
    if kind == "card":
        layers = CARD_LAYERS[name]
        args = ["-loop", "1", "-t", str(dur), "-i", f"{D}/bgcard_{k}.png"]
        for p, _ in layers:
            args += ["-loop", "1", "-t", str(dur), "-i", f"{D}/{p}_{k}.png"]
        fc, last = "", "0:v"
        for i, (_, st) in enumerate(layers, 1):
            pre, ov = slide(f"{i}:v", f"l{i}", st)
            fc += pre + f"[{last}][l{i}f]{ov}[s{i}];"
            last = f"s{i}"
        if name == "end":
            fc += f"[{last}]fade=t=out:st={dur - 1.0}:d=1.0[s_out];"
            last = "s_out"
        fc = fc.rstrip(";")
    else:
        W = round(600 * f["scale"]); H = round(1080 * f["scale"])
        args = ["-loop", "1", "-t", str(dur), "-i", f"{D}/bg_{k}.png",
                "-ss", str(start), "-t", str(dur), "-i", SRC,
                "-loop", "1", "-t", str(dur), "-i", f"{D}/mask.png",
                "-loop", "1", "-t", str(dur), "-i", f"{D}/cap_{name}_{k}.png"]
        pre, ov = slide("3:v", "cap", 0.2, 30)
        fc = (f"[1:v]fps=30,crop=600:1080:660:0,scale={W}:{H},format=rgba[ph];"
              f"[2:v]scale={W}:{H},format=gray[m];[ph][m]alphamerge[phm];"
              f"[0:v][phm]overlay={f['px']}:{f['py']}[b];" + pre +
              f"[b][capf]{ov}[s]")
        last = "s"
    run(args + ["-filter_complex", fc, "-map", f"[{last}]", "-t", str(dur)] + ENC + [out])
    return out


def build(k):
    segs = [scene(n, kind, d, s, k) for n, kind, d, s in SCENES]
    args = []
    for s in segs:
        args += ["-i", s]
    fc, last, off = "", "0:v", 0.0
    for i in range(1, len(segs)):
        off += SCENES[i - 1][2] - XF
        fc += f"[{last}][{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[x{i}];"
        last = f"x{i}"
    total = sum(s[2] for s in SCENES) - XF * (len(SCENES) - 1)
    n = len(segs)
    fc += (f"[{n}:a]atrim=0:{total:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.3,"
           f"afade=t=out:st={total - 2.5:.3f}:d=2.5[a]")
    out = f"{D}/../../salaflow-lancio-{'16x9' if k == 'h' else '9x16'}.mp4"
    run(args + ["-i", SRC, "-filter_complex", fc, "-map", f"[{last}]", "-map", "[a]"] + ENC +
        ["-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-t", f"{total:.3f}", out])
    print(out, f"{total:.2f}s")


for k in sys.argv[1:] or ["h", "v"]:
    build(k)
