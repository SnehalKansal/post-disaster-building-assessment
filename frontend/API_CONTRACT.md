# DisasterVision AI - Backend & ML API Integration Contract

This document specifies the exact REST API request/response contracts for the **Backend Team** and **ML/Dataset Team** to connect the PyTorch models to the React frontend.

---

## Recommended Repository Folder Structure

To avoid branch merge conflicts, organize the GitHub repository like this:

```
post-disaster-building-assessment/
│
├── frontend/                     <-- [Your Branch: frontend]
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   └── README.md
│
├── backend/                      <-- [Teammate Branch: backend-development]
│   ├── app/
│   │   ├── main.py               (FastAPI / Flask app)
│   │   ├── routes/
│   │   │   ├── analyze.py
│   │   │   └── analytics.py
│   │   └── services/
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml_models/                    <-- [Teammate Branch: ml-models / datasets]
│   ├── checkpoints/              (ResNet-50 / EfficientNet .pth weights)
│   ├── inference.py              (PyTorch model loader & Grad-CAM generator)
│   ├── preprocessing.py          (Image resizing, normalization, tiling)
│   └── dataset/
│
└── README.md
```

---

## API Endpoints Specification

Base URL: `http://localhost:8000/api/v1`

---

### 1. Image Damage Analysis Endpoint

- **Method**: `POST`
- **Path**: `/api/v1/analyze`
- **Content-Type**: `multipart/form-data`

#### Request Parameters:
| Form Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `image` | `File (binary)` | Yes | The uploaded satellite/building image (JPG/PNG). |
| `model_type` | `String` | No | `'resnet-50'`, `'efficientnet-b4'`, or `'damagenet-cnn'` (Default: `resnet-50`). |
| `analysis_type` | `String` | No | `'building-damage'`, `'flood-impact'`, or `'infrastructure-damage'`. |

#### Response (`200 OK` JSON):
```json
{
  "id": "DV-2026-9821",
  "name": "turkey_earthquake_sector_c4.jpg",
  "fileName": "turkey_earthquake_sector_c4.jpg",
  "disasterType": "Earthquake (M7.8)",
  "location": "Kahramanmaraş Sector 4",
  "date": "2026-08-31",
  "fileSize": "4.2 MB",
  "dimensions": "3840 x 2160",
  "sensorType": "Maxar WorldView-3",
  "originalImage": "http://localhost:8000/static/uploads/original_9821.jpg",
  "overlayImage": "http://localhost:8000/static/heatmaps/heatmap_9821.jpg",
  "damageLevel": "SEVERE_DAMAGE",
  "confidenceScore": 96.8,
  "analysisTime": "2.4s",
  "probabilities": {
    "noDamage": 1.2,
    "minorDamage": 4.5,
    "moderateDamage": 18.4,
    "severeDamage": 71.1,
    "destroyed": 4.8
  },
  "aiExplanation": "The model detected multi-story pancake collapse, extensive load-bearing column failure, and heavy concrete rubble dispersal.",
  "detectedIndicators": [
    { "text": "Complete collapse of lower 3 structural floors", "positive": true, "severity": "critical" },
    { "text": "Major shear fracture along western elevation", "positive": true, "severity": "high" },
    { "text": "Debris pattern identified in perimeter zone (radius 8.4m)", "positive": true, "severity": "medium" },
    { "text": "Severe contiguous masonry rubble accumulation", "positive": true, "severity": "high" }
  ],
  "recommendations": [
    { "priority": "HIGH", "text": "Deploy Urban Search and Rescue (USAR) canine teams immediately", "category": "Rescue" },
    { "priority": "HIGH", "text": "Erect a 25-meter safety perimeter and restrict civilian access", "category": "Evacuation" },
    { "priority": "MEDIUM", "text": "Perform secondary thermal drone survey for trapped survivors", "category": "Surveillance" },
    { "priority": "LOW", "text": "Initiate structural shoring and preliminary demolition planning", "category": "Recovery" }
  ],
  "heatmapData": [
    { "x": 28, "y": 25, "width": 44, "height": 40, "intensity": "critical", "label": "Pancake Collapse (98%)" },
    { "x": 18, "y": 62, "width": 32, "height": 28, "intensity": "high", "label": "Masonry Rubble" }
  ]
}
```

> **Damage Level Keys Supported by Frontend**:
> - `"NO_DAMAGE"` (0–20%)
> - `"MINOR_DAMAGE"` (21–40%)
> - `"MODERATE_DAMAGE"` (41–60%)
> - `"SEVERE_DAMAGE"` (61–80%)
> - `"DESTROYED"` (81–100%)

---

### 2. Analytics Dashboard KPIs Endpoint

- **Method**: `GET`
- **Path**: `/api/v1/analytics`

#### Response (`200 OK` JSON):
```json
{
  "kpis": {
    "totalAnalyses": "1,248",
    "damageCasesDetected": "842",
    "criticalCases": "127",
    "averageConfidence": "94.2%"
  },
  "damageDistribution": [
    { "label": "No Damage", "count": 406, "percentage": 32.5, "color": "#10b981" },
    { "label": "Minor Damage", "count": 312, "percentage": 25.0, "color": "#eab308" },
    { "label": "Moderate Damage", "count": 268, "percentage": 21.5, "color": "#f97316" },
    { "label": "Severe Damage", "count": 185, "percentage": 14.8, "color": "#ef4444" },
    { "label": "Destroyed", "count": 77, "percentage": 6.2, "color": "#991b1b" }
  ],
  "recentAnalyses": [...]
}
```

---

### 3. GIS Disaster Impact Zones Endpoint

- **Method**: `GET`
- **Path**: `/api/v1/map/zones`

#### Response (`200 OK` JSON):
```json
[
  {
    "id": "zone-a",
    "name": "Zone A - Epicenter Sector",
    "riskTier": "Critical",
    "color": "#ef4444",
    "badge": "CRITICAL ZONE",
    "affectedBuildings": 42,
    "coordinates": "37.5852° N, 36.9371° E",
    "severity": "Destroyed / Severe",
    "avgConfidence": "97.2%",
    "recommendedDispatch": "Search & Rescue Unit Alpha-1"
  }
]
```
