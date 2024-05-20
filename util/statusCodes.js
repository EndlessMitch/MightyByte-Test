const escape = require('./htmlEscape').sanitize;

const buildResponder = (code, msg) => {
    return (req, res, customMessage = false, doEscape = true, customCode = false) => {
        msg = customMessage || msg;

        if (doEscape) {
            msg = typeof msg === 'string' ? escape(msg) : msg;

            if (msg && typeof msg === 'object') {
                for (const [kk, vv] of Object.entries(msg)) {
                    if (typeof vv === 'string') {
                        msg[kk] = escape(vv);
                    }
                }
            }
        }

        if (!res.headersSent) {
            res.status(code);

            if (req.xhr) {
                const o = { message: msg };
                if (customCode) {
                    o.code = customCode;
                }
                res.json(o).end();
            } else {
                if (typeof msg !== 'object') {
                    return res.end(msg);
                } else {
                    return res.json(msg).end();
                }
            }
        }
    };
};

module.exports = {
    status200: buildResponder(200, 'OK'),
    status404: buildResponder(404, 'Resource Not Found'),
    status401: buildResponder(401, 'Not Logged In'),
    status403: buildResponder(403, 'This Action Is Forbidden'),
    status400: buildResponder(400, 'Bad Request'),
    status423: buildResponder(423, 'Locked'),
    status429: buildResponder(429, 'Too Many Requests'),
    status500: buildResponder(500, 'Server Error'),
    status301: (req, res, path) => {
        res.redirect(301, path);
    },
    status302: (req, res, path) => {
        res.redirect(302, path);
    },
    status307: (req, res, path) => {
        res.redirect(307, path);
    }
};
