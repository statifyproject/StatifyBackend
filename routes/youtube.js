'use strict';
import {fetch} from 'undici';
export async function endpoint(fastify) {
    fastify.get('/youtube/:id', async req => {
        try {
            const data = {
                id: req.params.id,
            };
            await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${data.id}&fields=items(snippet(title,description,thumbnails(high(url))),statistics(viewCount,subscriberCount,videoCount))&key=${process.env.YOUTUBE_API_KEY}` //this costs 1 credit
            )
                .then(res => res.json())
                .then(json => {
                    data.subs = json.items[0].statistics.subscriberCount;
                    data.views = json.items[0].statistics.viewCount;
                    data.videos = json.items[0].statistics.videoCount;
                    data.username = json.items[0].snippet.title;
                    data.description = json.items[0].snippet.description;
                    data.avatar = json.items[0].snippet.thumbnails.high.url;
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
