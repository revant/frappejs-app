const frappe = require('frappejs');
const Store = require('express-session/session/store');

/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function(fn){ process.nextTick(fn.bind.apply(fn, arguments)) };

module.exports = class SessionStore extends Store {
    constructor(){
        super();
    }
    // Required : get(sid, callback), destroy(sid, callback), set(sid, session, callback)
    async get(sid, callback){
        let session = await frappe.db.get("Session", sid);
        console.log(session);
        if(typeof session.session === "string"){
            callback(null, JSON.parse(session.session));
        } else if(typeof session.session === "object"){
            callback(null, session.session);
        } else {
            callback(null, null);
        }
    }

    async destroy(sid, callback){
        this.deleteSession(sid);
        callback && defer(callback);
    }

    set(sid, session, callback){
        // this.clearAll();
        const now = new Date()
        const expiration = new Date(now.setHours(now.getHours() + 1));
        session.cookie.expires = expiration;
        session.cookie.originalMaxAge = 1800;
        frappe.db.update("Session", {
            name: sid,
            session: JSON.stringify(session)
        }).then(()=>{
            callback(new Error("Sid Set"));
        }).catch(()=>{
            frappe.db.insert("Session", {
                name: sid,
                session: JSON.stringify(session)
            }).then(()=>{
                callback(new Error("Sid Set"));
            });
        });
    }

    // Recommended : touch(sid, session, callback)
    async touch(sid, session, callback){
        let sess = await frappe.getDoc('Session', sid);
        let currentSession = JSON.parse(sess.session);
        if (currentSession) {
            // update expiration
            currentSession.cookie = session.cookie;
            frappe.db.update('Session', {
                name: sid,
                session: JSON.stringify(currentSession)
            });
        }
        callback && defer(callback);
    }

    // Optional : all(callback), clear(callback), length(callback)
    all(callback){
        const sessionIds = [];
        var sessionList = frappe.db.getAll('Session');
        var sessions = {};
        for (let i = 0; i < sessionList.length; i++) {
            sessionIds.push(sessionList[i].name);
        }
        for (var i = 0; i < sessionIds.length; i++) {
          var sessionId = sessionIds[i];
          var session = this.getSession(sessionId);

          if (session) {
            sessions[sessionId] = session;
          }
        }

        callback && defer(callback, null, sessions);
    }

    clear(callback){
        this.clearAll();
        callback && defer(callback);
    }

    length(callback){
        this.all(function (err, sessions) {
            if (err) return callback(err);
            callback(null, Object.keys(sessions).length);
        });
    }

    async getSession(sessionId) {
        let session = await frappe.getDoc('Session', sessionId);
        var sess = session.session;
        if (!sess) {
          return;
        }

        // parse
        sess = JSON.parse(sess);

        var expires = typeof sess.cookie.expires === 'string'
          ? new Date(sess.cookie.expires)
          : sess.cookie.expires;

        console.log("Expires", expires);
        // destroy expired session
        if (expires && expires <= Date.now()) {
          this.deleteSession(sessionId);
          return;
        }

        return sess;
      }

    async clearAll(){
        console.log("SessionStore#clearAll");
        let sessionList = await frappe.db.getAll({doctype:"Session"});
        for (let i = 0; i < sessionList.length; i++) {
            const session = sessionList[i];
            console.log(session.name);
            const sess = await frappe.getDoc('Session', session.name);
            sess.delete();
        }
    }

    async deleteSession(sid){
        const sess = await frappe.getDoc('Session', sid);
        sess.delete();
    }

}