FROM node:14.15.0 as build-stage
WORKDIR /app
# ENV PATH ./node_modules/.bin:$PATH
COPY package*.json ./
RUN npm i
COPY ./ .
RUN npm run build

FROM nginx:latest as production-stage
RUN mkdir /app
COPY --from=build-stage /app/build /app
COPY nginx.conf /etc/nginx/nginx.conf

# EXPOSE 3000
# CMD ["serve", "-s", "build"]