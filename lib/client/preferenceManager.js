/* jshint browser: true, jquery: true */
/* global Preference:false, console:false, server:false , localPreferenceManager:false */
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
  this.modifyListeners = [];
  this.server = null;
};

PreferenceManager.prototype.getByName = function(name) {
  var preference = null;
  
  for(var i = 0; i < this.preferences.length; i++) {
    if(this.preferences[i].name === name) {
      preference = this.preferences[i];
      break;
    }
  }
  
  return preference;
};

PreferenceManager.prototype.getById = function(id) {
  var preference = null;
  
  var idx = this.preferencesIndex.indexOf(id);

  if(idx > -1) {
    preference = this.preferences[idx];
  }
  
  return preference;
};

// TODO: currently not used, but should be when remote management of preferences is added
PreferenceManager.prototype.add = function(preference) {
  this._sendAdd(preference);
};

// TODO: currently not used, but should be when remote management of preferences is added
PreferenceManager.prototype.update = function(preference) {
  this._sendUpdate(preference);
};

PreferenceManager.prototype.getSystemPreference = function() {
  var preference = new Preference();
  
  if(localPreferenceManager.localPreference.managedLocally) {
    // TODO: add logic to manage remotely managed preferences
  } else {
    if(this.preferences.length > 0) {
      preference = this.preferences[0];
    }
  }
  
  return preference;
};

PreferenceManager.prototype.addModfiedListener = function(listener) {
  this.modifyListeners.push(listener);
};

PreferenceManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case Preference.MESSAGE_PREFERENCES:
      this._receivedContent(server, content);
      processed = true;
      break;

    case Preference.MESSAGE_ADD_PREFERENCE:
      this._receivedAdd(server, new Preference(content));
      processed = true;
      break;

    case Preference.MESSAGE_DELETE_PREFERENCE:
      this._receivedDelete(server, content);
      processed = true;
      break;

    case Preference.MESSAGE_UPDATE_PREFERENCE:
      this._receivedUpdate(server, new Preference(content));
      processed = true;
      break;
  }

  return processed;
};

PreferenceManager.prototype._receivedAdd = function(server, d) {
  // TODO: determine how to manage this
  var preference = new Preference(d);
  
  this.preferences.push(preference);
  this.preferencesIndex.push(preference.id);
  
  this._updateDom();
  
  // TODO: sort out when required
  if(localPreferenceManager.localPreference.managedLocally) {
    this._notifyModifyListeners();
  } else {
    this._notifyModifyListeners();
  }
};

PreferenceManager.prototype._receivedDelete = function(server, id) {
  // TODO: determine how to manage this
};

PreferenceManager.prototype._receivedUpdate = function(server, preference) {
  var idx = this.preferencesIndex.indexOf(preference.id);
  var currentPreference = null;
  
  if(idx < 0) {
    this.preferences.push(preference);
    this.preferencesIndex.push(preference.id);
  } else {
    currentPreference = this.preferences[idx];
    this.preferences[idx] = preference;
  }
  
  if(localPreferenceManager.localPreference.managedLocally) {
    this._notifyModifyListeners();
  } else {
    // TODO: only notify if current preference has been updated remotely
    this._notifyModifyListeners();
  }

  displayStatusMessage("The changes have been saved", "General Settings");
};

PreferenceManager.prototype._receivedContent = function(server, d) {
  this.preferences = [];
  var preference = null;
  
  for (var item in d) {
    preference = new Preference(d[item]);
    this.preferences.push(preference);
    this.preferencesIndex.push(preference.id);
    
  }
  
  this._updateDom();
  
  this._notifyModifyListeners();
};

PreferenceManager.prototype._notifyModifyListeners = function(preference) {
  for(var i = 0; i < this.modifyListeners.length; i++) {
    this.modifyListeners[i].preferencesChanged(this.getSystemPreference());
  }
};

PreferenceManager.prototype._sendAdd = function(preference) {
  if(this.server !== null) {
    this.server.sendMessage(Preference.MESSAGE_ADD_PREFERENCE, preference);
  }
};

