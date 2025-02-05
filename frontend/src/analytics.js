// analytics.js
import ReactGA from 'react-ga4';

const TRACKING_ID = 'G-L5C8VZRY2W'; // Your GA4 Measurement ID

export const initGA = () => {
  console.log("Initializing GA with ID:", TRACKING_ID);
  ReactGA.initialize(TRACKING_ID);
};

export const logPageView = () => {
  const pagePath = window.location.pathname + window.location.search;
  console.log("Logging pageview for:", pagePath);
  // With react-ga4, you send pageviews like this:
  ReactGA.send({ hitType: "pageview", page: pagePath });
};
