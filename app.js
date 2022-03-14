require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const color = require('colors');

const app = express();

app.get('/', (_req, res) => {
    res.sendFile(__dirname + '/index.html');
});

function log(type, query) {
    if (type === 'error') {
        console.log(color.red(`✖ ${query}`));
    } else if (type === 'success') {
        console.log(color.green(`✔ ${query}`));
    } else if (type === 'info') {
        console.log(color.blue(`ℹ ${query}`));
    } else if (type === 'warning') {
        console.log(color.yellow(`⚠ ${query}`));
    } else if (type === 'debug') {
        console.log(color.gray(`⚙ ${query}`));
    } else {
        console.log(color.gray(query));
    }
}

app.get('/roblox/:user', async (req, res) => {
    let data = {
        username: req.params.user,
        online: Boolean,
        followers: Number,
        id: Number,
        friends: Number,
        success: Boolean,
        error: String,
    };
    try {
        if (isNaN(req.params.user)) {
            await fetch(`https://api.roblox.com/users/get-by-username?username=${data.username}`)
                .then(res => res.json())
                .then(
                    json => (
                        (data.online = json.IsOnline),
                        (data.userID = json.Id),
                        (data.success = json?.success),
                        (data.error = json?.errorMessage)
                    )
                );
            if (data.success == false) {
                throw new Error(`Roblox API Error: ${data.error}`);
            }
            await fetch(`https://friends.roblox.com/v1/users/${data.id}/followers/count`)
                .then(res => res.json())
                .then(json => (data.followers = json.count));
            await fetch(`https://friends.roblox.com/v1/users/${data.id}/friends/count`)
                .then(res => res.json())
                .then(json => (data.friends = json.count));
            res.json({
                code: 200,
                followers: data.followers,
                username: data.username,
                online: data.online,
                userID: data.userID,
                friends: data.friends,
                avatar: `https://www.roblox.com/headshot-thumbnail/image?userId=${data.id}&width=420&height=420&format=png`,
            });
        } else {
            res.json({code: 400, message: 'Please enter a username, not a user ID'});
        }
    } catch (err) {
        if (err.message == 'Roblox API Error: User not found') {
            res.json({
                code: 404,
                message: 'User not found',
            });
        } else {
            res.json({code: 500, message: err.message});
            log('error', `Threw 500 error: ${err.message}`);
            log('error', err);
        }
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
        log('error', `Threw 500 error: ${err.message}`);
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
        log('error', `Threw 500 error: ${err.message}`);
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
            error: String,
            verified: Boolean,
            avatar: String,
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
                    try {
                        data.error = json?.errors[0].detail;
                    } catch (err) {}
                    data.id = json.data?.id;
                });
            if (data.error == `Could not find user with username: [${data.username}].`) {
                throw new Error(`Twitter API Error: User not found`);
            }
            await fetch(
                `https://api.twitter.com/2/users/${data.id}?user.fields=public_metrics,profile_image_url,verified`,
                {
                    headers: twitterAuth,
                }
            )
                .then(res => res.json())
                .then(json => {
                    data.followers = json.data.public_metrics.followers_count;
                    data.following = json.data.public_metrics.following_count;
                    data.tweets = json.data.public_metrics.tweet_count;
                    data.verified = json.data.verified;
                    data.avatar = json.data.profile_image_url;
                });
            res.json({
                code: 200,
                followers: data.followers,
                username: data.username,
                id: data.id,
                following: data.following,
                tweets: data.tweets,
                verified: data.verified,
                avatar: data.avatar,
            });
        } else {
            res.json({
                code: 400,
                message: 'Please enter a username, not a user ID',
            });
        }
    } catch (err) {
        if (err.message == 'Twitter API Error: User not found') {
            res.json({
                code: 404,
                message: 'User not found',
            });
        } else {
            res.json({code: 500, message: err.message});
            log('error', `Threw 500 error: ${err.message}`);
        }
    }
});

app.get('/twitch/:user', async (req, res) => {
    try {
        let twitchOauth = String,
            data = {
                username: req.params.user,
                followers: Number,
                id: Number,
                views: Number,
                avatar: String,
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
                .then(json => {
                    data.id = json.data[0]?.id;
                    data.views = json.data[0]?.view_count;
                    data.avatar = json.data[0]?.profile_image_url;
                });
            if (data.id == undefined) {
                throw new Error(`Twitch API Error: User not found`);
            }
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
                views: data.views,
                avatar: data.avatar,
            });
        } else {
            res.json({
                code: 400,
                message: 'Please enter a username, not a user ID',
            });
        }
    } catch (err) {
        if (err.message == 'Twitch API Error: User not found') {
            res.json({
                code: 404,
                message: 'User not found',
            });
        } else {
            res.json({code: 500, message: err.message});
            log('error', `Threw 500 error: ${err.message}`);
        }
    }
});
app.get('/steam/:user', async (req, res) => {
    try {
        let data = {
            username: req.params.user,
            displayName: String,
            id64: Number,
            error: Number,
            realName: String,
            countryCode: String,
            stateCode: String,
            onlineState: String,
            rawOnlineState: Number,
            avatar: String,
        };
        if (isNaN(data.username)) {
            await fetch(
                `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${data.username}`
            )
                .then(res => res.json())
                .then(json => {
                    (data.id64 = json.response.steamid), (data.error = json.response.success);
                });
            if (data.error == 42) {
                throw new Error(`Steam API Error: User not found`);
            }
            await fetch(
                `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${data.id64}`
            )
                .then(res => res.json())
                .then(json => {
                    (data.displayName = json.response.players[0].personaname),
                        (data.realName = json.response.players[0].realname),
                        (data.countryCode = json.response.players[0].loccountrycode),
                        (data.stateCode = json.response.players[0].locstatecode),
                        (data.rawOnlineState = json.response.players[0].personastate);
                    data.avatar = json.response.players[0].avatar;
                });
            switch (data.rawOnlineState) {
                case 0:
                    data.onlineState = 'Offline';
                    break;
                case 1:
                    data.onlineState = 'Online';
                    break;
                case 2:
                    data.onlineState = 'Busy';
                    break;
                case 3:
                    data.onlineState = 'Away';
                    break;
                case 4:
                    data.onlineState = 'Snooze';
                    break;
                case 5:
                    data.onlineState = 'Looking to trade';
                    break;
                case 6:
                    data.onlineState = 'Looking to play';
                    break;
            }
            res.json({
                code: 200,
                displayName: data.displayName,
                realName: data.realName,
                countryCode: data.countryCode,
                stateCode: data.stateCode,
                onlineState: data.onlineState,
                avatar: data.avatar,
            });
        } else {
            res.json({
                code: 400,
                message:
                    "Please enter a user URL. this should be the user's Steam Community URL Ending. (ex: https://steamcommunity.com/id/<Give us this>)",
            });
        }
    } catch (err) {
        res.json({code: 500, message: err.message});
        log('error', `Threw 500 error: ${err.message}`);
    }
});
app.get('*', (_req, res) => {
    res.json({code: 404, message: 'Non-Existent Endpoint'});
});

app.listen(3000, () => {
    log('success', 'Server started on port 3000');
});
