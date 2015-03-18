/*jlint node: true */
/*global require, console, __dirname */

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

Epic E-08002 - Ellipse MMS with integration capability to a 3rd party ERP

Epic Path:
  CORE > 
    ELlipse > 
      Maintenance Management Solution > 
        Ellipse MSS with inetgration capability to a 3rd party ERP

Project Path:
  Ventyx > 
    Producst > 
      Ellipse EAM > 
        Ellipse > 
          Ellipse 8.5 > 
            2014 Q1 PSI - Ellipse

Spring is refered to as an Interation and the system name is Timebox


*/

var  V1Meta = require('./v1/v1meta').V1Meta;
var  V1Server = require('./v1/client').V1Server;
var moment = require('moment-timezone');
  
  
var fs = require('fs');
var file = __dirname + '/settings.json';

var settings;

var data = "";

// load the JSON data for the settings
//
// an example configuration for the settings.json is as follows:
//
// {
//   "hostname": "www13.v1host.com",
//   "instance": "/testSystem/",
//   "username": "admin",
//   "password": "admin",
//   "port": "443",
//   "protocol": "https"
// }

try {
  data = fs.readFileSync(file, 'utf8');
} catch(e) {
  console.log('Error reading ' + file + ': ' + e);
  return;
}
  
settings = JSON.parse(data);

console.log("hostname: " + settings.hostname);
console.log("instance: " + settings.instance);
console.log("username: " + settings.username);
console.log("port: " + settings.port);
console.log("protocol: " + settings.protocol);

var server = new V1Server(settings.hostname, settings.instance, settings.username, settings.password, settings.port, settings.protocol);

var v1 = new V1Meta(server);



//v1.query({
//  from: "Story",
//
//  select: [
//    'Name',
//    'Owners.Name',
//    'Estimate',
//    '',
//    '',
//    '',
//  ],
//  where: {
//    'Owners.Name': 'James Jenner',
//  },
//  success: function(result) {
//    console.log(JSON.stringify(result, null, ' '));
//  },
//    
//  error: function(err) {
//    console.log("ERROR: " + err);
//  },
//});
//
//return;

// burn down - project/release

// burn down - sprint
v1.query({
  from: "Timebox",

  select: [
    'Name',
    'Description',
//    'Owner',
    'Schedule',
    'TargetEstimate',
    'State.Code',
    // 'Actuals.Team',
    // 'Workitems',
    
    // "Workitems[Team.Name]",
    // "Workitems[Team]",
    //"Workitems.ToDo",
//    "Actuals.Value.@Sum",
    "Workitems.ToDo[Team.Name='Ellipse Development 8.6 - Materials';AssetState!='Dead'].@Sum",
    "Workitems.ToDo[AssetState!='Dead'].@Sum",
    "Workitems.ToDo.@Sum"
//    "Workitems.DetailEstimate[AssetState!='Dead'].@Sum"
  ],

  where: {
    "State.Code": 'ACTV', 
    'Name': 'SprintFeb2515',
    'Schedule.Name': 'Ellipse - 2 weeks iteration',
//    "BeginDate": 
  },
  asof: '2015-02-26',
  // wherestr: "EndDate>='2014-08-28'&BeginDate<='2014-08-28'",

  success: function(result) {
    console.log(JSON.stringify(result, null, ' '));
//    console.log(result.Name + "\t " + 
//      result.BeginDate + " -> " + 
//      result.EndDate + " " + 
//      result.Duration + " " + 
//      result._v1_current_data['Owner.Username'] + "\t" +
//      "Team: " + result._v1_current_data["Team.Name"] + 
//      " Team: " + result._v1_current_data["Workitems[Team.Name]"] + 
//      "ToDo: " + result._v1_current_data["Workitems.ToDo[AssetState!='Dead'].@Sum"]);
  },

  error: function(err) { 
    console.log("ERROR: " + err);
  }
});

//return;

//v1.query({
//  from: "Team",
//
//  select: [
//    'ID',
//    'Name',
//    'Description',
//    'Now',
//  ],
//
//  where: {
//    // "Name": 'Ellipse 8.5'
//    // "Name": 'Ellipse'
//  },
//
//  success: function(result) {
//    // console.log(result.Name + " : " + result.Description + " : " + " : "  + result);
//    // console.log(result.Name + " : " + result.Description);
//    console.log(result.ID + " : " + result.Name);
//  },
//
//  error: function(err) { 
//    console.log("ERROR: " + err);
//  }
//});


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
//    // "Name": 'Ellipse 8.5'
//    "Name": 'Ellipse'
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

var async = require('async');

var VersionOne = function(options) {
};

