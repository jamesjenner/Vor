/*jlint node: true */
/*global require, console, module, __dirname */
/*
 * comms.js
 *
 * Copyright (c) 2012 James G Jenner
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var http = require('http');
var https = require('https');
var fs = require('fs');
var ws = require('websocket').server;
var uuid = require('node-uuid');
var crypto = require('crypto');
var bcrypt = require('bcrypt');

var Message = require('./shared/message.js');
var Panel = require('./shared/panel.js');

var USERS_FILE = 'users.json';
var users = null;

module.exports = Comms;

util.inherits(Comms, EventEmitter);

function Comms(options) {
  EventEmitter.call(this);

  options = options || {};


  this.port = ((options.port !== null && options.port !== undefined) ? options.port : 9007); // 80?
  this.securePort = ((options.securePort !== null && options.securePort !== undefined) ? options.securePort : 9008); // 443?
  this.communicationType = ((options.communicationType !== null && options.communicationType !== undefined) ? options.communicationType : Message.COMMS_TYPE_UNSECURE_ONLY);
  this.uuidV1 = ((options.uuidV1 !== null && options.uuidV1 !== undefined) ? options.uuidV1 : false);
  this.sslKey = ((options.sslKey !== null && options.sslKey !== undefined) ? options.sslKey : 'keys/privatekey.pem');
  this.sslCert = ((options.sslCert !== null && options.sslCert !== undefined) ? options.sslCert : 'keys/certificate.pem');

  this.debug = ((options.debug !== null && options.debug !== undefined) ? options.debug : false);
  this.debugLevel = ((options.debugLevel !== null && options.debugLevel !== undefined) ? options.debugLevel : 0);

  //  this.loggingIn = ((options.loggingIn !== null && options.loggingIn !== undefined) ? options.loggingIn : false);
  //  this.loggerIn = options.analysisLogIn;
  //
  //  this.loggingOut = ((options.loggingOut !== null && options.loggingOut !== undefined) ? options.loggingOut : false);
  //  this.loggerOut = options.analysisLogOut;

  if (this.communicationType !== Message.COMMS_TYPE_UNSECURE_ONLY) {
    if (!fs.existsSync(this.sslKey)) {
      console.log((new Date()) + 'WARNING: cannot find file ' + this.sslKey + ', setting communication mode to UNSECURE ONLY');
      this.communicationType = Message.COMMS_TYPE_UNSECURE_ONLY;
    }
    if (!fs.existsSync(this.sslCert)) {
      console.log((new Date()) + 'WARNING: cannot find file ' + this.sslCert + ', setting communication mode to UNSECURE ONLY');
      this.communicationType = Message.COMMS_TYPE_UNSECURE_ONLY;
    }
  }

  users = User.load(USERS_FILE);
}


Comms.prototype.startClientServer = function () {
  var self = this;

  self.secureOnly = self.communicationType === Message.COMMS_TYPE_SECURE_ONLY;
  self.unsecureOnly = self.communicationType === Message.COMMS_TYPE_UNSECURE_ONLY;
  self.secureAndUnsecure = self.communicationType === Message.COMMS_TYPE_MIXED;

  // only start up the secure server if it is required
  if (self.secureOnly || self.secureAndUnsecure) {
    var sslOptions = {};

    sslOptions = {
      key: fs.readFileSync(self.sslKey),
      cert: fs.readFileSync(self.sslCert)
    };

    // setup a https server
    var httpsServer = https.createServer(sslOptions, function (request, response) {
      if (self.debug) {
        console.log((new Date()) + ' Https server received request for ' + request.url);
      }
      response.writeHead(404);
      response.end();
    });

    httpsServer.listen(self.securePort, function () {
      if (self.debug) {
        console.log((new Date()) + ' Https server is listening on port ' + self.securePort);
      }
      // note that we currently do not reply with 404, perhaps we should
    });

    // setup the secure server for websockets
    self.secureServer = new ws({
      httpServer: httpsServer,
      autoAcceptConnections: false
    });

    // add the listener for connection attempts
    self.secureServer.on('request', function (request) {
      processConnectionAttempt(self, request, true);
    });
  }

  // only start up the unsecure comms if not all comms are to be secure
  if (self.secureAndUnsecure || self.unsecureOnly) {
    // setup a http server
    var httpServer = http.createServer(function (request, response) {
      if (self.debug) {
        console.log((new Date()) + ' Http server received request for ' + request.url);
      }
      response.writeHead(404);
      response.end();
    });

    httpServer.listen(self.port, function () {
      if (self.debug) {
        console.log((new Date()) + ' http server is listening on port ' + self.port);
      }
    });

    // setup the unsecure server for websockets
    self.unsecureServer = new ws({
      httpServer: httpServer,
      autoAcceptConnections: false
    });

    // add the listener for connection attempts
    self.unsecureServer.on('request', function (request) {
      processConnectionAttempt(self, request, false);
    });
  }
};

/*
 * the following methods are used to send messages to the attached client(s)
 */
