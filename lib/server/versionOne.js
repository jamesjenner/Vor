/*jlint node: true */
/*global require, console, __dirname, module, setInterval, clearInterval */

/*
 * versionOne.js
 *
 * Copyright (C) 2014 by James Jenner
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
 * Note that this uses the VersionOne SDK.JavaScript, refer to resources mentioned
 * below for further information about the VersionOne SDK for javascript. 
 */

/*
  meta.v1

  This endpoint provides metadata about the kinds of things stored in VersionOne. 
  This includes getting information about the asset types, attribute definitions, 
  relationships and operations. 

  The meta.v1 endpoint allows a client of the API to discover various pieces of 
  information such as which attribute definitions are required, what content is 
  valid for an attribute, and which attributes belong to which asset types.

  http://community.versionone.com/Developers/Developer-Library/Documentation/API/Endpoints/meta.v1

  example:

    Query all assets:
      https://www14.v1host.com/v1sdktesting/meta.v1?xsl=api.xsl
      https://www11.v1host.com/VentyxProd/meta.v1?xsl=api.xsl
      https://www11.v1host.com/VentyxProd/meta.v1

    Query the PrimaryWorkitem asset providing a human readable drillable view
      https://www11.v1host.com/VentyxProd/meta.v1/PrimaryWorkitem?xsl=api.xsl


    Queries:
      http://community.versionone.com/Developers/Developer-Library/Documentation/API/Queries

    meta.v1:
      http://community.versionone.com/Developers/Developer-Library/Documentation/API/Endpoints/meta.v1

    rest-1.v1/Data:
      http://community.versionone.com/Developers/Developer-Library/Documentation/API/Endpoints/rest-1.v1%2F%2FData


    An overview of system assets:
      http://community.versionone.com/Help-Center/Version101/Current/Introduction-to-VersionOne/System-Assets
      http://community.versionone.com/Developers/Developer-Library/Concepts/Asset_Type

    How to query a backlog:
      http://community.versionone.com/Developers/Developer-Library/Recipes/Query_for_a_Backlog

  Sprint is refered to as an Interation and the system name is Timebox
*/

var EventEmitter = require('events').EventEmitter;
var util         = require('util');
var async        = require('async');
var moment       = require('moment-timezone');

var V1Meta       = require('./v1/v1meta').V1Meta;
var V1Server     = require('./v1/client').V1Server;

var AgileSprint  = require('../shared/agileSprint.js');
var AgileSprintBreakdown = require('../shared/agileSprintBreakdown.js');

module.exports = VersionOne;

util.inherits(VersionOne, EventEmitter);

VersionOne.SPRINT_MONITOR = 'sprintMonitor';
VersionOne.RELEASE_MONITOR = 'releaseMonitor';
VersionOne.EXECUTIVE_MONITOR = 'executiveMonitor';
VersionOne.ALL_MONITORS = 'allMonitors';

VersionOne.DEFAULT_POLL_MINS = 2;
VersionOne.DEFAULT_TEAM_NAME = 'Ellipse - Materials 1';

VersionOne.EVENT_SPRINT_DATA_RECEIVED = "sprintDataReceived";

function VersionOne(options) {
  EventEmitter.call(this);
  
  this.name = ((options.name !== null && options.name !== undefined) ? options.name : '');
  this.dataSourceId = ((options.dataSourceId !== null && options.dataSourceId !== undefined) ? options.dataSourceId : '');
  this.timeZone = ((options.timeZone !== null && options.timeZone !== undefined) ? options.timeZone : '');
  this.hostname = ((options.hostname !== null && options.hostname !== undefined) ? options.hostname : '');
  this.instance = ((options.instance !== null && options.instance !== undefined) ? options.instance : '');
  this.username = ((options.username !== null && options.username !== undefined) ? options.username : '');
  this.password = ((options.password !== null && options.password !== undefined) ? options.password : '');
  this.port = ((options.port !== null && options.port !== undefined) ? options.port : '433');
  this.protocol = ((options.protocol !== null && options.protocol !== undefined) ? options.protocol : 'https');
  
  this.pollFrequencyMinutes = ((options.pollFrequencyMinutes !== null && options.pollFrequencyMinutes !== undefined) ? options.pollFrequencyMinutes : VersionOne.DEFAULT_POLL_MINS);
  this.pollFrequencyMinutes = 2;
  this.pollFrequencyMilliseconds = this.pollFrequencyMinutes * 60 * 1000;
  
  this.teamName = ((options.teamName !== null && options.teamName !== undefined) ? options.teamName : VersionOne.DEFAULT_TEAM_NAME);
  
  this.dataType = ((options.dataType !== null && options.dataType !== undefined) ? options.dataType : '');
  this.dataValue = ((options.dataValue !== null && options.dataValue !== undefined) ? options.dataValue : '');
  
  
  this.sprintData = new AgileSprint({messageType: AgileSprint.MESSAGE_TYPE_COMBINED});
}

