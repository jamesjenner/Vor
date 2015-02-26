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

var jenkinsapi = require('./jenkins/jenkins');


var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var async        = require('async');

var V1Meta       = require('./v1/v1meta').V1Meta;
var V1Server     = require('./v1/client').V1Server;

var AgileSprint  = require('../shared/agileSprint.js');

module.exports = Jenkins;

util.inherits(Jenkins, EventEmitter);

Jenkins.SPRINT_MONITOR = 'sprintMonitor';
Jenkins.RELEASE_MONITOR = 'releaseMonitor';
Jenkins.EXECUTIVE_MONITOR = 'executiveMonitor';
Jenkins.ALL_MONITORS = 'allMonitors';

Jenkins.DEFAULT_POLL_MINS = 1;
Jenkins.DEFAULT_TEAM_NAME = 'Ellipse - Materials 1';

Jenkins.EVENT_SPRINT_DATA_RECEIVED = "sprintDataReceived";


function Jenkins(options) {
  EventEmitter.call(this);
  
  this.name = ((options.name !== null && options.name !== undefined) ? options.name : '');
  this.host = ((options.host !== null && options.host !== undefined) ? options.host : 'http://awsjenkins.ventyx.abb.com:8080');
  this.instance = ((options.instance !== null && options.instance !== undefined) ? options.instance : '');
  this.username = ((options.username !== null && options.username !== undefined) ? options.username : '');
  this.password = ((options.password !== null && options.password !== undefined) ? options.password : '');
  this.port = ((options.port !== null && options.port !== undefined) ? options.port : '433');
  this.protocol = ((options.protocol !== null && options.protocol !== undefined) ? options.protocol : 'https');
  
  this.pollFrequencyMinutes = ((options.pollFrequencyMinutes !== null && options.pollFrequencyMinutes !== undefined) ? options.pollFrequencyMinutes : Jenkins.DEFAULT_POLL_MINS);
  this.pollFrequencyMinutes = 0.5;
  this.pollFrequencyMilliseconds = this.pollFrequencyMinutes * 60 * 1000;
  
  this.teamName = ((options.teamName !== null && options.teamName !== undefined) ? options.teamName : Jenkins.DEFAULT_TEAM_NAME);
}

Jenkins.prototype.startMonitor = function(type) {
  console.log("Jenkins.startMonitor: " + type + ", team: " + this.teamName);
  if(this.host === '' || this.username === '') {
    return;
  }
  
  this.jenkins = jenkinsapi.init(this.host);
  
  this._monitor();
};

Jenkins.prototype._monitor = function() {
  // TODO: change to setTimeout?
  // in prod poll interval should be larger than time to fetch, however cannot garentee
  
  this.sprintMontiorInterval = setInterval(function() { 
    this._monitorExecute();
  }.bind(this), this.pollFrequencyMilliseconds);
};

Jenkins.prototype._monitorExecute = function() {

  jenkins.job_info('/kitchen_ellipse', function(err, data) {
    if(err) {
      console.log("ERROR (job info kitchen_ellipse): " + err);
      return;
    }

    console.log("\t display name: " + data.displayName);
    console.log("\t  description: " + data.description);
    // console.log("\t         name: " + data.name);
    // console.log("\t          url: " + data.url);
    // console.log("\t    buildable: " + data.buildable);
    // console.log("\t        color: " + data.color);
    // console.log("\tHealth Report: " + data.healthReport[0].description);
    // console.log("\t     icon URL: " + data.healthReport[0].iconUrl);
    console.log("\t        score: " + data.healthReport[0].score);
    console.log("\t       builds: ");
    
    for(var i = 0; i < data.builds.length && i < 6; i++) {
      (function(buildNbr) {
        getJobResult(buildNbr, function(result, building, progress) {
          if(building) {
            console.log("\t               " + buildNbr + " -> " + progress + "%");
          } else {
            console.log("\t               " + buildNbr + " : " + result);
          }
        });
      })(data.builds[i].number);
    }

  });
  
  this.getSprintStats(this.teamName, effectiveDate, function(err, agileSprint) {
    if(err) {
      // TODO: sort out error reporting (log file?)
      console.log(err);
    } else {
      this.emit(Jenkins.EVENT_SPRINT_DATA_RECEIVED, this.teamName, agileSprint);
      // result
      console.log(
        this.teamName + "\n\t" + 
        " Backlog: " + agileSprint.backlogStoryPoints + 
        " Wip: " + agileSprint.wipStoryPoints + 
        " Done: " + agileSprint.completedStoryPoints + " -> " + agileSprint.percentageDone + "% " + 
        " Start: " + agileSprint.sprintStartDate + 
        " End: " + agileSprint.sprintEndDate + 
        " Dur: " + agileSprint.sprintDuration);
    }
  }.bind(this));
};

function getJobResult(jobNbr, callback) {
  jenkins.build_info('/kitchen_ellipse', jobNbr, function(err, data) {
    if(!err && callback !== undefined) {
      callback(data.result, data.building, Math.round((new Date().getTime() - data.timestamp) / data.estimatedDuration * 100));
    }
  });
}

Jenkins.prototype.stopMonitor = function(type) {
  this._stopMonitor(this.sprintMontiorInterval);
};

Jenkins.prototype._stopMonitor = function(interval) {
  if(interval !== undefined && interval !== null) {
    clearInterval(interval);
  }
};