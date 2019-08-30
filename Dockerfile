FROM node:12.9
WORKDIR /project
COPY ./ ./
RUN npm install
