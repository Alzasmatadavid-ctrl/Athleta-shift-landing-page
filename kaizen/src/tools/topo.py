"""Genera curvas de nivel (mapa topográfico) como trazados SVG compactos.
Uso: python3 topo.py <salida.svgpaths> <previa.png>"""
import sys, math, random
from PIL import Image, ImageDraw

W, H = 1200, 800
NX, NY = 150, 100
random.seed(7)

# Relieve: una cumbre principal, dos secundarias y ondulación suave
peaks = [(0.70, 0.40, 0.22, 1.00), (0.30, 0.62, 0.18, 0.62), (0.18, 0.22, 0.14, 0.45), (0.92, 0.86, 0.16, 0.40)]


def height(u, v):
    z = 0.0
    for (px, py, s, a) in peaks:
        d2 = ((u - px) * 1.5) ** 2 + (v - py) ** 2
        z += a * math.exp(-d2 / (2 * s * s))
    z += 0.05 * math.sin(u * 9.0 + 1.3) * math.cos(v * 7.0 - 0.6) + 0.035 * math.sin(u * 17.0 + v * 13.0)
    return z


grid = [[height(i / NX, j / NY) for i in range(NX + 1)] for j in range(NY + 1)]
zmax = max(max(r) for r in grid)
levels = [zmax * t for t in (0.10, 0.18, 0.27, 0.36, 0.46, 0.56, 0.66, 0.76, 0.86, 0.94)]
sx, sy = W / NX, H / NY


def lerp(p, q, a, b, lv):
    t = (lv - a) / (b - a) if b != a else 0.5
    return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)


def segments(lv):
    segs = []
    for j in range(NY):
        for i in range(NX):
            a, b, c, d = grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]
            pa, pb, pc, pd = (i * sx, j * sy), ((i + 1) * sx, j * sy), ((i + 1) * sx, (j + 1) * sy), (i * sx, (j + 1) * sy)
            idx = (a > lv) | ((b > lv) << 1) | ((c > lv) << 2) | ((d > lv) << 3)
            if idx in (0, 15):
                continue
            top = lambda: lerp(pa, pb, a, b, lv)
            right = lambda: lerp(pb, pc, b, c, lv)
            bottom = lambda: lerp(pd, pc, d, c, lv)
            left = lambda: lerp(pa, pd, a, d, lv)
            table = {1: [(left, top)], 2: [(top, right)], 3: [(left, right)], 4: [(right, bottom)], 5: [(left, top), (right, bottom)],
                     6: [(top, bottom)], 7: [(left, bottom)], 8: [(left, bottom)], 9: [(top, bottom)], 10: [(top, right), (left, bottom)],
                     11: [(right, bottom)], 12: [(left, right)], 13: [(top, right)], 14: [(left, top)]}
            for f, g in table[idx]:
                segs.append((f(), g()))
    return segs


def stitch(segs):
    key = lambda p: (round(p[0], 3), round(p[1], 3))
    ends = {}
    for n, (p, q) in enumerate(segs):
        ends.setdefault(key(p), []).append(n); ends.setdefault(key(q), []).append(n)
    used = [False] * len(segs); lines = []
    for n in range(len(segs)):
        if used[n]:
            continue
        used[n] = True
        line = [segs[n][0], segs[n][1]]
        for direction in (1, 0):
            while True:
                tip = line[-1] if direction else line[0]
                nxt = [m for m in ends.get(key(tip), []) if not used[m]]
                if not nxt:
                    break
                m = nxt[0]; used[m] = True
                p, q = segs[m]
                other = q if key(p) == key(tip) else p
                if direction:
                    line.append(other)
                else:
                    line.insert(0, other)
        lines.append(line)
    return lines


def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / L
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]


sys.setrecursionlimit(10000)
paths = []; total = 0
img = Image.new('RGB', (W, H), (5, 7, 13)); dr = ImageDraw.Draw(img)
mid = lambda a, b: ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
EPS = 1.5
for li, lv in enumerate(levels):
    for line in stitch(segments(lv)):
        if len(line) < 14:
            continue
        closed = math.hypot(line[0][0] - line[-1][0], line[0][1] - line[-1][1]) < 1.0
        if closed:
            line = line[:-1]
            m = len(line) // 2
            pts = rdp(line[:m + 1], EPS)[:-1] + rdp(line[m:] + [line[0]], EPS)[:-1]
        else:
            pts = rdp(line, EPS)
        if len(pts) < 4:
            continue
        total += len(pts)
        n = len(pts)
        if closed:
            d = 'M%d %d' % mid(pts[0], pts[1])
            for i in range(1, n + 1):
                a, b = pts[i % n], pts[(i + 1) % n]
                d += 'Q%d %d %d %d' % (a[0], a[1], *mid(a, b))
            d += 'Z'
        else:
            d = 'M%d %d' % pts[0]
            for i in range(1, n - 1):
                d += 'Q%d %d %d %d' % (pts[i][0], pts[i][1], *mid(pts[i], pts[i + 1]))
            d += 'L%d %d' % pts[-1]
        paths.append((li, d))
        dr.line([(x, y) for x, y in pts] + ([pts[0]] if closed else []), fill=(150, 180, 255) if li % 3 == 0 else (90, 120, 200), width=1)
out = ''.join('<path%s d="%s"/>' % (' class="hi"' if li % 3 == 0 else '', d) for li, d in paths)
open(sys.argv[1], 'w').write(out)
img.save(sys.argv[2])
print('paths', len(paths), 'points', total, 'bytes', len(out))