VersionOne.prototype.startMonitor = function(type) {
  console.log("VersionOne.startMonitor: " + type + ", team: " + this.teamName);
  if(this.hostname === '' || this.username === '') {
    return;
  }
  
  this.v1server = new V1Server(this.hostname, this.instance, this.username, this.password, this.port, this.protocol);
  this.v1 = new V1Meta(this.v1server);

  switch(type) {
  case VersionOne.SPRINT_MONITOR:
    this._monitorSprint();
    break;

  case VersionOne.RELEASE_MONITOR:
    this._monitorRelease();
    break;

  case VersionOne.EXECUTIVE_MONITOR:
    this._monitorExecutive();
    break;

  case VersionOne.ALL_MONITORS:
    this._monitorSprint();
    break;
  }
};

VersionOne.prototype._monitorSprint = function() {
  // TODO: change to setTimeout?
  // in prod poll interval should be larger than time to fetch, however cannot garentee
  
  this._monitorSprintExecute();
  
  this.sprintMontiorInterval = setInterval(function() { 
    this._monitorSprintExecute();
  }.bind(this), this.pollFrequencyMilliseconds);
};

VersionOne.prototype._monitorSprintExecute = function() {
  // the current system date in YYYY-MM-DD format
  // TODO: determine the date relevent to server location
  // var timeZone = 'America/Denver';

  
  var effectiveDate;
  var timezoneDate;
  
  if(this.timeZone !== '') {
    timezoneDate = moment().tz(this.timeZone);
  }
  if(timezoneDate !== undefined) {
    effectiveDate = timezoneDate.format('YYYY-MM-DD');
  } else {
    effectiveDate = moment().format('YYYY-MM-DD');
  }

  async.parallel([
    this.getSprintStats(this.teamName, effectiveDate, function(err, agileSprint) {
      if(err) {
        // TODO: sort out error reporting (log file?)
        console.log(err);
      } else {
        this.emit(VersionOne.EVENT_SPRINT_DATA_RECEIVED, this.teamName, agileSprint);
        
        this.sprintData.backlogStoryPoints = agileSprint.backlogStoryPoints;
        this.sprintData.wipStoryPoints = agileSprint.wipStoryPoints;
        this.sprintData.completedStoryPoints = agileSprint.completedStoryPoints;
        this.sprintData.sprintStartDate = agileSprint.sprintStartDate;
        this.sprintData.sprintEndDate = agileSprint.sprintEndDate;
        this.sprintData.sprintDuration = agileSprint.sprintDuration;
        this.sprintData.percentageDoneStoryPoints = agileSprint.percentageDoneStoryPoints;
        this.sprintData.percentageTargetStoryPoints = agileSprint.percentageTargetStoryPoints;
        this.sprintData.blockedItems = agileSprint.blockedItems;
      }
    }.bind(this)),

    // TODO implment daily breakdown
    this.getSprintDailyBreakdown(this.teamName, effectiveDate, function(err, agileSprint) {
      if(err) {
        // TODO: sort out error reporting (log file?)
        console.log(err);
      } else {
        var i = 0;
        this.emit(VersionOne.EVENT_SPRINT_DATA_RECEIVED, this.teamName, agileSprint);
        // result
        
        this.sprintData.endDate = agileSprint.startDate;
        this.sprintData.startDate = agileSprint.startDate;
        this.sprintData.lengthInDays = agileSprint.lengthInDays;
        this.sprintData.duration = agileSprint.duration;
        
        i = agileSprint.data.length - 1;
        this.sprintData.totalEffortHours = agileSprint.data[i].workPerformed;
        this.sprintData.totalEstimateHours = agileSprint.data[i].estimatedWork;
        this.sprintData.percentageDoneHours = Math.round(this.sprintData.totalEffortHours / this.sprintData.totalEstimateHours * 100);
        
//        console.log(this.teamName + " " + 
//          this.sprintData.startDate + " " + 
//          this.sprintData.endDate + 
//          " length " + this.sprintData.lengthInDays + 
//          " dur "  + this.sprintData.duration + 
//          " tot hrs " + this.sprintData.totalEffortHours + 
//          " est hrs "  + this.sprintData.totalEstimateHours + 
//          " "  + this.sprintData.percentageDoneHours + "%"
//        );
        this.sprintData.data = [];
        
        for(i = 0; i < agileSprint.data.length; i++) {
          this.sprintData.data[i] = {};
          this.sprintData.data[i].date = agileSprint.data[i].date;
          this.sprintData.data[i].estimatedWork = agileSprint.data[i].estimatedWork;
          this.sprintData.data[i].workPerformed = agileSprint.data[i].workPerformed;
          this.sprintData.data[i].outstandingWork = agileSprint.data[i].outstandingWork;
//          console.log(
//            "\tdate: " + agileSprint.data[i].date + " " + + " " +
//            " estimate: " + agileSprint.data[i].estimatedWork + 
//            " workPerformed: " + agileSprint.data[i].workPerformed + 
//            " outstandingWork: " + agileSprint.data[i].outstandingWork);
        }

      }
    }.bind(this))
  ]);
};

