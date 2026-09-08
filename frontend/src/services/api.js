const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function request(path, options) {
	const response = await fetch(`${API_BASE_URL}${path}`, options);
	if (!response.ok) {
		let message = `Request failed with status ${response.status}.`;
		try {
			const payload = await response.json();
			message = typeof payload.detail === 'string' ? payload.detail : message;
		} catch {
			// Keep the status message when the backend did not return JSON.
		}
		throw new Error(message);
	}
	return response.json();
}

export function analyzeDisasterImage(imageFile, modelType, analysisType) { const formData = new FormData(); formData.append('image', imageFile); formData.append('model_type', modelType); formData.append('analysis_type', analysisType); return request('/analyze', { method: 'POST', body: formData }); }
export function fetchAnalyticsData() { return request('/analytics'); }
export function fetchRiskZones() { return request('/map/zones'); }
