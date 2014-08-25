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
  
var hostname = "www11.v1host.com"; 
var instance = "VentyxProd";
var username = "james.jenner";
var password = "*********";
var port = "443";
var protocol = "https";

var server = new V1Server(hostname, instance, username, password, port, protocol);

var v1 = new V1Meta(server);

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



v1.query({
  from: "Timebox",
  select: [
    'Name',
    'Days',
    'Duration',
    'State.Code',
    'State.Code',
    'Workitems.ToDo.@Sum',
    'Workitems.Actuals.Value.@Sum',
  ],
  where: {
    "Name": 'SprintAug1314'
  },

  success: function(result) {
    console.log(util.inspect(result, {showHidden: true, depth: null}));
    console.log(result._v1_current_data['Name'] + " : " + result.Name + " : " + result._v1_current_data['Workitems.ToDo.@Sum']);
    // console.log(result.ToDo);
    // console.log(result.Name + " To do: " + result['Name'] + " : " + result['Workitems.ToDo.@Sum']);
  },

  error: function(err) { 
    console.log("ERROR: " + err);
  }
});

function processData(result) {
  console.log(result.Name);
  // console.log(result.Name + "\t" + result['Status.Name']);
}
