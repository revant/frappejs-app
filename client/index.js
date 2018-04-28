const frappe = require('frappejs');
const { registerReportRoutes } = require('../reports');

module.exports = {
    start() {
        frappe.desk.menu.addItem('User', '#list/User');
        frappe.router.default = '#list/User';
        frappe.router.show(window.location.hash);
    }
}