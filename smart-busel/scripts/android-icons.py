"""Значки Android из resources/brand/icon.png (запуск: python3 scripts/android-icons.py).
Адаптивный значок: фон — тёмно-синий цвет логотипа, передний план — логотип 80dp из 108dp
(края квадрата уходят за маску, видна только середина — аист в шапочке)."""
from PIL import Image, ImageDraw
import os

SRC = 'resources/brand/icon.png'
RES = 'android/app/src/main/res'
BG = (16, 30, 80, 255)  # #101E50 — как края логотипа
DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}

src = Image.open(SRC).convert('RGBA')
art = src.crop(src.getbbox())

def foreground(px):
    canvas = Image.new('RGBA', (px, px), (0, 0, 0, 0))
    size = round(px * 80 / 108)
    a = art.resize((size, size), Image.LANCZOS)
    canvas.alpha_composite(a, ((px - size) // 2, (px - size) // 2))
    return canvas

def full(px):
    """Фон + передний план (как его покажет лаунчер без маски)."""
    c = Image.new('RGBA', (px, px), BG)
    c.alpha_composite(foreground(px))
    return c

def circle(img):
    mask = Image.new('L', img.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, img.size[0] - 1, img.size[1] - 1), fill=255)
    out = Image.new('RGBA', img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out

for name, k in DENS.items():
    d = f'{RES}/mipmap-{name}'
    os.makedirs(d, exist_ok=True)
    foreground(round(108 * k)).save(f'{d}/ic_launcher_foreground.png', optimize=True)
    # старые Android (до 8.0): обычный значок — логотип как есть, круглый — середина адаптивного
    art.resize((round(48 * k),) * 2, Image.LANCZOS).save(f'{d}/ic_launcher.png', optimize=True)
    big = full(round(108 * k))
    inset = round(18 * k)
    circle(big.crop((inset, inset, big.size[0] - inset, big.size[1] - inset)).resize((round(48 * k),) * 2, Image.LANCZOS)).save(f'{d}/ic_launcher_round.png', optimize=True)

# Значок для Google Play: 512×512, без прозрачности
os.makedirs('resources/android', exist_ok=True)
# видимая часть адаптивного значка (72 из 108 dp), растянутая до 512
full(768).crop((128, 128, 640, 640)).convert('RGB').save('resources/android/play-icon-512.png', optimize=True)
print('ok')
