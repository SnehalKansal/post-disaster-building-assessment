import { BarChart3, Download, Layers3, MapPinned, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DamageMap from '../components/DamageMap';
import {
	assetUrl,
	fetchAnalyticsData,
	fetchAssessment,
	fetchAssessments,
	fetchBuildingsGeoJson,
	geojsonDownloadUrl,
} from '../services/api';
import '../styles/dashboard.css';

const ALL_DAMAGE = [1, 2, 3, 4];

export default function Dashboard() {
	const { disasterId } = useParams();
	const [assessments, setAssessments] = useState([]);
	const [activeId, setActiveId] = useState(disasterId ? Number(disasterId) : null);
	const [detail, setDetail] = useState(null);
	const [geojson, setGeojson] = useState(null);
	const [analytics, setAnalytics] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selected, setSelected] = useState(null);

	const [showBuildings, setShowBuildings] = useState(true);
	const [showHeatmap, setShowHeatmap] = useState(false);
	const [showZones, setShowZones] = useState(true);
	const [visibleDamage, setVisibleDamage] = useState(ALL_DAMAGE);

	const loadIndex = useCallback(async () => {
		setError(null);
		try {
			const [jobs, stats] = await Promise.all([fetchAssessments(), fetchAnalyticsData()]);
			setAssessments(jobs);
			setAnalytics(stats);
			const completed = jobs.filter((job) => job.status === 'Completed');
			setActiveId((current) => current ?? completed[0]?.disasterId ?? null);
		} catch (requestError) {
			setError(requestError.message);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadIndex();
	}, [loadIndex]);

	useEffect(() => {
		if (activeId == null) {
			setDetail(null);
			setGeojson(null);
			return undefined;
		}
		let cancelled = false;
		(async () => {
			try {
				const [nextDetail, nextGeojson] = await Promise.all([
					fetchAssessment(activeId),
					fetchBuildingsGeoJson(activeId).catch(() => null),
				]);
				if (cancelled) return;
				setDetail(nextDetail);
				setGeojson(nextGeojson);
				setSelected(null);
			} catch (requestError) {
				if (!cancelled) setError(requestError.message);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [activeId]);

	function toggleDamage(code) {
		setVisibleDamage((current) =>
			current.includes(code) ? current.filter((value) => value !== code) : [...current, code].sort(),
		);
	}

	const job = detail?.job;
	const summary = detail?.summary;
	const zones = detail?.zones ?? [];
	const kpis = analytics?.kpis ?? {};

	return (
		<div className="page workspace-page">
			<header className="workspace-header">
				<div>
					<p className="eyebrow">Spatial workspace</p>
					<h1>Assessment layers</h1>
					<p>Predicted building footprints, severity heatmap, and ranked priority zones.</p>
				</div>
				<button className="button secondary" onClick={loadIndex} type="button">
					<RefreshCw size={16} /> Refresh
				</button>
			</header>

			{error && <p className="notice error">{error}</p>}

			<section className="kpi-grid" aria-label="Assessment summary">
				<article><span>Completed assessments</span><strong>{kpis.totalAnalyses ?? '—'}</strong></article>
				<article><span>Buildings assessed</span><strong>{kpis.totalBuildings ?? '—'}</strong></article>
				<article><span>Damaged buildings</span><strong>{kpis.damageCasesDetected ?? '—'}</strong></article>
				<article><span>Major or destroyed</span><strong>{kpis.criticalCases ?? '—'}</strong></article>
				<article><span>Mean confidence</span><strong>{kpis.averageConfidence ?? '—'}</strong></article>
			</section>

			{assessments.length > 0 && (
				<nav className="assessment-tabs" aria-label="Assessments">
					{assessments.map((item) => (
						<button
							key={item.jobId}
							type="button"
							className={`assessment-tab${item.disasterId === activeId ? ' active' : ''}`}
							disabled={item.status !== 'Completed'}
							onClick={() => setActiveId(item.disasterId)}
						>
							<span>{item.name || `Assessment ${item.disasterId}`}</span>
							<small>{item.status === 'Completed' ? `${item.buildingCount} buildings` : item.status}</small>
						</button>
					))}
				</nav>
			)}

			{isLoading && <p className="canvas-message">Loading spatial layers…</p>}

			{!isLoading && !detail && (
				<section className="workspace-canvas">
					<div className="empty-map-state">
						<Layers3 size={28} />
						<h2>No completed assessments yet</h2>
						<p>Upload a pre/post image pair to produce building footprints and damage layers.</p>
						<Link className="button primary" to="/ingest">Ingest imagery</Link>
					</div>
				</section>
			)}

			{detail && job && (
				<>
					<div className="workspace-toolbar">
						<span><MapPinned size={16} /> Pixel CRS · {job.imageWidth}×{job.imageHeight}</span>
						<span><Layers3 size={16} /> {summary.totalBuildings} buildings · {zones.length} priority zones</span>
						<label className="toggle"><input type="checkbox" checked={showBuildings} onChange={() => setShowBuildings((v) => !v)} /> Footprints</label>
						<label className="toggle"><input type="checkbox" checked={showHeatmap} onChange={() => setShowHeatmap((v) => !v)} /> Severity heatmap</label>
						<label className="toggle"><input type="checkbox" checked={showZones} onChange={() => setShowZones((v) => !v)} /> Priority zones</label>
						<a className="button secondary" href={geojsonDownloadUrl(activeId)} download>
							<Download size={15} /> GeoJSON
						</a>
					</div>

					<div className="map-shell">
						<DamageMap
							imageUrl={assetUrl(job.postImage)}
							heatmapUrl={assetUrl(job.heatmapImage)}
							width={job.imageWidth}
							height={job.imageHeight}
							geojson={geojson}
							zones={zones}
							showBuildings={showBuildings}
							showHeatmap={showHeatmap}
							showZones={showZones}
							visibleDamage={visibleDamage}
							onSelectBuilding={setSelected}
						/>
						<aside className="map-side">
							<h3>Damage distribution</h3>
							<ul className="legend">
								{summary.damageDistribution.map((bucket) => (
									<li key={bucket.code}>
										<label className="legend-row">
											<input
												type="checkbox"
												checked={visibleDamage.includes(bucket.code)}
												onChange={() => toggleDamage(bucket.code)}
											/>
											<span className="swatch" style={{ background: bucket.color }} />
											<span className="legend-label">{bucket.label}</span>
											<span className="legend-count">{bucket.count} · {bucket.percentage}%</span>
										</label>
										<div className="legend-bar">
											<div style={{ width: `${bucket.percentage}%`, background: bucket.color }} />
										</div>
									</li>
								))}
							</ul>

							{selected && (
								<div className="selected-building">
									<h3>Building #{selected.buildingIndex}</h3>
									<p><span className="swatch" style={{ background: selected.color }} /> {selected.damageLabel}</p>
									<p>Confidence {(selected.confidence * 100).toFixed(1)}%</p>
									<p>Area {selected.areaPx} px</p>
								</div>
							)}

							<h3>Priority zones</h3>
							{zones.length === 0 && <p className="muted">No clustered damage hot spots in this scene.</p>}
							<ol className="zone-list">
								{zones.map((zone) => (
									<li key={zone.id}>
										<div className="zone-head">
											<strong>{zone.name}</strong>
											<span className={`tier tier-${zone.riskTier.toLowerCase()}`}>{zone.riskTier}</span>
										</div>
										<small>
											{zone.affectedBuildings} buildings · {zone.destroyedCount} destroyed · {zone.majorDamageCount} major · severity {zone.severityScore}
										</small>
									</li>
								))}
							</ol>
						</aside>
					</div>

					<section className="run-meta">
						<BarChart3 size={18} />
						<span>
							{job.buildingCount} buildings in {job.durationSeconds?.toFixed(1)}s on {job.device} · mean confidence {(summary.averageConfidence * 100).toFixed(1)}% · polygons in pixel coordinates (geo-referencing pending)
						</span>
					</section>
				</>
			)}
		</div>
	);
}
