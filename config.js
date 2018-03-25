var config = {};
config.session = {};
config.session.secret = "cats";
config.session.cookieSecret = "cats";
config.session.cookieMaxAge = 86400000;
config.session.expires = 3600000;

module.exports = config;
