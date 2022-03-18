import {fetch} from 'undici';
export const twitch = async app => {
    app.get('/twitch/:user', async (req, res) => {
        try {
            let twitchOauth = String,
                data = {
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
                res.json({
                    code: 200,
                    followers: data.followers,
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
                console.log('error', `Threw 500 error: ${err.message}`);
            }
        }
    });
};
