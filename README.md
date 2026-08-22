# ⛏️ MineCloud

> Minecraft server + Discord bot + Docker, porque entrar al servidor a levantar Minecraft manualmente es demasiado trabajo.

**MineCloud** es un pequeño proyecto que hice para poder administrar un servidor de Minecraft desde Discord, manteniendo todo lo más automatizado y sencillo posible.

La idea es bastante simple:

**Discord → Bot → Crafty → Minecraft**

Y para no depender de abrir puertos directamente en el router, el proyecto puede utilizar **Playit** y **Cloudflare Tunnel** para exponer los servicios.

---

## ✨ ¿Qué hace?

MineCloud junta varias piezas para tener un servidor de Minecraft fácil de administrar:

* 🎮 **Crafty Controller** para administrar Minecraft.
* 🤖 **Discord Bot** para controlar el servidor desde Discord.
* 🐳 **Docker Compose** para levantar todos los servicios.
* 🌐 **Playit** para exponer Minecraft sin abrir puertos en el router.
* ☁️ **Cloudflare Tunnel** para servicios HTTP internos.
* 🔐 Variables de entorno para mantener tokens y credenciales fuera del repositorio.

Actualmente el bot permite:

| Comando             | Acción                              |
| ------------------- | ----------------------------------- |
| `/jochis putea`     | 🟢 Arranca Minecraft                |
| `/jochis mime`      | 🔴 Apaga Minecraft                  |
| `/jochis again`     | 🔄 Reinicia Minecraft               |
| `/jochis como_vamo` | 📊 Consulta el estado *(pendiente)* |

Sí, los nombres de los comandos son así a propósito. 💀

---

## 🧩 Arquitectura

La estructura actual es aproximadamente:

```text
                         ┌──────────────────┐
                         │      Discord     │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Discord Bot    │
                         │   Node.js        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │      Crafty      │
                         │ Minecraft Server │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │    Minecraft     │
                         └──────────────────┘

              ┌──────────────────┐
              │      Playit      │
              │ Minecraft Tunnel │
              └────────┬─────────┘
                       │
                       ▼
                  Internet 🌎

              ┌──────────────────┐
              │   Cloudflared    │
              │  Cloudflare      │
              │     Tunnel       │
              └──────────────────┘
```

Todo esto se levanta utilizando `docker compose`.

---

# 🚀 Instalación

## 1. Requisitos

Necesitas tener instalado:

* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/)
* Una cuenta de Discord
* Un Discord Bot
* Una cuenta de Playit si quieres utilizarlo para Minecraft
* Un Cloudflare Tunnel si quieres utilizar Cloudflare

No necesitas instalar Node.js directamente en el servidor para el bot, ya que este se ejecuta dentro de Docker.

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/dromel06/minecloud.git
cd minecloud
```

---

## 3. Crear el `.env`

El proyecto incluye un `.env.example` con las variables necesarias.

Cópialo:

```bash
cp .env.example .env
```

Después edita:

```bash
nano .env
```

El archivo debería quedar aproximadamente así:

```env
# Playit
PLAYIT_SECRET_KEY=TU_PLAYIT_SECRET_KEY

# Cloudflare
TUNNEL_TOKEN=TU_CLOUDFLARE_TUNNEL_TOKEN

# Discord
DISCORD_TOKEN=TU_DISCORD_BOT_TOKEN
DISCORD_CLIENT_ID=TU_DISCORD_CLIENT_ID
DISCORD_GUILD_ID=TU_DISCORD_SERVER_ID

# Crafty
CRAFTY_URL=https://crafty:8443
CRAFTY_TOKEN=TU_CRAFTY_API_TOKEN
CRAFTY_SERVER_ID=ID_DEL_SERVIDOR
```

⚠️ **No subas `.env` a GitHub.**

El repositorio ya utiliza `.env.example` para indicar qué variables necesita el proyecto.

---

# 🤖 Configurar Discord

Primero necesitas crear una aplicación desde el **Discord Developer Portal**.

Crea una aplicación y agrega un Bot.

Necesitarás:

```text
DISCORD_TOKEN
DISCORD_CLIENT_ID
DISCORD_GUILD_ID
```

### Discord Token

El token del bot se obtiene desde la sección **Bot** de tu aplicación.

```env
DISCORD_TOKEN=xxxxxxxxxxxxxxxx
```

### Client ID

El `CLIENT_ID` corresponde al **Application ID** de tu aplicación.

```env
DISCORD_CLIENT_ID=123456789012345678
```

### Guild ID

El `GUILD_ID` es el ID de tu servidor de Discord.

```env
DISCORD_GUILD_ID=123456789012345678
```

El bot registra los slash commands directamente en el servidor cuando `DISCORD_GUILD_ID` está definido, haciendo que los cambios aparezcan inmediatamente.

---

# 🎮 Configurar Crafty

MineCloud utiliza [Crafty Controller](https://craftycontrol.com/) para administrar el servidor de Minecraft.

El servicio se ejecuta mediante Docker y expone:

```text
8000   → HTTP
8443   → HTTPS
25500-25510
25565  → Minecraft
```

La configuración actual del Compose también mantiene los datos importantes de Crafty en `./data`, por lo que los mundos, logs, backups y configuración sobreviven aunque el contenedor sea recreado.

La estructura termina siendo:

```text
data/
├── backups/
├── config/
├── import/
├── logs/
└── servers/
```

---

# 🔑 Crafty API

El bot necesita comunicarse con Crafty para poder controlar el servidor.

En `.env`:

```env
CRAFTY_URL=https://crafty:8443
CRAFTY_TOKEN=TU_TOKEN
CRAFTY_SERVER_ID=TU_SERVER_ID
```

Como el bot y Crafty están dentro de la misma red Docker, el bot puede comunicarse con Crafty utilizando:

```text
https://crafty:8443
```

en lugar de utilizar la IP pública del servidor.

---

# 🌐 Playit

Si tu ISP no permite abrir puertos del router, **Playit** es probablemente la opción más sencilla para exponer Minecraft.

El Compose ya incluye el agente de Playit:

```yaml
playit:
  image: ghcr.io/playit-cloud/playit-agent:1.0
  network_mode: host
