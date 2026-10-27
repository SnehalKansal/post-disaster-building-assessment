# Frontend API Contract

Base URL: `http://localhost:8000/api/v1`

All building and zone geometry is returned in **image pixel coordinates**
(`x` = column, `y` = row, origin top-left), not longitude/latitude.
GeoTIFF geo-referencing is the next step; until then the map renders in
`L.CRS.Simple` over the post-disaster image.

---

## Submit a pre/post pair

`POST /analyze` — `multipart/form-data`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `pre_image` | JPEG / PNG / TIFF | Yes | Baseline scene |
| `post_image` | JPEG / PNG / TIFF | Yes | Same scene after the event |
| `name` | String | No | Defaults to the pre-image filename |
| `location` | String | No | Defaults to `Unknown` |
| `analysis_type` | String | No | Defaults to `building-damage` |

Returns `202 Accepted` with the queued job. Inference runs in the background;
poll `GET /jobs/{job_id}` until `status` is `Completed` or `Failed`.

Errors: `415` unsupported type, `422` undecodable or missing image,
`413` over 64 MB, `503` model weights not installed.

```json
{
  "jobId": "3c7cabe2e5dd",
  "disasterId": 1,
  "name": "Tornado test tile",
  "status": "Queued",
  "stage": "Queued",
  "progress": 0.0,
  "buildingCount": 0,
  "preImage": "/static/uploads/3c7cabe2e5dd_pre.png",
  "postImage": "/static/uploads/3c7cabe2e5dd_post.png",
  "overlayImage": null,
  "heatmapImage": null,
  "geojsonUrl": null
}
```

## Job status

`GET /jobs/{job_id}` — same envelope. `status` moves through
`Queued → Processing → Completed`, or `Failed` with `error` set.
`stage` carries a human-readable step and `progress` runs 0.0–1.0.

When complete it also carries `buildingCount`, `durationSeconds`, `device`,
`imageWidth`/`imageHeight`, and the `overlayImage` / `heatmapImage` artifact
paths (prefix with the API origin to load them).

## Assessment list

`GET /assessments` — every job, newest first, in the job envelope above.

## Assessment detail

`GET /assessments/{disaster_id}`

```json
{
  "job": { "...": "job envelope" },
  "summary": {
    "totalBuildings": 38,
    "damagedBuildings": 8,
    "criticalBuildings": 6,
    "averageConfidence": 0.9104,
    "damageDistribution": [
      { "code": 1, "label": "No Damage", "count": 30, "percentage": 78.9, "color": "#10b981" }
    ]
  },
  "zones": [
    {
      "id": "1",
      "name": "Zone 1",
      "riskTier": "Critical",
      "rank": 1,
      "severityScore": 1.75,
      "affectedBuildings": 4,
      "destroyedCount": 1,
      "majorDamageCount": 0,
      "centroidPixel": [312.0, 480.5],
      "polygonPixel": [[290, 455], "..."]
    }
  ]
}
```

## Building GeoJSON

`GET /assessments/{disaster_id}/geojson` — a `FeatureCollection`, one feature
per building, served as a download.

```json
{
  "type": "FeatureCollection",
  "properties": { "crs": "pixel", "imageWidth": 1024, "imageHeight": 1024 },
  "features": [
    {
      "type": "Feature",
      "id": 0,
      "geometry": { "type": "Polygon", "coordinates": [[[772, 881], "..."]] },
      "properties": {
        "buildingIndex": 0,
        "damage": 1,
        "damage_name": "no-damage",
        "damageLabel": "No Damage",
        "confidence": 0.9154,
        "areaPx": 3446.5,
        "color": "#10b981"
      }
    }
  ]
}
```

Damage codes: `1` no damage, `2` minor, `3` major, `4` destroyed.

## Priority zones

`GET /map/zones` — zones across every assessment, in the zone shape above.

## Analytics

`GET /analytics` — KPIs aggregated over all completed assessments, the combined
damage distribution, and the most recent runs.

## Model status

`GET /model/status` — `{ weightsPresent, loaded, device, error }`. The upload
page uses this to disable submission when weights are missing rather than
failing at request time.
