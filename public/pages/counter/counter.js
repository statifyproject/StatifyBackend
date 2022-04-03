'use strict';
async function build() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });

    const data = {
        user: params.user,
        service: params.service.toLowerCase(),
        stat: params.stat?.toLowerCase(),
    };

    await fetch(`https://api.statify.live/${data.service}/${data.user}`)
        .then(res => res.json())
        .then(json => {
            data.avatar = json.data?.avatar || json.data?.icon;
            data.username = json.data?.username || json.data?.name || json.data?.channel;
            data.code = json.code;
            data.statValue = json.data?.[data.stat];
        });

    if (data.code == 200) {
        document.getElementById('avatar').src = data.avatar;
        document.getElementById('username').innerHTML = data.username;
        document.getElementById('counter').innerHTML = data.statValue;
    } else {
        document.getElementById('username').innerHTML = '404';
    }
}
