FROM node:latest

RUN git clone https://github.com/MuhammedKpln/WhatsApp-Bot /root/fedai
WORKDIR /root/fedai/
ENV TZ=Europe/Istanbul
RUN npm install
RUN npm run build
RUN ls
WORKDIR /root/fedai/build/src/
# COPY /root/fedai/languages/TR.json /root/fedai/build/src/languages/TR.json
# COPY /root/fedai/languages/EN.json /root/fedai/build/src/languages/EN.json
# CMD ["npm", "run", "start"]
CMD ["node", "main.js"]
