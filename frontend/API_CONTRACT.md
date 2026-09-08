# Frontend API Contract

Base URL: `http://localhost:8000/api/v1`

## Submit imagery

`POST /analyze` accepts `multipart/form-data`.

| Field | Type | Required |
| --- | --- | --- |
| `image` | JPEG, PNG, or TIFF file | Yes |
| `model_type` | String | Yes |
| `analysis_type` | String | Yes |

The current backend stores the source image and confirms receipt. It does not claim a damage class, confidence score, heatmap, or recommendation until geospatial processing and ML inference are implemented.

```json
{
  "id": "DV-EXAMPLE",
  "fileName": "source-image.tif",
  "originalImage": "http://localhost:8000/static/uploads/source-image.tif",
  "status": "received",
  "message": "Imagery has been stored. Geospatial processing and damage inference are not available yet.",
  "modelType": "resnet-50",
  "analysisType": "building-damage"
}
```

## Spatial workspace

`GET /map/zones` returns published priority zones when geospatial processing has created them. It returns an empty array before any layers are available.

## Analytics

`GET /analytics` is reserved for database-backed assessment summaries. The frontend does not render made-up analytics while no persisted analysis data exists.
