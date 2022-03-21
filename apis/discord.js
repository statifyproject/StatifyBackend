import {fetch} from 'undici';
export async function discord(app) {
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
            console.log('error', `Threw 500 error: ${err.message}`);
        }
    });
}
