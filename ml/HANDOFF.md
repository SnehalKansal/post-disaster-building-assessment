# Model handoff — Building Damage Assessment (ML → Backend)

## 1. Files you need from me
- `models/segformer_localization_best/`  (folder: config.json + model.safetensors)
- `models/siamese_damage_best.pth`
- `inference.py`, `requirements.txt`  (this package)

Get the weights off Kaggle: Save Version → open the version's **Output** tab →
download the files, OR I publish them as a Kaggle **Dataset** and add you as collaborator.
(Weights are tens of MB — use Git LFS or a shared drive, not a plain git commit.)

## 2. Install
    pip install -r requirements.txt

## 3. The interface (one function, no ML knowledge needed)
    from inference import load_models, predict_geojson

    # once, at app startup:
    seg, sia = load_models("models/segformer_localization_best",
                           "models/siamese_damage_best.pth", device="cpu")  # or "cuda"

    # per request:
    geojson = predict_geojson(pre_path, post_path, seg, sia)
    # -> {"type":"FeatureCollection","features":[{geometry, properties:{damage, damage_name}}, ...]}

`predict(...)` returns `(geojson, post_image, building_contours)` if you also want the
post image and contours (e.g. to render the severity heatmap).

## 4. FastAPI sketch
    from fastapi import FastAPI
    from inference import load_models, predict_geojson
    app = FastAPI()
    seg, sia = load_models("models/segformer_localization_best",
                           "models/siamese_damage_best.pth", device="cpu")

    @app.post("/analyze")
    def analyze(pre_path: str, post_path: str):
        return predict_geojson(pre_path, post_path, seg, sia)

Load the models ONCE at startup (not per request). Run heavy calls on the
Celery/GPU worker, not in the web request, as in our architecture.

## 5. Things to know
- Output polygons are in **pixel coordinates**, not lat/long yet (geo-referencing is the next step).
- Input images: pre/post pair, same scene, 1024x1024 (xBD tile size).
- damage: 1=no-damage, 2=minor, 3=major, 4=destroyed.
- CPU works; GPU is faster. First call is slow (model load / warm-up).
