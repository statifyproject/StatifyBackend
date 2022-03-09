const express = require('express');
const fetch = require('node-fetch');

const app = express();

app.get('/', (req, res) => {
  res.sendFile('index.html')
});

app.get('/youtube/*', async (req, res) => {
  const path = req.path.replace('/youtube', '').replace('/', '');
  const link = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${path}&key=AIzaSyDpL6Q7EnBQXhYuYn7kMqoogAH7tzCmOHQ`)
  const reqs = await link.json();
  if (reqs.pageInfo.totalResults == 0) {
    res.json({code: 404, message: "Channel not found, check if you provided channel ID, not name"});
    return
  }
  res.json({subscribers: reqs.items[0].statistics.subscriberCount, views: reqs.items[0].statistics.viewCount, });
});

app.get('/discord/*', async (req, res) => {
  const path = req.path.replace('/discord', '').replace('/', '');
  const link = await fetch(`https://discordapp.com/api/v9/invites/${path}?with_counts=true`)
  const reqs = await link.json();
  if (reqs.code == 10006) {
    res.json({code: 404, message: "Guild not found, check if you provided Invite Code, not Guild ID"});
    return
  } else {
    res.json({name: reqs.guild.name, members: reqs.approximate_member_count, online: reqs.approximate_presence_count, boosts: reqs.guild.premium_subscription_count});
  }
});

app.get('*', (req, res) => {
  res.json({code: 404, message: 'Not Found'});
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});