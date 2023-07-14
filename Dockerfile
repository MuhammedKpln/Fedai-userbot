FROM node:18-alpine

RUN apk add git libwebp-tools ffmpeg-libs ffmpeg

COPY . /root/fedai
WORKDIR /root/fedai/
RUN npm install
RUN npm run build
WORKDIR /root/fedai/build/src/
CMD ["node", "main.js"]
