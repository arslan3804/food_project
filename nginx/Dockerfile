FROM node:23-alpine as build

WORKDIR /app
COPY food_frontend/ ./
RUN npm install --legacy-peer-deps && npm run build

FROM nginx:alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
