'use strict';
export async function endpoint(fastify) {
    fastify.get('/discord/:invite', async req => {
        try {
            const data = {
                invite: req.params.invite,
            };
            await fetch(`https://discordapp.com/api/v9/invites/${data.invite}?with_counts=true`)
                .then(res => res.json())
                .then(json => {
                    data.name = json.guild.name;
                    data.id = json.guild.id;
                    data.splash = json.guild.splash;
                    data.icon = json.guild.icon;
                    data.banner = json.guild.banner;
                    data.description = json.guild.description;
                    data.vanity = json.guild.vanity_url;
                    data.boosts = json.guild.premium_subscription_count;
                    data.nsfw = json.guild.nsfw;
                    data.members = json.approximate_member_count;
                    data.online = json.approximate_presence_count;
                });

            if (!data.banner) {
                delete data.banner;
            } else {
                data.banner = `https://cdn.discordapp.com/banners/${data.id}/${data.banner}`;
                if (data.banner?.startsWith('a_')) {
                    data.banner += '.gif';
                } else {
                    data.banner += '.png';
                }
            }
            if (!data.description) {
                data.description = 404;
            }
            if (!data.icon) {
                data.icon = 404;
            } else {
                data.icon = `https://cdn.discordapp.com/icons/${data.id}/${data.icon}`;
                if (data.icon?.startsWith('a_')) {
                    data.icon += '.gif';
                } else {
                    data.icon += '.png';
                }
            }
            if (!data.splash) {
                data.splash = 404;
            } else {
                data.splash = `https://cdn.discordapp.com/splashes/${data.id}/${data.splash}.jpg`;
            }
            return {
                code: 200,
                data,
            };
        } catch (err) {
            if (err.message == "Cannot read properties of undefined (reading 'name')") {
                return {
                    code: 404,
                    message: 'Discord Api Error: Invalid invite',
                };
            } else {
                console.error(`Threw 500 error in Discord module: ${err}`);
                return { code: 500, message: err.message };
            }
        }
    });
}
