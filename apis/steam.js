import {fetch} from 'undici';
export async function steam(app) {
    app.get('/steam/:user', async (req, res) => {
        try {
            let data = {
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
            console.log('error', `Threw 500 error: ${err.message}`);
        }
    });
}
