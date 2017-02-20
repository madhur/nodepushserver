FROM node:5.11.1

RUN npm install

ADD ./ /app

WORKDIR /app

EXPOSE 8001

ENTRYPOINT node faye_v2.js