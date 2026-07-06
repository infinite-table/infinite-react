# Build context must be the repository root
# (the image needs www/functions/json-server and www/dataserver/data)
FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY data-server/package.json ./package.json
RUN npm install --omit=dev && npm cache clean --force

# Keep the same relative layout the json-server module expects:
# it requires ../../dataserver/data/*.json relative to its own file
COPY www/functions/json-server ./www/functions/json-server
COPY www/dataserver/data ./www/dataserver/data

COPY data-server/server.js ./server.js

ENV PORT=3002
EXPOSE 3002

CMD ["node", "server.js"]
