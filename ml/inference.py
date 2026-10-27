"""
inference.py — Post-Disaster Building Damage Assessment
Single-entry inference module for backend integration.

Pipeline:  SegFormer-B0 (building localization) -> Siamese ResNet-18 (damage class)
Entry point the backend calls:  predict(pre_path, post_path, seg, sia)

Usage (e.g. inside a FastAPI worker):
    from inference import load_models, predict, predict_geojson
    seg, sia = load_models("models/segformer_localization_best",
                           "models/siamese_damage_best.pth", device="cpu")
    geojson = predict_geojson("pre.png", "post.png", seg, sia)   # dict -> JSON response
"""
import json
import numpy as np, cv2, torch, torch.nn as nn
from torchvision import models as tvmodels
from transformers import SegformerForSemanticSegmentation
from shapely.geometry import Polygon, mapping

IMG_SIZE = 512          # SegFormer input size
PATCH    = 96           # per-building patch size for the Siamese net
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD  = np.array([0.229, 0.224, 0.225], np.float32)
DNAMES = {1: "no-damage", 2: "minor", 3: "major", 4: "destroyed"}


class SiameseDamage(nn.Module):
    """Shared ResNet-18 encoder; compares pre/post patches via [fa, fb, |fa-fb|]."""
    def __init__(self, n=4):
        super().__init__()
        enc = tvmodels.resnet18(weights=None)        # weights=None: we load trained .pth
        self.encoder = nn.Sequential(*list(enc.children())[:-1])
        self.head = nn.Sequential(
            nn.Linear(512 * 3, 256), nn.ReLU(), nn.Dropout(0.3), nn.Linear(256, n))

    def forward(self, pre, post):
        fa = self.encoder(pre).flatten(1)
        fb = self.encoder(post).flatten(1)
        return self.head(torch.cat([fa, fb, torch.abs(fa - fb)], 1))


def load_models(seg_path, sia_path, device=None):
    """Load both trained models once at startup; reuse the objects for every request."""
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    seg = SegformerForSemanticSegmentation.from_pretrained(seg_path).to(device).eval()
    sia = SiameseDamage().to(device)
    sia.load_state_dict(torch.load(sia_path, map_location=device))
    sia.eval()
    return seg, sia


def _norm_tensor(img_rgb, size, device):
    x = cv2.resize(img_rgb, (size, size)).astype(np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)
    return torch.from_numpy(x).unsqueeze(0).float().to(device)


def predict(pre_path, post_path, seg, sia, min_area=40, device=None):
    """
    Run the full two-stage pipeline on one pre/post image pair.
    Returns: (geojson_dict, post_image_bgr, building_contours)
      - geojson_dict : FeatureCollection, one Feature per building (pixel coords)
      - post_image_bgr : the post-disaster image (for overlays/heatmaps)
      - building_contours : list of cv2 contours (for the severity heatmap)
    """
    device = device or next(sia.parameters()).device
    pre_bgr, post_bgr = cv2.imread(pre_path), cv2.imread(post_path)
    pre_rgb  = cv2.cvtColor(pre_bgr,  cv2.COLOR_BGR2RGB)
    post_rgb = cv2.cvtColor(post_bgr, cv2.COLOR_BGR2RGB)

    # Stage 1: SegFormer building mask
    inp = _norm_tensor(pre_rgb, IMG_SIZE, device)
    with torch.no_grad():
        logits = seg(pixel_values=inp).logits
        up = nn.functional.interpolate(logits, size=(1024, 1024),
                                       mode="bilinear", align_corners=False)
        binmask = (up.argmax(1)[0].cpu().numpy() == 1).astype(np.uint8)

    cnts, _ = cv2.findContours(binmask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    buildings = [c for c in cnts if cv2.contourArea(c) >= min_area]

    feats, kept = [], []
    for c in buildings:
        x, y, w, h = cv2.boundingRect(c)

        def crop(img):
            p = img[max(0, y - 8):y + h + 8, max(0, x - 8):x + w + 8]
            if p.size == 0:
                p = np.zeros((PATCH, PATCH, 3), np.uint8)
            return _norm_tensor(p, PATCH, device)

        # Stage 2: Siamese damage class
        with torch.no_grad():
            cls = sia(crop(pre_rgb), crop(post_rgb)).argmax(1).item() + 1
        if len(c) < 4:
            continue
        poly = Polygon(c.reshape(-1, 2))
        if not poly.is_valid:
            continue
        feats.append({"type": "Feature", "geometry": mapping(poly),
                      "properties": {"damage": int(cls), "damage_name": DNAMES[cls]}})
        kept.append(c)

    return {"type": "FeatureCollection", "features": feats}, post_bgr, kept


def predict_geojson(pre_path, post_path, seg, sia, **kw):
    """Convenience: return only the GeoJSON dict (what an API endpoint serves)."""
    gj, _, _ = predict(pre_path, post_path, seg, sia, **kw)
    return gj


if __name__ == "__main__":
    import sys
    seg, sia = load_models(sys.argv[1], sys.argv[2])      # seg_dir  sia.pth
    gj, _, _ = predict(sys.argv[3], sys.argv[4], seg, sia)  # pre.png  post.png
    print("buildings detected:", len(gj["features"]))
    print(json.dumps(gj)[:300], "...")
