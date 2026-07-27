FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for native builds
RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

ENV PORT=5000

#CMD ["npm", "run", "dev"]