// TODO: currently not used, but should be when remote management of preferences is added
PreferenceManager.prototype._sendDeletePreference = function(id) {
  if(this.server !== null) {
    this.server.sendMessage(Preference.MESSAGE_DELETE_PREFERENCE, id);
  }
};

PreferenceManager.prototype._sendUpdate = function(preference) {
  if(this.server !== null) {
    this.server.sendMessage(Preference.MESSAGE_UPDATE_PREFERENCE, preference);
  }
};

PreferenceManager.prototype.setup = function() {
  $("#generalSettingsApply").on('click', function() {
    this._processApply();
    return false;
  }.bind(this));
};

PreferenceManager.prototype._updateDom = function() {
  var idx = 0;
  
  if(!localPreferenceManager.localPreference.managedLocally) {
    // TODO: add logic to manage remotely managed preferences
  }
  
  $('#preferenceLogo').val(this.preferences[idx].logo);
  $('#preferenceTitle').val(this.preferences[idx].title);
  $('#preferenceSubTitle').val(this.preferences[idx].subTitle);
  $('#preferenceLocation').val(this.preferences[idx].location);
  $('#preferenceDisplayRows').val(this.preferences[idx].rows);
  $('#preferenceDisplayColumns').val(this.preferences[idx].columns);
  $('#preferenceHeaderEnabled').prop('checked', this.preferences[idx].displayHeader).change();
  $('#preferenceBannerEnabled').prop('checked', this.preferences[idx].displayBanner).change();
  $('#preferenceBannerPosition').val(this.preferences[idx].bannerPosition);
  $('#preferenceBannerRotationPeriod').val(this.preferences[idx].bannerRotationPeriod);
  $('#preferenceScreenPaddingTop').val(this.preferences[idx].screenPaddingTop);
  $('#preferenceScreenPaddingBottom').val(this.preferences[idx].screenPaddingBottom);
  $('#preferenceScreenPaddingLeft').val(this.preferences[idx].screenPaddingLeft);
  $('#preferenceScreenPaddingRight').val(this.preferences[idx].screenPaddingRight);
  $('#preferenceScreenPaddingEnabled').prop('checked', this.preferences[idx].screenPaddingEnabled).change();
  $('#preferenceScreenBurnGuardEnabled').prop('checked', this.preferences[idx].screenBurnGuard).change();
  
  $('#preferenceBannerPosition').selectpicker('refresh');
};

PreferenceManager.prototype._processApply = function() {
  var preference = new Preference();
  var addPreference = false;
    
  if (this.preferences.length === 0) {
    addPreference = true;
  } else {
    addPreference = false;
    preference = this.preferences[0];
  }
  
  preference.displayHeader = this._getCheckedValue('preferenceHeaderEnabled');
  preference.displayBanner = this._getCheckedValue('preferenceBannerEnabled');
  preference.logo = $('#preferenceLogo').val();
  preference.title = $('#preferenceTitle').val();
  preference.subTitle = $('#preferenceSubTitle').val();
  preference.location = $('#preferenceLocation').val();
  preference.rows = $('#preferenceDisplayRows').val();
  preference.columns = $('#preferenceDisplayColumns').val();
  preference.bannerPosition = $('#preferenceBannerPosition').val();
  preference.bannerRotationPeriod = $('#preferenceBannerRotationPeriod').val();

  preference.screenPaddingTop = $('#preferenceScreenPaddingTop').val();
  preference.screenPaddingBottom = $('#preferenceScreenPaddingBottom').val();
  preference.screenPaddingLeft = $('#preferenceScreenPaddingLeft').val();
  preference.screenPaddingRight = $('#preferenceScreenPaddingRight').val();
  preference.screenPaddingEnabled = this._getCheckedValue('preferenceScreenPaddingEnabled');
  preference.screenBurnGuard = this._getCheckedValue('preferenceScreenBurnGuardEnabled');
  
  if(addPreference) {
    this._sendAdd(preference);
  } else {
    this._sendUpdate(preference);
  }
};

PreferenceManager.prototype._getCheckedValue = function(fieldName) {
  if($('#' + fieldName + ':checked').val()) {
    return true;
  } else {
    return false;
  }
};
