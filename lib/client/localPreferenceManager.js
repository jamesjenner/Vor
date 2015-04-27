/* jshint browser: true, jquery: true */
/* global LocalPreference:false, console:false, server:false  */
/*
 * localLocalPreferenceManager.js
 *
 * Copyright (c) 2015 James G Jenner
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

var LocalPreferenceManager = function(options) {
  this.localPreference = new LocalPreference;
  this.server = null;
};

LocalPreferenceManager.prototype.updateLocalPreference = function(preference) {
  // TODO: determine the correct row (row of last element for column + 1)
  this._sendUpdateLocalPreference(preference);
};

LocalPreferenceManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case LocalPreferences.MESSAGE_LOCAL_PREFERENCE:
      this._receivedLocalPreference(server, content);
      processed = true;
      break;

    case LocalPreferences.MESSAGE_UPDATE_LOCAL_PREFERENCE:
      this._receivedUpdateLocalPreference(server, new LocalPreferences(content));
      processed = true;
      break;
  }

  return processed;
};

LocalPreferenceManager.prototype._receivedAddLocalPreference = function(server, d) {
  this._addLocalPreferenceToDom(d);
};

LocalPreferenceManager.prototype._receivedDeleteLocalPreference = function(server, id) {
  this._deleteLocalPreference(id);
};

LocalPreferenceManager.prototype._receivedUpdateLocalPreference = function(server, preference) {
  this.localPreference = new LocalPreferences(d);
  // TODO: update DOM
};

LocalPreferenceManager.prototype._receivedLocalPreference = function(server, d) {
  this.localPreference = new LocalPreferences(d);
  // TODO: update DOM
};

LocalPreferenceManager.prototype._sendUpdateLocalPreference = function(preference) {
  if(this.server !== null) {
    this.server.sendMessage(LocalPreferences.MESSAGE_UPDATE_LOCAL_PREFERENCE, preference);
  }
};

LocalPreferenceManager.prototype._addLocalPreferenceToDom = function(preference) {
  // TODO: update DOM
};

LocalPreferenceManager.prototype.setupLocalPreferencesPane = function() {
  // TODO: setup/add DOM
};
