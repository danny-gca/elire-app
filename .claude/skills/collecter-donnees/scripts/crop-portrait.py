# Recadre un portrait en carré 512 px centré sur le visage, JPEG qualité 82.
# Prérequis : pip install "opencv-python-headless<5" pillow (dans un venv).
# Usage : python crop-portrait.py <photo-source> assets/images/candidates/<id>.jpg
import sys

import cv2
from PIL import Image, ImageOps

src, out = sys.argv[1], sys.argv[2]
im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
W, H = im.size
gray = cv2.cvtColor(cv2.imread(src), cv2.COLOR_BGR2GRAY)
casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
faces = casc.detectMultiScale(gray, 1.1, 6, minSize=(W // 12, W // 12))
if len(faces):
    x, y, w, h = max(faces, key=lambda r: r[2] * r[3])
    side = min(int(w * 2.8), W, H)
    cx, cy = x + w / 2, y + h * 0.55
else:
    print('Aucun visage détecté : carré centré en haut, à vérifier à l\'œil.')
    side = min(W, H)
    cx, cy = W / 2, side / 2
left = int(min(max(cx - side / 2, 0), W - side))
top = int(min(max(cy - side / 2, 0), H - side))
crop = im.crop((left, top, left + side, top + side)).resize((min(512, side),) * 2, Image.LANCZOS)
crop.save(out, 'JPEG', quality=82, optimize=True, progressive=True)
print(out, crop.size)
