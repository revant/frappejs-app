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
const FrappeSessionStore = require('./FrappeSessionStore');
const login = require('connect-ensure-login');

module.exports = {
    setup(app, config=null) {
        this.setupFrappeApp(app);
        this.setupTemplating(app);
        app.use(cookieParser(config.session.cookieSecret));
        app.use(bodyParser.json({ extended: false }));
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(errorHandler());
        this.setupSession(app, config);
        app.use(passport.initialize());
        app.use(passport.session());

        // Passport configuration
        require('./auth');

        app.get('/', (request, response) => response.redirect('/app'));
        app.get('/app', login.ensureLoggedIn(), (req, res)=> res.render('app'));
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
        console.log(__dirname);
        const nunjucksEnv = nunjucks.configure(path.resolve(__dirname, '../'), {
            express: app
        });

        nunjucksEnv.addFilter('log', console.log);

        // setup engine
        app.engine('html', nunjucks.render);
        app.set('view engine', 'html');
        app.set('view options', { layout: true });
    },

    setupSession(app, config=null){
        let sess = {
            saveUninitialized: true,
            resave: false,
            store: new FrappeSessionStore(),
            secret: config.session.secret,
            cookie : { maxAge: config.session.cookieMaxAge, httpOnly: false }
        };

        if (app.get('env') === 'production') {
            app.set('trust proxy', 1) // trust first proxy
            sess.cookie.secure = true // serve secure cookies
        }
        app.use(session(sess));
    },

    setupFrappeApp(app){
        app.use((req, res, next) => {
            console.log(`[${req.method}][${res.statusCode}] ${req.url}`);
            frappe.request = req;
            frappe.response = res;
            next();
        });
    }
};
