import {PHASE_DEVELOPMENT_SERVER} from 'next/constants.js';

/** @type {import('next').NextConfig} */
const shared={
  output:'standalone',
  images:{remotePatterns:[{protocol:'https',hostname:'**'}]}
};

export default function nextConfig(phase){
  return {
    ...shared,
    // Keep development assets separate so `next build` cannot invalidate
    // chunks currently served by `next dev`.
    distDir:phase===PHASE_DEVELOPMENT_SERVER?'.next-dev':'.next'
  };
}
