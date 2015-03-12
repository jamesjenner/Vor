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

var jenkinsapi = require('./jenkins/jenkins');

var JenkinsState = require('../shared/jenkinsState.js');

module.exports = Jenkins;

util.inherits(Jenkins, EventEmitter);

Jenkins.DEFAULT_POLL_MINS = 1;
Jenkins.DEFAULT_TEAM_NAME = 'kitchen_ellipse';

Jenkins.EVENT_DATA_RECEIVED = "dataReceived";


function Jenkins(options) {
  EventEmitter.call(this);
  
  this.host = ((options.host !== null && options.host !== undefined) ? options.host : 'http://awsjenkins.ventyx.abb.com:8080');
  this.name = ((options.name !== null && options.name !== undefined) ? options.name : Jenkins.DEFAULT_NAME);
  
  this.pollFrequencyMinutes = ((options.pollFrequencyMinutes !== null && options.pollFrequencyMinutes !== undefined) ? options.pollFrequencyMinutes : Jenkins.DEFAULT_POLL_MINS);
  this.pollFrequencyMinutes = 0.5;
  this.pollFrequencyMilliseconds = this.pollFrequencyMinutes * 60 * 1000;
  // TODO: stop this from being hard coded
  this.maxHistory = 5;
  this.history = [];
  
}

Jenkins.prototype.startMonitor = function () {
  console.log("Jenkins.startMonitor -> " + this.name);
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
    this._monitorExecute();
  }.bind(this), this.pollFrequencyMilliseconds);
};

Jenkins.prototype._monitorExecute = function () {

  this.jenkins.job_info('/' + this.name, function(err, data) {
    if(err) {
      console.log("ERROR (job info kitchen_ellipse): " + err);
      return;
    }

    var jenkinsState = new JenkinsState();
    jenkinsState.displayName = data.displayName;
    jenkinsState.description = data.description;
    jenkinsState.name = data.name;
    jenkinsState.buildable = data.buildable;
    jenkinsState.healthScore = data.healthReport[0].score;
    jenkinsState.healthDescription = data.healthReport[0].description;
    
    console.log("\t display name: " + data.displayName);
    console.log("\t  description: " + data.description);
    console.log("\t         name: " + data.name);
    console.log("\t          url: " + data.url);
    console.log("\t    buildable: " + data.buildable);
    console.log("\t        color: " + data.color);
    console.log("\tHealth Report: " + data.healthReport[0].description);
    console.log("\t     icon URL: " + data.healthReport[0].iconUrl);
    console.log("\t        score: " + data.healthReport[0].score);
    console.log("\t       builds: ");

    // increase by 1 as if build is in progress then it's in the job results
    var maxBuilds = this.maxHistory + 1;
    var isLastBuild = false;
    for(var i = 0; i < data.builds.length && i < maxBuilds; i++) {
      console.log("last build " + i + " >= " + data.builds.length+ " || " + (i + 1) + ">= " + maxBuilds);
      isLastBuild = i >= data.builds.length || i + 1 >= maxBuilds;
      
      (function(buildNbr, isLastBuild) {
        this._getJobResult(buildNbr, isLastBuild, function(result, building, progress, isLastBuild) {
          if(building) {
            console.log("\t               " + buildNbr + " -> " + progress + "%");
            jenkinsState.building = true;
            jenkinsState.buildingNumber = buildNbr;
            jenkinsState.progress = progress;
          } else {
            console.log("\t               " + buildNbr + " : " + result);
            jenkinsState.builds.push({buildNumber: buildNbr, result: result});
          }
          
          if(isLastBuild) {
            console.log("\t               emiting");
            this._processResults(jenkinsState);
          }
        }.bind(this));
      }).bind(this)(data.builds[i].number, isLastBuild);
    }
  }.bind(this));
};

function compareBuilds (a, b) {
  if (a.buildNumber < b.buildNumber) {
     return -1;
  }
  
  if (a.buildNumber > b.buildNumber) {
    return 1;
  }
  
  return 0;
}

Jenkins.prototype._processResults = function (jenkinsState) {
  var i = 0;
  var j = 0;
  var exists = false;
  var newBuilds = [];

  jenkinsState.builds.sort(compareBuilds);
  
  for (i = 0; i < jenkinsState.builds.length; i++) {
    exists = false;
    for (j = 0; j < this.history.length && !exists; j++) {
      console.log("compare: " + this.history[j].buildNumber + " === " + jenkinsState.builds[i].buildNumber);
      if(this.history[j].buildNumber === jenkinsState.builds[i].buildNumber) {
        exists = true;
      }
    }
    
    if(!exists) {
      console.log("history: " + this.history.length + " max: " + this.maxHistory);
      if(this.history.length > this.maxHistory) {
        this.history.shift();
      }
  
      this.history.push(jenkinsState.builds[i]);
      newBuilds.push(jenkinsState.builds[i]);
    }
  }
  
  jenkinsState.builds = newBuilds;
  
  // sort the 
  this.emit(Jenkins.EVENT_DATA_RECEIVED, this.name, jenkinsState);
};

Jenkins.prototype._getJobResult = function (jobNbr, isLastBuild, callback) {
  this.jenkins.build_info('/' + this.name, jobNbr, function(err, data) {
    if(!err && callback !== undefined) {
      callback(data.result, data.building, Math.round((new Date().getTime() - data.timestamp) / data.estimatedDuration * 100), isLastBuild);
    }
  });
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