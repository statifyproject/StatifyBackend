'use strict';
import {fetch} from 'undici';
export async function endpoint(fastify) {
    fastify.get('/twitch/:user', async req => {
        try {
            let twitchOauth = String;
            const data = {
                username: req.params.user,
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
                return {
                    code: 200,
                    data,
                };
            } else {
                return {
                    code: 400,
                    message: 'Please enter a username, not a user ID',
                };
            }
        } catch (err) {
            if (err.message == 'Twitch API Error: User not found') {
                return {
                    code: 404,
                    message: 'User not found',
                };
            } else {
                console.error(`Threw 500 error in Twitch module: ${err}`);
                return {code: 500, message: err};
            }
        }
    });
}