Comms.prototype.sendPanels = function (connection, panels) {
  if (this.debug && this.debugLevel > 4) {
    console.log((new Date()) + ' Sending id: ' + Message.PANELS + ' body: ' + JSON.stringify(panels));
  }
  connection.send(Message.constructMessage(Message.PANELS, panels));
};

/*
 * Currently only responds to where the add came from.
 * When admin is developed, if in admin mode then will
 * need to either send to all appropriate clients, or
 * allow option to resend config to all appropriate
 * clients, possibly via a edit/submit mode concept.
 *
 * code to boardcast globally is as follows:
 *
 * Comms.prototype.sendAddPanel = function (panel) {
 *   this._constructAndBroadcastMsg(Message.ADD_PANEL, panel, 4);
 * }
 */

Comms.prototype.sendAddPanel = function (connection, panel) {
  connection.send(Message.constructMessage(Message.ADD_PANEL, panel, 4));
};

Comms.prototype.sendDeletePanel = function (connection, panel) {
  connection.send(Message.constructMessage(Message.DELETE_PANEL, panel, 4));
};

Comms.prototype.sendUpdatePanel = function (connection, panel) {
  connection.send(Message.constructMessage(Message.UPDATE_PANEL, panel, 4));
};

Comms.prototype._constructAndBroadcastMsg = function (msgId, body, dbgLvl) {
  var msg = Message.constructMessage(msgId, body);

  if (this.debug && this.debugLevel >= dbgLvl) {
    console.log((new Date()) + ' Sending id: ' + JSON.stringify(msgId));
  }

  this._broadcastMsg(msg);
};

Comms.prototype._broadcastMsg = function (msg) {
  if (this.secureAndUnsecure || this.unsecureOnly) {
    this.unsecureServer.broadcast(msg);
  } else {
    this.secureServer.broadcast(msg);
  }
};

/*
 * the following private (not shared) methods are used to emit reception of messages and events
 */
var fireNewConnection = function (self, connection) {
  self.emit('newConnection', connection);

  //  if (self.loggingIn) {
  //    self.loggerIn.info('new connection: ', connection.remoteAddress + ' protocol: ' + connection.protocol);
  //  }
};

var fireNewConnectionAuthenticated = function (self, connection) {
  self.emit('newConnectionAuthenticated', connection);

  //  if (self.loggingIn) {
  //    self.loggerIn.info('new connection authenticated: ', connection.remoteAddress + ' protocol: ' + connection.protocol);
  //  }
};

var fireNewConnectionAccepted = function (self, connection) {
  self.emit('newConnectionAccepted', connection);

  //  if (self.loggingIn) {
  //    self.loggerIn.info('new connection accepted: ', connection.remoteAddress + ' protocol: ' + connection.protocol);
  //  }
};

var rcvdAddPanel = function (self, connection, data) {
  self.emit('addPanel', connection, data);
};

var rcvdDeletePanel = function (self, connection, data) {
  self.emit('deletePanel', connection, data);
};

