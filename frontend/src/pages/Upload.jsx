import { AlertTriangle, FileImage, LoaderCircle, Upload as UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchJob, fetchModelStatus, submitAssessment } from '../services/api';
import '../styles/upload.css';

const POLL_MS = 1200;

function ImagePicker({ role, label, hint, file, onPick }) {
	const [previewUrl, setPreviewUrl] = useState(null);

	useEffect(() => {
		if (!file || file.type === 'image/tiff') {
			setPreviewUrl(null);
			return undefined;
		}
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	return (
		<div className="image-picker">
			<label className="file-picker">
				<input
					type="file"
					accept="image/jpeg,image/png,image/tiff,.tif,.tiff"
					onChange={(event) => onPick(event.target.files?.[0] ?? null)}
				/>
				<FileImage size={22} />
				<span>{file ? file.name : label}</span>
				<small>{hint}</small>
			</label>
			{previewUrl && <img className="image-preview" src={previewUrl} alt={`${role} preview`} />}
			{file && !previewUrl && <p className="preview-note">TIFF preview unavailable — the file will still be processed.</p>}
		</div>
	);
}

export default function Upload() {
	const navigate = useNavigate();
	const [preImage, setPreImage] = useState(null);
	const [postImage, setPostImage] = useState(null);
	const [name, setName] = useState('');
	const [location, setLocation] = useState('');
	const [analysisType, setAnalysisType] = useState('building-damage');
	const [job, setJob] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [modelStatus, setModelStatus] = useState(null);
	const timerRef = useRef(null);

	useEffect(() => {
		fetchModelStatus().then(setModelStatus).catch(() => setModelStatus(null));
		return () => clearTimeout(timerRef.current);
	}, []);

	useEffect(() => {
		if (!job || job.status === 'Completed' || job.status === 'Failed') return undefined;
		timerRef.current = setTimeout(async () => {
			try {
				const next = await fetchJob(job.jobId);
				setJob(next);
				if (next.status === 'Completed') {
					navigate(`/workspace/${next.disasterId}`);
				}
			} catch (pollError) {
				setError(pollError.message);
			}
		}, POLL_MS);
		return () => clearTimeout(timerRef.current);
	}, [job, navigate]);

	async function submit(event) {
		event.preventDefault();
		if (!preImage || !postImage) return;
		setIsSubmitting(true);
		setError(null);
		try {
			setJob(await submitAssessment({ preImage, postImage, name, location, analysisType }));
		} catch (requestError) {
			setError(requestError.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	const running = job && job.status !== 'Completed' && job.status !== 'Failed';
	const weightsMissing = modelStatus && !modelStatus.weightsPresent;

	return (
		<div className="page narrow-page">
			<header className="page-heading">
				<p className="eyebrow">Imagery intake</p>
				<h1>Run a damage assessment</h1>
				<p>
					Upload a co-registered pre- and post-disaster pair of the same scene. Stage 1 localizes
					buildings in the pre-disaster image; Stage 2 classifies the damage at each one.
				</p>
			</header>

			{weightsMissing && (
				<p className="notice error">
					<AlertTriangle size={18} /> Model weights are not installed on the server, so assessments cannot run.
				</p>
			)}

			<form className="ingest-card" onSubmit={submit}>
				<div className="pair-grid">
					<ImagePicker
						role="Pre-disaster"
						label="Choose pre-disaster image"
						hint="Baseline scene · JPEG, PNG, or GeoTIFF"
						file={preImage}
						onPick={setPreImage}
					/>
					<ImagePicker
						role="Post-disaster"
						label="Choose post-disaster image"
						hint="Same scene after the event"
						file={postImage}
						onPick={setPostImage}
					/>
				</div>

				<div className="field-row">
					<label className="field-label">
						Assessment name
						<input
							type="text"
							value={name}
							placeholder="e.g. Joplin tornado — tile 14"
							onChange={(event) => setName(event.target.value)}
						/>
					</label>
					<label className="field-label">
						Location
						<input
							type="text"
							value={location}
							placeholder="e.g. Joplin, MO"
							onChange={(event) => setLocation(event.target.value)}
						/>
					</label>
				</div>

				<label className="field-label">
					Assessment focus
					<select value={analysisType} onChange={(event) => setAnalysisType(event.target.value)}>
						<option value="building-damage">Building damage</option>
						<option value="flood-impact">Flood impact</option>
						<option value="infrastructure-damage">Infrastructure damage</option>
					</select>
				</label>

				<button
					className="button primary submit-button"
					disabled={!preImage || !postImage || isSubmitting || running || weightsMissing}
					type="submit"
				>
					{isSubmitting || running ? <LoaderCircle className="spin" size={17} /> : <UploadIcon size={17} />}
					{running ? 'Processing…' : isSubmitting ? 'Submitting' : 'Run assessment'}
				</button>
			</form>

			{error && <p className="notice error"><AlertTriangle size={18} /> {error}</p>}

			{job && (
				<section className={`job-card${job.status === 'Failed' ? ' failed' : ''}`}>
					<div className="job-head">
						<strong>{job.name || 'Assessment'}</strong>
						<span className={`status-pill status-${job.status.toLowerCase()}`}>{job.status}</span>
					</div>
					<div className="progress-track">
						<div className="progress-fill" style={{ width: `${Math.round(job.progress * 100)}%` }} />
					</div>
					<p className="job-stage">{job.error ? job.error : job.stage}</p>
					{job.status === 'Completed' && (
						<p className="job-stage">
							{job.buildingCount} buildings in {job.durationSeconds?.toFixed(1)}s on {job.device}.
						</p>
					)}
				</section>
			)}
		</div>
	);
}
