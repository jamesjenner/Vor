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

var async = require('async');
var moment = require('moment-timezone');
var V1Meta = require('./v1/v1meta').V1Meta;
var V1Server = require('./v1/client').V1Server;

var AgileSprint = require('../shared/agileSprint.js');

module.exports = VersionOne;

VersionOne.SPRINT_MONITOR = 'sprintMonitor';
VersionOne.RELEASE_MONITOR = 'releaseMonitor';
VersionOne.EXECUTIVE_MONITOR = 'executiveMonitor';
VersionOne.ALL_MONITORS = 'allMonitors';

VersionOne.DEFAULT_POLL_MINS = 1;
VersionOne.DEFAULT_TEAM_NAME = 'Ellipse - Materials 1';

function VersionOne(options) {
  console.log("VersionOne: instantiating: " + JSON.stringify(options));
  
  this.name = ((options.name !== null && options.name !== undefined) ? options.name : '');
  this.timeZone = ((options.timeZone !== null && options.timeZone !== undefined) ? options.timeZone : '');
  this.hostname = ((options.hostname !== null && options.hostname !== undefined) ? options.hostname : '');
  this.instance = ((options.instance !== null && options.instance !== undefined) ? options.instance : '');
  this.username = ((options.username !== null && options.username !== undefined) ? options.username : '');
  this.password = ((options.password !== null && options.password !== undefined) ? options.password : '');
  this.port = ((options.port !== null && options.port !== undefined) ? options.port : '433');
  this.protocol = ((options.protocol !== null && options.protocol !== undefined) ? options.protocol : 'https');
  
  this.pollFrequencyMinutes = ((options.pollFrequencyMinutes !== null && options.pollFrequencyMinutes !== undefined) ? options.pollFrequencyMinutes : VersionOne.DEFAULT_POLL_MINS);
  this.pollFrequencyMinutes = 0.5;
  this.pollFrequencyMilliseconds = this.pollFrequencyMinutes * 60 * 1000;
  
  this.teamName = ((options.teamName !== null && options.teamName !== undefined) ? options.teamName : VersionOne.DEFAULT_TEAM_NAME);
}

VersionOne.prototype.startMonitor = function(type) {
  console.log("VersionOne: startMonitor: " + type);
  if(this.hostname === '' || this.username === '') {
    return;
  }
  
  console.log("name:     " + this.name);
  console.log("timeZone: " + this.timeZone);
  console.log("hostname: " + this.hostname);
  console.log("instance: " + this.instance);
  console.log("username: " + this.username);
  console.log("password: " + this.password);
  console.log("port:     " + this.port);
  console.log("protocol: " + this.protocol);
  
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
  
  this.sprintMontiorInterval = setInterval(function() { 
    this._monitorSprintExecute();
  }.bind(this), this.pollFrequencyMilliseconds);
};

VersionOne.prototype._monitorSprintExecute = function() {
  console.log("monitor sprint execute: " + this.name + " : " + this.timeZone);

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

  this.getSprintStats(this.teamName, effectiveDate, function(err, agileSprint) {
    if(err) {
      // TODO: sort out error reporting (log file?)
      console.log(err);
    } else {
      // result
      console.log(
        this.teamName + "\n\t" + 
        " Backlog: " + agileSprint.backlogStoryPoints + 
        " Wip: " + agileSprint.wipStoryPoints + 
        " Done: " + agileSprint.doneStoryPoints + " -> " + agileSprint.percentageDone + "% " + 
        " Start: " + agileSprint.sprintStartDate + 
        " End: " + agileSprint.sprintEndDate + 
        " Dur: " + agileSprint.sprintDuration);
    }
  });
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
    var agileSprint = new AgileSprint();
    
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
            agileSprint.doneStoryPoints += storyPoints;
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
        agileSprint.blockedItems = results[_grpIdx][_wrkItmIdx].BlockingIssues;
        
        agileSprint.sprintStartDate = new Date(results[_grpIdx][_wrkItmIdx].SprintStartDate);
        agileSprint.sprintEndDate = new Date(results[_grpIdx][_wrkItmIdx].SprintEndDate);
        agileSprint.sprintDuration = results[_grpIdx][_wrkItmIdx].SprintDuration;
      }
    }
    
    // calculate the % complete
    agileSprint.percentageDone = Math.round(agileSprint.doneStoryPoints / totalStoryPoints * 100);
    
    if(isNaN(agileSprint.percentageDone)) {
       agileSprint.percentageDone = 0;
    }
    
    // TODO: calculate the percentage that should be done by now, based on start end and current date
    // agileSprint.percentageTarget = ...
    
    
    callback(null, agileSprint);
  }.bind(this);
  
  
  console.log("performing async query");
  async.parallel([
    async.apply(this.__getDefectsForTeamAndCurrentSprint.bind(this), teamName, effectiveDate),
    async.apply(this.__getStoriesForTeamAndCurrentSprint.bind(this), teamName, effectiveDate),
//    this.__getDefectsForTeamAndCurrentSprint.bind(this, teamName, effectiveDate),
//    this.__getStoriesForTeamAndCurrentSprint.bind(this, teamName, effectiveDate),
    ], 
    dataCallback);
};

