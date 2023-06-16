const { useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const makeWASocket = require("@whiskeysockets/baileys").default;
const { sleep } = require("./utilities");
const { getUsers, pushUsers } = require("./database");
const fs = require('fs');

let sock = null;
let authInfo = null;

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        connect();
      }
    } else if (connection === "open") {
      console.log("Conectado a WA!");
    }
  });

  sock.ev.on('creds.update', saveCreds);

  return sock;
}

async function sendMessage( res) {
  const sock = await connect();
  let coutMessage = 0;
  let coutTotal = 0;
  let time = new Date();


  getUsers(async (users) => {
    for (i = 0; i < users.length; i++) {
      const user = users[i];
      await sleep(10000);
      if (coutMessage == 2) {
        await sleep(10000);
        coutMessage = 0;
      } else {
        coutMessage++;
      }

      const id = `591${user.phone}@s.whatsapp.net`;

      try {
        await sock.sendMessage(id, { text: user.message });
        if (user.img !== null) {
          await sock.sendMessage(id, {
            image: { url: user.img },
            caption: "",
          });
        }
        if (user.pdf !== null) {
          await sock.sendMessage(id, {
            document: { url: params.pdf },
            caption: "",
          });
        }

        console.log(`Mensaje enviado correctamente a ${user.phone} | ${time}.`);

        pushUsers(async (conn) => {
          coutTotal++;
          conn.query("INSERT INTO reports (phone, time) VALUES (?,?)", [
            user.phone,
            time,
          ]);
          conn.query(`DELETE FROM contacts WHERE phone = ${user.phone}`);
          conn.end();
          if (coutTotal === users.length) {
            console.log("Todos los mensajes fueron enviados correctamente.");
          }
        });
      } catch (err) {
        console.log(err);
        if (err) {
          dataRes = { msg: "Ocurrió un error desconocido", data: err };
        }
      }
    }
  });
};

const get_enviarmensaje = async (req, res) => sendMessage(req.query, res);
const post_enviarmensaje = async (req, res) => sendMessage(req.body, res);


module.exports = {
  connect,
  get_enviarmensaje,
  post_enviarmensaje,
  sendMessage,
};
