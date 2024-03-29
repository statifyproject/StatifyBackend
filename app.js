'use strict';
import Fastify from 'fastify';
const fastify = Fastify();
import { resolve, join } from 'path';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import fastifyFavicon from 'fastify-favicon';

dotenv.config();

fastify.register(fastifyStatic, {
    root: join(resolve('.'), 'public'),
});
fastify.register(fastifyFavicon, {
    path: join(resolve('.'), 'public/images'),
    name: 'favicon.ico',
});

async function tryLoad(name) {
    try {
        const { endpoint } = await import(`./routes/${name}.js`);
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

fastify
    .listen({ port: 3000 })
    .then(address => console.log(`Listening on ${address}`))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
