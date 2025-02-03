import ReactGA from 'react-ga';

const TRACKING_ID = 'G-L5C8VZRY2W';

export const initGA = () => {
  ReactGA.initialize(TRACKING_ID);
};

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname);
};
