'use strict';
import {fetch} from 'undici';
export async function roblox(fastify) {
    fastify.get('/roblox/:user', async req => {
        try {
            let data = {
                username: req.params.user,
            };
            if (isNaN(req.params.user)) {
                await fetch(`https://api.roblox.com/users/get-by-username?username=${data.username}`)
                    .then(res => res.json())
                    .then(
                        json => (
                            (data.online = json.IsOnline),
                            (data.id = json.Id),
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
                return {
                    code: 200,
                    followers: data.followers,
                    username: data.username,
                    online: data.online,
                    id: data.id,
                    friends: data.friends,
                    avatar: `https://www.roblox.com/headshot-thumbnail/image?userId=${data.id}&width=420&height=420&format=png`,
                };
            } else {
                return {code: 400, message: 'Please enter a username, not a user ID'};
            }
        } catch (err) {
            if (err.message == 'Roblox API Error: User not found') {
                return {
                    code: 404,
                    message: 'User not found',
                };
            } else {
                console.log('error', `Threw 500 error in Roblox module: ${err.message}`);
                return {code: 500, message: err.message};
            }
        }
    });
}