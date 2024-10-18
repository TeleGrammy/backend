FROM node:18-slim

RUN useradd --create-home --shell /bin/bash telegrammy

WORKDIR /usr/src/app

COPY package*.json .  # Ensure package.json is copied first

RUN npm ci --only=production  # Now npm install will have access to package.json

COPY . .  # Copy the rest of your application code

RUN chown -R telegrammy:telegrammy /usr/src/app

USER telegrammy

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm","run","start:prod"]
