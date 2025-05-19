FROM node:23-alpine as build

WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY ../nginx/default.conf /etc/nginx/conf.d/default.conf
