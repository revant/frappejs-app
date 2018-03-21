const client = require('frappejs/client');
const user = require('frappejs/models/doctype/User/User.js');
const frappe = require('frappejs')
// start server
client.start({
    columns: 3,
    server: 'localhost:8000',
}).then(() => {
    frappe.desk.addSidebarItem('Home', '#');
    frappe.desk.addSidebarItem('New User', '#new/User');

    frappe.router.default = '#list/User';
    frappe.router.show(window.location.hash);
});