VersionOne.prototype.__getStoriesForTeamAndCurrentSprint = function(teamName, effectiveDate, callback) {
  console.log("__getStoriesForTeamAndCurrentSprint this: " + this.hostname + " teameName: " + teamName + " effectiveDate " + effectiveDate);
  this.__getForTeamAndCurrentSprint(callback, "Story", teamName, effectiveDate);
};

VersionOne.prototype.__getDefectsForTeamAndCurrentSprint = function(teamName, effectiveDate, callback) {
  console.log("__getDefectsForTeamAndCurrentSprint this: " + this.hostname + " teameName: " + teamName + " effectiveDate " + effectiveDate);
  this.__getForTeamAndCurrentSprint(callback, "Defect", teamName, effectiveDate);
};
    
VersionOne.prototype.__getForTeamAndCurrentSprint = function(callback, source, teamName, effectiveDate) {
  this.v1.trans_query({
    from: source,

    select: [
      'Team.Name',
      'ID',
      'Name',
      'IsClosed',
      'IsCompleted',
      'IsDead',
      'IsDeleted',
      'IsInactive',

      'Status.Name',
      'Estimate',
      'BlockingIssues.@Sum',

      'Timebox.Name',
      'Timebox.State.Code',
      'Timebox.BeginDate',
      'Timebox.EndDate',
      'Timebox.Duration',
      'Timebox.Owner.Username',
    ],

    where: {
      // "Timebox.State.Code": 'ACTV', 
      // "Timebox.State.Code": 'FUTR', 
      "Team.Name": teamName
    },
    wherestr: "Timebox.EndDate>='" + effectiveDate + "'&Timebox.BeginDate<='" + effectiveDate + "'",

    success: function(result) {
      var data = [];
      for(var i = 0; i < result.query_results.length; i++) {
        data.push({
          ID: result.query_results[i]._v1_current_data["ID.Number"],
          Est: result.query_results[i].Estimate,
          Team: result.query_results[i]._v1_current_data["Team.Name"],
          Sprint: result.query_results[i]._v1_current_data["Timebox.Name"],
          Status: result.query_results[i]._v1_current_data["Status.Name"],
          BlockingIssues: result.query_results[i]._v1_current_data["BlockingIssues.@Sum"],
          SprintStartDate: result.query_results[i]._v1_current_data["Timebox.BeginDate"],
          SprintEndDate: result.query_results[i]._v1_current_data["Timebox.EndDate"],
          SprintDuration: result.query_results[i]._v1_current_data["Timebox.Duration"],
        });
      }
      callback(null, data);
    },

    error: function(err) { 
      callback({errorMsg: "ERROR: " + err});
    }
  });
};

//v1.query({
//  from: "Scope",
//
//  select: [
//    'Parent.Name', 
//    'Name',
//    'Description',
//    'BeginDate',
//    'EndDate',
//    'Duration',
//    'Days',
//    'Status.Name',
//    'Status.Description',
//    'Owner.Username',
//    'Owner.Nickname',
//    'Owner.Description',
//    'Reference'
//  ],
//
//  where: {
//    "Name": 'Ellipse 8.5'
//  },
//
//  success: function(result) {
//    console.log(result.Name + " : " + result.BeginDate + " : " + result.Days + " : "  + result);
//  },
//
//  error: function(err) { 
//    console.log("ERROR: " + err);
//  }
//});

//v1.query({
//  from: "Story",
//
//  select: [
//    'Name',
//    'Owners.Name',
//    'Estimate'
//  ],
//  where: {
//    'Owners.Name': 'James Jenner',
//  },
//  success: processData,
//    
//  error: function(err) {
//    console.log("ERROR: " + err);
//  },
//});

var util = require('util');


//v1.query({
//  from: "Timebox",
//
//  select: [
//    'Name',
//    'State.Code',
//    'BeginDate',
//    'EndDate',
//    'Duration',
//    'Owner.Username',
//
//    'IsClosed',
//    'IsDead',
//    'IsInactive',
//    'Now',
//    "Workitems[Team.Name='Ellipse - Finance Development'].ToDo[AssetState!='Dead'].@Sum"
//  ],
//
//  where: {
////    "State.Code": 'ACTV', 
////    "BeginDate": 
//  },
//  wherestr: "EndDate>='2014-08-28'&BeginDate<='2014-08-28'",
//
//  success: function(result) {
//    // console.log(JSON.stringify(result, null, " "));
//    console.log(result.Name + "\t " + 
//      result.BeginDate + " -> " + 
//      result.EndDate + " " + 
//      result.Duration + " " + 
//      result._v1_current_data['Owner.Username'] + "\t" +
//      "ToDo: " + result._v1_current_data["Workitems[Team.Name='Ellipse - Finance Development'].ToDo[AssetState!='Dead'].@Sum"]);
//  },
//
//  error: function(err) { 
//    console.log("ERROR: " + err);
//  }
//});

