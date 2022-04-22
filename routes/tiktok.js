'use strict';
export async function endpoint(fastify) {
    fastify.get('/tiktok/:username', async req => {
        try {
            const data = {
                username: req.params.username,
            };
            await fetch(`https://www.tiktok.com/node/share/user/@${data.username}`)
                .then(res => res.json())
                .then(json => {
                    data.id = json.userInfo.id;
                    data.avatar = json.userInfo.user?.avatarLarger;
                    data.verified = json.userInfo.user.verified;
                    data.bio = json.userInfo.user?.signature;
                    data.link = json.userInfo.user?.bioLink.link;
                    data.followers = json.userInfo.stats.followerCount;
                    data.following = json.userInfo.stats.followingCount;
                    data.hearts = json.userInfo.stats.heartCount;
                    data.posts = json.userInfo.stats.videoCount;
                });
            return {
                code: 200,
                data,
            };
        } catch (err) {
            if (err.message == "Cannot read properties of undefined (reading 'verified')") {
                return {code: 404, message: 'User does not exist'};
            } else {
                console.error(`Threw 500 error in TikTok module: ${err}`);
                return {code: 500, message: err.message};
            }
        }
    });
}