VersionOne.prototype.getSprintStats = function(teamName, effectiveDate, callback) {
  var dataCallback = function(err, results) {
//    console.log("got results " + results[0].length);
    if(err) {
      callback(err);
      return;
    }
    
    var storyPoints = 0;
    var totalStoryPoints = 0;
    var data = {
      blockedItems: 0,
      backlogStoryPoints: 0,
      wipStoryPoints: 0,
      doneStoryPoints: 0,
      percentageDone: 0,
      percentageTarget: 0,
      sprintStartDate: '',
      sprintEndDate: '',
      sprintDuration: 0,
    };
    
    for(var _grpIdx = 0; _grpIdx < results.length; _grpIdx++) {
//      console.log("> " + _grpIdx);
      for(var _wrkItmIdx = 0; _wrkItmIdx < results[_grpIdx].length; _wrkItmIdx++) {
//        console.log("\t> " + _wrkItmIdx);
        
        // determin the story points
        storyPoints = parseInt(results[_grpIdx][_wrkItmIdx].Est);
        if(isNaN(storyPoints)) {
          storyPoints = 0;
        }
        
        totalStoryPoints += storyPoints;
        
//        console.log(
//          "\tStart: " + results[_grpIdx][_wrkItmIdx].SprintStartDate, 
//          "\tEnd: " +   results[_grpIdx][_wrkItmIdx].SprintEndDate, 
//          "\tDur: " +   results[_grpIdx][_wrkItmIdx].SprintDuration, 
//          "\tID: " + results[_grpIdx][_wrkItmIdx].ID, 
//          "\tEst: " + results[_grpIdx][_wrkItmIdx].Est, 
//          "\tTeam: " + results[_grpIdx][_wrkItmIdx].Team, 
//          "\tSprint: " + results[_grpIdx][_wrkItmIdx].Sprint, 
//          "\tStatus: " + results[_grpIdx][_wrkItmIdx].Status, 
//          "\tBlockingIssues: " + results[_grpIdx][_wrkItmIdx].BlockingIssues);
        
        // increment the appropriate story point bucket
        switch(results[_grpIdx][_wrkItmIdx].Status) {
          case "Accepted": 
            data.doneStoryPoints += storyPoints;
            break;
            
          case "In Progress": 
            data.wipStoryPoints += storyPoints;
            break;
          
          case "":
            data.backlogStoryPoints += storyPoints;
            break;
        }
        
        // set the sprint info
        data.blockedItems += results[_grpIdx][_wrkItmIdx].BlockingIssues === "0" ? 0 : 1;
        data.sprintStartDate = new Date(results[_grpIdx][_wrkItmIdx].SprintStartDate);
        data.sprintEndDate = new Date(results[_grpIdx][_wrkItmIdx].SprintEndDate);
        data.sprintDuration = results[_grpIdx][_wrkItmIdx].SprintDuration;
      }
    }
    
    // calculate the % complete
    data.percentageDone = Math.round(data.doneStoryPoints / totalStoryPoints * 100);
    
    if(isNaN(data.percentageDone)) {
       data.percentageDone = 0;
    }
    
    // calculate the percentage that should be done by now
    
    
    callback(null, data);
  };
  
  async.parallel([
    async.apply(this.__getDefectsForTeamAndCurrentSprint, teamName, effectiveDate),
    async.apply(this.__getStoriesForTeamAndCurrentSprint, teamName, effectiveDate),
    ], 
    dataCallback);
};

VersionOne.prototype.__getStoriesForTeamAndCurrentSprint = function(teamName, effectiveDate, callback) {
  VersionOne.__getForTeamAndCurrentSprint(callback, "Story", teamName, effectiveDate);
};

VersionOne.prototype.__getDefectsForTeamAndCurrentSprint = function(teamName, effectiveDate, callback) {
  VersionOne.__getForTeamAndCurrentSprint(callback, "Defect", teamName, effectiveDate);
};

