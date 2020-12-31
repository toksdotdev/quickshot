FROM buildkite/puppeteer as build
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
# Don't install option package `puppeteer` (since it's already in the docker image)
RUN NPM_POST_INSTALL=0 npm i --no-optional
COPY . .
RUN npm run build

FROM buildkite/puppeteer
USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --from=build /home/node/app/node_modules ./node_modules
COPY --from=build /home/node/app/dist ./dist
EXPOSE 3000
CMD [ "node", "dist/server.js"]
