import {fetch} from 'undici';
export const youtube = app => {
    app.get('/youtube/:channel', async (req, res) => {
        try {
            let data = {
                channel: req.params.channel,
            };
            await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${data.path}&key=${process.env.YOUTUBE_API_KEY}&maxResults=1&type=channel`
            )
                .then(res => res.json())
                .then(json => {
                    data.id = json.items[0].id.channelId;
                    data.avatar = json.items[0].snippet.thumbnails.default.url;
                });
            await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${data.id}&key=${process.env.YOUTUBE_API_KEY}`
            )
                .then(res => res.json())
                .then(json => {
                    data.subscribers = json.items[0].statistics.subscriberCount;
                    data.views = json.items[0].statistics.viewCount;
                    data.videos = json.items[0].statistics.videoCount;
                });
            res.json({
                code: 200,
                subscribers: data.subscribers,
                views: data.views,
                videos: data.videos,
                avatar: data.avatar,
            });
        } catch (err) {
            res.json({code: 500, message: err.message});
            console.log('error', `Threw 500 error: ${err.message}`);
        }
    });
};
