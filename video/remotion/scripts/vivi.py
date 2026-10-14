# Living stills for the cartoon: brings the ChatGPT images (public/clips/nuove) to life without AI-video credits.
# Every image has a "rig": soft-edged regions (a head, a hand, the notebook…) that rotate, squash and bob on the beat
# of the swing track (120 BPM: one beat every 15 frames at 30 fps, beat on frame 0 of every clip).
# The image is warped frame by frame and saved as public/clips/vivi/nuova-XX.mp4; points that overlays have to
# follow (the phone screens, the lamp) are saved per frame in src/cartoon/vivi.json.
# Clip lengths come from the durations in src/cartoon/script.ts: after changing them, run this again.
# Usage: python3 scripts/vivi.py [11 16 …]   (no arguments: every image)
import json, math, os, re, subprocess, sys
import cv2
import numpy as np

FF = os.environ.get('FF', '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public/clips/nuove')
OUT = os.path.join(ROOT, 'public/clips/vivi')
SEG = os.path.join(ROOT, 'scripts/vivi')  # foreground masks (GrabCut), for the parallax
FPS, BEAT = 30, 15
W, H = 1672, 941
OH = 940  # H.264 wants even sizes

# which shot shows which image
SHOT = {'c11': '11', 'c16': '16', 'c17': '17', 'c18': '18', 'c19': '19', 'c20': '20', 'c21': '21', 'c22': '22',
        'c23': '23', 'c24': '24', 'c27': '27', 'c28': '28', 'c28b': '29', 'c29': '30'}


# ---------- masks ----------
def ell(cx, cy, rx, ry, a=0):
    m = np.zeros((H, W), np.float32)
    cv2.ellipse(m, (int(cx), int(cy)), (int(rx), int(ry)), a, 0, 360, 1, -1)
    return m


def poly(*pts):
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 1)
    return m


def near(m, px):  # the mask grown by px pixels
    return cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * px + 1, 2 * px + 1)))


def seg(n):
    return (cv2.imread(os.path.join(SEG, f'fg-{n}.png'), cv2.IMREAD_GRAYSCALE) > 127).astype(np.float32)


# ---------- motion helpers (b = beats, s = seconds) ----------
TAU = 2 * math.pi
def sq(b, a, ph=0.0):  # squash on the beat, stretch in between (feet on the floor)
    c = math.cos(TAU * (b + ph))
    return dict(sx=1 + 0.6 * a * c, sy=1 - a * c)
def hop(b, h, ph=0.0):  # lands on the beat
    return -h * abs(math.sin(math.pi * (b + ph)))
