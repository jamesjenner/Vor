/*jlint node: true */
/*global require, console, module, __dirname */
/*
 * localPreferenceHandler.js
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

var LocalPreference = require('../shared/localPreference.js');
var fs = require('fs');

module.exports = LocalPreferenceHandler;

LocalPreferenceHandler.LOCAL_PREFERENCE_FILE = 'localPreference.json';

function LocalPreferenceHandler(options) {
  this.dataDirectory = ((options.dataDirectory !== null && options.dataDirectory !== undefined) ? options.dataDirectory : './');
  
  this.localPreference = [];
  this._load();
}

LocalPreferenceHandler.prototype.addLocalPreference = function (data) {
  this.localPreference = new LocalPreference(data);

  this._save();

  return this.localPreference;
};

/*
 * updateLocalPreference updates the localPreference
 * 
 * Note: this will create a localPreference if it doesn't exist
 * 
 * returns the resulting localPreference (merged)
 */
LocalPreferenceHandler.prototype.updateLocalPreference = function (data) {
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
    return null;
  }

  var localPreference = this.localPreference;

  // create a new preference if none exist
  if (this.localPreference === null) {
    return this.addLocalPreference(data);
  }
  
  // merge the data from the msg into the vehicle
  LocalPreference.merge(this.localPreference, data);

  // save the localPreference
  this._save();
  
  return this.localPreference;
};

LocalPreferenceHandler.prototype._load = function() {
  this.localPreference = [];

  try {
    this.localPreference = JSON.parse(fs.readFileSync(this.dataDirectory + LocalPreferenceHandler.LOCAL_PREFERENCE_FILE));
  } catch (e) {
    if (e.code === 'ENOENT') {
      // ENOENT is file not found, that is okay, just means no records
    } else {
      // unknown error, lets throw
      throw e;
    }
  }

  if (!this.localPreference) {
    this.localPreference = new LocalPreference();
  }
};

LocalPreferenceHandler.prototype._save = function () {
  fs.writeFileSync(this.dataDirectory + LocalPreferenceHandler.LOCAL_PREFERENCE_FILE, JSON.stringify(this.localPreference, null, '\t'));
};

LocalPreferenceHandler.prototype.setupCommsListeners = function (comms) {
  comms.on(MeltingPot.Comms.NEW_CONNECTION_ACCEPTED, function (c) {
    comms.sendMessage(c, LocalPreference.MESSAGE_LOCAL_PREFERENCE, this.localPreference);
  }.bind(this));
  
  comms.on(LocalPreference.MESSAGE_UPDATE_PREFERENCE, function (c, d) {
    var localPreference = this.updateLocalPreference(d);
    
    if (localPreference !== null) {
      comms.sendMessage(c, LocalPreference.MESSAGE_UPDATE_PREFERENCE, localPreference);
    }
  }.bind(this));

  comms.on(LocalPreference.MESSAGE_GET_LOCAL_PREFERENCE, function (c) {
    comms.sendMessage(c, LocalPreference.MESSAGE_LOCAL_PREFERENCE, this.localPreference);
  }.bind(this));
};

LocalPreferenceHandler.messageHandler = function (comms, connection, msgId, msgBody) {
  var messageProcessed = false;
  
  switch (msgId) {
    case LocalPreference.MESSAGE_UPDATE_PREFERENCE:
      comms.emit(LocalPreference.MESSAGE_UPDATE_PREFERENCE, connection, msgBody);
      messageProcessed = true;
      break;

    case LocalPreference.MESSAGE_GET_LOCAL_PREFERENCE:
      comms.emit(LocalPreference.MESSAGE_GET_LOCAL_PREFERENCE, connection);
      messageProcessed = true;
      break;
  }
  
  return messageProcessed;
};

