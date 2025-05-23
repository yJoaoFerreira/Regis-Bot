require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.once('ready', () => {
    console.log(`Bot logado como ${client.user.tag}`);
    console.log('-----------------------');
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = '!';

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        await message.channel.send('Pong!');
    }
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error("Erro: O token do bot não foi encontrado nas variáveis de ambiente.");
    console.error("Certifique-se de que o arquivo .env existe e contém DISCORD_TOKEN=SEU_TOKEN_AQUI");
} else {
    client.login(token);
}