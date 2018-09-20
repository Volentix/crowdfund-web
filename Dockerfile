FROM node:8-alpine

ADD . /code
WORKDIR /code

RUN yarn install
RUN yarn run build
RUN yarn global add serve
CMD [ "serve", "-s", "dist"]
