'use strict';
import {fetch} from 'undici';
export async function endpoint(fastify) {
    fastify.get('/youtube/:channel', async req => {
        try {
            const data = {
                channel: req.params.channel,
            };
            await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${data.channel}&key=${process.env.YOUTUBE_API_KEY}&maxResults=1&type=channel` //This costs 100 credits
            )
                .then(res => res.json())
                .then(json => {
                    data.id = json.items[0].id.channelId;
                    data.avatar = json.items[0].snippet.thumbnails.default.url;
                });
            await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${data.id}&key=${process.env.YOUTUBE_API_KEY}` //this costs 1 credit
            )
                .then(res => res.json())
                .then(json => {
                    data.subscribers = json.items[0].statistics.subscriberCount;
                    data.views = json.items[0].statistics.viewCount;
                    data.videos = json.items[0].statistics.videoCount;
                });
            return {
                code: 200,
                data,
            };
        } catch (err) {
            console.error(`Threw 500 error in YouTube module: ${err.message}`);
            return {code: 500, message: err.message};
        }
    });
}
