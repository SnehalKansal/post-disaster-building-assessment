import L from 'leaflet';
import { useEffect, useMemo, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const DAMAGE_COLORS = {
	1: '#10b981',
	2: '#eab308',
	3: '#f97316',
	4: '#ef4444',
};

/**
 * Renders predicted building footprints over the post-disaster image.
 *
 * The pipeline emits pixel coordinates, so the map uses L.CRS.Simple and
 * treats the image as the coordinate space. When GeoTIFF geo-referencing
 * lands, this switches to a real tile layer without changing the data flow.
 */
export default function DamageMap({
	imageUrl,
	heatmapUrl,
	width,
	height,
	geojson,
	zones = [],
	showBuildings = true,
	showHeatmap = false,
	showZones = true,
	visibleDamage = [1, 2, 3, 4],
	onSelectBuilding,
}) {
	const containerRef = useRef(null);
	const mapRef = useRef(null);
	const layersRef = useRef({});

	// Leaflet's y axis grows upward, so flip image rows into map space.
	const bounds = useMemo(
		() => [
			[0, 0],
			[height || 1024, width || 1024],
		],
		[width, height],
	);
	const toLatLng = useMemo(
		() => (x, y) => [(height || 1024) - y, x],
		[height],
	);

	useEffect(() => {
		if (!containerRef.current || mapRef.current) return;
		const map = L.map(containerRef.current, {
			crs: L.CRS.Simple,
			minZoom: -4,
			maxZoom: 4,
			zoomSnap: 0.25,
			attributionControl: false,
		});
		mapRef.current = map;
		return () => {
			map.remove();
			mapRef.current = null;
			layersRef.current = {};
		};
	}, []);

	// Base imagery and heatmap overlay.
	useEffect(() => {
		const map = mapRef.current;
		if (!map || !imageUrl) return;
		const layers = layersRef.current;

		layers.base?.remove();
		layers.base = L.imageOverlay(imageUrl, bounds).addTo(map);
		map.setMaxBounds(bounds);
		map.fitBounds(bounds);

		return () => {
			layers.base?.remove();
			layers.base = null;
		};
	}, [imageUrl, bounds]);

	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		const layers = layersRef.current;
		layers.heat?.remove();
		layers.heat = null;
		if (showHeatmap && heatmapUrl) {
			layers.heat = L.imageOverlay(heatmapUrl, bounds, { opacity: 0.85 }).addTo(map);
		}
	}, [showHeatmap, heatmapUrl, bounds]);

	// Building footprints.
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		const layers = layersRef.current;
		layers.buildings?.remove();
		layers.buildings = null;
		if (!showBuildings || !geojson?.features?.length) return;

		const group = L.layerGroup();
		for (const feature of geojson.features) {
			const damage = feature.properties.damage;
			if (!visibleDamage.includes(damage)) continue;
			const ring = feature.geometry?.coordinates?.[0];
			if (!ring?.length) continue;

			const polygon = L.polygon(ring.map(([x, y]) => toLatLng(x, y)), {
				color: DAMAGE_COLORS[damage],
				weight: 2,
				fillOpacity: 0.35,
			});
			const { damageLabel, confidence, buildingIndex, areaPx } = feature.properties;
			polygon.bindTooltip(
				`<strong>${damageLabel}</strong><br/>Confidence ${(confidence * 100).toFixed(1)}%<br/>Area ${areaPx} px`,
				{ sticky: true },
			);
			polygon.on('click', () => onSelectBuilding?.(feature.properties));
			group.addLayer(polygon);
		}
		group.addTo(map);
		layers.buildings = group;
	}, [geojson, showBuildings, visibleDamage, toLatLng, onSelectBuilding]);

	// Priority zones.
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;
		const layers = layersRef.current;
		layers.zones?.remove();
		layers.zones = null;
		if (!showZones || !zones.length) return;

		const group = L.layerGroup();
		for (const zone of zones) {
			if (!zone.polygonPixel?.length) continue;
			const polygon = L.polygon(zone.polygonPixel.map(([x, y]) => toLatLng(x, y)), {
				color: '#7c3aed',
				weight: 2,
				dashArray: '6 4',
				fill: false,
			});
			polygon.bindTooltip(
				`<strong>${zone.name} — ${zone.riskTier}</strong><br/>${zone.affectedBuildings} buildings<br/>${zone.destroyedCount} destroyed · ${zone.majorDamageCount} major`,
				{ sticky: true },
			);
			group.addLayer(polygon);
		}
		group.addTo(map);
		layers.zones = group;
	}, [zones, showZones, toLatLng]);

	return <div className="damage-map" ref={containerRef} role="application" aria-label="Damage map" />;
}
