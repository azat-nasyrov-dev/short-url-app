FROM node:16.3.0-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16.3.0-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/node_modules ./node_modules/
COPY --from=build /app/dist ./dist
USER appuser
EXPOSE 3001
CMD ["node", "./dist/main.js"]