VersionOne.__getForTeamAndCurrentSprint = function(callback, source, teamName, effectiveDate) {
//  console.log("from " + source + " select data  where Team.Name = " + teamName);
  v1.trans_query({
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
      'BlockingIssues.@Count',

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
/*
{ _v1_id: 'Defect:1106611',
    _v1_transaction: { query_results: [Circular], v1meta: [Object], dirty_assets: [] },
    _v1_execute_operation: [Function],
    _v1_new_data: {},
    _v1_current_data: 
     { 'Team.Name': 'JI Core',
       Name: 'Selecting online help icon twice for same page gives 404',
       IsClosed: 'true',
       IsCompleted: 'false',
       IsDead: 'false',
       IsDeleted: 'false',
       IsInactive: 'true',
       'Status.Name': 'Accepted',
       Estimate: '3',
       'BlockingIssues.@Sum': '',
       'Timebox.Name': 'Sprint 39',
       'Timebox.State.Code': 'CLSD',
       'Timebox.BeginDate': '2014-03-05',
       'Timebox.EndDate': '2014-03-19',
       'Timebox.Duration': '14 Days',
       'Timebox.Owner.Username': 'matt.oconnor',
       'ID.Name': 'Selecting online help icon twice for same page gives 404',
       'ID.Number': 'D-23967',
       ID: [Object] } },

 */      
      
      var data = [];
      for(var i = 0; i < result.query_results.length; i++) {
//        console.log('ID:              ' + result.query_results[i]._v1_current_data["ID.Number"]);
//        console.log('\tEst:             ' + result.query_results[i].Estimate);
//        console.log('\tTeam:            ' + result.query_results[i]._v1_current_data["Team.Name"]);
//        console.log('\tName:            ' + result.query_results[i]._v1_current_data["Name"]);
//        console.log('\tIs Closed:       ' + result.query_results[i]._v1_current_data["IsClosed"]);
//        console.log('\tSprint:          ' + result.query_results[i]._v1_current_data["Timebox.Name"]);
//        console.log('\tStatus:          ' + result.query_results[i]._v1_current_data["Status.Name"]);
//        console.log('\tEstimate:        ' + result.query_results[i]._v1_current_data["Estimate"]);
//        console.log('\tBlockingIssues:  ' + result.query_results[i]._v1_current_data["BlockingIssues.@Sum"]);
//        console.log('\tSprint Name:     ' + result.query_results[i]._v1_current_data["Timebox.Name"]);
//        console.log('\tSprintStartDate: ' + result.query_results[i]._v1_current_data["Timebox.BeginDate"]);
//        console.log('\tSprintEndDate:   ' + result.query_results[i]._v1_current_data["Timebox.EndDate"]);
//        console.log('\tSprintDuration:  ' + result.query_results[i]._v1_current_data["Timebox.Duration"]);

        data.push({
          ID: result.query_results[i]._v1_current_data["ID.Number"],
          Est: result.query_results[i].Estimate,
          Team: result.query_results[i]._v1_current_data["Team.Name"],
          Sprint: result.query_results[i]._v1_current_data["Timebox.Name"],
          Status: result.query_results[i]._v1_current_data["Status.Name"],
          BlockingIssues: result.query_results[i]._v1_current_data["BlockingIssues.@Count"],
          SprintStartDate: result.query_results[i]._v1_current_data["Timebox.BeginDate"],
          SprintEndDate: result.query_results[i]._v1_current_data["Timebox.EndDate"],
          SprintDuration: result.query_results[i]._v1_current_data["Timebox.Duration"],
        });
      }
//      console.log("data for callback: " + data.length);
      callback(null, data);
    },

    error: function(err) { 
      console.error("ERROR: " + err);
      callback({errorMsg: "ERROR: " + err});
    }
  });
};



var myVersionOne = new VersionOne();
console.log("get stats");

var effectiveDate = '2015-3-18';

