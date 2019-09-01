FROM node:12.9
WORKDIR /project
COPY package.json ./
RUN npm install
COPY ./ /project
