const client = require('frappejs/client');
const user = require('frappejs/models/doctype/User/User.js');
const frappe = require('frappejs');
const menu = require('frappejs/client/desk/menu');

// start server
client.start({
    columns: 3,
    server: 'localhost:8000',
}).then(() => {
    frappe.registerModels(require('../models'), 'client');

    frappe.desk.menu.addItem('User', '#list/User');
    frappe.desk.menu.addItem('Session', '#list/Session');
    frappe.desk.menu.addItem('OAuthClient', '#list/OAuthClient');

    frappe.router.default = '#list/Session';
    frappe.router.show(window.location.hash);
});
