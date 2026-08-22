import express from 'express';
import {
    EmbedBuilder
} from 'discord.js';

const app = express();

app.use(express.json());

const PORT = process.env.WEBHOOK_PORT || 3000;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;


/*
 * ============================
 * Webhook de Crafty
 * ============================
 */

app.post('/crafty', async (req, res) => {

    console.log('Webhook recibido desde Crafty:');

    console.log(
        JSON.stringify(req.body, null, 2)
    );


    /*
     * Respondemos inmediatamente a Crafty.
     */

    res.sendStatus(200);


    try {

        const payload = req.body;

        /*
         * Crafty nos manda un array de embeds.
         */

        const craftyEmbed =
            payload.embeds?.[0];

        if (!craftyEmbed) {

            console.log(
                'Webhook sin embed, ignorando.'
            );

            return;
        }


        /*
         * Información del servidor
         */

        const serverName =
            craftyEmbed.author?.name ||
            craftyEmbed.title ||
            'Minecraft';


        const description =
            craftyEmbed.description || '';


        /*
         * Detectamos el evento.
         */

        const lowerDescription =
            description.toLowerCase();


        let status;
        let emoji;
        let title;


        if (
            lowerDescription.includes('has started') ||
            lowerDescription.includes('started!')
        ) {

            status = 'ONLINE';
            emoji = '🟢';
            title = 'Minecraft iniciado';

        } else if (
            lowerDescription.includes('has stopped') ||
            lowerDescription.includes('stopped!')
        ) {

            status = 'OFFLINE';
            emoji = '🔴';
            title = 'Minecraft apagado';

        } else if (
            lowerDescription.includes('restarted') ||
            lowerDescription.includes('restarting')
        ) {

            status = 'REINICIANDO';
            emoji = '🔄';
            title = 'Minecraft reiniciándose';

        } else {

            status = 'EVENTO';
            emoji = '📢';
            title = 'Evento de Minecraft';

        }


        /*
         * ============================
         * Discord
         * ============================
         */

        const channel =
            await getDiscordChannel();


        if (!channel) {

            console.error(
                'No se encontró el canal de Discord.'
            );

            return;
        }


        /*
         * Creamos nuestro propio Embed.
         */

        const embed = new EmbedBuilder()
            .setTitle(`${emoji} ${title}`)
            .setDescription(
                `**Servidor:** ${serverName}\n\n` +
                `**Estado:** ${status}`
            )
            .setTimestamp();


        /*
         * Añadimos el evento original
         * como información adicional.
         */

        embed.addFields({
            name: 'Evento',
            value: description
                .replace(/\n/g, ' ')
                .trim()
                .slice(0, 1024)
        });


        /*
         * Footer
         */

        embed.setFooter({
            text: 'Jochis Minecraft Bot'
        });


        await channel.send({
            embeds: [embed]
        });


        console.log(
            'Evento enviado a Discord.'
        );


    } catch (error) {

        console.error(
            'Error procesando webhook:',
            error
        );

    }

});


/*
 * ============================
 * Obtener canal
 * ============================
 */

async function getDiscordChannel() {

    /*
     * Importamos el cliente de Discord
     * creado en index.js.
     */

    const {
        client
    } = await import('./discord.js');


    return client.channels.fetch(
        DISCORD_CHANNEL_ID
    );

}


/*
 * ============================
 * Servidor HTTP
 * ============================
 */

app.listen(
    PORT,
    '0.0.0.0',
    () => {

        console.log(
            `Webhook escuchando en puerto ${PORT}`
        );

    }
);
