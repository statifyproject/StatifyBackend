'use strict';
export async function endpoint(fastify) {
    fastify.get('/osu/:lookup', async req => {
        try {
            let osuOauth = String;
            const data = {
                lookup: req.params.lookup,
            };
            await fetch('https://osu.ppy.sh/oauth/token', {
                method: 'POST',
                headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
                body: JSON.stringify({
                    client_id: process.env.OSU_CLIENT_ID,
                    client_secret: process.env.OSU_CLIENT_SECRET,
                    grant_type: 'client_credentials',
                    scope: 'public',
                }),
            })
                .then(res => res.json())
                .then(json => {
                    osuOauth = json.access_token;
                });
            await fetch(`https://osu.ppy.sh/api/v2/users/${data.lookup}`, {
                headers: {Authorization: `Bearer ${osuOauth}`},
            })
                .then(res => res.json())
                .then(json => {
                    data.avatar = json.avatar_url;
                    data.countryCode = json.country_code;
                    data.id = json.id;
                    data.online = json.is_active;
                    data.bot = json.is_bot;
                    data.username = json.username;
                    data.cover = json.cover_url;
                    data.discord = json.discord;
                    data.interests = json.interests;
                    data.location = json.location;
                    data.occupation = json.occupation;
                    data.playStyle = json.playstyle;
                    data.twitter = json.twitter_url;
                    data.title = json.title;
                    data.website = json.website;
                    data.country = json.country.name;
                    data.badges = json.badges;
                    data.beatmapPlays = json.beatmap_playcounts_count;
                    data.comments = json.comments_count;
                    data.followers = json.follower_count;
                    data.description = json.page.raw;
                    data.previousUsernames = json.previous_usernames;
                    data.level = json.statistics.level.current;
                    data.rank = json.statistics.global_rank;
                    data.pp = json.statistics.pp;
                    data.rankedScore = json.statistics.ranked_score;
                    data.totalScore = json.statistics.total_score;
                    data.playCount = json.statistics.play_count;
                    data.totalHits = json.statistics.total_hits;
                    data.accuracy = json.statistics.hit_accuracy;
                    data.maxCombo = json.statistics.maximum_combo;
                    data.ss = json.statistics.grade_counts.ss;
                    data.ssh = json.statistics.grade_counts.ssh;
                    data.s = json.statistics.grade_counts.s;
                    data.sh = json.statistics.grade_counts.sh;
                    data.a = json.statistics.grade_counts.a;
                });
            return {
                code: 200,
                data,
            };
        } catch (err) {
            if (err.message == "Cannot read properties of undefined (reading 'name')") {
                return {code: 404, message: 'User does not exist'};
            } else {
                console.error(`Threw 500 error in Osu! module: ${err}`);
                return {code: 500, message: err.message};
            }
        }
    });
}
