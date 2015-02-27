/*
 * jenkinsState.js
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

if (typeof module == "undefined") {
  var module = function () {};
  var exports = this.jenkinsState = {};
  module.exports = exports;
}
if (typeof require != "undefined") {
  
}

module.exports = JenkinsState;

JenkinsState.MESSAGE_STATS = 'jenkinsStateStats';

function JenkinsState(options) {
  options = options || {};

  this.displayName = ((options.displayName !== null && options.displayName !== undefined) ? options.displayName : '');
  this.description = ((options.description !== null && options.description !== undefined) ? options.description : '');
  this.healthScore = ((options.healthScore !== null && options.healthScore !== undefined) ? options.healthScore : '');
  this.healthDescription = ((options.healthDescription !== null && options.healthDescription !== undefined) ? options.healthDescription : '');
  this.building = ((options.building !== null && options.building !== undefined) ? options.building : false);
  this.buildingNumber = ((options.buildingNumber !== null && options.buildingNumber !== undefined) ? options.buildingNumber : false);
  this.progress = ((options.progress !== null && options.progress !== undefined) ? options.progress : 100);
  this.builds = ((options.builds !== null && options.builds !== undefined) ? options.builds : []);
}