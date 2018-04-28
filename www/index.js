const client = require('frappejs/client');
const appClient = require('../client');

// start server
client.start({
    server: 'localhost:8000',
    makeDesk: 0
}).then(() => {
    client.makeDesk(3);
    appClient.start();
});

module.exports = false;
