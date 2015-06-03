/*jlint node: true */
/*global require, console, __dirname, module, setInterval, clearInterval */

/*
 * jenkins.js
 *
 * Copyright (C) 2015 by James Jenner
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
 * 
 * Note that this uses the Jenkins SDK.JavaScript, refer to resources mentioned
 * below for further information about the Jenkins SDK for javascript. 
 */

var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var async        = require('async');

var jenkinsapi = require('./jenkins/jenkins');

var JenkinsState = require('../shared/jenkinsState.js');

module.exports = Jenkins;

util.inherits(Jenkins, EventEmitter);

Jenkins.DEFAULT_POLL_MINS = 1;
Jenkins.DEFAULT_NAME = 'kitchen_ellipse';

Jenkins.EVENT_DATA_RECEIVED = "dataReceived";


function Jenkins(options) {
  EventEmitter.call(this);
  
  this.host = ((options.host !== null && options.host !== undefined) ? options.host : 'http://awsjenkins.ventyx.abb.com:8080');
  this.name = ((options.name !== null && options.name !== undefined) ? options.name : Jenkins.DEFAULT_NAME);
  
  this.debug = false;
  this.pollFrequencyMinutes = ((options.pollFrequencyMinutes !== null && options.pollFrequencyMinutes !== undefined) ? options.pollFrequencyMinutes : Jenkins.DEFAULT_POLL_MINS);
  this.pollFrequencyMinutes = 0.5;
  this.pollFrequencyMilliseconds = this.pollFrequencyMinutes * 60 * 1000;
  // TODO: stop this from being hard coded
  this.maxHistory = 5;
  this.history = [];

  this.jenkinsState = new JenkinsState();
}

Jenkins.prototype.startMonitor = function () {
  if(this.debug) {
    console.log("Jenkins.startMonitor -> " + this.name);
  }
  
  if (this.host === '' || this.name === '') {
    return;
  }
  
  this.jenkins = jenkinsapi.init(this.host);
  
  this._monitor();
};

Jenkins.prototype._monitor = function () {
  // TODO: change to setTimeout?
  // in prod poll interval should be larger than time to fetch, however cannot garentee
  
  this.sprintMontiorInterval = setInterval(function() { 
    if(this.debug) {
      console.log(new Date() + " Jenkins._monitor -> " + this.name + ", call _monitorExecute()");
    }
    this._monitorExecute();
  }.bind(this), this.pollFrequencyMilliseconds);
};

Jenkins.prototype._monitorExecute = function () {

  this.jenkins.job_info('/' + this.name, function(err, data) {
    if(err) {
      console.log("ERROR (job info kitchen_ellipse): " + err);
      return;
    }

    this.jenkinsState.displayName = data.displayName;
    this.jenkinsState.description = data.description;
    this.jenkinsState.name = data.name;
    this.jenkinsState.buildable = data.buildable;
    this.jenkinsState.healthScore = data.healthReport[0].score;
    this.jenkinsState.healthDescription = data.healthReport[0].description;

    // increase by 1 as if build is in progress then it's in the job results
    var maxBuilds = this.maxHistory + 1;
    var isLastBuild = false;
    data.builds.sort(compareJenkinsNumber);
    var processBuilds = [];
    
    for(var i = 0; i < data.builds.length && i < maxBuilds; i++) {
      processBuilds.push(data.builds[i].number);
    }

    async.map(processBuilds, this._getJobResult.bind(this), this._buildDetailsReceived.bind(this));
  }.bind(this));
};

Jenkins.prototype._getJobResult = function (jobNbr, done) {
  this.jenkins.build_info('/' + this.name, jobNbr, function(err, data) {
    if(!err) {
      if(data.building) {
        return done(null, {buildNbr: jobNbr, result: data.result, actions: data.actions, building: data.building, progress: Math.round((new Date().getTime() - data.timestamp) / data.estimatedDuration * 100)});
      } else {
        return done(null, {buildNbr: jobNbr, result: data.result, actions: data.actions, building: data.building, progress: 0});
      }
    } else {
      return done(err);
    }
  }.bind(this));
};



Jenkins.prototype._getBuildDetails = function(buildNbr, isLastBuild) {
};