VersionOne.prototype._monitorRelease = function() {
};

VersionOne.prototype._monitorExecutive = function() {
};

VersionOne.prototype.stopMonitor = function(type) {
  switch(type) {
  case VersionOne.SPRINT_MONITOR:
    this._stopMonitor(this.sprintMontiorInterval);
    this.sprintMontiorInterval = null;
    break;

  case VersionOne.RELEASE_MONITOR:
    this._stopMonitor(this.releaseMonitorInterval);
    this.releaseMonitorInterval = null;
    break;

  case VersionOne.EXECUTIVE_MONITOR:
    this._stopMonitor(this.executiveMonitorInterval);
    this.executiveMonitorInterval = null;
    break;

  case VersionOne.ALL_MONITORS:
    this._stopMonitor(this.sprintMontiorInterval);
    this.sprintMontiorInterval = null;

    this._stopMonitor(this.releaseMonitorInterval);
    this.releaseMonitorInterval = null;

    this._stopMonitor(this.executiveMonitorInterval);
    this.executiveMonitorInterval = null;
    break;
  }
};

VersionOne.prototype._stopMonitor = function(interval) {
  if(interval !== undefined && interval !== null) {
    clearInterval(interval);
  }
};

VersionOne.prototype.getSprintStats = function(teamName, effectiveDate, callback) {
  var dataCallback = function(err, results) {
    if(err) {
      callback(err);
      return;
    }
    
    var storyPoints = 0;
    var totalStoryPoints = 0;
    var agileSprint = new AgileSprint({messageType: AgileSprint.MESSAGE_TYPE_SUMMARY});
    
    if(results.length === 0) {
      return;
    }
    
    for(var _grpIdx = 0; _grpIdx < results.length; _grpIdx++) {
      for(var _wrkItmIdx = 0; _wrkItmIdx < results[_grpIdx].length; _wrkItmIdx++) {
        
        // determin the story points
        storyPoints = parseInt(results[_grpIdx][_wrkItmIdx].Est);
        if(isNaN(storyPoints)) {
          storyPoints = 0;
        }
        
        totalStoryPoints += storyPoints;
        
        // increment the appropriate story point bucket
        switch(results[_grpIdx][_wrkItmIdx].Status) {
          case "Accepted": 
            agileSprint.completedStoryPoints += storyPoints;
            break;
            
          case "In Progress": 
            agileSprint.wipStoryPoints += storyPoints;
            break;
          
          case "":
            agileSprint.backlogStoryPoints += storyPoints;
            break;
        }
        
        
        // set the sprint info
        // TODO: investigate blocked items === blocking issues?
        agileSprint.blockedItems += results[_grpIdx][_wrkItmIdx].BlockingIssues === "0" ? 0 : 1;
        agileSprint.sprintStartDate = new Date(results[_grpIdx][_wrkItmIdx].SprintStartDate);
        agileSprint.sprintEndDate = new Date(results[_grpIdx][_wrkItmIdx].SprintEndDate);
        agileSprint.sprintDuration = results[_grpIdx][_wrkItmIdx].SprintDuration;
        agileSprint.totalEffortHours = results[_grpIdx][_wrkItmIdx].Actuals;
        agileSprint.totalEstimateHours = results[_grpIdx][_wrkItmIdx].DetailEstimate;
      }
    }
    
    // calculate the % complete
    agileSprint.percentageDoneStoryPoints = Math.round(agileSprint.completedStoryPoints / totalStoryPoints * 100);
    
    // calculate the % done in hours
    agileSprint.percentageDoneHours = Math.round(agileSprint.totalEffortHours / agileSprint.totalEstimateHours * 100);
    
    if(isNaN(agileSprint.percentageDoneStoryPoints)) {
       agileSprint.percentageDoneStoryPoints = 0;
    }

    if(agileSprint.sprintStartDate === undefined || agileSprint.sprintStartDate === null || agileSprint.sprintStartDate === '') {
      return;
    }
    
    // calculate the % target
    var startString = agileSprint.sprintStartDate.getFullYear() + "-" + (agileSprint.sprintStartDate.getMonth() + 1) + "-" + agileSprint.sprintStartDate.getDate();
    var endString = agileSprint.sprintEndDate.getFullYear() + "-" + (agileSprint.sprintEndDate.getMonth() + 1) + "-" + agileSprint.sprintEndDate.getDate();
    var startSprintM = moment(startString, "YYYY-MM-DD");
    var endSprintM = moment(endString, "YYYY-MM-DD");
    var currentM = moment();
    var sprintDuration = moment.duration(endSprintM - startSprintM);
    var currentDuration = moment.duration(currentM - startSprintM);
    agileSprint.percentageTargetStoryPoints = Math.round(currentDuration.asDays() / sprintDuration.asDays() * 100);
    
    callback(null, agileSprint);
  }.bind(this);
  
  
  async.parallel([
    async.apply(this.__getDefectsForTeamAndCurrentSprint.bind(this), teamName, effectiveDate),
    async.apply(this.__getStoriesForTeamAndCurrentSprint.bind(this), teamName, effectiveDate),
//    this.__getDefectsForTeamAndCurrentSprint.bind(this, teamName, effectiveDate),
//    this.__getStoriesForTeamAndCurrentSprint.bind(this, teamName, effectiveDate),
    ], 
    dataCallback);
};