var rcvdUpdatePanel = function (self, connection, data) {
  self.emit('updatePanel', connection, data);

  //  if (self.loggingIn) {
  //    self.loggerIn.info('update panel', data);
  //  }
};

var rcvdSendPanels = function (self, connection) {
  self.emit('sendPanels', connection);

  //  if (self.loggingIn) {
  //    self.loggerIn.info('send panels', connection);
  //  }
};

/* 
 * Currently all origins allowed.
 * TODO: This should be initialy restricted to localhost
 * Need to look at extending or duplicating if we support admin/client approach
 */
function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed
  console.log("originIsAllowed TODO: This should be initialy restricted to localhost: " + origin);

  return true;
}

function processConnectionAttempt(self, request, isSecure) {
  if (self.debug) {
    console.log((new Date()) + ' Connection attempt from origin ' + request.origin +
      ', secure: ' + isSecure +
      ', websocket ver: ' + request.webSocketVersion +
      ', protocols : ' + request.requestedProtocols.length +
      ' : ' + request.requestedProtocols);
  }

  if (!originIsAllowed(request.origin)) {
    // make sure we only accept requests from an allowed origin
    request.reject();
    if (self.debug) {
      console.log((new Date()) + ' Connection rejected, invalid origin: ' + request.origin);
    }
    return;
  }

  var connection = null;

  // process protocols
  for (var i = 0, l = request.requestedProtocols.length; i < l; i++) {
    if (request.requestedProtocols[i] === 'vor_0.1') {
      connection = request.accept(request.requestedProtocols[i], request.origin);
      connection.verified = false;
      connection.isSecure = isSecure;
      break;
    }
  }

  // test if no connection was created, due to no protocol match
  if (!connection) {
    if (self.debug) {
      console.log((new Date()) + ' Connection rejected, invalid protocol(s): ' + request.requestedProtocols);
    }
    connection = request.reject();
    return;
  }

  if (self.debug) {
    console.log((new Date()) + ' Connection accepted, protocol: ' + connection.protocol);
  }

  // add the message listener
  connection.on('message', function (message) {
    var connectionIsValid = processRawMessage(self, connection, message);
  });

  // add the connection close listener
  connection.on('close', function (reasonCode, description) {
    processConnectionClosed(connection, reasonCode, description);
  });

  // fire the connection event
  fireNewConnection(self, connection);
}

function processConnectionClosed(connection, reasonCode, description) {
  if (this.debug) {
    console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected: ' + reasonCode + ", " + description);
  }
}

function processRawMessage(self, con, message) {
  if (message.type === 'utf8') {
    if (self.debug && self.debugLevel > 3) {
      console.log((new Date()) + ' Received message: ' + message.utf8Data);
    }

    // deconstruct the message
    var msg = Message.deconstructMessage(message.utf8Data);

    processMessage(self, con, msg.id, msg.body);
  } else if (message.type === 'binary') {
    if (self.debug) {
      console.log((new Date()) + ' Received binary message of ' + message.binaryData.length + ' bytes');
    }
    // con.sendBytes(message.binaryData);
  } else {
    if (self.debug) {
      console.log((new Date()) + ' Received unknown message type ' + message.type);
    }
  }
}

