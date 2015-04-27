/*jlint node: true */
/*global require, console, module, __dirname */
/*
 * preferenceHandler.js
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

var Preference = require('../shared/preference.js');
var fs = require('fs');

module.exports = PreferenceHandler;

// util.inherits(Comms, EventEmitter);

PreferenceHandler.PREFERENCE_FILE = 'preference.json';

function PreferenceHandler(options) {
  this.dataDirectory = ((options.dataDirectory !== null && options.dataDirectory !== undefined) ? options.dataDirectory : './');
  
  // EventEmitter.call(this);
  this.preferences = [];
  this._load();
  
  // TODO: add log/debug logic
}

PreferenceHandler.prototype.addPreference = function (data) {
  var preference = new Preference(data);

  this.preferences.push(preference);

  this._save();

  return preference;
};

/*
 * updatePreference updates the preference
 * 
 * Note: this will not add the preference if it doesn't exist
 * 
 * returns the resulting preference (merged) if identified by id, otherwise null
 */
PreferenceHandler.prototype.updatePreference = function (data) {
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
    // TODO: error handling
    return null;
  }

  var preference = this._findById(data.id);

  if (preference !== null) {
    // merge the data from the msg into the vehicle
    Preference.merge(preference, data);

    // save the preference
    this._save();
  }
  
  return preference;
};

/*
 * removePreference removes a preference
 * 
 * returns true if sucessful, otherwise false
 */
PreferenceHandler.prototype.removePreference = function (id) {
  // if the message isn't set and the id isn't set then do nothing
  if (id === null || id === undefined) {
    return false;
  }

  var preference = this._findById(id);
  var adjust = false;
  var row = preference.row;
  var idx = -1;
  var len = this.preference.length;
  var i = 0;

  // determine entry
  for (i = 0; i < len; i++) {
    if (this.preferences[i].id === preference.id) {
      idx = i;
      break;
    }
  }
  
  if (idx === -1) {
    return false;
  }
  
  this.preferences.splice(idx, 1);
  len--;
  
  this._save();
  
  return true;
};

/** 
 * _findById - finds the preference based on it's id
 *
 * returns null if not found, otherwise the preference
 */
PreferenceHandler.prototype._findById = function (id) {
  var preference = null;
  var i;

  // if id isn't set then return
  if (id === null || id === undefined) {
    return preference;
  }

  for (i in this.preferences) {
    if (this.preferences[i].id === id) {
      return this.preferences[i];
    }
  }

  return preference;
};

PreferenceHandler.prototype._load = function() {
  this.preferences = [];

  try {
    this.preferences = JSON.parse(fs.readFileSync(this.dataDirectory + PreferenceHandler.PREFERENCE_FILE));
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

PreferenceHandler.prototype._save = function () {
  fs.writeFileSync(this.dataDirectory + PreferenceHandler.PREFERENCE_FILE, JSON.stringify(this.preferences, null, '\t'));
};

PreferenceHandler.prototype.setupCommsListeners = function (comms) {
  comms.on(MeltingPot.Comms.NEW_CONNECTION_ACCEPTED, function (c) {
    comms.sendMessage(c, Preference.MESSAGE_PREFERENCES, this.preferences);
  }.bind(this));
  
  comms.on(Preference.MESSAGE_ADD_PREFERENCE, function (c, d) {
    comms.sendMessage(c, Preference.MESSAGE_ADD_PREFERENCE, this.addPreference(d));
  }.bind(this));

  comms.on(Preference.MESSAGE_UPDATE_PREFERENCE, function (c, d) {
    var preference = this.updatePreference(d);
    
    if (preference !== null) {
      comms.sendMessage(c, Preference.MESSAGE_UPDATE_PREFERENCE, preference);
    }
  }.bind(this));

  comms.on(Preference.MESSAGE_DELETE_PREFERENCE, function (c, d) {
    if (this.removePreference(d)) {
      comms.sendMessage(c, Preference.MESSAGE_DELETE_PREFERENCE, d);
    }
  }.bind(this));

  comms.on(Preference.MESSAGE_GET_PREFERENCES, function (c) {
    comms.sendMessage(c, Preference.MESSAGE_PREFERENCES, this.preferences);
  }.bind(this));
};

PreferenceHandler.messageHandler = function (comms, connection, msgId, msgBody) {
  var messageProcessed = false;
  
  switch (msgId) {
    case Preference.MESSAGE_ADD_PREFERENCE:
      comms.emit(Preference.MESSAGE_ADD_PREFERENCE, connection, msgBody);
      messageProcessed = true;
      break;

    case Preference.MESSAGE_DELETE_PREFERENCE:
      comms.emit(Preference.MESSAGE_DELETE_PREFERENCE, connection, msgBody);
      messageProcessed = true;
      break;

    case Preference.MESSAGE_UPDATE_PREFERENCE:
      comms.emit(Preference.MESSAGE_UPDATE_PREFERENCE, connection, msgBody);
      messageProcessed = true;
      break;

    case Preference.MESSAGE_GET_PREFERENCES:
      comms.emit(Preference.MESSAGE_GET_PREFERENCES, connection);
      messageProcessed = true;
      break;
  }
  
  return messageProcessed;
};

