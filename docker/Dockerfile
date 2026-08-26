FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --ignore-scripts

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=@marketlens/web", "--", "--hostname", "0.0.0.0"]
