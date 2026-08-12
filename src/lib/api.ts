import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", new URLSearchParams({ username: email, password })),
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),
  me: () => api.get("/auth/me"),
};

// Posts
export const postsApi = {
  list: (params: Record<string, any>) => api.get("/posts", { params }),
  create: (data: any) => api.post("/posts", data),
  update: (id: number, data: any) => api.patch(`/posts/${id}`, data),
  delete: (id: number) => api.delete(`/posts/${id}`),
  bulk: (data: any) => api.post("/posts/bulk", data),
};

// Accounts
export const accountsApi = {
  list: (workspaceId: number) => api.get("/accounts", { params: { workspace_id: workspaceId } }),
  connect: (data: any) => api.post("/accounts", data),
  disconnect: (id: number) => api.delete(`/accounts/${id}`),
};

// Media
export const mediaApi = {
  list: (workspaceId: number, params?: any) => api.get("/media", { params: { workspace_id: workspaceId, ...params } }),
  upload: (workspaceId: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/media/upload?workspace_id=${workspaceId}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id: number) => api.delete(`/media/${id}`),
};

// Analytics
export const analyticsApi = {
  overview: (workspaceId: number, days = 30) =>
    api.get("/analytics/overview", { params: { workspace_id: workspaceId, days } }),
  performance: (workspaceId: number, days = 30) =>
    api.get("/analytics/performance", { params: { workspace_id: workspaceId, days } }),
};

// AI
export const aiApi = {
  generateCaptions: (data: any) => api.post("/ai/captions", data),
  rewrite: (data: any) => api.post("/ai/rewrite", data),
  hooks: (data: any) => api.post("/ai/hooks", data),
  hashtags: (topic: string, platform: string) =>
    api.post("/ai/hashtags", null, { params: { topic, platform } }),
};

// RSS
export const rssApi = {
  list: (workspaceId: number) => api.get("/rss", { params: { workspace_id: workspaceId } }),
  create: (data: any) => api.post("/rss", data),
  delete: (id: number) => api.delete(`/rss/${id}`),
};

// Team
export const teamApi = {
  members: (workspaceId: number) => api.get(`/team/${workspaceId}/members`),
  remove: (memberId: number) => api.delete(`/team/members/${memberId}`),
};

// ─── AI-First API ─────────────────────────────────────────────────────────────

// The agent / natural-language interface
export const agentApi = {
  chat: (workspaceId: number, prompt: string, autoExecute = true) =>
    api.post("/agent/chat", { workspace_id: workspaceId, prompt, auto_execute: autoExecute }),
  interpret: (workspaceId: number, prompt: string) =>
    api.post("/agent/interpret", { workspace_id: workspaceId, prompt }),
  runs: (workspaceId: number) => api.get("/agent/runs", { params: { workspace_id: workspaceId } }),
  undo: (runId: number) => api.post(`/agent/runs/${runId}/undo`),
};

// Campaigns
export const campaignApi = {
  plan: (workspaceId: number, prompt: string) =>
    api.post("/campaigns/plan", { workspace_id: workspaceId, prompt }),
  list: (workspaceId: number) => api.get("/campaigns", { params: { workspace_id: workspaceId } }),
  get: (id: number) => api.get(`/campaigns/${id}`),
  regenerate: (id: number) => api.post(`/campaigns/${id}/regenerate`),
  submitForApproval: (id: number) => api.post(`/campaigns/${id}/submit-for-approval`),
  editVariation: (variationId: number, data: { caption?: string; scheduled_at?: string }) =>
    api.patch(`/campaigns/variations/${variationId}`, data),
};

// Brand voice
export const brandVoiceApi = {
  get: (workspaceId: number) => api.get("/brand-voice", { params: { workspace_id: workspaceId } }),
  save: (data: any) => api.post("/brand-voice", data),
  learnFromSamples: (workspaceId: number, samples: string[]) =>
    api.post("/brand-voice/learn-from-samples", samples, { params: { workspace_id: workspaceId } }),
};

// Approvals
export const approvalApi = {
  pending: (workspaceId: number) => api.get("/approvals", { params: { workspace_id: workspaceId } }),
  decide: (requestId: number, decision: string, comment = "") =>
    api.post(`/approvals/${requestId}/decide`, { decision, comment }),
};

// Best-time-to-post
export const timingApi = {
  bestTimes: (accountId: number, n = 7) =>
    api.get(`/timing/best-times/${accountId}`, { params: { n } }),
};

// Post Analytics (real data endpoints)
export const postAnalyticsApi = {
  postDetail: (postId: number) => api.get(`/analytics/posts/${postId}`),
  topPosts: (workspaceId: number, metric = "impressions", days = 30) =>
    api.get("/analytics/top-posts", { params: { workspace_id: workspaceId, metric, days } }),
  fetchNow: (postAccountId: number) => api.post(`/analytics/fetch-now/${postAccountId}`),
};

// Post Intelligence
export const intelligenceApi = {
  analyze: (data: { caption: string; platform_hint?: string; niche_hint?: string; workspace_id?: number }) =>
    api.post("/intelligence/analyze", data),
  compare: (data: { caption_a: string; caption_b: string; platform_hint?: string; niche_hint?: string; workspace_id?: number }) =>
    api.post("/intelligence/compare", data),
  batch: (captions: string[], workspaceId?: number) =>
    api.post("/intelligence/batch", { captions, workspace_id: workspaceId }),
  history: (workspaceId?: number, limit = 20) =>
    api.get("/intelligence/history", { params: { workspace_id: workspaceId, limit } }),
};

// Website Tracking
export const trackingApi = {
  createSite: (data: { workspace_id: number; name: string; domain: string }) =>
    api.post("/tracking/sites", data),
  listSites: (workspaceId: number) =>
    api.get("/tracking/sites", { params: { workspace_id: workspaceId } }),
  getSnippet: (trackerId: string) =>
    api.get(`/tracking/sites/${trackerId}/snippet`),
  overview: (trackerId: string, days = 30) =>
    api.get(`/tracking/sites/${trackerId}/overview`, { params: { days } }),
  timeseries: (trackerId: string, days = 30) =>
    api.get(`/tracking/sites/${trackerId}/timeseries`, { params: { days } }),
  topPages: (trackerId: string, days = 30, limit = 20) =>
    api.get(`/tracking/sites/${trackerId}/pages`, { params: { days, limit } }),
  referrers: (trackerId: string, days = 30) =>
    api.get(`/tracking/sites/${trackerId}/referrers`, { params: { days } }),
  utm: (trackerId: string, days = 30) =>
    api.get(`/tracking/sites/${trackerId}/utm`, { params: { days } }),
  devices: (trackerId: string, days = 30) =>
    api.get(`/tracking/sites/${trackerId}/devices`, { params: { days } }),
  geography: (trackerId: string, days = 30) =>
    api.get(`/tracking/sites/${trackerId}/geography`, { params: { days } }),
  sessions: (trackerId: string, limit = 25) =>
    api.get(`/tracking/sites/${trackerId}/sessions`, { params: { limit } }),
};