VersionOne.prototype.__getStoriesForTeamAndCurrentSprint = function(teamName, effectiveDate, callback) {
  this.__getForTeamAndCurrentSprint(callback, "Story", teamName, effectiveDate);
};

VersionOne.prototype.__getDefectsForTeamAndCurrentSprint = function(teamName, effectiveDate, callback) {
  this.__getForTeamAndCurrentSprint(callback, "Defect", teamName, effectiveDate);
};
    
VersionOne.prototype.__getForTeamAndCurrentSprint = function(callback, source, teamName, effectiveDate) {

  this.v1.trans_query({
    from: source,
    select: [
      'Status.Name',
      'Estimate',
      'BlockingIssues.@Count',
      'Timebox.Name',
      'Timebox.BeginDate',
      'Timebox.EndDate',
      'Timebox.Duration',
      'DetailEstimate',
      'Actuals.Value.@Sum',
      'ToDo',
    ],
    where: {
      // "Timebox.State.Code": 'ACTV', 
      // "Timebox.State.Code": 'FUTR', 
      "Team.Name": teamName,
    },
    wherestr: "Timebox.EndDate>='" + effectiveDate + "'&Timebox.BeginDate<='" + effectiveDate + "'&AssetState!='Dead'",
    success: function(result) {
      var data = [];
      for(var i = 0; i < result.query_results.length; i++) {
        data.push({
          Est: result.query_results[i].Estimate,
          Sprint: result.query_results[i]._v1_current_data["Timebox.Name"],
          Status: result.query_results[i]._v1_current_data["Status.Name"],
          BlockingIssues: result.query_results[i]._v1_current_data["BlockingIssues.@Count"],
          SprintStartDate: result.query_results[i]._v1_current_data["Timebox.BeginDate"],
          SprintEndDate: result.query_results[i]._v1_current_data["Timebox.EndDate"],
          SprintDuration: result.query_results[i]._v1_current_data["Timebox.Duration"],
          DetailEstimate: result.query_results[i]._v1_current_data["DetailEstimate"],
          Actuals: result.query_results[i]._v1_current_data["Actuals.Value.@Sum"],
          ToDo: result.query_results[i]._v1_current_data["ToDo"],
        });
      }
      callback(null, data);
    },

    error: function(err) { 
      callback({errorMsg: "ERROR: " + err});
    }
  });
};

