const express = require('express'),
SSE = require('./sse'),
Router = new express.Router();


Router.get('/', SSE.init);


module.exports = [
    {
        scope: '/stream',
        router: Router
    }
]
