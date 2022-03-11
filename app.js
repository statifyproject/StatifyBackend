const twitter = true; //Twitter API
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/youtube/*', async (req, res) => {
    const path = req.path.replace('/youtube', '').replace('/', '');
    const link = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${path}&key=AIzaSyDpL6Q7EnBQXhYuYn7kMqoogAH7tzCmOHQ`,
    );
    const reqs = await link.json();
    if (reqs.pageInfo.totalResults == 0) {
        res.json({
            code: 404,
            message:
                'Channel not found, check if you provided channel ID, not name',
        });
        return;
    }
    res.json({
        subscribers: reqs.items[0].statistics.subscriberCount,
        views: reqs.items[0].statistics.viewCount,
    });
});

app.get('/discord/*', async (req, res) => {
    const path = req.path.replace('/discord', '').replace('/', '');
    const link = await fetch(
        `https://discordapp.com/api/v9/invites/${path}?with_counts=true`,
    );
    const reqs = await link.json();
    if (reqs.code == 10006) {
        res.json({
            code: 404,
            message:
                'Guild not found, check if you provided Invite Code, not Guild ID',
        });
        return;
    } else {
        res.json({
            name: reqs.guild.name,
            members: reqs.approximate_member_count,
            online: reqs.approximate_presence_count,
            boosts: reqs.guild.premium_subscription_count,
        });
    }
});

app.get('/twitter/*', async (req, res) => {
    const path = req.path.replace('/twitter', '').replace('/', '');
    // still trying to figure out how to get the followers count
});

//TWITCH API

app.get('/twitch/*', async (req, res) => {
    let user, followers, subs;
    async () => {
        let twitchOauth;
        await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: 'POST',
            },
        )
            .then((res) => res.json())
            .then((res) => (twitchOauth = res.access_token));
        const twitchAuth = {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${twitchOauth}`,
        };
        let user;
        await fetch(
            `https://api.twitch.tv/helix/users?login=${req.path
                .replace('/twitch', '')
                .replace('/', '')}`,
            {
                method: 'GET',
                headers: twitchAuth,
            },
        )
            .then((res) => res.json())
            .then((res) => (user = res.id));
        let followers;
        await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${user}`, {
            method: 'GET',
            headers: twitchAuth,
        })
            .then((res) => res.json())
            .then((res) => (followers = res.total));
        let subs;
        await fetch(
            `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${user}`,
            {
                method: 'GET',
                headers: twitchAuth,
            },
        )
            .then((res) => res.json())
            .then((res) => (subs = res.total));
    };
    res.json({
        followers: followers,
        subs: subs,
    });
});

app.get('*', (req, res) => {
    res.json({ code: 404, message: 'Not Found' });
});

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});
