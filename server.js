const frappe = require('frappejs');
const server = require('frappejs/server');
const authAPI = require('./src/authAPI');
const restAPI = require('frappejs/server/restAPI');
const config = require('./config');

server.start({
    backend: 'sqlite',
    models: require('./models'),
    connectionParams: {dbPath: './test.db'},
    static: './'
}).then(()=>{
    authAPI.setup(frappe.app, config);
});