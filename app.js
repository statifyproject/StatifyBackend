import dotenv from 'dotenv';
import express from 'express';

import {youtube} from './apis/youtube.js';
import {twitter} from './apis/twitter.js';
import {twitch} from './apis/twitch.js';
import {discord} from './apis/discord.js';
//import {reddit} from './apis/reddit.js';
import {roblox} from './apis/roblox.js';
import {steam} from './apis/steam.js';

dotenv.config();

const app = express();

youtube(app);
twitter(app);
twitch(app);
discord(app);
//reddit(app);
roblox(app);
steam(app);

app.get('/', (_req, res) => {
    try {
        res.sendFile(process.cwd() + '/index.html'); // __dirname doesn't fucking work wot
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

app.listen(1337, () => {
    console.log('Server started on port 1337');
});
