# AI-Powered Post-Disaster Building Damage Assessment

A web application that assesses building damage after natural disasters from
paired pre- and post-disaster satellite imagery, using a two-stage
SegFormer–Siamese deep learning pipeline.

## Overview

Natural disasters can damage thousands of buildings in minutes, and manual
photo-interpretation at that scale is too slow for disaster-response timelines.
This system automates the initial assessment by comparing imagery captured
before and after an event.

Given a pre/post image pair, the system:

1. Localizes every building footprint in the pre-disaster image.
2. Crops the aligned pre- and post-disaster patch of each building.
3. Classifies each building into one of four damage levels.
4. Produces building-level GeoJSON, a damage map, a severity heatmap, and
   ranked priority zones.

Outputs are a **preliminary** assessment intended to support response planning.
They should be confirmed by a human reviewer before use in life-critical
decisions.

---

## Architecture

```text
   PRE-DISASTER IMAGE          POST-DISASTER IMAGE
            |                           |
            v                           |
  +---------------------+               |
  | Stage 1             |               |
  | SegFormer-B0        |               |
  | building mask       |               |
  +----------+----------+               |
             |                          |
             v                          |
  +---------------------+               |
  | Contour extraction  |               |
  | -> polygons + boxes |               |
  +----------+----------+               |
             |                          |
             +------------+-------------+
                          v
             +-------------------------+
             | Stage 2                 |
             | Siamese ResNet-18       |
             | [f_pre; f_post; |diff|] |
             | -> 4-class damage       |
             +------------+------------+
                          |
                          v
             +-------------------------+
             | Severity heatmap        |
             | Priority zones          |
             +------------+------------+
                          |
                          v
             +-------------------------+
             | FastAPI + PostgreSQL /  |
             | PostGIS  (async jobs)   |
             +------------+------------+
                          |
                          v
             +-------------------------+
             | React + Leaflet         |
             +------------+------------+
                          |
     +--------------+-----+------+--------------+
     v              v            v              v
 Damage map     Heatmap    Priority zones   GeoJSON export
```

**Stage 1** — SegFormer-B0 (MiT-B0 encoder, ~3.7M parameters) segments
buildings in the pre-disaster image at 512x512; the mask is upsampled to the
source resolution and converted to polygons via contour extraction.

**Stage 2** — a shared-weight ResNet-18 encoder embeds each building's aligned
96x96 pre/post patch pair into two 512-d vectors, fused as
`[f_pre ; f_post ; |f_pre - f_post|]` and classified by an MLP head into
**No Damage / Minor / Major / Destroyed**, with a softmax confidence.

Trained on 9,168 xBD image pairs (304,370 buildings): localization reaches
**0.7292 IoU / 0.8056 F1**, and the imbalance-aware classifier **0.716 macro-F1**.

---

## Project layout

```
ml/                      Trained models + the ML team's inference deliverable
  inference.py           Reference two-stage implementation (load_models/predict)
  models/                Checkpoints (not in git - see "Model weights")
backend/
  app/ml/                Model runtime + batched pipeline with confidence
  app/services/          Assessment orchestration, geospatial outputs, reporting
  app/models/            SQLAlchemy / PostGIS tables
  app/api/router.py      REST endpoints
frontend/
  src/components/        DamageMap (Leaflet, pixel CRS)
  src/pages/             Upload (pre/post + job polling), Dashboard (workspace)
```

---

## Setup

### 1. Database

Requires PostgreSQL with the PostGIS extension.

```bash
createdb damage_assessment
psql -d damage_assessment -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`.

### 2. Model weights

The checkpoints are tens of megabytes and are **not committed to git**. Place
them so the tree looks like:

```
ml/models/segformer_localization_best/config.json
ml/models/segformer_localization_best/model.safetensors
ml/models/siamese_damage_best.pth
```

Override the location with `MODEL_DIR` in `backend/.env` if needed.
`GET /api/v1/model/status` reports whether they were found and loaded.

### 3. Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python scripts/create_tables.py
uvicorn app.main:app --reload --port 8000
```

Models are loaded once at startup. Interactive API docs: http://localhost:8000/docs

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the printed URL (http://localhost:5173, or 5174 if that port is taken).

---

## How it runs

Uploading a pair creates an `analysis_jobs` row and returns `202` immediately.
Inference runs in a background task so the request never blocks, moving through
`Queued → Processing → Completed` (or `Failed`, with the error recorded). The
upload page polls the job and redirects to the workspace when it finishes.

Results are persisted to PostGIS: one `buildings` row per footprint with its
damage class and confidence, plus ranked `priority_zones`.

---

## Features

- Pre/post image-pair upload with validation
- Asynchronous jobs with live progress
- Building detection and 4-class damage classification with confidence
- Interactive Leaflet map: footprints, severity heatmap, priority-zone overlays
- Per-class layer filtering and click-through building inspection
- Damage statistics and cross-assessment analytics
- GeoJSON export

## Current limitations

- **Outputs are in pixel coordinates, not longitude/latitude.** Geo-referencing
  via the GeoTIFF affine transform is the next step, so the `buildings.geometry`
  and `priority_zones.geometry` (EPSG:4326) columns stay `NULL` and the pixel
  geometry is stored in `geometry_pixel` (SRID 0) instead.
- Optical-only: cloud cover can obscure a scene.
- Minor and major damage are the most frequently confused classes.
- Stage 2 was trained on ground-truth crops, so Stage 1 localization errors can
  propagate at inference; no end-to-end combined score is computed.
- Latency has not been validated on areas above 100 km².
