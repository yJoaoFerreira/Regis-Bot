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
});

function formatRollOutput(total, rolls, originalRollString, modifier) {
    let rollDetails = `[${rolls.join(', ')}] ${originalRollString}`;
    if (modifier !== 0) {
        rollDetails += ` ${modifier > 0 ? '+ ' : ''}${modifier}`;
    }
    return `\` ${total} \` ⟵ ${rollDetails}`;
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    const rollRegex = /^(\d*)([#]?)d(\d+)([\+\-]\d+)?/i;
    const match = content.match(rollRegex);

    if (match) {
        let numDice = parseInt(match[1]) || 1;
        const individualRollsFlag = match[2] === '#';
        let sides = parseInt(match[3]);
        let modifier = 0;

        if (match[4]) {
            modifier = parseInt(match[4]);
        }

        if (numDice <= 0 || numDice > 100) {
            return message.reply(`Não consigo rolar ${numDice} dados. Tente entre 1 ~ 100 dados.`);
        }
        if (sides <= 1 || sides > 1000) {
            return message.reply(`Não consigo rolar um d${sides}. Tente dados com d2 ~ d1000.`);
        }

        let fullResponse = '';

        if (individualRollsFlag) {
            const lines = [];
            for (let i = 0; i < numDice; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                const total = roll + modifier;
                lines.push(formatRollOutput(total, [roll], `1d${sides}`, modifier));
            }
            fullResponse += lines.join('\n');
        } else {
            const rolls = [];
            for (let i = 0; i < numDice; i++) {
                rolls.push(Math.floor(Math.random() * sides) + 1);
            }
            const total = rolls.reduce((sum, current) => sum + current, 0) + modifier;
            fullResponse += formatRollOutput(total, rolls, `${numDice}d${sides}`, modifier);
        }
        
        await message.reply(fullResponse);
    }
});

const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error("Erro: O token do bot não foi encontrado nas variáveis de ambiente.");
    console.error("Certifique-se de que o arquivo .env existe e contém DISCORD_TOKEN=SEU_TOKEN_AQUI");
} else {
    client.login(token);
}

/* 
- Fazer o "-" ter espaçamento igual o "+";
- Adicionar o * para multiplicação;
- Adicionar o / para divisão;
- Adicionar suporte à mais de um argumento de bônus;
*/ 