var teams = [
  {name: 'Ellipse - Automation',                        effectiveDate: effectiveDate, },
  {name: 'Ellipse - Finance Development',               effectiveDate: effectiveDate, },
  {name: 'Ellipse - Integration',                       effectiveDate: effectiveDate, },
  {name: 'Finance Product Owner',                    effectiveDate: effectiveDate, },
  {name: 'Ellipse - MITWIP',                            effectiveDate: effectiveDate, },
  {name: 'Ellipse - Code Maintenance and Support',      effectiveDate: effectiveDate, },
  {name: 'Ellipse Development 8.6 - Field Length and ERP integration',  effectiveDate: effectiveDate, },
  {name: 'Ellipse Development 8.6 - Maintenance',                       effectiveDate: effectiveDate, },
  {name: 'Ellipse Development 8.6 - Materials',                         effectiveDate: effectiveDate, },
  {name: 'Ellipse Tests Automation',                    effectiveDate: effectiveDate, },
  {name: 'JI Core',                                     effectiveDate: effectiveDate, },
];
var idx;
var util = require('util');
var a = 1.56723;
console.log(util.format("test number: %d %d %d %d", 1, 1.1, 1.562, (1.56723).toFixed(1)));  
for(idx = 0; idx < teams.length; idx++) {
  (function(team) {
    myVersionOne.getSprintStats(team.name, team.effectiveDate, function(err, data) {
//      console.log("error: " + err + " processing data: " + JSON.stringify(data, null, " "));
      if(err) {
        console.log(err);
      } else {
        if(data.sprintStartDate !== '' && data.sprintEndDate !== '') {
//          console.log("data.sprintStartDate [" + data.sprintStartDate + "] null: " + 
//                     (data.sprintStartDate === null) + 
//                     " undefined: " + (data.sprintStartDate === undefined) +
//                     "  blank: " + (data.sprintStartDate === '') + 
//                     "  Date?: " + (data.sprintStartDate instanceof Date) 
//                     );
          var startString = data.sprintStartDate.getFullYear() + "-" + (data.sprintStartDate.getMonth() + 1) + "-" + data.sprintStartDate.getDate()
          var endString = data.sprintEndDate.getFullYear() + "-" + (data.sprintEndDate.getMonth() + 1) + "-" + data.sprintEndDate.getDate()
          var startSprintM = moment(startString, "YYYY-MM-DD");
          var endSprintM = moment(endString, "YYYY-MM-DD");
          var currentM = moment();
          var sprintDuration = moment.duration(endSprintM - startSprintM);
          var currentDuration = moment.duration(currentM - startSprintM);
          var targetPercentage =  
                  Math.round(currentDuration.asDays() / sprintDuration.asDays() * 100);

          // console.log("duration: " + sprintDuration.asDays() + " so far: " + currentDuration.asDays().toFixed(1) + " target: " + targetPercentage + "%");
  //        console.log(
  //        "Start: " + data.sprintStartDate +
  //          "\tEnd: " + data.sprintEndDate 
  //        var startSprintM = moment.tz(data.sprintStartDate.valueOf(), "America/Denver");
  //        var endSprintM = moment.tz(data.sprintEndDate.valueOf(), "America/Denver");
          // var startSprintM = moment(data.sprintStartDate);
          // var endSprintM = moment.tz(data.sprintEndDate, "America/Denver");
          var startSprintMBrisbane   = startSprintM.clone().tz('Australia/Brisbane');
          var startSprintMDenver   = startSprintM.clone().tz('America/Denver');
          console.log(
            startSprintM.format('ll')
             + " -> "  +
            endSprintM.format('ll') + ' ' +
            "\tBlocked: " + data.blockedItems + 
            "\tBacklog: " + data.backlogStoryPoints + 
            "\tWip: " + data.wipStoryPoints + 
            "\t D: " + data.doneStoryPoints + "\t" + data.percentageDone + "%\tT: " + targetPercentage + "%" +
            "\tDur: " + data.sprintDuration +
            "\t" + team.name
//            "\nStart: " + data.sprintStartDate +
//            "\tEnd: " + data.sprintEndDate 
          );
        }
      }
    });
  })(teams[idx]);
}

// ---- timezone
  
  var tz = require('timezone/loaded'),
    utc;

// Get POSIX time in UTC.
utc = tz(new Date());

// Convert UTC time to local time in a localize language.
//console.log(tz(utc, '%c', 'fr_FR', 'America/Montreal'));
//console.log(tz(utc, '%c', 'en_UK', 'England/London'));
//console.log(tz(utc, '%c', 'en_AU', 'Australia/Brisbane'));
//console.log(tz(utc, '%c', 'en_US', 'America/Denver'));
//console.log(tz(utc, '%c', 'en_US', 'America/Atlanta')); // no go, not supported... :(
//  
//var tz = require('timezone');
//var us = tz(require("timezone/America"));
//var eu = tz(require("timezone/Europe"));
//var as = tz(require("timezone/Asia"));
//var au = tz(require("timezone/Australia"));
//
//// var moonwalk = us("1969-07-21 02:56");
//  var moonwalk = tz("1969-07-21 02:56");
//  var sprintStart = tz("2014-12-03 00:00");
//console.log("Detroit shown as Detroit:   " + us(us("2014-12-03 00:00", "America/Detroit"), "%F %T", "American/Detroit"));
//console.log("Brisbane shown as Brisbane: " + as(as("2014-12-03 00:00", "Asia/Brisbane"), "%F %T", "Asia/Brisbane"));
//
//console.log("Sprint Start @ Brisbane: " + au(sprintStart, "%F %T", "Australia/Brisbane"));
//console.log("Sprint Start @ Detroit:  " + us(sprintStart, "%F %T", "American/Detroit"));


//console.log("Detroit shown as Detroit:   " + us(us("2014-07-27 00:00", "America/Detroit"), "%F %T", "American/Detroit"));
//console.log("Brisbane shown as Brisbane: " + as(as("2014-07-27 00:00", "Asia/Brisbane"), "%F %T", "Asia/Brisbane"));
//console.log("Moonwalk @ Brisbane: " + au(moonwalk, "%F %T", "Australia/Brisbane"));
//console.log("Moonwalk @ Detroit:  " + us(moonwalk, "%F %T", "American/Detroit"));

