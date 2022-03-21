'use strict';
import Fastify from 'fastify';
const fastify = Fastify();
import {resolve, join} from 'path';
import fastifyStatic from 'fastify-static';
import dotenv from 'dotenv';

dotenv.config();

fastify.register(fastifyStatic, {
    root: join(resolve('.'), 'public'),
});

try {
    const {discord} = await import('./routes/discord.js');
    discord(fastify);
} catch (err) {
    console.log('Failed to load Discord route:', err.message);
}

try {
    const {roblox} = await import('./routes/roblox.js');
    roblox(fastify);
} catch (err) {
    console.log('Failed to load Roblox route:', err.message);
}

try {
    const {steam} = await import('./routes/steam.js');
    steam(fastify);
} catch (err) {
    console.log('Failed to load Steam route:', err.message);
}

try {
    const {twitch} = await import('./routes/twitch.js');
    twitch(fastify);
} catch (err) {
    console.log('Failed to load Twitch route:', err.message);
}

try {
    const {twitter} = await import('./routes/twitter.js');
    twitter(fastify);
} catch (err) {
    console.log('Failed to load Twitter route:', err.message);
}

try {
    const {youtube} = await import('./routes/youtube.js');
    youtube(fastify);
} catch (err) {
    console.log('Failed to load YouTube route:', err.message);
}

fastify.get('/', async (_req, reply) => {
    return reply.sendFile('/pages/index.html');
});

fastify.get('/counter*', async (_req, reply) => {
    return reply.sendFile('/pages/counter/counter.html');
});

const start = async () => {
    try {
        await fastify.listen(3000, '127.0.0.1'); // 127.0.0.1 must be specified or things will break
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
