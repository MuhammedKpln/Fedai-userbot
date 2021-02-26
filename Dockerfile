FROM node:latest

RUN git clone https://github.com/MuhammedKpln/WhatsApp-Bot /root/fedai
WORKDIR /root/fedai/
ENV TZ=Europe/Istanbul
RUN npm install
RUN npm build

CMD ["npm", "start"]
