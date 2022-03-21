const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
const service = params.service;
const user = params.user;

let userData = {};

await fetch(`https://api.statify.live/${service}/${user}`)
    .then(res => res.json())
    .then(json => (userData.avatar = json.avatar));
