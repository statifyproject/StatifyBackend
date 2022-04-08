'use strict';
import Fastify from 'fastify';
const fastify = Fastify();
import {resolve, join} from 'path';
import fastifyStatic from 'fastify-static';
import dotenv from 'dotenv';
import fastifyFavicon from 'fastify-favicon';

dotenv.config();

fastify.register(fastifyStatic, {
    root: join(resolve('.'), 'public'),
});
fastify.register(fastifyFavicon, {
    path: join(resolve('.'), 'public/images'),
});

async function tryLoad(name) {
    try {
        const {endpoint} = await import(`./routes/${name}.js`);
        endpoint(fastify);
        console.info(`Loaded ${name}`);
    } catch (err) {
        console.error(`Failed to load ${name}: ${err.message}`);
    }
}

await tryLoad('discord');
await tryLoad('roblox');
await tryLoad('steam');
await tryLoad('twitch');
await tryLoad('twitter');
await tryLoad('youtube');
await tryLoad('tiktok');
await tryLoad('osu');

fastify.get('/', async (_req, reply) => {
    return reply.sendFile('/pages/index.html');
});

fastify.get('/build*', async (_req, reply) => {
    return reply.sendFile('/pages/counter/builder.html');
});

fastify.get('/count*', async (_req, reply) => {
    return reply.sendFile('/pages/counter/counter.html');
});

async function start() {
    try {
        await fastify.listen(3000, '127.0.0.1'); // 127.0.0.1 must be specified or it will default to IPv6
        console.log(`Statify listening on http://${fastify.server.address().address}:${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}
start();
