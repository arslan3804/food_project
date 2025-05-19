FROM node:23-alpine as build

WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps && npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html
