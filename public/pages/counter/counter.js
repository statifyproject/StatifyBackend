'use strict';
async function build() {
    const params = new URLSearchParams(window.location.search);
    const data = {};
    await fetch(`https://api.statify.live/${params.get('service')}/${params.get('user')}`)
        .then(res => res.json())
        .then(json => {
            data.avatar = json.data?.avatar || json.data?.icon;
            data.username = json.data?.username || json.data?.name;
            data.code = json.code;
            data.statValue = json.data?.[params.get('stat')];
        });
    if (data.code == 200) {
        document.getElementById('avatar').src = data.avatar;
        document.getElementById('username').innerHTML = data.username;
        document.getElementById('counter').innerHTML = data.statValue;
    } else {
        document.getElementById('username').innerHTML = '404';
    }
}
