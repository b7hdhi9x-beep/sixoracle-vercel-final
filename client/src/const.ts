export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Simple login URL - direct to /login page (email/password auth)
export const getLoginUrl = () => {
  return "/login";
};

// Get dashboard URL
export const getDashboardUrl = () => {
  return "/dashboard";
};

// Get any internal URL
export const getAuthenticatedUrl = (path: string) => {
  return path;
};
