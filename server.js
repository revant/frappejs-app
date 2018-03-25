const frappe = require('frappejs');
const server = require('frappejs/server');

server.start({
    backend: 'sqlite',
    models: require('./models'),
    connectionParams: {dbPath: './test.db'},
    static: './'
}).then(()=>{
    frappe.app.use((req, res, next) => {
        console.log(`[${req.method}] ${req.url}`);
        next();
    });
    // let oc = frappe.getMeta("OAuthClient");
    // oc.then((success) => {
    //     console.log(success);
    // }).catch(error => console.log(error, null));
    // console.log(oc);
});