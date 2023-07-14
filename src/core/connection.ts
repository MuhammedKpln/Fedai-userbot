import { Boom } from "@hapi/boom";
import makeWASocket, {
  DisconnectReason,
  WAMessageContent,
  WAMessageKey,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  proto,
} from "@whiskeysockets/baileys";
import NodeCache from "node-cache";
import { Logger } from "./logger";
import { useMongoDBAuthState } from './session/mongodb_helper';
import { MongoClient } from 'mongodb';
import { randomUUID } from 'crypto';


const logger = Logger.child({
  module: "connection",
});

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterCache = new NodeCache();

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({ logger });
store.readFromFile("./baileys_store_multi.json");
// save every 10s
setInterval(() => {
  store?.writeToFile("./baileys_store_multi.json");
}, 10_000);

// start a connection

const startSocket = async () => {
  const mongoClient =  new MongoClient("mongodb://mongoadmin:secret@mongodb:27017/fedai?authSource=admin")
  await mongoClient.connect()


  const key = randomUUID()
  const collection =mongoClient.db('fedai').collection(key)

  const { state, saveCreds } = await  useMongoDBAuthState(collection)
  // fetch latest version of WA Web
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    getMessage,
  });

  store?.bind(sock.ev);

  sock.ev.on("creds.update", async () => {
    await saveCreds();
  });

  sock.ev.on("connection.update", async (conn) => {
    const { connection, lastDisconnect } = conn;
    if (connection === "close") {
      // reconnect if not logged out
      if (
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut
      ) {
        startSocket();
      } else {
        console.log("Connection closed. You are logged out.");
      }
    }

    console.log("connection update", conn);
  });

  return sock;

  async function getMessage(
    key: WAMessageKey,
  ): Promise<WAMessageContent | undefined> {
    if (store) {
      const msg = await store.loadMessage(key.remoteJid!, key.id!);
      return msg?.message || undefined;
    }

    // only if store is present
    return proto.Message.fromObject({});
  }
};

export { startSocket };
