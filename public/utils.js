const formatFetchRespose = async function (response) {
    const o = {status: response.status, headers: response.headers, data: null}

    return new Promise((resolve, reject) => {
        response.json().catch((r) => {
            console.error(response.url, r);
            return null
            r.text()
        }).then(function (d) {
            o.data = d

            if (response.ok && o.status >= 200 && o.status <= 299) {
                resolve(o)
            }else {
                reject(o)
            }
        })
    })
},
DUMMY_SESSION_ID = '111122233333';


export async function fetchHandler({url, request = {}}) {
    if (typeof request.headers === 'undefined') {
        request.headers = {};
    }

    if (!request.headers['X-Requested-With']) {
        request.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    if (!request.headers["Content-Type"]) {
        request.headers["Content-Type"] = "application/json";
    }

    request.headers['pragma'] = 'no-cache';
    request.headers['cache-control'] = 'no-cache';
    request.headers['Authorization'] = 'Bearer ' + DUMMY_SESSION_ID;

    return await fetch(url, request).then(formatFetchRespose);
}
