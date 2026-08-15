const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys')
const pino = require('pino')
const chalk = require('chalk')

const NOMOR_KAMU = "6285755275609" // GANTI INI PAKE NOMOR KAMU

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const { version } = await fetchLatestBaileysVersion()
    const sock = makeWASocket({ version, logger: pino({ level: 'fatal' }), auth: state })
    sock.ev.on('creds.update', saveCreds)
    if (!state.creds.registered) {
        setTimeout(async () => {
            let code = await sock.requestPairingCode(NOMOR_KAMU)
            console.log(chalk.green.bold(`\nPAIRING CODE: ${code}\n`))
        }, 3000)
    }
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0]
        if (!msg.message) return
        let text = msg.message.conversation
        if (text === '.ping') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'Pong! NaveBot online ✅' })
        }
    })
}
start()
