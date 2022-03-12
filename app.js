require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/roblox/:user', async (req, res) => {
    let data = [(username = String), (online = Boolean), (followers = Number), (userID = Number), (friends = Number)];
    try {
        if (isNaN(req.params.user)) {
            await fetch(`https://api.roblox.com/users/get-by-username?username=${req.params.user}`)
                .then(res => res.json())
                .then(
                    json => ((data.username = json.Username), (data.online = json.IsOnline), (data.userID = json.Id))
                );
            await fetch(`https://friends.roblox.com/v1/users/${data.userID}/followers`)
                .then(res => res.json())
                .then(json => (data.followers = json.data.length));
            await fetch(`https://friends.roblox.com/v1/users/${data.userID}/friends`)
                .then(res => res.json())
                .then(json => (data.friends = json.data.length));
            res.json({
                followers: data.followers,
                username: data.username,
                online: data.online,
                userID: data.userID,
                friends: data.friends,
            });
        } else {
            throw new Error('Please enter a username, not a user ID');
        }
    } catch (err) {
        res.json({code: 400, message: err.message});
    }
});

app.get('/youtube/*', async (req, res) => {
    const path = req.path.replace('/youtube', '').replace('/', '');
    const link = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${path}&key=AIzaSyDpL6Q7EnBQXhYuYn7kMqoogAH7tzCmOHQ`
    );
    const reqs = await link.json();
    if (reqs.pageInfo.totalResults == 0) {
        res.json({
            code: 404,
            message: 'Channel not found, check if you provided channel ID, not name',
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
    const link = await fetch(`https://discordapp.com/api/v9/invites/${path}?with_counts=true`);
    const reqs = await link.json();
    if (reqs.code == 10006) {
        res.json({
            code: 404,
            message: 'Guild not found, check if you provided Invite Code, not Guild ID',
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

app.get('/twitter/:username', async (req, res) => {
    const user = await twitter.getUserByUsername(req.params.username || '', ['public_metrics']);
    res.json({
        followers: user.data.public_metrics.followers_count,
        tweet_count: user.data.public_metrics.tweet_count,
    });
});
//TWITCH API

app.get('/twitch/*', async (req, res) => {
    let subs, followers, user;
    async () => {
        let twitchOauth;
        await fetch(
            `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: 'POST',
            }
        )
            .then(res => res.json())
            .then(res => (twitchOauth = res.access_token));
        const twitchAuth = {
            'Client-ID': process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${twitchOauth}`,
        };
        await fetch(`https://api.twitch.tv/helix/users?login=${req.path.replace('/twitch', '').replace('/', '')}`, {
            method: 'GET',
            headers: twitchAuth,
        })
            .then(res => res.json())
            .then(res => (user = res.id));
        await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${user}`, {
            method: 'GET',
            headers: twitchAuth,
        })
            .then(res => res.json())
            .then(res => (followers = res.total));
        await fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${user}`, {
            method: 'GET',
            headers: twitchAuth,
        })
            .then(res => res.json())
            .then(res => console.log(res.total));
    };
    res.json({
        followers: followers,
        subs: subs,
    });
});

app.get('*', (req, res) => {
    res.json({code: 404, message: 'Not Found'});
});

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});
