const frappe = require('frappejs');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const nunjucks = require('nunjucks');
const path = require('path');
const routes = require('./routes');
const SessionStore = require('./SessionStore');

module.exports = {
    setup(app) {
        this.setupTemplating(app);
        app.use(cookieParser());
        app.use(bodyParser.json({ extended: false }));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(errorHandler());
        this.setupSession(app);
        app.use(passport.initialize());
        app.use(passport.session());

        // Passport configuration
        require('./auth');

        app.get('/', routes.site.index);
        app.get('/login', routes.site.loginForm);
        app.post('/login', routes.site.login);
        app.get('/logout', routes.site.logout);
        app.get('/account', routes.site.account);

        app.get('/dialog/authorize', routes.oauth2.authorization);
        app.post('/dialog/authorize/decision', routes.oauth2.decision);
        app.post('/oauth/token', routes.oauth2.token);

        app.get('/api/userinfo', routes.user.info);
        app.get('/api/clientinfo', routes.client.info);
    },

    setupTemplating(app){
        const nunjucksEnv = nunjucks.configure(path.resolve(__dirname, 'views'), {
            express: app
        });

        nunjucksEnv.addFilter('log', console.log);

        // setup engine
        app.engine('html', nunjucks.render);
        app.set('view engine', 'html');
        app.set('view options', { layout: true });
    },

    setupSession(app){
        let sess = {
            // store: new SessionStore(),
            secret: 'cats',
            resave: false,
            saveUninitialized: true,
            cookie : {}
        };

        if (app.get('env') === 'production') {
            app.set('trust proxy', 1) // trust first proxy
            sess.cookie.secure = true // serve secure cookies
        }
        app.use(session(sess));
    }
};
