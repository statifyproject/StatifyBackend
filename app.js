import dotenv from 'dotenv';
import express from 'express';

const __dirname = process.cwd(); //Why the fuck is this necessary?
dotenv.config();
const app = express();

async function apis() {
    try {
        const {youtube} = await import('./apis/youtube.js');
        youtube(app);
    } catch (err) {
        console.log(`failed to load youtube api module: ${err}`);
    }

    try {
        const {reddit} = await import('./apis/reddit.js');
        reddit(app);
    } catch (err) {
        console.log(`failed to load reddit api module: ${err}`);
    }

    try {
        const {twitter} = await import('./apis/twitter.js');
        twitter(app);
    } catch (err) {
        console.log(`failed to load twitter api module: ${err}`);
    }

    try {
        const {twitch} = await import('./apis/twitch.js');
        twitch(app);
    } catch (err) {
        console.log(`failed to load twitch api module: ${err}`);
    }

    try {
        const {discord} = await import('./apis/discord.js');
        discord(app);
    } catch (err) {
        console.log(`failed to load discord api module: ${err}`);
    }

    try {
        const {roblox} = await import('./apis/roblox.js');
        roblox(app);
    } catch (err) {
        console.log(`failed to load roblox api module: ${err}`);
    }

    try {
        const {steam} = await import('./apis/steam.js');
        steam(app);
    } catch (err) {
        console.log(`failed to load steam api module: ${err}`);
    }

    console.log(`finished loading all API files, starting server at http://localhost:1337`);
}

app.get('/', (_req, res) => {
    try {
        res.sendFile(__dirname + '/index.html'); // __dirname doesn't fucking work wot
    } catch (e) {
        console.log('error', e);
    }
});

app.get('*', (_req, res) => {
    try {
        res.json({code: 404, message: 'Non-Existent Endpoint'});
    } catch (err) {
        res.json({code: 500, message: err.message});
        log('error', `Threw 500 error: ${err.message}`);
    }
});

app.listen(1337, apis());
