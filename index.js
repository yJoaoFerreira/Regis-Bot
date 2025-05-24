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

function formatRollOutput(total, rolls, originalRollString, finalModifierString) {
    let rollDetails = `[${rolls.join(', ')}] ${originalRollString}`;
    if (finalModifierString) {
        rollDetails += ` ${finalModifierString}`;
    }
    return `\` ${total} \` ⟵ ${rollDetails}`;
}

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();

    const rollRegex = /^(\d*)([#]?)d(\d+)(.*)?/i;
    const match = content.match(rollRegex);

    if (match) {
        let numDice = parseInt(match[1]) || 1;
        const individualRollsFlag = match[2] === '#';
        let sides = parseInt(match[3]);
        let rawModifiersString = match[4] ? match[4].trim() : '';

        if (numDice <= 0 || numDice > 100) {
            return message.reply(`Não consigo rolar ${numDice} dados. Tente entre 1 ~ 100 dados.`);
        }
        if (sides <= 1 || sides > 1000) {
            return message.reply(`Não consigo rolar um d${sides}. Tente dados com d2 ~ d1000.`);
        }

        let fullResponse = '';
        
        const modifierParserRegex = /([\+\-\*x\/])(\d+)/g;

        let modifiers = [];
        let modMatch;

        while ((modMatch = modifierParserRegex.exec(rawModifiersString)) !== null) {
            modifiers.push({
                operator: modMatch[1],
                value: parseInt(modMatch[2])
            });
        }

        for (const mod of modifiers) {
            if ((mod.operator === '*' || mod.operator === '/' || mod.operator === 'x') && mod.value <= 0) {
                return message.reply("O valor para multiplicação/divisão deve ser maior que 0.");
            }
        }

        let finalModifierString = modifiers.map(mod => {
            let op = mod.operator;
            if (op === 'x') op = '*';
            return `${op} ${mod.value}`;
        }).join(' ');

        if (modifiers.length === 0) {
            finalModifierString = '';
        }

        if (individualRollsFlag) {
            const lines = [];
            for (let i = 0; i < numDice; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                let currentTotal = roll;
                let tempTotalForMulDiv = currentTotal;

                for (const mod of modifiers) {
                    if (mod.operator === '*' || mod.operator === 'x') {
                        tempTotalForMulDiv *= mod.value;
                    } else if (mod.operator === '/') {
                        tempTotalForMulDiv = Math.floor(tempTotalForMulDiv / mod.value);
                    }
                }
                currentTotal = tempTotalForMulDiv;

                for (const mod of modifiers) {
                     if (mod.operator === '+') {
                        currentTotal += mod.value;
                    } else if (mod.operator === '-') {
                        currentTotal -= mod.value;
                    }
                }
                
                lines.push(formatRollOutput(currentTotal, [roll], `1d${sides}`, finalModifierString));
            }
            fullResponse += lines.join('\n');

        } else {
            const rolls = [];
            for (let i = 0; i < numDice; i++) {
                rolls.push(Math.floor(Math.random() * sides) + 1);
            }
            let total = rolls.reduce((sum, current) => sum + current, 0);

            let tempTotalForMulDiv = total;

            for (const mod of modifiers) {
                if (mod.operator === '*' || mod.operator === 'x') {
                    tempTotalForMulDiv *= mod.value;
                } else if (mod.operator === '/') {
                    tempTotalForMulDiv = Math.floor(tempTotalForMulDiv / mod.value);
                }
            }

            total = tempTotalForMulDiv;

            for (const mod of modifiers) {
                 if (mod.operator === '+') {
                    total += mod.value;
                } else if (mod.operator === '-') {
                    total -= mod.value;
                }
            }
            
            fullResponse += formatRollOutput(total, rolls, `${numDice}d${sides}`, finalModifierString);
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
- Caso seja crítico ou desastre, ficar em caps;
*/ 