Jenkins.prototype._buildDetailsReceived = function(err, result) {
  var failed, skipped, total, isTestable;
  
  this.jenkinsState.building = false;
  this.jenkinsState.buildingNumber = '';
  this.jenkinsState.progress = 100;
  
  result.forEach(function(item, index) {
    if(item !== undefined) {
      if(item.building !== undefined && item.building) {
        this.jenkinsState.building = true;
        this.jenkinsState.buildingNumber = item.buildNbr;
        this.jenkinsState.progress = item.progress;
      } else {
        failed = 0;
        skipped = 0;
        total = 0;
        isTestable = false;
        if(item.actions !== undefined && item.actions.length > 5 && item.actions[6] !== undefined) {
          if(item.actions[6].failCount !== undefined) {
            failed = parseInt(item.actions[6].failCount);
            isTestable = true;
          }
          if(item.actions[6].skipCount !== undefined) {
            skipped = parseInt(item.actions[6].skipCount);
            isTestable = true;
          }
          if(item.actions[6].totalCount !== undefined) {
            isTestable = true;
            total = parseInt(item.actions[6].totalCount);
          }
        }
        this.jenkinsState.builds.push({
          buildNumber: item.buildNbr, 
          result: item.result,
          failed: failed,
          passed: total - skipped - failed,
          skipped: skipped,
          isTestable: isTestable,
          total: total,
        });
      }
    }
  }.bind(this));
    
  this._processResults();
};

Jenkins.prototype._processResults = function () {
  var i = 0;
  var j = 0;
  var exists = false;
  var newBuilds = [];

  this.jenkinsState.builds.sort(compareBuilds);
  
  for (i = 0; i < this.jenkinsState.builds.length; i++) {
    exists = false;
    for (j = 0; j < this.history.length && !exists; j++) {
      if(this.history[j].buildNumber === this.jenkinsState.builds[i].buildNumber) {
        exists = true;
      }
    }
    
    if(!exists) {
      if(this.history.length > this.maxHistory) {
        this.history.shift();
      }
  
      this.history.push(this.jenkinsState.builds[i]);
      newBuilds.push(this.jenkinsState.builds[i]);
    }
  }
  
  this.jenkinsState.builds = newBuilds;
    
  if(this.jenkinsState.building) {
    this.jenkinsState.mostRecentBuildNumber = this.jenkinsState.buildingNumber;
    this.jenkinsState.mostRecentBuildState = '';
    this.jenkinsState.mostRecentFailed      = 0;
    this.jenkinsState.mostRecentSkipped     = 0;
    this.jenkinsState.mostRecentPassed      = 0;
    this.jenkinsState.mostRecentTotal       = 0;
    this.jenkinsState.mostRecentIsTestable  = false;
  } else {
    this.jenkinsState.mostRecentBuildNumber = this.history[this.history.length - 1].buildNumber;
    this.jenkinsState.mostRecentBuildState  = this.history[this.history.length - 1].result;
    this.jenkinsState.mostRecentFailed      = this.history[this.history.length - 1].failed;
    this.jenkinsState.mostRecentSkipped     = this.history[this.history.length - 1].skipped;
    this.jenkinsState.mostRecentPassed      = this.history[this.history.length - 1].passed;
    this.jenkinsState.mostRecentTotal       = this.history[this.history.length - 1].total;
    this.jenkinsState.mostRecentIsTestable  = this.history[this.history.length - 1].isTestable;
  }
  
  if(this.debug) {
    console.log("emitting " + this.jenkinsState.name + 
                " Building: " + this.jenkinsState.building + 
                " Progress: " + this.jenkinsState.progress + "%" +
                " Build: " + this.jenkinsState.mostRecentBuildNumber + 
                " State: " + this.jenkinsState.mostRecentBuildState +
                " Failed: " + this.jenkinsState.mostRecentFailed + 
                " Skipped: " + this.jenkinsState.mostRecentSkipped +
                " Passed: " + this.jenkinsState.mostRecentPassed +
                " Total: " + this.jenkinsState.mostRecentTotal +
                " Testable: " + this.jenkinsState.mostRecentIsTestable +
                " Builds: " + this.jenkinsState.builds.length);
  }

  this.emit(Jenkins.EVENT_DATA_RECEIVED, this.name, this.jenkinsState);
};

Jenkins.prototype.getJenkinsState = function() {
  // return the jenkinsState, but include the full history, not the diff
  var fullState = new JenkinsState(this.jenkinsState);
  fullState.builds = this.history;
  return fullState;
};

Jenkins.prototype.stopMonitor = function(type) {
  this._stopMonitor(this.sprintMontiorInterval);
};

Jenkins.prototype._stopMonitor = function(interval) {
  if(interval !== undefined && interval !== null) {
    clearInterval(interval);
  }
};

function Job(value, color) {
  this.color = color;
  this.value = value;
}

function compareJenkinsNumber (a, b) {
  if (a.number < b.number) {
     return 1;
  }
  
  if (a.number > b.number) {
    return -1;
  }
  
  return 0;
}


function compareBuilds (a, b) {
  if (a.buildNumber < b.buildNumber) {
     return -1;
  }
  
  if (a.buildNumber > b.buildNumber) {
    return 1;
  }
  
  return 0;
}