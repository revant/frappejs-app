const frappe = require('frappejs');
const server = require('frappejs/server');
const authAPI = require('./src/authAPI');
const restAPI = require('frappejs/server/restAPI');

server.start({
    backend: 'sqlite',
    models: require('./models'),
    connectionParams: {dbPath: './test.db'},
    static: './'
}).then(()=>{
    authAPI.setup(frappe.app);
    restAPI.setup(frappe.app);
    frappe.app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.url}`);
        console.log(req.session);
        next();
    });
});