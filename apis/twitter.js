import {fetch} from 'undici';
export const twitter = async app => {
    app.get('/twitter/:user', async (req, res) => {
        try {
            let data = {
                username: req.params.user,
            };
            if (isNaN(data.user)) {
                const twitterAuth = {
                    Authorization: `Bearer ${process.env.TWITTER_TOKEN}`,
                };
                await fetch(`https://api.twitter.com/2/users/by/username/${data.username}`, {
                    headers: twitterAuth,
                })
                    .then(res => res.json())
                    .then(json => {
                        try {
                            data.error = json?.errors[0].detail;
                        } catch (err) {}
                        data.id = json.data?.id;
                    });
                if (data.error == `Could not find user with username: [${data.username}].`) {
                    throw new Error(`Twitter API Error: User not found`);
                }
                await fetch(
                    `https://api.twitter.com/2/users/${data.id}?user.fields=public_metrics,profile_image_url,verified`,
                    {
                        headers: twitterAuth,
                    }
                )
                    .then(res => res.json())
                    .then(json => {
                        data.followers = json.data.public_metrics.followers_count;
                        data.following = json.data.public_metrics.following_count;
                        data.tweets = json.data.public_metrics.tweet_count;
                        data.verified = json.data.verified;
                        data.avatar = json.data.profile_image_url;
                    });
                res.json({
                    code: 200,
                    followers: data.followers,
                    username: data.username,
                    id: data.id,
                    following: data.following,
                    tweets: data.tweets,
                    verified: data.verified,
                    avatar: data.avatar,
                });
            } else {
                res.json({
                    code: 400,
                    message: 'Please enter a username, not a user ID',
                });
            }
        } catch (err) {
            if (err.message == 'Twitter API Error: User not found') {
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
