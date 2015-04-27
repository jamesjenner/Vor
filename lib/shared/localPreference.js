/*global window, require, console */
/*
 * localPreference.js
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
  var exports = this.localPreference = {};
  module.exports = exports;
}

module.exports = LocalPreference;

LocalPreference.KEY = 'LocalPreference';

LocalPreference.MESSAGE_UPDATE_LOCAL_PREFERENCE = 'updateLocalPreference';
LocalPreference.MESSAGE_GET_LOCAL_PREFERENCE = 'getLocalLocalPreference';
LocalPreference.MESSAGE_LOCAL_PREFERENCE = 'localPreference';


function LocalPreference(options) {
  options = options || {};
  
  this.managedLocally = ((options.managedLocally !== null && options.managedLocally !== undefined) ? options.managedLocally : true);
  this.remoteNode = ((options.remoteNode !== null && options.remoteNode !== undefined) ? options.remoteNode : '');
}

/* 
 * merge
 */
LocalPreference.merge = function (d1, d2) {
  mergeAttribute(d1, d2, 'managedLocally');
};

function mergeAttribute(object, modifiedObject, attribute) {
  object[attribute] = ((modifiedObject[attribute] !== null && modifiedObject[attribute] !== undefined) ? modifiedObject[attribute] : object[attribute]);
}