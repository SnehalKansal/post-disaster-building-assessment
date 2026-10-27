const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/** Origin of the API, used to resolve /static artifact paths to absolute URLs. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export function assetUrl(path) {
	if (!path) return null;
	return /^https?:\/\//i.test(path) ? path : `${API_ORIGIN}${path}`;
}

async function request(path, options) {
	const response = await fetch(`${API_BASE_URL}${path}`, options);
	if (!response.ok) {
		let message = `Request failed with status ${response.status}.`;
		try {
			const payload = await response.json();
			if (typeof payload.detail === 'string') {
				message = payload.detail;
			} else if (Array.isArray(payload.detail)) {
				message = payload.detail.map((item) => item.msg).join(', ') || message;
			}
		} catch {
			// Keep the status message when the backend did not return JSON.
		}
		throw new Error(message);
	}
	return response.json();
}

/** Queue a two-stage assessment for a pre/post image pair. */
export function submitAssessment({ preImage, postImage, name, location, analysisType }) {
	const formData = new FormData();
	formData.append('pre_image', preImage);
	formData.append('post_image', postImage);
	formData.append('name', name ?? '');
	formData.append('location', location ?? '');
	formData.append('analysis_type', analysisType ?? 'building-damage');
	return request('/analyze', { method: 'POST', body: formData });
}

export function fetchJob(jobId) {
	return request(`/jobs/${jobId}`);
}

export function fetchAssessment(disasterId) {
	return request(`/assessments/${disasterId}`);
}

export function fetchAssessments() {
	return request('/assessments');
}

export function fetchBuildingsGeoJson(disasterId) {
	return request(`/assessments/${disasterId}/geojson`);
}

export function fetchAnalyticsData() {
	return request('/analytics');
}

export function fetchRiskZones() {
	return request('/map/zones');
}

export function fetchModelStatus() {
	return request('/model/status');
}

export function geojsonDownloadUrl(disasterId) {
	return `${API_BASE_URL}/assessments/${disasterId}/geojson`;
}
