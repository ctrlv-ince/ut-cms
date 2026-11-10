export const environment = {
  production: true,
  // Node-RED and the API run on the same host as the frontend.
  nodeRedUrl: `${window.location.protocol}//${window.location.hostname}:1880`,
  nodeRedDashboardUrl: `${window.location.protocol}//${window.location.hostname}:1880/dashboard`,
  backendUrl: `${window.location.protocol}//${window.location.hostname}:3030`
};
