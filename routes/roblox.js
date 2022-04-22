'use strict';
export async function endpoint(fastify) {
    fastify.get('/roblox/:user', async req => {
        try {
            const data = {
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
                data.avatar = `https://www.roblox.com/headshot-thumbnail/image?userId=${data.id}&width=420&height=420&format=png`;
                return {
                    code: 200,
                    data,
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
                console.error(`Threw 500 error in Roblox module: ${err}`);
                return {code: 500, message: err.message};
            }
        }
    });
}
