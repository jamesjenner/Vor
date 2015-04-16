/*
 * agileSprint.js
 *
 * Copyright (c) 2014 James G Jenner
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
  var exports = this.agileSprint = {};
  module.exports = exports;
}
if (typeof require != "undefined") {
  
}

module.exports = AgileSprint;

AgileSprint.MESSAGE_STATS = 'agileSprintStats';

AgileSprint.MESSAGE_TYPE_SUMMARY = 'agileSprintSummary';
AgileSprint.MESSAGE_TYPE_BREAKDOWN = 'agileSprintBreakdown';

function AgileSprint(options) {
  options = options || {};

  this.messageType = ((options.messageType !== null && options.messageType !== undefined) ? options.messageType : AgileSprint.MESSAGE_TYPE_OVERVIEW);
  this.blockedItems = ((options.blockedItems !== null && options.blockedItems !== undefined) ? options.blockedItems : 0);
  this.backlogStoryPoints = ((options.backlogStoryPoints !== null && options.backlogStoryPoints !== undefined) ? options.backlogStoryPoints : 0);
  this.wipStoryPoints = ((options.wipStoryPoints !== null && options.wipStoryPoints !== undefined) ? options.wipStoryPoints : 0);
  this.completedStoryPoints = ((options.completedStoryPoints !== null && options.completedStoryPoints !== undefined) ? options.completedStoryPoints : 0);
  this.percentageDone = ((options.percentageDone !== null && options.percentageDone !== undefined) ? options.percentageDone : 0);
  this.percentageTarget = ((options.percentageTarget !== null && options.percentageTarget !== undefined) ? options.percentageTarget : 0);
  this.sprintStartDate = ((options.sprintStartDate !== null && options.sprintStartDate !== undefined) ? options.sprintStartDate : '');
  this.sprintEndDate = ((options.sprintEndDate !== null && options.sprintEndDate !== undefined) ? options.sprintEndDate : '');
  this.sprintDuration = ((options.sprintDuration !== null && options.sprintDuration !== undefined) ? options.sprintDuration : 0);
  this.data = ((options.data !== null && options.data !== undefined) ? options.data : []);
}