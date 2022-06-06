FROM node:14.15.0

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3001
CMD ["node", "--max_old_space_size=500", "server.js", "--production"]