VersionOne.prototype.getSprintDailyBreakdown = function(teamName, effectiveDate, callback) {
  var agileSprint = new AgileSprint({messageType: AgileSprint.MESSAGE_TYPE_BREAKDOWN});
  var now = moment();
  var date, estimatedWork, workPerformed, outstandingWork;
  var sprintDetailsCallback = function(err, result) {
    for(var i = 0; i < result.length; i++) {
      if(result[i].result !== null && result._v1_id !== '') {
        estimatedWork = result[i].result._v1_current_data["Workitems[Team.Name='" + result[i].team + "'&AssetState!='Dead'].DetailEstimate.@Sum"];
        workPerformed = result[i].result._v1_current_data["Workitems[Team.Name='" + result[i].team + "'&AssetState!='Dead'].Actuals.Value.@Sum"];
        outstandingWork = result[i].result._v1_current_data["Workitems[Team.Name='" + result[i].team + "'&AssetState!='Dead'].ToDo.@Sum"];
      }
      
      date = result[i].date;
      
      if(estimatedWork === undefined) { 
        estimatedWork = 0; 
      }
      if(workPerformed === undefined) { 
        workPerformed = 0; 
      }
      if(outstandingWork === undefined) { 
        outstandingWork = 0; 
      }
      
      agileSprint.data.push({
        date: date, 
        estimatedWork: estimatedWork,
        workPerformed: workPerformed,
        outstandingWork: outstandingWork 
      });
    }
    
    agileSprint.data.sort(_compareSprintDetailsByDay);
    callback(null, agileSprint);
  }.bind(this);
  
  var sprintSummaryCallback = function(results) {
    if(results.query_results.length === 0) {
      callback("ERROR: No sprint data for team " + teamName);
      return;
    }
    var start;
    var end;
    var duration;
    var stateCode; 
    var lastSprintStart = null;
    var tmpStart;
    var sprintId;
    
    for(var v = 0; v < results.query_results.length; v++) {
      tmpStart = moment(results.query_results[v].BeginDate);
      if(lastSprintStart === null || tmpStart.isAfter(lastSprintStart)) {
        start = tmpStart;
        lastSprintStart = start;
        sprintId = results.query_results[v].ID[0];
        end = moment(results.query_results[v].EndDate);
        duration = results.query_results[v].Duration;
        stateCode = results.query_results[v]._v1_current_data['State.Code']; 
      }
    }

    diff = Math.abs(start.diff(now, 'days'));

    if(diff > 14) {
      diff = 14;
    }

    agileSprint.startDate = start;
    agileSprint.endDate = end;
    agileSprint.duration = duration;
    agileSprint.lengthInDays = _getDaysFromSprintDuration(duration);
    // TODO: this should be generisised, will need definitions in AgileSprintBreakdown (refer shared/agileSprintBreakdown.js) 
    agileSprint.state = stateCode;
    
    var dayOfWeek;
    var current;

    var processData = [];
    for (current = start; current.isBefore(end)|| current.isSame(end); current.add(1, 'days')) {
      if(current.isAfter(now)) {
        break;
      }
      
      dayOfWeek = current.day();

      if(dayOfWeek !== 0 && dayOfWeek !== 6) {
        processData.push({team: teamName, sprintId: sprintId, date: current.format('YYYY-MM-DD')});
      }
    }
    
    processData[processData.length - 1].isNow = now.isBefore(end);
    
    async.map(processData, this._getSprintDetails.bind(this), sprintDetailsCallback.bind(this));
  }.bind(this);
  
  this._getSprintForTeam(teamName, effectiveDate, sprintSummaryCallback);
};

