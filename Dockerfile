FROM node:18-alpine
LABEL Author="Ineed API"
WORKDIR $SERVER_HOME
COPY . $SERVER_HOME

RUN npm install pm2 -g

RUN yarn

RUN yarn prisma generate

RUN yarn build

EXPOSE 3000

CMD ["pm2-runtime","./dist/main.js","--no-autorestart"]
