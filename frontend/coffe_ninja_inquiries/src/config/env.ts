const rawApiUrl = (import.meta.env.VITE_API_URL ?? "")
  .trim()
  .replace(/\/+$/, "");

export const API_ORIGIN = rawApiUrl;
export const API_BASE_URL = rawApiUrl ? `${rawApiUrl}/api/v1/` : "/api/v1/";
export const API_CREDENTIALS: RequestCredentials = rawApiUrl
  ? "include"
  : "same-origin";