```

Solo necesitas colocar la clave correspondiente en:

```env
PLAYIT_SECRET_KEY=TU_SECRET_KEY
```

Después puedes configurar el túnel de Playit para apuntar al puerto de Minecraft:

```text
Local IP:   127.0.0.1
Local Port: 25565
```

Una vez configurado, Playit será el encargado de proporcionar la dirección que utilizarán los jugadores para conectarse.

---

# ☁️ Cloudflare Tunnel

Cloudflare Tunnel se incluye para poder exponer servicios HTTP sin abrir puertos directamente.

En `.env`:

```env
TUNNEL_TOKEN=TU_CLOUDFLARE_TUNNEL_TOKEN
```

El contenedor utiliza:

```yaml
command: tunnel --no-autoupdate run
```

y se conecta utilizando el token proporcionado por Cloudflare.

> **Importante:** Cloudflare Tunnel no reemplaza el túnel de Minecraft de Playit en esta configuración. Cada uno tiene su propósito.

---

# 🐳 Levantar MineCloud

Una vez configurado `.env`:

```bash
docker compose up -d
```

Comprueba los contenedores:

```bash
docker compose ps
```

Y revisa los logs:

```bash
docker compose logs -f
```

Para revisar únicamente el bot:

```bash
docker compose logs -f discord-bot
```

---

# 🤖 Activar el Discord Bot

El bot está configurado como un **Docker Compose profile**, así que no se inicia con el `docker compose up -d` normal.

Para levantarlo:

```bash
docker compose --profile discord up -d
```

Esto inicia el servicio:

```text
minecraft-discord-bot
```

El bot utiliza Node.js y `discord.js` para manejar las interacciones de Discord.

---

# 🛑 Detener MineCloud

Para apagar todo:

```bash
docker compose --profile discord down
```

Para reiniciar:

```bash
docker compose --profile discord restart
```

---

# 📂 Estructura del proyecto

```text
minecloud/
│
├── discord-bot/
│   ├── src/
│   │   ├── crafty/
│   │   ├── discord.js
│   │   ├── index.js
│   │   └── webhook.js
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── data/
│   ├── backups/
│   ├── config/
│   ├── import/
│   ├── logs/
│   └── servers/
│
├── .env.example
├── .gitignore
└── docker-compose.yml
```

El bot mantiene separada la lógica de Discord y la comunicación con Crafty, mientras que Docker Compose se encarga de conectar los diferentes servicios.

---

# 🛠️ Desarrollo

Si quieres trabajar directamente con el bot:

```bash
cd discord-bot
npm install
npm start
```

Aunque para el despliegue normal recomiendo utilizar Docker.

El proyecto actualmente utiliza:

* Node.js
* Discord.js
* Express
* dotenv
* Docker
* Docker Compose
* Crafty Controller
* Playit
* Cloudflare Tunnel

---

# 📌 Cosas que faltan / próximas ideas

Este proyecto todavía está en desarrollo, así que hay varias cosas que me gustaría agregar:

* [ ] Implementar `/jochis como_vamo`
* [ ] Mostrar jugadores conectados
* [ ] Mostrar TPS / memoria / CPU
* [ ] Enviar eventos de Crafty a Discord
* [ ] Notificar cuando Minecraft termina de iniciar
* [ ] Notificar cuando alguien entra o sale
* [ ] Sistema de permisos para comandos
* [ ] Backups desde Discord
* [ ] Restaurar backups desde Discord
* [ ] Comando para enviar mensajes al servidor
* [ ] Mejorar manejo de errores
* [ ] Dashboard web
* [ ] Soporte para múltiples servidores

---

# ⚠️ Seguridad

Hay algunas cosas importantes antes de poner esto en producción.

**Nunca subas tu `.env`:**

```text
.env
```

Tampoco compartas:

```text
DISCORD_TOKEN
PLAYIT_SECRET_KEY
TUNNEL_TOKEN
CRAFTY_TOKEN
```

Si alguno de estos tokens termina en GitHub, Discord, una captura o cualquier otro lugar público, **revócalo y genera uno nuevo**.

---

# 💡 ¿Por qué hice esto?

Porque quería algo bastante sencillo:

> Tener mi servidor de Minecraft corriendo en mi propia máquina y poder controlarlo sin tener que conectarme por SSH cada vez que alguien quiera jugar.

En lugar de entrar al servidor, buscar el contenedor, abrir Crafty y hacer todo manualmente...

```text
Discord
   ↓
/jochis putea
   ↓
Bot
   ↓
Crafty API
   ↓
Minecraft 🟢
```

Y listo.

---

# 🤝 Contribuciones

Si quieres mejorar alguna parte del proyecto, eres bienvenido.

Puedes hacer un fork, crear una rama y mandar un Pull Request.

```bash
git checkout -b feature/nueva-funcion
git commit -m "Add nueva función"
git push origin feature/nueva-funcion
```

---

# 📜 Licencia

Este proyecto se distribuye bajo la licencia incluida en el repositorio.

---

<p align="center">

**⛏️ MineCloud**

Hecho para no tener que levantar Minecraft a mano cada vez que queremos jugar.

</p>
