# AI-Powered Post-Disaster Building Damage Assessment

An AI-powered web application for assessing building damage after natural disasters using pre-disaster and post-disaster satellite imagery.

## Overview

Natural disasters such as earthquakes, floods, hurricanes, and wildfires can cause extensive damage to buildings and infrastructure. Rapid identification of severely affected areas is important for disaster response and resource prioritization.

This project aims to automate the initial building damage assessment process by comparing satellite imagery captured before and after a disaster.

The system will:

1. Accept pre-disaster and post-disaster satellite images.
2. Preprocess and align the images.
3. Detect individual buildings from satellite imagery.
4. Compare pre- and post-disaster building regions.
5. Classify the damage level of each building.
6. Associate predictions with geographic coordinates.
7. Visualize building-level damage on an interactive map.
8. Generate damage heatmaps and priority zones.
9. Provide statistics and downloadable geospatial results.

The final system is intended to provide a rapid preliminary assessment that can support disaster-response planning and prioritization.

---

## Key Features

- Pre- and post-disaster satellite image upload
- Image preprocessing and alignment
- Building detection and segmentation
- Building-level damage classification
- Four damage categories:
  - No Damage
  - Minor Damage
  - Major Damage
  - Destroyed
- Confidence score for predictions
- Geospatial building polygons
- Interactive damage map
- Damage heatmap
- High-severity / priority zones
- Building-level inspection
- Damage statistics
- GeoJSON export
- Assessment report generation

---

## System Architecture

```text
          PRE-DISASTER IMAGE
                  +
           POST-DISASTER IMAGE
                  |
                  v
        +---------------------+
        | Image Preprocessing |
        | Alignment / Tiling  |
        +----------+----------+
                   |
                   v
        +---------------------+
        | Building Detection  |
        | U-Net + ResNet50    |
        +----------+----------+
                   |
                   v
        +---------------------+
        | Building Polygons   |
        | + Building IDs      |
        +----------+----------+
                   |
                   v
        +---------------------+
        | Pre/Post Building   |
        | Image Crops         |
        +----------+----------+
                   |
                   v
        +---------------------+
        | Damage Classification|
        | Siamese ResNet34    |
        +----------+----------+
                   |
                   v
        +---------------------+
        | Damage Class +      |
        | Confidence Score    |
        +----------+----------+
                   |
                   v
        +---------------------+
        | Geospatial Processing|
        +----------+----------+
                   |
                   v
        +---------------------+
        | PostgreSQL + PostGIS |
        +----------+----------+
                   |
                   v
        +---------------------+
        | FastAPI Backend      |
        +----------+----------+
                   |
                   v
        +---------------------+
        | React + Leaflet      |
        | Web Application      |
        +----------+----------+
                   |
                   v
     +-------------+-------------+
     |             |             |
     v             v             v
 Damage Map    Heatmap      Priority Zones
     |
     v
 Statistics + GeoJSON + Report