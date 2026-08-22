import 'dotenv/config';

import './webhook.js';

import {
    REST,
    Routes,
    SlashCommandBuilder,
    Events
} from 'discord.js';

import {
    startServer,
    stopServer,
    restartServer
} from './crafty/api.js';


const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.DISCORD_GUILD_ID;


/*
 * ============================
 * Discord Client
 * ============================
 */

import { client } from './discord.js';


/*
 * ============================
 * Slash Commands
 * ============================
 */

const commands = [
    new SlashCommandBuilder()
        .setName('jochis')
        .setDescription('Controla el servidor de Minecraft')

        .addSubcommand(subcommand =>
            subcommand
                .setName('putea')
                .setDescription('Arranca el servidor de Minecraft')
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('mime')
                .setDescription('Apaga el servidor de Minecraft')
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('again')
                .setDescription('Reinicia el servidor de Minecraft')
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('como_vamo')
                .setDescription('Consulta el estado del servidor')
        )

        .toJSON()
];


/*
 * ============================
 * Registrar comandos
 * ============================
 */

const rest = new REST({
    version: '10'
}).setToken(TOKEN);


async function registerCommands() {

    console.log('Registrando comandos...');

    /*
     * Si tenemos GUILD_ID usamos comandos del servidor.
     * Esto hace que los cambios aparezcan inmediatamente.
     */

    if (GUILD_ID) {

        await rest.put(
            Routes.applicationGuildCommands(
                CLIENT_ID,
                GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            `Comandos registrados en el servidor ${GUILD_ID}.`
        );

    } else {

        /*
         * Fallback: comandos globales
         */

        await rest.put(
            Routes.applicationCommands(
                CLIENT_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            'Comandos globales registrados.'
        );
    }
}


/*
 * ============================
 * Bot conectado
 * ============================
 */

client.once(
    Events.ClientReady,
    readyClient => {

        console.log(
            `Bot conectado como ${readyClient.user.tag}`
        );

    }
);


/*
 * ============================
 * Interacciones
 * ============================
 */

client.on(
    Events.InteractionCreate,
    async interaction => {

        /*
         * Solo nos interesan Slash Commands
         */

        if (!interaction.isChatInputCommand()) {
            return;
        }


        console.log(
            `Interacción recibida: ${interaction.commandName}`
        );


        /*
         * Solo manejamos /jochis
         */

        if (interaction.commandName !== 'jochis') {
            return;
        }


        const subcommand =
            interaction.options.getSubcommand();


        console.log(
            `Subcomando recibido: ${subcommand}`
        );


        /*
         * Respondemos inmediatamente a Discord.
         *
         * Discord da aproximadamente 3 segundos
         * para responder una interacción.
         */

        await interaction.deferReply();


        try {

            /*
             * ============================
             * ARRANCAR
             * /jochis putea
             * ============================
             */

            if (subcommand === 'putea') {

                console.log(
                    'Iniciando Minecraft...'
                );

                await startServer();

                console.log(
                    'Crafty aceptó la petición de inicio.'
                );

                await interaction.editReply(
                    '🟢 **Minecraft está arrancando.**'
                );

                return;
            }


            /*
             * ============================
             * APAGAR
             * /jochis mime
             * ============================
             */

            if (subcommand === 'mime') {

                console.log(
                    'Apagando Minecraft...'
                );

                await stopServer();

                console.log(
                    'Crafty aceptó la petición de apagado.'
                );

                await interaction.editReply(
                    '🔴 **Minecraft se está apagando.**'
                );

                return;
            }


            /*
             * ============================
             * REINICIAR
             * /jochis again
             * ============================
             */

            if (subcommand === 'again') {

                console.log(
                    'Reiniciando Minecraft...'
                );

                await restartServer();

                console.log(
                    'Crafty aceptó la petición de reinicio.'
                );

                await interaction.editReply(
                    '🔄 **Minecraft se está reiniciando.**'
                );

                return;
            }


            /*
             * ============================
             * ESTADO
             * /jochis como_vamo
             * ============================
             */

            if (subcommand === 'como_vamo') {

                console.log(
                    'Consultando estado de Minecraft...'
                );

                await interaction.editReply(
                    '📊 **El estado de Minecraft todavía no está implementado.**'
                );

                return;
            }

        } catch (error) {

            console.error(
                'Error controlando Minecraft:',
                error
            );


            /*
             * En caso de error intentamos
             * avisar al usuario.
             */

            const message =
                '❌ **No pude ejecutar la acción.**\n' +
                'Revisa los logs del bot.';


            if (interaction.deferred) {

                await interaction.editReply(
                    message
                );

            } else {

                await interaction.reply({
                    content: message,
                    ephemeral: true
                });

            }

        }

    }
);


/*
 * ============================
 * Inicio
 * ============================
 */

await registerCommands();

await client.login(TOKEN);
