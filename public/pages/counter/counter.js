'use strict';
async function build() {
    const params = new URLSearchParams(window.location.search);
    const data = {
        user: params.user,
        service: params.service,
        stat: params.stat,
    };

    await fetch(`https://api.statify.live/${data.service}/${data.user}`)
        .then(res => res.json())
        .then(json => (data.avatar = json.data?.avatar));
    document.getElementById('avatar').src;
}