//console.log("Moonwalk @ Brisbane: " + tz(moonwalk, "%F %T", "Australia/Brisbane"));
//console.log("Moonwalk @ Detroit:  " + tz(moonwalk, "%F %T", "American/Detroit"));

  
// ----- moment
  
var now = moment();

// console.log(moment.tz.names());
  
  /*
  'US/Alaska',
  'US/Aleutian',
  'US/Arizona',
  'US/Central',
  'US/East-Indiana',
  'US/Eastern',
  'US/Hawaii',
  'US/Indiana-Starke',
  'US/Michigan',
  'US/Mountain',
  'US/Pacific',
  'US/Pacific-New',
  'US/Samoa',
   */
  
// can add a time zone, etc. see: http://momentjs.com/timezone/docs/#/data-loading/

//console.log("\n\nMoment testing, now at different regions\n");
//
//console.log("Denver:      " + now.tz('America/Denver').format('ddd ha'));  // 5am PDT
////console.log("Atlantas:      " + now.tz('America/Atlantas').format('ddd ha'));  // 5am PDT
//console.log("Los Angeles: " + now.tz('America/Los_Angeles').format('ddd ha'));  // 5am PDT
//console.log("New York:    " + now.tz('America/New_York').format('ddd ha'));     // 8am EDT
//console.log("Tokyo:       " + now.tz('Asia/Tokyo').format('ddd ha'));           // 9pm JST
//console.log("Brisbane:    " + now.tz('Australia/Brisbane').format('ddd ha'));     // 10pm EST
//  
//console.log("\n\nMoment testing, sprint start presuming value is for denver timezone\n");
//
//var startSprintM = moment.tz("2014-12-03 00:00", "America/Denver");
//var startSprintMBrisbane   = startSprintM.clone().tz('Australia/Brisbane')
//var startSprintMLosAngeles = startSprintM.clone().tz('America/Los_Angeles')
//var startSprintMNewYork    = startSprintM.clone().tz('America/New_York')
//var startSprintMSingapore  = startSprintM.clone().tz('Singapore')
//
//// console.log("start sprint, brissy: " + startSprintM.clone('Australia/Brisbane').format('ha z'));
//console.log("Denver      " + momentToString(startSprintM));
//console.log("Brisbane    " + momentToString(startSprintMBrisbane));
//console.log("Los Angeles " + momentToString(startSprintMLosAngeles));
//console.log("New York    " + momentToString(startSprintMNewYork));
//// startSprintMSingapore.locale('sg');
//console.log("Singapore   " + momentToString(startSprintMSingapore));

function momentToString(mValue) {
  // return mValue.format('llll') + " : " + mValue.format('LT') + " - " + mValue.format('ddd');
  return mValue.format('ddd LT');
}

//var brisbane = moment();
//var paris     = brisbane.clone().tz("Europe/Paris");
//paris.locale('fr');
//var newYork     = brisbane.clone().tz("America/New_York");
//var losAngeles  = brisbane.clone().tz("America/Los_Angeles");
//var london      = brisbane.clone().tz("Europe/London");
//var kualaLumpur = brisbane.clone().tz("Asia/Kuala_Lumpur");
//kualaLumpur.locale('ms_MY');

//console.log("Brisbane:     " + brisbane.format('llll') + " : " + brisbane.format('LT') + " " + brisbane.format('ddd'));
//console.log("Paris:        " + paris.format('llll') + " : " + paris.format('LT') + " " + paris.format('ddd'));
//console.log("New York:     " + newYork.format('llll') + " : " + newYork.format('LT') + " " + newYork.format('ddd'));
//console.log("Los Angeles:  " + losAngeles.format('llll') + " : " + losAngeles.format('LT') + " " + losAngeles.format('ddd'));
//console.log("London:       " + london.format('llll') + " : " + london.format('LT') + " " + london.format('ddd'));
//console.log("Kuala Lumpur: " + kualaLumpur.format('llll') + " : " + kualaLumpur.format('LT') + " " + kualaLumpur.format('ddd'));

//console.log("\n\nMoment current date\n");
//
//console.log(moment().format());
//console.log(moment().format('YYYY MM DD'));
//console.log(moment().format('YYYY-MM-DD'));
//console.log(moment().tz("America/Denver").format('YYYY-MM-DD'));
//
//console.log("\n\nMoment testing complete\n");