function _getDaysFromSprintDuration(duration) {
  if(duration === undefined || duration === null) {
    return 0;
  }
  
  var tokens = duration.split(' ');
  
  var baseValue = tokens[0];
  
  switch(tokens[1]) {
    case "days": 
      break;
      
    case "weeks":
      baseValue *= 7;
      break;
      
    case "hours": 
      baseValue /= 6;
      break;
  }
  
  return baseValue;
}


VersionOne.prototype._getSprintForTeam = function(teamName, effectiveDate, callback) {
  var test = this.v1.trans_query({
    from: "Timebox",
    select: [
      'ID',
      'State.Code',
      'BeginDate',
      'EndDate',
      'Duration',
    ],
    where: {
      "Workitems.Team.Name": teamName,
      "State.Code": 'ACTV', 
    },
    wherestr: "EndDate>='" + effectiveDate + "'&BeginDate<='" + effectiveDate + "'",
    success: callback,
    error: function(err) { 
      console.log({error: err, errorMsg: "ERROR: " + err});
    }
  });
};
  
VersionOne.prototype._getSprintDetails = function(params, done) {
  if(params.isNow) {
    this._getSprintBreakdownForTeam(params.team, params.sprintId, function(result) {
      return done(null, {team: params.team, date: params.date, result: result});
    });
  } else {
    this._getSprintBreakdownForTeam(params.team, params.sprintId, function(result) {
      return done(null, {team: params.team, date: params.date, result: result});
    }, params.date);
  }
};

/* 
 * Burn Down
 * 
 * The start point for the ideal line is the maximum detail estimate across all days (which may not be the first
 * The end point for the ideal line is 0
 * The x coord for the burn down is the todo for the given day (y axis)
 * 
 * Burn Up
 * 
 * total work - todo
 * completed work - effort performed (actuals val)
 * ideal line (optional, non standard) - projected completed work required to complete todo for the day
 * 
 * 
 */

function _compareSprintDetailsByDay(a, b) {
  var dateA = moment(a.date);
  var dateB = moment(b.date);
  
  if (dateA.isBefore(dateB)) {
     return -1;
  }
  
  if (dateA.isAfter(dateB)) {
    return 1;
  }
  
  return 0;
}

VersionOne.prototype._getSprintBreakdownForTeam = function(teamName, sprintId, callback, asofDate) {
  if(asofDate !== undefined) {
    this.v1.query({
      from: "Timebox",
      select: [
        "Workitems[Team.Name='" + teamName + "'&AssetState!='Dead'].ToDo.@Sum",
        "Workitems[Team.Name='" + teamName + "'&AssetState!='Dead'].DetailEstimate.@Sum",
        "Workitems[Team.Name='" + teamName + "'&AssetState!='Dead'].Actuals.Value.@Sum",
      ],
      asof: asofDate,
      where: {
        "Workitems.Team.Name": teamName,
        "State.Code": 'ACTV', 
        "ID": sprintId,
      },
      success: callback,
      error: function(err) { 
        console.log("ERROR: " + err);
      }
    });
  } else {
    this.v1.query({
      from: "Timebox",
      select: [
        "Workitems[Team.Name='" + teamName + "'&AssetState!='Dead'].DetailEstimate.@Sum",
        "Workitems[Team.Name='" + teamName + "'&AssetState!='Dead'].Actuals.Value.@Sum",
        "Workitems[Team.Name='" + teamName + "'&AssetState!='Dead'].ToDo.@Sum",
      ],
      where: {
        "Workitems.Team.Name": teamName,
        "State.Code": 'ACTV', 
        "ID": sprintId,
      },
      success: callback,
      error: function(err) { 
        console.log("ERROR: " + err);
      }
    });
  }
};  


