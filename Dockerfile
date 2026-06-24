# Alterado para a versão 22
FROM node:22

ENV CI=true

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile --config.strict-dep-builds=false

RUN pnpm prisma generate

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "start:prod"]