//v1.trans_query({
//  from: "Story",
//
//  select: [
//    
//    'Team.Name',
//    'ID',
//    'Name',
//    'IsClosed',
//    'IsCompleted',
//    'IsDead',
//    'IsDeleted',
//    'IsInactive',
//    
//    'Status.Name',
//    'Estimate',
//    'BlockingIssues.@Sum',
//    
//    'Timebox.Name',
//    'Timebox.State.Code',
//    'Timebox.BeginDate',
//    'Timebox.EndDate',
//    'Timebox.Duration',
//    'Timebox.Owner.Username',
//  ],
//
//  where: {
//    // "ID": "Story:1709886",
//    // "Timebox.State.Code": 'ACTV', 
//    // "Timebox.State.Code": 'FUTR', 
//    "Team.Name": 'Ellipse - Finance Development'
//  },
//  wherestr: "Timebox.EndDate>='2014-08-28'&Timebox.BeginDate<='2014-08-28'",
//
//  success: function(result) {
//    // console.log(result);
//    // console.log(JSON.stringify(result, null, " "));
//    // console.log("ID: " + result._v1_current_data["ID.Number"] + " Team: " + result._v1_current_data["Team.Name"] + "\tClosed: " + result.IsClosed + "\tCompleted: " + result.IsCompleted + "\tStatus: " + result._v1_current_data["Status.Name"] + "\tBlocking Issues: " + result._v1_current_data["BlockingIssues.@Sum"] + " Name: " + result.Name);
//    for(var i = 0; i < result.query_results.length; i++) {
//      console.log(
//        "ID: " + result.query_results[i]._v1_current_data["ID.Number"] + 
//        "\tEst: " + result.query_results[i].Estimate + 
//        "\tTeam: " + result.query_results[i]._v1_current_data["Team.Name"] + 
//        "\tSprint: " + result.query_results[i]._v1_current_data["Timebox.Name"] +
//        "\tStatus: " + result.query_results[i]._v1_current_data["Status.Name"] + 
//        "\tBlocking Issues: " + result.query_results[i]._v1_current_data["BlockingIssues.@Sum"]);
//    }
//  },
//
//  error: function(err) { 
//    console.log("ERROR: " + err);
//  }
//});
//
//v1.trans_query({
//  from: "Defect",
//
//  select: [
//    
//    'Team.Name',
//    'ID',
//    'Name',
//    'IsClosed',
//    'IsCompleted',
//    'IsDead',
//    'IsDeleted',
//    'IsInactive',
//    
//    'Status.Name',
//    'Estimate',
//    'BlockingIssues.@Sum',
//    
//    'Timebox.Name',
//    'Timebox.State.Code',
//    'Timebox.BeginDate',
//    'Timebox.EndDate',
//    'Timebox.Duration',
//    'Timebox.Owner.Username',
//  ],
//
//  where: {
//    // "ID": "Story:1709886",
//    // "Timebox.State.Code": 'ACTV', 
//    // "Timebox.State.Code": 'FUTR', 
//    "Team.Name": 'Ellipse - Finance Development'
//  },
//  wherestr: "Timebox.EndDate>='2014-08-28'&Timebox.BeginDate<='2014-08-28'",
//
//  success: function(result) {
//    // console.log(JSON.stringify(result, null, " "));
//    // console.log("ID: " + result._v1_current_data["ID.Number"] + " Team: " + result._v1_current_data["Team.Name"] + "\tClosed: " + result.IsClosed + "\tCompleted: " + result.IsCompleted + "\tStatus: " + result._v1_current_data["Status.Name"] + "\tBlocking Issues: " + result._v1_current_data["BlockingIssues.@Sum"] + " Name: " + result.Name);
//    // console.log("ID: " + result._v1_current_data["ID.Number"] + "\tEst: " + result.Estimate + "\tTeam: " + result._v1_current_data["Team.Name"] + "\tStatus: " + result._v1_current_data["Status.Name"] + "\tBlocking Issues: " + result._v1_current_data["BlockingIssues.@Sum"]);
//    for(var i = 0; i < result.query_results.length; i++) {
//      console.log(
//        "ID: " + result.query_results[i]._v1_current_data["ID.Number"] + 
//        "\tEst: " + result.query_results[i].Estimate + 
//        "\tTeam: " + result.query_results[i]._v1_current_data["Team.Name"] + 
//        "\tSprint: " + result.query_results[i]._v1_current_data["Timebox.Name"] +
//        "\tStatus: " + result.query_results[i]._v1_current_data["Status.Name"] + 
//        "\tBlocking Issues: " + result.query_results[i]._v1_current_data["BlockingIssues.@Sum"]);
//    }
//  },
//
//  error: function(err) { 
//    console.log("ERROR: " + err);
//  }
//});

