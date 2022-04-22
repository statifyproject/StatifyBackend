'use strict';
export async function endpoint(fastify) {
    fastify.get('/steam/:user', async req => {
        try {
            const data = {
                username: req.params.user,
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

                data.onlineState = [
                    'Offline',
                    'Online',
                    'Busy',
                    'Away',
                    'Snooze',
                    'looking to trade',
                    'looking to play',
                ][data.rawOnlineState];

                if (data.error == 1) {
                    delete data.error;
                }
                return {
                    code: 200,
                    data,
                };
            } else {
                return {
                    code: 400,
                    message:
                        "Please enter a user URL. this should be the user's Steam Community URL Ending. (ex: https://steamcommunity.com/id/<Give us this>)",
                };
            }
        } catch (err) {
            console.error(`Threw 500 error in Steam module: ${err}`);
            return {code: 500, message: err.message};
        }
    });
}
