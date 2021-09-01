# Devops setup

This `www` folder is deployed to netlify as a static nextjs website.

In addition to that, we have `functions/json-server/fn.js` which is a serverless fn for serving data sources - it's compiled/packed with `esbuild` into a single file located at `functions/json-server/json-server.js`