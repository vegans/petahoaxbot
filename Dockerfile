FROM mhart/alpine-node:12

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn

COPY . .
RUN yarn build

FROM mhart/alpine-node:slim-12

# ENV NODE_ENV=production
ENV NODE_ENV=production
WORKDIR /app

COPY --from=0 /app .

CMD ["yarn", "dist"]
