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
    const rollRegex = /^(\d*)([#]?)d(\d+)(?:([\*x\/])(\d+))?(?:([\+\-])(\d+))?/i;
    const match = content.match(rollRegex);

    if (match) {
        let numDice = parseInt(match[1]) || 1;
        const individualRollsFlag = match[2] === '#';
        let sides = parseInt(match[3]);

        let opMulDiv = match[4];
        let valMulDiv = parseInt(match[5]) || 1;

        let opAddSub = match[6];
        let valAddSub = parseInt(match[7]) || 0;
        
        if (numDice <= 0 || numDice > 100) {
            return message.reply(`Não consigo rolar ${numDice} dados. Tente entre 1 ~ 100 dados.`);
        }
        if (sides <= 1 || sides > 1000) {
            return message.reply(`Não consigo rolar um d${sides}. Tente dados com d2 ~ d1000.`);
        }
        if (valMulDiv <= 0 && (opMulDiv === '*' || opMulDiv === '/')) {
            return message.reply("O valor para multiplicação/divisão deve ser maior que 0.");
        }


        let fullResponse = '';
        let originalRollStringUsed = `${numDice || ''}${individualRollsFlag ? '#' : ''}d${sides}`;
        let finalModifierString = '';

        if (opMulDiv) {
            finalModifierString += `${opMulDiv === 'x' ? '*' : opMulDiv} ${valMulDiv}`;
        }
        if (opAddSub) {
            finalModifierString += ` ${opAddSub} ${valAddSub}`;
        }
        if (!opMulDiv && !opAddSub) {
             finalModifierString = '';
        }


        if (individualRollsFlag) {
            const lines = [];
            for (let i = 0; i < numDice; i++) {
                const roll = Math.floor(Math.random() * sides) + 1;
                let currentTotal = roll;

                if (opMulDiv === '*') {
                    currentTotal *= valMulDiv;
                } else if (opMulDiv === '/' && valMulDiv !== 0) {
                    currentTotal = Math.floor(currentTotal / valMulDiv);
                } else if (opMulDiv === 'x') {
                    currentTotal *= valMulDiv;
                }

                if (opAddSub === '+') {
                    currentTotal += valAddSub;
                } else if (opAddSub === '-') {
                    currentTotal -= valAddSub;
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

            if (opMulDiv === '*') {
                total *= valMulDiv;
            } else if (opMulDiv === '/' && valMulDiv !== 0) {
                total = Math.floor(total / valMulDiv);
            } else if (opMulDiv === 'x') {
                 total *= valMulDiv;
            }

            if (opAddSub === '+') {
                total += valAddSub;
            } else if (opAddSub === '-') {
                total -= valAddSub;
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
- Adicionar suporte à mais de um argumento de bônus;
- Caso seja crítico ou desastre, ficar em caps;
*/ 