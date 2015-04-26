/*global window, require, console */
/*
 * preferences.js
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

// "use strict"

var node = false;

if (typeof module === "undefined") {
  var module = function () {};
  var exports = this.preferences = {};
  module.exports = exports;
}
if (typeof require !== "undefined") {
  var uuid = require('node-uuid');
}

module.exports = Preferences;

Preferences.KEY = 'Preferences';

Preferences.DEFAULT_LOGO = 'Misc';
Preferences.DEFAULT_LOCATION = 'Random point in the space/time continuum';
Preferences.DEFAULT_WIDTH = 1;
Preferences.DEFAULT_ROWS = 2;
Preferences.DEFAULT_COLUMNS = 2;
Preferences.DEFAULT_TITLE = "ACME Rocket Powered Products, Inc";
Preferences.DEFAULT_SUBTITLE = "A part of the ACME Group of companies";

Preferences.MESSAGE_ADD_PREFERENCS = 'addPreferences';
Preferences.MESSAGE_UPDATE_PREFERENCS = 'updatePreferences';
Preferences.MESSAGE_DELETE_PREFERENCS = 'deletePreferences';
Preferences.MESSAGE_GET_PREFERENCES = 'getPreferences';
Preferences.MESSAGE_PREFERENCES = 'preferences';


function Preferences(options) {
  options = options || {};
  
  var uuidV1 = ((options.uuidV1 !== null && options.uuidV1 !== undefined) ? options.uuidV1 : false);
  
  this.id = ((options.id !== null && options.id !== undefined) ? options.id : uuidV1 ? uuid.v1() : uuid.v4());

  this.logo = ((options.logo !== null && options.logo !== undefined) ? options.logo : Preferences.DEFAULT_LOGO);
  this.title = ((options.title !== null && options.title !== undefined) ? options.title : Preferences.DEFAULT_TITLE);
  this.subTitle = ((options.subTitle !== null && options.subTitle !== undefined) ? options.subTitle : Preferences.DEFAULT_SUBTITLE);

  this.location = ((options.location !== null && options.location !== undefined) ? options.location : Preferences.DEFAULT_LOCATION);
  
  this.columns = ((options.columns !== null && options.columns !== undefined) ? options.columns : Preferences.DEFAULT_COLUMNS);
  this.rows = ((options.rows !== null && options.rows !== undefined) ? options.rows : Preferences.DEFAULT_ROWS);
  
  this.displayHeader = ((options.displayHeader !== null && options.displayHeader !== undefined) ? options.displayHeader : true);
  this.displayBanner = ((options.displayBanner !== null && options.displayBanner !== undefined) ? options.displayBanner : true);
}

/* 
 * merge
 */
Preferences.merge = function (d1, d2) {
  mergeAttribute(d1, d2, 'logo');
  mergeAttribute(d1, d2, 'title');
  mergeAttribute(d1, d2, 'subTitle');
  mergeAttribute(d1, d2, 'location');
  mergeAttribute(d1, d2, 'columns');
  mergeAttribute(d1, d2, 'rows');
  mergeAttribute(d1, d2, 'displayHeader');
  mergeAttribute(d1, d2, 'displayBanner');
};

function mergeAttribute(object, modifiedObject, attribute) {
  object[attribute] = ((modifiedObject[attribute] !== null && modifiedObject[attribute] !== undefined) ? modifiedObject[attribute] : object[attribute]);
}