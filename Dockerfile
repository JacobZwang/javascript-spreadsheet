FROM node:18 AS builder

RUN npm install pnpm -g

COPY package.json package.json

COPY pnpm-lock.yaml pnpm-lock.yaml

RUN pnpm install --ignore-scripts

COPY . .

RUN pnpm run build




FROM node:18

COPY --from=builder .output ./

EXPOSE 3000

CMD ["node", "./server/index.mjs"]