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
  this.localPreference = new LocalPreference();
  this.server = null;
  
  this._updateLocalPreferencesOnDom();
};

LocalPreferenceManager.prototype.updateLocalPreference = function(preference) {
  // TODO: determine the correct row (row of last element for column + 1)
  this._sendUpdateLocalPreference(preference);
};

LocalPreferenceManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case LocalPreference.MESSAGE_LOCAL_PREFERENCE:
      this._receivedLocalPreference(server, content);
      processed = true;
      break;

    case LocalPreference.MESSAGE_UPDATE_LOCAL_PREFERENCE:
      this._receivedUpdateLocalPreference(server, new LocalPreference(content));
      processed = true;
      break;
  }

  return processed;
};

LocalPreferenceManager.prototype._receivedUpdateLocalPreference = function(server, preference) {
  this.localPreference = new LocalPreference(preference);
  this._updateLocalPreferencesOnDom();
};

LocalPreferenceManager.prototype._receivedLocalPreference = function(server, d) {
  this.localPreference = new LocalPreference(d);
  this._updateLocalPreferencesOnDom();
};

LocalPreferenceManager.prototype._sendUpdateLocalPreference = function() {
  if(this.server !== null) {
    this.server.sendMessage(LocalPreference.MESSAGE_UPDATE_LOCAL_PREFERENCE, this.localPreference);
  }
};

LocalPreferenceManager.prototype.setup = function() {
  this._updateLocalPreferencesOnDom();
  $("#generalSettingsApply").on('click', function() {
    this._processApply();
    return false;
  }.bind(this));
  
};

LocalPreferenceManager.prototype._updateLocalPreferencesOnDom = function() {
  $('#preferenceLocalConfig').prop('checked', this.localPreference.managedLocally).change();
};

LocalPreferenceManager.prototype._processApply = function(preference) {
  if($('#preferenceLocalConfig:checked').val()) {
    this.localPreference.managedLocally = true;
  } else {
    this.localPreference.managedLocally = false;
  }

  this._sendUpdateLocalPreference();
};

