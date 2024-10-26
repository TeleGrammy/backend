FROM node:18-slim

RUN useradd --create-home --shell /bin/bash telegrammy

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --only=production

COPY . .

RUN chown -R telegrammy:telegrammy /usr/src/app

USER telegrammy

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node","src/index.js"]
