/*global window, require, console */
/*
 * preference.js
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
  var exports = this.preference = {};
  module.exports = exports;
}
if (typeof require !== "undefined") {
  var uuid = require('node-uuid');
}

module.exports = Preference;

Preference.KEY = 'Preference';

Preference.BANNER_POSITION_TOP = "Top";
Preference.BANNER_POSITION_BOTTOM = "Bottom";
  
Preference.DEFAULT_LOGO = 'Misc';
Preference.DEFAULT_LOCATION = 'Random point in the space/time continuum';
Preference.DEFAULT_WIDTH = 1;
Preference.DEFAULT_ROWS = 2;
Preference.DEFAULT_COLUMNS = 2;
Preference.DEFAULT_TITLE = "ACME Rocket Powered Products, Inc";
Preference.DEFAULT_SUBTITLE = "A part of the ACME Group of companies";

Preference.DEFAULT_BANNER_POSITION = Preference.BANNER_POSITION_BOTTOM;
Preference.DEFAULT_BANNER_ROTATION_PERIOD = 3000;

Preference.MESSAGE_ADD_PREFERENCE = 'addPreference';
Preference.MESSAGE_UPDATE_PREFERENCE = 'updatePreference';
Preference.MESSAGE_DELETE_PREFERENCE = 'deletePreference';
Preference.MESSAGE_GET_PREFERENCES = 'getPreference';
Preference.MESSAGE_PREFERENCES = 'preference';


function Preference(options) {
  options = options || {};
  
  var uuidV1 = ((options.uuidV1 !== null && options.uuidV1 !== undefined) ? options.uuidV1 : false);
  
  this.id = ((options.id !== null && options.id !== undefined) ? options.id : uuidV1 ? uuid.v1() : uuid.v4());

  this.logo = ((options.logo !== null && options.logo !== undefined) ? options.logo : Preference.DEFAULT_LOGO);
  this.title = ((options.title !== null && options.title !== undefined) ? options.title : Preference.DEFAULT_TITLE);
  this.subTitle = ((options.subTitle !== null && options.subTitle !== undefined) ? options.subTitle : Preference.DEFAULT_SUBTITLE);

  this.location = ((options.location !== null && options.location !== undefined) ? options.location : Preference.DEFAULT_LOCATION);
  
  this.columns = ((options.columns !== null && options.columns !== undefined) ? parseInt(options.columns) : Preference.DEFAULT_COLUMNS);
  this.rows = ((options.rows !== null && options.rows !== undefined) ? parseInt(options.rows) : Preference.DEFAULT_ROWS);
  
  this.displayHeader = ((options.displayHeader !== null && options.displayHeader !== undefined) ? options.displayHeader : true);
  this.displayBanner = ((options.displayBanner !== null && options.displayBanner !== undefined) ? options.displayBanner : true);

  this.bannerPosition = ((options.bannerPosition !== null && options.bannerPosition !== undefined) ? options.bannerPosition : Preference.DEFAULT_BANNER_POSITION);
  this.bannerRotationPeriod = ((options.bannerRotationPeriod !== null && options.bannerRotationPeriod !== undefined) ? parseInt(options.bannerRotationPeriod) : Preference.DEFAULT_BANNER_ROTATION_PERIOD);
  
  this.screenPaddingTop = ((options.screenPaddingTop !== null && options.screenPaddingTop !== undefined) ? options.screenPaddingTop : 0);
  this.screenPaddingBottom = ((options.screenPaddingBottom !== null && options.screenPaddingBottom !== undefined) ? options.screenPaddingBottom : 0);
  this.screenPaddingLeft = ((options.screenPaddingLeft !== null && options.screenPaddingLeft !== undefined) ? options.screenPaddingLeft : 0);
  this.screenPaddingRight = ((options.screenPaddingRight !== null && options.screenPaddingRight !== undefined) ? options.screenPaddingRight : 0);
  
  this.screenBurnGuard = ((options.screenBurnGuard !== null && options.screenBurnGuard !== undefined) ? options.screenBurnGuard : false);
}

/* 
 * merge
 */
Preference.merge = function (d1, d2) {
  mergeAttribute(d1, d2, 'logo');
  mergeAttribute(d1, d2, 'title');
  mergeAttribute(d1, d2, 'subTitle');
  mergeAttribute(d1, d2, 'location');
  mergeAttribute(d1, d2, 'columns');
  mergeAttribute(d1, d2, 'rows');
  mergeAttribute(d1, d2, 'displayHeader');
  mergeAttribute(d1, d2, 'displayBanner');
  mergeAttribute(d1, d2, 'bannerPosition');
  mergeAttribute(d1, d2, 'bannerRotationPeriod');
  mergeAttribute(d1, d2, 'screenPaddingTop');
  mergeAttribute(d1, d2, 'screenPaddingBottom');
  mergeAttribute(d1, d2, 'screenPaddingLeft');
  mergeAttribute(d1, d2, 'screenPaddingRight');
  mergeAttribute(d1, d2, 'screenBurnGuard');
};

function mergeAttribute(object, modifiedObject, attribute) {
  object[attribute] = ((modifiedObject[attribute] !== null && modifiedObject[attribute] !== undefined) ? modifiedObject[attribute] : object[attribute]);
}