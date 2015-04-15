/*
 * agileSprintBreakdown.js
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
  var exports = this.agileSprintBreakdown = {};
  module.exports = exports;
}
if (typeof require != "undefined") {
  
}

module.exports = AgileSprintBreakdown;

AgileSprintBreakdown.MESSAGE_STATS = 'agileSprintBreakdownStats';

function AgileSprintBreakdown(options) {
  options = options || {};

  this.startDate = ((options.startDate !== null && options.startDate !== undefined) ? options.startDate : null);
  this.endDate = ((options.endDate !== null && options.endDate !== undefined) ? options.endDate : null);
  this.lengthInDays = ((options.lengthInDays !== null && options.lengthInDays !== undefined) ? options.lengthInDays : 0);
  this.state = ((options.state !== null && options.state !== undefined) ? options.state : '');
  this.data = ((options.data !== null && options.data !== undefined) ? options.data : []);
}