function authenticateConnection(self, connection, msgBody) {
  var validUser = false;
  var foundUser = false;
  var salt = null;
  var password = null;
  var body = null;
  var i = 0,
    l = 0;

  var clientConnectionType = msgBody.connectionType;

  var user = new User({
    userId: msgBody.userId,
    password: msgBody.password
  });

  if (!clientConnectionType) {
    connection.send(Message.constructMessage(Message.AUTHENTICATION_REJECTED, "athentication message malformed"));
    connection.drop(connection.CLOSE_REASON_NORMAL, "authentication message malformed");
    return;
  }

  switch (clientConnectionType) {
  case Message.COMMS_TYPE_SECURE_ONLY:
    if (self.unsecureOnly) {
      connection.send(Message.constructMessage(Message.AUTHENTICATION_REJECTED, "Server only allows unsecure connections"));
      connection.drop(connection.CLOSE_REASON_NORMAL, "Server only allows unsecure connections");
      return;
    }
    break;

  case Message.COMMS_TYPE_UNSECURE_ONLY:
    if (self.secureOnly) {
      connection.send(Message.constructMessage(Message.AUTHENTICATION_REJECTED, "Server only allows secure connections"));
      connection.drop(connection.CLOSE_REASON_NORMAL, "Server only allows secure connections");
      return;
    }
    break;

  case Message.COMMS_TYPE_MIXED:
    if (!connection.isSecure) {
      connection.send(Message.constructMessage(Message.AUTHENTICATION_REJECTED, "Requested mixed comms while authentication is via unsecure connection"));
      connection.drop(connection.CLOSE_REASON_NORMAL, "Requested mixed comms while authentication is via unsecure connection");
      return;
    }
    break;
  }

  if (!users || users.length === 0) {
    if (self.debug) {
      console.log((new Date()) + ' No users so creating user for : ' + user.userId);
    }
    // We have the first user, so add it and accept
    validUser = true;

    user.salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(user.password, user.salt);
    users.push(user);

    User.save(USERS_FILE, users);
  } else {
    // validate that the user exists
    for (i = 0, l = users.length; i < l; i++) {
      if (users[i].id === user.id) {
        // found the user
        foundUser = true;
        salt = users[i].salt;
        password = users[i].password;
        break;
      }
    }

    if (foundUser) {
      // validate if the salt and hash of the password is valid
      var hashed = bcrypt.hashSync(user.password, salt);
      validUser = (password === hashed);
    }
  }

  if (validUser) {
    // validation successful
    if (self.debug) {
      console.log((new Date()) + ' authentication for user ' + user.userId + ' successful');
    }

    // fire the connection event
    fireNewConnectionAuthenticated(self, connection);

    // only create a session if all comms are mixed (ie comms are shared between ws and wss)
    if (self.secureOnly ||
      self.unsecureOnly ||
      (clientConnectionType === Message.COMMS_TYPE_UNSECURE_ONLY && !connection.isSecure) ||
      (clientConnectionType === Message.COMMS_TYPE_SECURE_ONLY && connection.isSecure)) {
      // fire the connection accepted event
      if (self.debug) {
        console.log((new Date()) + ' sending accept');
      }
      fireNewConnectionAccepted(self, connection);
      connection.verified = true;
      body = {
        sessionId: '',
        connectionType: self.communicationType
      };
      connection.send(Message.constructMessage(Message.AUTHENTICATION_ACCEPTED, body));
    } else {
      // create a session key
      var sessionId = generateSession(self, connection);

      // send the session key back
      if (self.debug) {
        console.log((new Date()) + ' sending session ' + sessionId);
      }
      body = {
        sessionId: sessionId,
        connectionType: self.communicationType
      };
      connection.send(Message.constructMessage(Message.AUTHENTICATION_ACCEPTED, body));
    }
  } else {
    if (self.debug) {
      console.log((new Date()) + ' authentication for user ' + user.userId + ' unsuccessful');
    }

    // validation failed, reject the connection
    connection.send(Message.constructMessage(Message.AUTHENTICATION_REJECTED));
    connection.drop(connection.CLOSE_REASON_NORMAL, "authentication failed");
  }
}

var sessions = [];

function generateSession(self, connection) {
  var currentTime = Date.now();

  if (self.debug) {
    console.log((new Date()) + ' generating session id for ' + (self.uudiV1 ? 'UUID V1' : 'UUID V4 RNG') + ' @ ' + currentTime);
  }

  var session = {};
  session.time = currentTime;
  session.address = connection.remoteAddress;
  session.secureConnection = connection;

  if (self.uuidV1) {
    session.sessionId = uuid.v1();
  } else {
    session.sessionId = uuid.v4({
      rng: uuid.nodeRNG
    });
  }

  sessions.push(session);

  return session.sessionId;
}

