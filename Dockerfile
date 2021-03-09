FROM node:15.11.0-alpine3.10

RUN apk add git libwebp-tools ffmpeg-libs ffmpeg

RUN git clone https://github.com/MuhammedKpln/WhatsApp-Bot /root/fedai
WORKDIR /root/fedai/
RUN npm install
RUN npm run build
WORKDIR /root/fedai/build/src/
CMD ["node", "main.js"]
