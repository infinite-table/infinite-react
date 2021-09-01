# Devops setup

This `www` folder is deployed to netlify as a static nextjs website.

In addition to that, we have `functions/json-server/fn.js` which is a serverless fn for serving data sources - it's compiled/packed with `esbuild` into a single file located at `functions/json-server/json-server.js`. For compiling this, run `npm run build-functions` (or `npm run watch-functions`) script found in `www/package.json`

For actually running the serverless function in browser, go in root and run `npm run serve:functions` (defined in `/package.json`) and then navigate to `http://localhost:9999/.netlify/functions/json-server/employees`