/**
 * validate session
 *
 * note that this is only performed when a session id has been passed via message
 * so if the session is invalid then the connection will be terminated automatically
 *
 * This also trims the session id pool of any expired sessions. currently only occurs here.
 */
function validateSession(self, connection, msg) {
  // set a time to compare the date the session was created
  var i, l;
  var validTimeCompare = Date.now() - (2 * 60 * 1000);

  // iterate through the sessions, remove expired ones
  // note: comparing length everytime, as the length may change
  if (self.debug) {
    console.log((new Date()) + " Checking for old sessions");
  }
  for (i = 0; i < sessions.length; i++) {
    if (sessions[i].time < validTimeCompare) {
      if (self.debug) {
        console.log((new Date()) + " \tremoving session: " + sessions[i].sessionId + " : " + sessions[i].time);
      }
      // remove as has expired
      sessions.splice(i, 1);
    }
  }

  var entryFound = false;
  var idx = -1;
  // find the session id for the remote address of the connection
  for (i = 0, l = sessions.length; i < l; i++) {
    if (sessions[i].address === connection.remoteAddress) {
      // found the address
      entryFound = true;
      idx = i;
      break;
    }
  }

  if (entryFound) {
    // check session id is valid
    if (sessions[i].sessionId === msg.sessionId) {
      // the session is valid
      connection.verified = true;
      // the secure connection must be updated and set to verified, otherwise it will think it isn't
      sessions[i].secureConnection.verified = true;
    }
    // remove the entry, either it's invalid or it's valid and being used
    sessions.splice(idx, 1);
  }

  if (connection.verified) {
    connection.send(Message.constructMessage(Message.SESSION_CONFIRMED));
    // fire the connection accepted event
    fireNewConnectionAccepted(self, connection);
  } else {
    // disconnect as the session id is invalid
    // TODO: if this is unsecure, then must also drop the corresponding secure session
    if (self.debug) {
      console.log((new Date()) + " dropping connection as session was invalid");
    }
    connection.drop(connection.CLOSE_REASON_NORMAL, "Session id not valid");
  }
}

function processMessage(self, connection, id, msg) {
  if (!connection.verified) {
    switch (id) {
    case Message.AUTHENTICATE:
      authenticateConnection(self, connection, msg);
      break;

    case Message.SESSION:
      if (connection.isSecure && self.secureOnly) {
        if (self.debug) {
          console.log((new Date()) +
            ' Invalid message, received session request, secure connection: ' + connection.isSecure);
        }
      } else {
        validateSession(self, connection, msg);
      }
      break;

    default:
      if (self.debug) {
        console.log((new Date()) +
          ' Unknown message received ' + id + ', secure connection: ' + connection.isSecure);
      }
      break;
    }
  } else {
    switch (id) {
    case Message.CHANGE_PWD:
      break;

    case Message.ADD_PANEL:
      rcvdAddPanel(self, connection, msg);
      break;

    case Message.DELETE_PANEL:
      rcvdDeletePanel(self, connection, msg);
      break;

    case Message.UPDATE_PANEL:
      rcvdUpdatePanel(self, connection, msg);
      break;

    case Message.GET_PANELS:
      rcvdSendPanels(self, connection);
      break;

    default:
      if (self.debug) {
        console.log((new Date()) +
          ' Unknown message received ' + id + ', secure connection: ' + connection.isSecure);
      }
      break;
    }
  }
}

var User = function (options) {
  options = options || {};

  this.salt = options.salt || 0;
  this.userId = options.userId || '';
  this.password = options.password || '';
};

/* 
 * load users
 */
User.load = function (filename) {
  var list = [];
  var i, l;
  try {
    var dataJSON = JSON.parse(fs.readFileSync(filename));

    // the received JSON data will be object, not user instances, so convert
    // TODO: is this really required?

    for (i = 0, l = dataJSON.length; i < l; i++) {
      list.push(new User(dataJSON[i]));
    }
  } catch (err) {}

  return list;
};

/* 
 * save users
 */
User.save = function (filename, list) {
  fs.writeFileSync(filename, JSON.stringify(list, null, '\t'));
};