/* jshint browser: true, jquery: true */
/* global Preference:false, console:false, server:false  */
/*
 * preferenceManager.js
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

var PreferenceManager = function(options) {
  this.preferences = [];
  this.preferencesIndex = [];
  this.server = null;
};

PreferenceManager.prototype.getPreferenceByName = function(name) {
  var preference = null;
  
  for(var i = 0; i < this.preferences.length; i++) {
    if(this.preferences[i].name === name) {
      preference = this.preferences[i];
      break;
    }
  }
  
  return preference;
};

PreferenceManager.prototype.getPreferenceById = function(id) {
  var preference = null;
  
  var idx = this.preferencesIndex.indexOf(id);

  if(idx > -1) {
    preference = this.preferences[idx];
  }
  
  return preference;
};

PreferenceManager.prototype.addPreference = function(preference) {
  // TODO: determine the correct row (row of last element for column + 1)
  this._sendAddPreference(preference);
};

PreferenceManager.prototype.updatePreference = function(preference) {
  // TODO: determine the correct row (row of last element for column + 1)
  this._sendUpdatePreference(preference);
};

PreferenceManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case Preference.MESSAGE_PREFERENCES:
      this._receivedPreference(server, content);
      processed = true;
      break;

    case Preference.MESSAGE_ADD_PREFERENCE:
      this._receivedAddPreference(server, new Preference(content));
      processed = true;
      break;

    case Preference.MESSAGE_DELETE_PREFERENCE:
      this._receivedDeletePreference(server, content);
      processed = true;
      break;

    case Preference.MESSAGE_UPDATE_PREFERENCE:
      this._receivedUpdatePreference(server, new Preference(content));
      processed = true;
      break;
  }

  return processed;
};

PreferenceManager.prototype._receivedAddPreference = function(server, d) {
  this._addPreferenceToDom(d);
};

PreferenceManager.prototype._receivedDeletePreference = function(server, id) {
  this._deletePreference(id);
};

PreferenceManager.prototype._receivedUpdatePreference = function(server, preference) {
  var idx = this.preferencesIndex.indexOf(preference.id);
  var currentPreference = null;
  
  if(idx < 0) {
    this.preferences.push(preference);
    this.preferencesIndex.push(preference.id);
  } else {
    currentPreference = this.preferences[idx];
    this.preferences[idx] = preference;
    
    if(currentPreference.name !== preference.name) {
      $('#preferenceRowName' + preference.id).text(preference.name);
    }
    if(currentPreference.type !== preference.type) {
      $('#preferenceRowType'  + preference.id).text(preference.type);
    }
  }
};

PreferenceManager.prototype._receivedPreference = function(server, d) {
  // TODO: test logic to remove existing data on DOM (needed for reconnection, but not supported)
  $("#preferencesGrid").empty();

  this.preferences = [];
  var preference = null;
  
  for (var item in d) {
    preference = new Preference(d[item]);
    this.preferences.push(preference);
    this.preferencesIndex.push(preference.id);
    this._addPreferenceToDom(preference);
  }
};

PreferenceManager.prototype._sendAddPreference = function(preference) {
  if(this.server !== null) {
    this.server.sendMessage(Preference.MESSAGE_ADD_PREFERENCE, preference);
  }
};

PreferenceManager.prototype._sendDeletePreference = function(id) {
  if(this.server !== null) {
    this.server.sendMessage(Preference.MESSAGE_DELETE_PREFERENCE, id);
  }
};

PreferenceManager.prototype._sendUpdatePreference = function(preference) {
  if(this.server !== null) {
    this.server.sendMessage(Preference.MESSAGE_UPDATE_PREFERENCE, preference);
  }
};

PreferenceManager.prototype._addPreferenceToDom = function(preference) {
};

PreferenceManager.prototype._deletePreference = function(id) {
  $('#preferenceRow' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
};

PreferenceManager.prototype.setupPreferencePane = function() {
  $(".preferenceRow").on('click', function() {
    // viewPreferenceDetailPane($(this).attr("data-key"));
    return false;
  });
  
  $("#addPreference").on('click', function() {
    viewPreferenceWizard('add', {});
    // viewPreferenceDetailPane($(this).attr("data-key"));
    return false;
  });
};
