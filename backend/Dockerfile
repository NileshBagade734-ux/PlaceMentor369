FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p uploads/resumes

EXPOSE 5000

CMD ["node", "server.js"]
