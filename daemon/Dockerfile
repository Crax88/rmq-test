FROM node:16 as development

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./package*.json ./

USER node

RUN npm ci

COPY --chown=node:node ./ .

EXPOSE 4000

CMD ["npm", "run", "start:dev"]

# FROM node:13 as production

# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# WORKDIR /home/node/app

# COPY ./package*.json ./

# USER node

# RUN npm ci --production

# COPY --chown=node:node backend/. .

# RUN npm run build

# EXPOSE 4000

# CMD ["npm", "run", "start"]