def ss(x, a, b):  # smoothstep
    t = min(1, max(0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)
def talk(s, t0, t1):  # mouth flapping while the line is spoken
    if s < t0 or s > t1:
        return 0.0
    env = ss(s, t0, t0 + 0.08) * (1 - ss(s, t1 - 0.08, t1))
    return env * (0.5 - 0.5 * math.cos(TAU * 5.2 * (s - t0))) * (0.65 + 0.35 * math.sin(TAU * 1.7 * s))


class Part:
    """A soft-edged region moved by fn(f, b, s, n) -> dict(r=deg, sx, sy, tx, ty) around pivot.
    kind 'wave': fn returns dict(a=px, k=rad/px, w=rad) for a sideways ripple along y (paper in the wind).
    kind 'radial': fn returns dict(a=px, l=px, w=rad) for rings rippling out from pivot."""
    def __init__(self, mask, fn, pivot=(0, 0), feather=24, kind='affine'):
        self.kind, self.fn, self.pivot = kind, fn, np.array(pivot, np.float32)
        m = cv2.GaussianBlur(mask, (0, 0), feather / 2) if feather else mask
        self.mask = np.clip(m, 0, 1).astype(np.float32)
        ys, xs = np.nonzero(self.mask > 0.003)
        pad = 80
        self.box = (max(0, xs.min() - pad), max(0, ys.min() - pad), min(W, xs.max() + pad + 1), min(H, ys.max() + pad + 1))

    def params(self, f, n):
        d = dict(r=0.0, sx=1.0, sy=1.0, tx=0.0, ty=0.0)
        d.update(self.fn(f, f / BEAT, f / FPS, n))
        return d

    def inverse(self, x, y, p):
        if self.kind == 'wave':
            return x - p['a'] * np.sin(p['k'] * y - p['w']), y
        if self.kind == 'radial':
            dx, dy = x - self.pivot[0], y - self.pivot[1]
            r = np.sqrt(dx * dx + dy * dy) + 1e-3
            d = p['a'] * np.sin(TAU * r / p['l'] - p['w'])
            return x - d * dx / r, y - d * dy / r
        cx, cy = self.pivot
        th = math.radians(p['r'])
        u, v = x - p['tx'] - cx, y - p['ty'] - cy
        c, s = math.cos(-th), math.sin(-th)
        return cx + (c * u - s * v) / p['sx'], cy + (s * u + c * v) / p['sy']

    def forward(self, pt, p):
        if self.kind != 'affine':
            return pt
        cx, cy = self.pivot
        th = math.radians(p['r'])
        u, v = (pt[0] - cx) * p['sx'], (pt[1] - cy) * p['sy']
        c, s = math.cos(th), math.sin(th)
        return np.array([cx + c * u - s * v + p['tx'], cy + s * u + c * v + p['ty']])


def mask_at(m, x, y):
    xi, yi = int(round(min(W - 1, max(0, x)))), int(round(min(H - 1, max(0, y))))
    return float(m[yi, xi])


# ---------- rigs: coordinates are pixels of the 1672×941 images; parts go from the outside in ----------
def rig(n):
    P = Part
    if n == '11':  # six customers squeezed around a table for four
        return [
            P(ell(320, 470, 255, 345), lambda f, b, s, N: dict(r=1.6 * math.sin(math.pi * b), tx=6 * math.sin(math.pi * b)), (300, 790), 40),
            P(ell(360, 230, 150, 120), lambda f, b, s, N: dict(r=3 * math.sin(TAU * b), ty=hop(b, 5)), (340, 330)),
            P(ell(920, 450, 420, 320), lambda f, b, s, N: dict(sx=1 - 0.02 * (0.5 - 0.5 * math.cos(TAU * b)), sy=1 + 0.018 * (0.5 - 0.5 * math.cos(TAU * b))), (900, 620), 50),
            P(ell(1107, 240, 120, 170), lambda f, b, s, N: dict(r=2.5 * math.sin(TAU * b + 1)), (1110, 420)),
            P(ell(1313, 150, 95, 42), lambda f, b, s, N: dict(r=6 * math.sin(math.pi * b + 0.3)), (1300, 210), 16),
            P(ell(1440, 500, 160, 300), lambda f, b, s, N: dict(r=-2.5 * (0.5 - 0.5 * math.cos(TAU * b)), sx=1 - 0.02 * (0.5 - 0.5 * math.cos(TAU * b))), (1450, 780)),
            P(ell(1393, 835, 70, 105), lambda f, b, s, N: dict(r=3.5 * math.sin(TAU * 2 * b)), (1393, 930), 16),
        ], {}
    if n == '16':  # the endless receipt at closing time
        return [
            P(ell(400, 70, 125, 85), lambda f, b, s, N: dict(r=2.2 * math.sin(TAU * s / 2.4)), (400, -160), 20),
            P(ell(740, 380, 105, 75), lambda f, b, s, N: dict(ty=2 * math.sin(TAU * 2 * b)), (740, 440), 16),
            P(ell(725, 300, 85, 55), lambda f, b, s, N: dict(tx=7 * math.cos(TAU * b), ty=7 * math.sin(TAU * b)), (725, 300), 20),
            P(ell(507, 262, 150, 135), lambda f, b, s, N: dict(r=3 * math.sin(TAU * s / 1.7) + 4 * f / N, ty=5 * f / N), (520, 385)),
            P(poly((790, 318), (852, 308), (910, 560), (912, 790), (818, 800), (796, 560)), lambda f, b, s, N: dict(a=5, k=TAU / 190, w=TAU * 1.3 * s), (0, 0), 14, 'wave'),
            P(ell(237, 350, 100, 105), lambda f, b, s, N: dict(sy=1 + 0.035 * math.sin(TAU * s / 1.8), sx=1 - 0.015 * math.sin(TAU * s / 1.8)), (237, 440)),
        ], {'lampada': [(400, 115)]}
    if n == '17':  # the morning after
        q = lambda ph: (lambda f, b, s, N: dict(ty=-8 * math.sin(math.pi * b + ph), r=8 * math.sin(math.pi * b + ph + 1)))
        return [
            P(ell(640, 375, 228, 188), lambda f, b, s, N: dict(r=2.5 * math.sin(TAU * s / 2.6)), (660, 520)),
            P(ell(880, 513, 62, 56), lambda f, b, s, N: dict(ty=-4 * math.sin(TAU * s / 1.6)), (900, 560), 18),
            P(ell(1080, 580, 128, 122), lambda f, b, s, N: dict(r=2.2 * math.sin(math.pi * b + 1.5)), (1080, 690)),
            P(ell(653, 140, 48, 62), q(0), (653, 140), 14),
            P(ell(787, 127, 52, 66), q(2.1), (787, 127), 14),
            P(ell(853, 200, 48, 60), q(4.2), (853, 200), 14),
        ], {}
    if n == '18':  # the three dancing question marks
        return [
            P(ell(427, 520, 150, 295), lambda f, b, s, N: dict(r=3 * math.sin(math.pi * b), **sq(b, 0.03)), (420, 770), 30),
            P(ell(177, 380, 100, 135), lambda f, b, s, N: dict(r=8 * math.sin(math.pi * b)), (230, 290), 20),
            P(ell(867, 507, 150, 285), lambda f, b, s, N: dict(r=-3 * math.sin(math.pi * b), **sq(b, 0.03, 0.5)), (880, 770), 30),
            P(poly((650, 280), (725, 268), (805, 420), (785, 700), (705, 875), (565, 865), (600, 700), (690, 520)), lambda f, b, s, N: dict(a=4, k=TAU / 170, w=TAU * 1.5 * s), (0, 0), 14, 'wave'),
            P(ell(1267, 520, 155, 295), lambda f, b, s, N: dict(r=3 * math.sin(math.pi * b), **sq(b, 0.03)), (1260, 770), 30),
            P(ell(1480, 373, 95, 80), lambda f, b, s, N: dict(r=5 * math.sin(TAU * b)), (1410, 400), 18),
            P(ell(1590, 200, 62, 56), lambda f, b, s, N: dict(sx=1 - 0.3 * abs(math.sin(TAU * 3 * s)), ty=-7 * math.sin(TAU * s), tx=5 * math.sin(TAU * 0.7 * s)), (1590, 200), 12),
        ], {}
    if n == '19':  # the notebook shrugs: "boh"
        sh = lambda b: math.sin(math.pi * b / 2) ** 2
        return [
            P(ell(700, 490, 225, 300), lambda f, b, s, N: dict(sy=1 + 0.03 * sh(b), sx=1 - 0.012 * sh(b)), (720, 790), 30),
            P(ell(733, 363, 110, 36), lambda f, b, s, N: dict(ty=-7 * sh(b)), (733, 363), 14),
            P(ell(417, 470, 100, 88), lambda f, b, s, N: dict(ty=-18 * sh(b), r=-9 * sh(b)), (500, 520), 20),
            P(ell(1027, 460, 100, 88), lambda f, b, s, N: dict(ty=-18 * sh(b), r=9 * sh(b)), (940, 510), 20),
        ], {}
    if n == '20':  # the propaganda poster (the writing on the ribbon is added in the video)
        return [
            P(ell(793, 590, 215, 265), lambda f, b, s, N: dict(r=1.5 * math.sin(math.pi * b), **sq(b, 0.02)), (840, 830), 30),
            P(ell(1060, 470, 78, 98), lambda f, b, s, N: dict(ty=hop(b, 10), r=6 * math.sin(TAU * b)), (1000, 540), 18),
        ], {}
    if n == '21':  # grandpa: "it's always been done this way"
        return [
            P(ell(1020, 630, 225, 300), lambda f, b, s, N: sq(b, 0.015), (1060, 905), 30),
            P(ell(1007, 427, 142, 102), lambda f, b, s, N: dict(r=2.5 * math.sin(TAU * b + 0.5)), (1010, 530)),
            P(ell(967, 497, 58, 32), lambda f, b, s, N: dict(sy=1 + 0.14 * talk(s, 0.1, N / FPS)), (967, 475), 12),
            P(ell(833, 463, 68, 92), lambda f, b, s, N: dict(r=11 * math.sin(TAU * b)), (850, 540), 18),
            P(ell(507, 287, 142, 122), lambda f, b, s, N: dict(r=2 * math.sin(math.pi * b), ty=5 * max(0, math.sin(math.pi * b))), (500, 400)),
            P(ell(553, 453, 82, 62), lambda f, b, s, N: dict(r=3 * math.sin(TAU * b)), (553, 480), 16),
        ], {}
    if n == '22':  # chaos
        parts = [
            P(ell(800, 507, 270, 310), lambda f, b, s, N: dict(r=6 * math.sin(TAU * b), ty=hop(b, 6)), (800, 800), 36),
            P(ell(793, 300, 142, 112), lambda f, b, s, N: dict(r=6 * math.sin(TAU * 2 * b)), (800, 400)),
            P(ell(320, 693, 122, 115), lambda f, b, s, N: dict(ty=hop(2 * b, 14), r=4 * math.sin(TAU * 2 * b)), (320, 790), 20),
            P(ell(1340, 660, 108, 115), lambda f, b, s, N: dict(ty=hop(2 * b, 14, 0.5), r=4 * math.sin(TAU * 2 * b + 1)), (1340, 770), 20),
            P(ell(1240, 400, 188, 200), lambda f, b, s, N: dict(r=3 * math.sin(TAU * b + 1)), (1150, 560)),
            P(ell(1340, 140, 112, 72), lambda f, b, s, N: dict(r=6 * math.sin(TAU * 2 * b)), (1340, 200), 18),
            P(ell(200, 360, 215, 188), lambda f, b, s, N: dict(r=3 * math.sin(TAU * 2 * b + 0.7)), (200, 520)),
            P(ell(1560, 693, 110, 160), lambda f, b, s, N: dict(r=2 * math.sin(TAU * 2 * b + 2)), (1560, 840)),
        ]
        flying = [(820, 120), (987, 220), (527, 273), (520, 493), (1093, 593), (633, 767), (933, 140), (573, 567), (707, 113), (540, 360), (1027, 467), (653, 667)]
        for i, (x, y) in enumerate(flying):
            ph = i * 0.9
            parts.append(P(ell(x, y, 52, 48), (lambda ph: lambda f, b, s, N: dict(tx=11 * math.cos(TAU * 1.6 * s + ph), ty=11 * math.sin(TAU * 1.6 * s + ph), r=14 * math.sin(TAU * 1.6 * s + ph)))(ph), (x, y), 16))
        return parts, {}
    if n == '23':  # hypnotised: spinning eyes, rippling rings
        bg = 1 - seg('23')
        return [
            P(bg, lambda f, b, s, N: dict(a=6, l=150, w=TAU * 1.1 * s), (795, 330), 10, 'radial'),
            P(seg('23'), lambda f, b, s, N: dict(r=1.4 * math.sin(TAU * s / 2.2 + 0.5)), (760, 940), 10),
            P(ell(747, 333, 255, 228), lambda f, b, s, N: dict(r=3 * math.sin(TAU * s / 2.2)), (760, 500)),
            P(ell(953, 560, 150, 160), lambda f, b, s, N: dict(r=2 * math.sin(TAU * b)), (950, 700)),
        ], {'occhi': [(820.5, 216.4), (730.7, 257.8)]}  # the spinning spirals are drawn over the eyes in the video
    if n == '24':  # colour! "look here"
        fg = seg('24')
        right = ell(1090, 560, 300, 420)
        return [
            P(1 - fg, lambda f, b, s, N: dict(tx=-12 * (f / N - 0.5)), (0, 0), 8),
            P(fg * right, lambda f, b, s, N: sq(b, 0.012), (1090, 925), 10),
            P(fg * ell(520, 520, 330, 380), lambda f, b, s, N: dict(r=2.2 * ss(s, 0.1, 0.8), **sq(b, 0.01, 0.5)), (520, 860), 10),
            P(ell(560, 333, 188, 160), lambda f, b, s, N: dict(r=3 * math.sin(TAU * s / 1.2)), (540, 450)),
            P(ell(433, 540, 108, 130), lambda f, b, s, N: dict(r=3 * math.sin(TAU * b + 2)), (450, 640), 18),
            P(ell(1027, 347, 160, 148), lambda f, b, s, N: dict(r=2 * math.sin(TAU * b + 1)), (1020, 460)),
            P(ell(990, 445, 30, 22), lambda f, b, s, N: dict(sy=1 + 0.18 * talk(s, 0.05, 0.9)), (990, 430), 8),
            P(poly((1100, 480), (1150, 330), (1160, 70), (1410, 50), (1420, 360), (1250, 430), (1195, 490)), lambda f, b, s, N: dict(r=3 * math.sin(TAU * b) * (0.4 + 0.6 * math.exp(-s * 1.5))), (1130, 450), 22),
        ], {'schermo': SCREENS['24']}
    if n == '27':  # "and the notebook?"
        fg = seg('27')
        return [
            P(1 - fg, lambda f, b, s, N: dict(tx=10 * (f / N - 0.5)), (0, 0), 8),
            P(fg, lambda f, b, s, N: dict(sy=1 + 0.01 * math.sin(TAU * s / 1.5)), (720, 941), 8),
            P(ell(687, 307, 282, 230), lambda f, b, s, N: dict(r=-2.5 * math.sin(TAU * s / 1.6)), (720, 500)),
            P(ell(807, 423, 32, 24), lambda f, b, s, N: dict(sy=1 + 0.22 * talk(s, 0.1, 1.1)), (807, 405), 8),
            P(ell(1053, 580, 200, 232), lambda f, b, s, N: dict(r=2 * math.sin(TAU * b)), (1130, 720)),
            P(ell(700, 600, 112, 120), lambda f, b, s, N: dict(ty=-4 * abs(math.sin(TAU * 2 * s))), (700, 700), 20),
        ], {}
    if n == '28':  # "keep it"
        fg = seg('28')
        sh = lambda s: ss(s, 0.05, 0.35) * (1 - ss(s, 0.95, 1.35))
        return [
            P(1 - fg, lambda f, b, s, N: dict(tx=-10 * (f / N - 0.5)), (0, 0), 8),
            P(fg * ell(853, 720, 470, 320), lambda f, b, s, N: dict(sy=1 + 0.02 * sh(s)), (853, 941), 10),
            P(ell(873, 317, 292, 262), lambda f, b, s, N: dict(r=-4 * sh(s) + 1.5 * math.sin(TAU * b), ty=-8 * sh(s)), (853, 560)),
            P(ell(830, 505, 36, 25), lambda f, b, s, N: dict(sy=1 + 0.2 * talk(s, 0.05, 0.9)), (830, 487), 8),
            P(poly((190, 410), (490, 400), (610, 700), (565, 810), (470, 810), (330, 640), (185, 560)) * near(fg, 18), lambda f, b, s, N: dict(r=5 * sh(s), ty=-10 * sh(s)), (547, 760), 30),
            P(poly((1160, 470), (1470, 480), (1470, 705), (1250, 705), (1135, 810), (1015, 810), (1045, 700)) * near(fg, 18), lambda f, b, s, N: dict(r=-5 * sh(s), ty=-10 * sh(s)), (1053, 760), 30),
        ], {}
    if n == '29':  # "for the recipes"
        return [
            P(ell(640, 287, 192, 162), lambda f, b, s, N: dict(r=2.5 * math.sin(TAU * b)), (620, 430)),
            P(ell(480, 540, 112, 122), lambda f, b, s, N: dict(tx=5 * math.cos(TAU * 3 * s), ty=4 * math.sin(TAU * 6 * s)), (420, 620), 20),
            P(ell(967, 660, 162, 162), lambda f, b, s, N: dict(r=3 * math.sin(TAU * b + 1), **sq(b, 0.02)), (967, 800)),
            P(ell(1167, 247, 182, 172), lambda f, b, s, N: dict(r=2.5 * math.sin(TAU * b + 2)), (1150, 410)),
            P(ell(973, 430, 62, 102), lambda f, b, s, N: dict(ty=hop(b, 10), r=5 * math.sin(TAU * b)), (980, 520), 18),
            P(ell(1405, 400, 115, 170), lambda f, b, s, N: dict(ty=-5 * math.sin(TAU * b), r=2 * math.sin(TAU * b)), (1380, 540), 22),
        ], {'schermo': SCREENS['29']}
    if n == '30':  # the goodbye at the door
        D = 4 / 3
        return [
            P(ell(600, 533, 255, 375), lambda f, b, s, N: sq(b, 0.015), (530, 820), 30),
            P(ell(1093, 533, 228, 348), lambda f, b, s, N: sq(b, 0.015, 0.5), (1050, 820), 30),
            P(poly(*[(x * D, y * D) for x, y in [(205, 55), (355, 55), (375, 170), (405, 250), (365, 305), (300, 255), (225, 205)]]), lambda f, b, s, N: dict(r=11 * math.sin(TAU * b)), (467, 360), 22),
            P(poly(*[(x * D, y * D) for x, y in [(865, 135), (995, 135), (1005, 245), (925, 295), (875, 335), (835, 300)]]), lambda f, b, s, N: dict(r=11 * math.sin(TAU * b + math.pi)), (1160, 427), 22),
            P(ell(853, 640, 138, 192), lambda f, b, s, N: dict(ty=hop(b, 10, 0.5), **sq(b, 0.025, 0.5)), (850, 830), 24),
            P(ell(1007, 553, 56, 56), lambda f, b, s, N: dict(r=12 * math.sin(TAU * b)), (980, 580), 14),
        ], {}
    raise SystemExit(f'no rig for {n}')


SCREENS = {  # phone screens (tl, tr, br, bl), fitted to the blank screens of the images
    '24': [(1198.3, 105.5), (1327.9, 90.5), (1321.2, 330.8), (1204.4, 340.5)],
    '29': [(1395.8, 284.9), (1485.3, 310.0), (1408.1, 506.8), (1332.3, 479.1)],
}


def durations():
    txt = open(os.path.join(ROOT, 'src/cartoon/script.ts')).read()
    return {m.group(1): float(m.group(2)) for m in re.finditer(r'id: "(c\w+)".*?dur: ([\d.]+)', txt)}


def render(n, frames):
    img = cv2.imread(os.path.join(SRC, f'nuova-{n}.jpg'))
    assert img.shape[:2] == (H, W), img.shape
    parts, track = rig(n)
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    os.makedirs(OUT, exist_ok=True)
    dst = os.path.join(OUT, f'nuova-{n}.mp4')
    enc = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{OH}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst],
                           stdin=subprocess.PIPE)
    tracks = {k: [] for k in track}
    for f in range(frames):
        qx, qy = gx.copy(), gy.copy()
        ps = [p.params(f, frames) for p in parts]
        for p, pr in zip(parts, ps):  # output -> source: outermost part first
            x0, y0, x1, y1 = p.box
            sx, sy = qx[y0:y1, x0:x1], qy[y0:y1, x0:x1]
            w = cv2.remap(p.mask, sx, sy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
            ix, iy = p.inverse(sx, sy, pr)
            sx += w * (ix - sx)
            sy += w * (iy - sy)
        frame = cv2.remap(img, qx, qy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
        enc.stdin.write(frame[:OH].tobytes())
        for k, pts in track.items():  # source -> output: innermost part first
            cur = []
            for pt in pts:
                q = np.array(pt, np.float64)
                for p, pr in reversed(list(zip(parts, ps))):
                    w = mask_at(p.mask, q[0], q[1])
                    if w > 0:
                        q = q + w * (p.forward(q, pr) - q)
                cur.append([round(float(q[0]), 1), round(float(q[1]), 1)])
            tracks[k].append(cur)
    enc.stdin.close()
    enc.wait()
    return tracks


if __name__ == '__main__':
    dur = durations()
    want = sys.argv[1:] or sorted(set(SHOT.values()))
    path = os.path.join(ROOT, 'src/cartoon/vivi.json')
    data = json.load(open(path)) if os.path.exists(path) else {}
    for n in want:
        secs = max(dur[c] for c, m in SHOT.items() if m == n)
        frames = int(math.ceil((secs + 0.6) * FPS))  # + up to a beat to line up with the music
        tr = render(n, frames)
        data[n] = {'frames': frames, **tr}
        print(f'nuova-{n}: {frames} frames', flush=True)
    json.dump(data, open(path, 'w'), separators=(',', ':'))
