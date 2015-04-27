/*jlint node: true */
/*global require, console, module, __dirname */
/*
 * preferencesHandler.js
 *
 * Copyright (C) 2015 by James Jenner
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

var MeltingPot = require('meltingpot');

var Preferences = require('../shared/preferences.js');
var fs = require('fs');

module.exports = PreferencesHandler;

// util.inherits(Comms, EventEmitter);

PreferencesHandler.PREFERENCES_FILE = 'preferences.json';

function PreferencesHandler(options) {
  this.dataDirectory = ((options.dataDirectory !== null && options.dataDirectory !== undefined) ? options.dataDirectory : './');
  
  // EventEmitter.call(this);
  this.preferences = [];
  this._load();
  
  // TODO: add log/debug logic
}

PreferencesHandler.prototype.addPreferences = function (data) {
  var preferences = new Preferences(data);

  this.preferences.push(preferences);

  this._save();

  return preferences;
};

/*
 * updatePreferences updates the preferences
 * 
 * Note: this will not add the preferences if it doesn't exist
 * 
 * returns the resulting preferences (merged) if identified by id, otherwise null
 */
PreferencesHandler.prototype.updatePreferences = function (data) {
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
    // create a new preference if none exist
    return this.addPreferences(data);
  }

  var preferences = this._findById(data.id);

  if (preferences !== null) {
    // merge the data from the msg into the vehicle
    Preferences.merge(preferences, data);

    // save the preferences
    this._save();
  }
  
//  if (preferences === null && this.debug) {
//    console.log((new Date()) + ' Update preferences failed, preferences not found: ' + data.id + " : " + data.name);
//  }
  
  return preferences;
};

/*
 * removePreferences removes a preferences
 * 
 * returns true if sucessful, otherwise false
 */
PreferencesHandler.prototype.removePreferences = function (id) {
  // if the message isn't set and the id isn't set then do nothing
  if (id === null || id === undefined) {
    return false;
  }

  var preferences = this._findById(id);
  var adjust = false;
  var row = preferences.row;
  var idx = -1;
  var len = this.preferences.length;
  var i = 0;

  // determine entry
  for (i = 0; i < len; i++) {
    if (this.preferences[i].id === preferences.id) {
      idx = i;
      break;
    }
  }
  
  if (idx === -1) {
    return false;
  }
  
  this.preferences.splice(idx, 1);
  len--;
  
  // reorder row
  for (i = idx; i < len; i++) {
    if (this.preferences[i].column === preferences.column) {
      this.preferences[i].row = row++;
    }
  }
  
  this._save();
  
  return true;
};

/** 
 * _findById - finds the preferences based on it's id
 *
 * returns null if not found, otherwise the preferences
 */
PreferencesHandler.prototype._findById = function (id) {
  var preferences = null;
  var i;

  // if id isn't set then return
  if (id === null || id === undefined) {
    return preferences;
  }

  for (i in this.preferences) {
    if (this.preferences[i].id === id) {
      return this.preferences[i];
    }
  }

  return preferences;
};

PreferencesHandler.prototype._load = function() {
  this.preferences = [];

  try {
    this.preferences = JSON.parse(fs.readFileSync(this.dataDirectory + PreferencesHandler.PREFERENCES_FILE));
  } catch (e) {
    if (e.code === 'ENOENT') {
      // ENOENT is file not found, that is okay, just means no records
    } else {
      // unknown error, lets throw
      throw e;
    }
  }

  if (this.preferences) {
    // TODO: add sorting for new structure of preferences... not sure if possible
    // preferences.sort(compareName);
  } else {
    this.preferences = [];
  }
};

PreferencesHandler.prototype._save = function () {
  fs.writeFileSync(this.dataDirectory + PreferencesHandler.PREFERENCES_FILE, JSON.stringify(this.preferences, null, '\t'));
};

PreferencesHandler.prototype.setupCommsListeners = function (comms) {
  comms.on(MeltingPot.Comms.NEW_CONNECTION_ACCEPTED, function (c) {
    comms.sendMessage(c, Preferences.MESSAGE_PREFERENCES, this.preferences);
  }.bind(this));
  
  comms.on(Preferences.MESSAGE_ADD_PREFERENCE, function (c, d) {
    comms.sendMessage(c, Preferences.MESSAGE_ADD_PREFERENCE, this.addPreferences(d));
  }.bind(this));

  comms.on(Preferences.MESSAGE_UPDATE_PREFERENCE, function (c, d) {
    var preferences = this.updatePreferences(d);
    
    if (preferences !== null) {
      comms.sendMessage(c, Preferences.MESSAGE_UPDATE_PREFERENCE, preferences);
    }
  }.bind(this));

  comms.on(Preferences.MESSAGE_DELETE_PREFERENCE, function (c, d) {
    if (this.removePreferences(d)) {
      comms.sendMessage(c, Preferences.MESSAGE_DELETE_PREFERENCE, d);
    }
  }.bind(this));

  comms.on(Preferences.MESSAGE_GET_PREFERENCES, function (c) {
    comms.sendMessage(c, Preferences.MESSAGE_PREFERENCES, this.preferences);
  }.bind(this));
};

PreferencesHandler.messageHandler = function (comms, connection, msgId, msgBody) {
  var messageProcessed = false;
  
  switch (msgId) {
    case Preferences.MESSAGE_ADD_PREFERENCE:
      comms.emit(Preferences.MESSAGE_ADD_PREFERENCE, connection, msgBody);
      messageProcessed = true;
      break;

    case Preferences.MESSAGE_DELETE_PREFERENCE:
      comms.emit(Preferences.MESSAGE_DELETE_PREFERENCE, connection, msgBody);
      messageProcessed = true;
      break;

    case Preferences.MESSAGE_UPDATE_PREFERENCE:
      comms.emit(Preferences.MESSAGE_UPDATE_PREFERENCE, connection, msgBody);
      messageProcessed = true;
      break;

    case Preferences.MESSAGE_GET_PREFERENCES:
      comms.emit(Preferences.MESSAGE_GET_PREFERENCES, connection);
      messageProcessed = true;
      break;
  }
  
  return messageProcessed;
};

