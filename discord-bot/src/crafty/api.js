const CRAFTY_URL = process.env.CRAFTY_URL;
const CRAFTY_TOKEN = process.env.CRAFTY_TOKEN;
const CRAFTY_SERVER_ID = process.env.CRAFTY_SERVER_ID;

async function craftyRequest(endpoint, options = {}) {
    const response = await fetch(`${CRAFTY_URL}${endpoint}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${CRAFTY_TOKEN}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        data = text;
    }

    if (!response.ok) {
        throw new Error(
            `Crafty API ${response.status}: ${JSON.stringify(data)}`
        );
    }

    return data;
}

/**
 * Arranca el servidor
 */
export async function startServer() {
    return craftyRequest(
        `/api/v2/servers/${CRAFTY_SERVER_ID}/action/start_server`,
        {
            method: 'POST'
        }
    );
}

/**
 * Apaga el servidor
 */
export async function stopServer() {
    return craftyRequest(
        `/api/v2/servers/${CRAFTY_SERVER_ID}/action/stop_server`,
        {
            method: 'POST'
        }
    );
}

/**
 * Reinicia el servidor
 */
export async function restartServer() {
    return craftyRequest(
        `/api/v2/servers/${CRAFTY_SERVER_ID}/action/restart_server`,
        {
            method: 'POST'
        }
    );
}
