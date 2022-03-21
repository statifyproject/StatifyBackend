'use strict';
window.onload = async function () {
    import { fetch } from 'undici';
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    const service = params.service;
    console.log(service)
    let userData = {
        lookup=params.user
    };

    await fetch(`https://api.statify.live/${service}/${userData.lookup}`)
        .then(res => res.json())
        .then(json => (userData.avatar = json.avatar));
    console.log(userData)
}