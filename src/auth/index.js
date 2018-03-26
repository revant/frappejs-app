'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const AuthorizationCodeStrategy = require('passport-oauth2-code').Strategy;
const frappe = require('frappejs');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
  (username, password, done) => {
    frappe.db.get("User", username).then((success) => {
      if (success.password !== password) return done(null, false);
      if (!success.name) return done(null, false);
      const user = createUserFromDocType(success);
      done(null, user);
    }).catch((error) => {
      done(error);
    });
  }
));

passport.serializeUser((user, done) => done(null, user.username));

passport.deserializeUser((username, done) => {
  frappe.db.get("User", username).then((success) => {
    const user = createUserFromDocType(success);
    done(null, user);
  }).catch(error => done(error, null));
});

/**
 * BasicStrategy & ClientPasswordStrategy
 *
 * These strategies are used to authenticate registered OAuth clients. They are
 * employed to protect the `token` endpoint, which consumers use to obtain
 * access tokens. The OAuth 2.0 specification suggests that clients use the
 * HTTP Basic scheme to authenticate. Use of the client password strategy
 * allows clients to send the same credentials in the request body (as opposed
 * to the `Authorization` header). While this approach is not recommended by
 * the specification, in practice it is quite common.
 */
function verifyClient(clientId, clientSecret, done) {
  frappe.db.get("OAuthClient", clientId).then((success) => {
    if (!success.name) return done(null, false);
    if (client.clientSecret !== clientSecret) return done(null, false);
    let client = createClientFromDocType(success);
    return done(null,client);
  }).catch((error) => {
    done(error);
  });
}

passport.use(new BasicStrategy(verifyClient));

passport.use(new ClientPasswordStrategy(verifyClient));

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token). If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use(new BearerStrategy(
  async(accessToken, done) => {
    let filters = {accessToken:accessToken}
    var bearerToken = null;
    try {
      bearerToken = await frappe.db.getValue('Session', JSON.stringify(filters));
      if (!bearerToken) return done(null, false);
      if (bearerToken.username) {
        frappe.db.get("User", username).then((success) => {
          if (!success.username) return done(null, false);
          const user = createUserFromDocType(success);
          // To keep this example simple, restricted scopes are not implemented,
          // and this is just for illustrative purposes.
          done(null, user, { scope: '*' });
        }).catch(error => done(error));
      } else {
        let session = await frappe.db.get('Session', bearerToken);
        frappe.db.get("OAuthClient", session.clientId).then((success) => {
          if (!success.name) return done(null, false);
          let client = createClientFromDocType(success);
          // To keep this example simple, restricted scopes are not implemented,
          // and this is just for illustrative purposes.
          done(null, client, { scope: '*' });
        }).catch(error => done(error));
      }
    } catch (error) {
      if (error) return done(error);
    }
  }
));

/**
 * The OAuth 2.0 authorization code authentication strategy authenticates
 * clients using a client ID and client secret. The strategy requires a verify callback,
 * which accepts those credentials and calls done providing a client.
 */

passport.use(new AuthorizationCodeStrategy(
  async function(clientCode, clientId, clientSecret, redirectURI, verified) {
    // verified(err, client, info);
    frappe.db.getAll({
      doctype: 'Session',
      filters: { authorizationCode:clientCode },
      limit: 1,
      fields: ["*"]
    }).then(async(success)=>{
      if(success.length){
        success = success[0];
        let client = await frappe.db.get('OAuthClient', clientId);
        let oauthClient = createClientFromDocType(client);
        verified(null, oauthClient, null);
      } else {
        verified(new Error("Invalid Authorization Code"), null, null);
      }
    });
  }
));

function createUserFromDocType(userDoc) {
  return {
    id: userDoc.name,
    username: userDoc.name,
    // password: userDoc.password,
    name: userDoc.full_name
  };
}

function createClientFromDocType(doc) {
  return {
    id: doc.name,
    name: doc.name,
    clientId: doc.name,
    clientSecret: doc.clientSecret,
    isTrusted: doc.isTrusted
  };
}
