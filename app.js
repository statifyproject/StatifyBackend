require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();

app.get('/', (_req, res) => {
    res.sendFile(__dirname + '/page/index.html');
});

app.get('/roblox/:user', async (req, res) => {
    let data = {
        username: String,
        online: Boolean,
        followers: Number,
        userID: Number,
        friends: Number,
    };
    try {
        if (isNaN(req.params.user)) {
            await fetch(`https://api.roblox.com/users/get-by-username?username=${req.params.user}`)
                .then(res => res.json())
                .then(
                    json => ((data.username = json.Username), (data.online = json.IsOnline), (data.userID = json.Id))
                );
            await fetch(`https://friends.roblox.com/v1/users/${data.userID}/followers/count`)
                .then(res => res.json())
                .then(json => (data.followers = json.count));
            await fetch(`https://friends.roblox.com/v1/users/${data.userID}/friends`)
                .then(res => res.json())
                .then(json => (data.friends = json.data.length));
            res.json({
                code: 200,
                followers: data.followers,
                username: data.username,
                online: data.online,
                userID: data.userID,
                friends: data.friends,
            });
        } else {
            res.json({code: 400, message: 'Please enter a username, not a user ID'});
        }
    } catch (err) {
        res.json({code: 500, message: err.message});
        console.log(`threw 500 error: ${err.message}`);
    }
});

app.get('/youtube/:path', async (req, res) => {
    try {
        const {path} = req.params;
        const link = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${path}&key=${process.env.YOUTUBE_API_KEY}`
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
            code: 200,
            subscribers: reqs.items[0].statistics.subscriberCount,
            views: reqs.items[0].statistics.viewCount,
        });
    } catch (err) {
        res.json({code: 500, message: err.message});
        console.log(`threw 500 error: ${err.message}`);
    }
});

app.get('/discord/:path', async (req, res) => {
    try {
        const {path} = req.params;
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
                code: 200,
                name: reqs.guild.name,
                members: reqs.approximate_member_count,
                online: reqs.approximate_presence_count,
                boosts: reqs.guild.premium_subscription_count,
            });
        }
    } catch (err) {
        res.json({code: 500, message: err.message});
        console.log(`threw 500 error: ${err.message}`);
    }
});

app.get('/twitter/:user', async (req, res) => {
    try {
        let data = {
            username: req.params.user,
            followers: Number,
            id: Number,
            following: Number,
            tweets: Number,
        };
        if (isNaN(data.user)) {
            const twitterAuth = {
                Authorization: `Bearer ${process.env.TWITTER_TOKEN}`,
            };
            await fetch(`https://api.twitter.com/2/users/by/username/${data.username}`, {
                headers: twitterAuth,
            })
                .then(res => res.json())
                .then(json => {
                    data.id = json.data.id;
                });
            await fetch(`https://api.twitter.com/2/users/${data.id}?user.fields=public_metrics`, {
                headers: twitterAuth,
            })
                .then(res => res.json())
                .then(json => {
                    data.followers = json.data.public_metrics.followers_count;
                    data.following = json.data.public_metrics.following_count;
                    data.tweets = json.data.public_metrics.tweet_count;
                });
            res.json({
                code: 200,
                followers: data.followers,
                username: data.username,
                id: data.id,
                following: data.following,
                tweets: data.tweets,
            });
        } else {
            res.json({
                code: 400,
                message: 'Please enter a username, not a user ID',
            });
        }
    } catch (err) {
        res.json({code: 500, message: err.message});
        console.log(`threw 500 error: ${err.message}`);
    }
});

app.get('/twitch/:user', async (req, res) => {
    try {
        let twitchOauth = String,
            data = {
                username: req.params.user,
                followers: Number,
                id: Number,
                viewers: Number,
                //subs: Number,
            };

        if (isNaN(data.username)) {
            await fetch(
                `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
                {
                    method: 'POST',
                }
            )
                .then(res => res.json())
                .then(json => (twitchOauth = json.access_token));
            const twitchAuth = {
                'Client-ID': process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${twitchOauth}`,
            };
            await fetch(`https://api.twitch.tv/helix/users?login=${data.username}`, {
                headers: twitchAuth,
            })
                .then(res => res.json())
                .then(json => (data.id = json.data[0].id));
            await fetch(`https://api.twitch.tv/helix/users/follows?to_id=${data.id}`, {
                headers: twitchAuth,
            })
                .then(res => res.json())
                .then(json => (data.followers = json.total));
            /*await fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${data.id}`, {
                headers: twitchAuth,
            })
                .then(res => res.json())
                .then(json => console.log(json));
            */ // we need the users authorization to get this.
            res.json({
                code: 200,
                followers: data.followers,
                //subs: data.subs,
                id: data.id,
            });
        } else {
            res.json({
                code: 400,
                message: 'Please enter a username, not a user ID',
            });
        }
    } catch (err) {
        res.json({code: 500, message: err.message});
        console.log(`threw 500 error: ${err.message}`);
    }
});
app.get('*', (_req, res) => {
    res.json({code: 404, message: 'Non-Existent Endpoint'});
});

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});
