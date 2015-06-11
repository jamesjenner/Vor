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

  Endpoints:
    http://community.versionone.com/Developers/Developer-Library/Concepts/Endpoints  
  
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

/* 
 * 
 * burn down
 *   
 *   line a: for each day: (sum of estimates / days in sprint) * day of sprint
 *   line b: for each day: sum of estimates for work remaining less sum of work completed
 * 
 * burn up
 * 
 *   line a: for each day: sum of work done in day
 *   line b: total sum of estimates for all work
 * 
 */

var V1Meta = require('./v1/v1meta').V1Meta;
var V1Server = require('./v1/client').V1Server;
var moment = require('moment-timezone');
var async = require('async');
  
  
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

//console.log("hostname: " + settings.hostname);
//console.log("instance: " + settings.instance);
//console.log("username: " + settings.username);
//console.log("port: " + settings.port);
//console.log("protocol: " + settings.protocol);

var server = new V1Server(settings.hostname, settings.instance, settings.username, settings.password, settings.port, settings.protocol);

var v1 = new V1Meta(server);

//var team = 'Ellipse - Automation';
//var team = 'Ellipse - Finance Development';
//var team = 'Ellipse - Integration';
//var team = 'Finance Product Owner';
//var team = 'Ellipse - MITWIP';
//var team = 'Ellipse Tests Automation';
//var team = 'JI Core';

//var team = 'Ellipse Development 8.6 - Maintenance';
//var team = 'Ellipse Development 8.6 - Field Length and ERP integration';
// var team = 'Ellipse - Code Maintenance and Support';

var team = 'Ellipse Development 8.6 - Materials';
// var team = 'zzzz - ACME Alpha';

var effectiveDate = '2015-5-13';

// list all stories in a project

// burn down - project/release

// burn down - sprint

// list all stories in a sprint for a timebox
// https://www11.v1host.com/VentyxProd/meta.v1?xsl=api.xsl#Workitem

_getSubProjects({projectName: "Ellipse EAM", programName: "Ellipse Code Maintenance Reduction Program"});

// _getProgramNameId("Ellipse code Maintenance Reduction Program");

function _getDefectsforProjectProgram(options) {
  options = options !== undefined ? options : {};
  
  var projectId = (options.projectId !== undefined && options.projectId !== null) ? options.projectId : "";
  var projectName = (options.projectName !== undefined && options.projectName !== null) ? options.projectName : "";
  var source = (options.source !== undefined && options.source !== null) ? options.source : "";
  var programName = (options.programName !== undefined && options.programName !== null) ? options.programName : "";
  
  var whereStatement = {};
  var selectStatement = ["ID", "Name", "Inactive", "IsClosed", "IsDeleted", "AssetState"];

  if(programName !== "") {
    // TODO: filter by projectName
  }
  
  whereStatement["IsDeleted"] = false;
  whereStatement["IsDead"] = false;
  
  if(projectName !== "") {
    whereStatement["Scope.Name"] = projectName;
  }
  if(projectId !== "") {
    whereStatement["Scope.ID"] = projectId;
  }
  if(source !== "") {
    whereStatement["Source.Name"] = source;
  }
  
//      "Team.Name": teamName,
//      "Timebox.Name": sprintName,
//      "State.Code": 'ACTV', 
  
  v1.query({
//      from: "PrimaryWorkitem",
    from: 'Defect',
    select: [
      'ID',
      'Priority',
      'Name',
//      'Source',
      'IsClosed',
      'IsCompleted',
//      'IsDead',
//      'IsDeleted',
      'CreateDate',
      'CreateDateUTC',
      'IsInactive',
      'Status.Name',
      'AssetState',
      'FoundBy',
//      'Status.Name',
      'Custom_Component3',
//      'Custom_DuplicateOf2',
//      'Custom_EngineeringResearch',
//      'Custom_EPEstDate',
      'Custom_InternalSource4.Name',
//      'Custom_KanbanStates',
//      'Custom_Product2',
//      'Custom_ProductCategory1',
//      'Custom_ProductCategory2',
//      'Custom_ProductCategory3',
//      'Custom_ProductCategory4',
//      'Custom_ProductCategory5',
//      'Custom_QCReference',
//      'Custom_ReleaseNotes3',
      'Custom_ScreenID',
//      'Custom_ServiceSuiteKanbanStatus',
      'Custom_Severity2.Name',
      'Custom_SFDCAccount2',
      'Custom_SFDCCaseNumber2',
      'Custom_SFDCChangeReqID',
//      'Custom_SFDCLanguage',
      'Custom_SFDCProduct2',
      'Custom_SFDCProductVersion2',
      'Custom_SFDCRequestByDate',
//      'Custom_SFDCStepsToRecreate',
//      'Custom_SprintTestingStatus',
      'Custom_SubComponent4',
//      'Custom_VersionAffected2',
      'Custom_VersionAffected2.Name',
      'Scope.Name',
    ],
    where: whereStatement,
    success: function(result) {
      var accountName = _getAccountName(result['_v1_current_data']['Custom_SFDCAccount2'], result['_v1_current_data']['FoundBy']);
//      if(result["_v1_current_data"]["ID.Number"] === undefined) {
//        console.log(JSON.stringify(result, null, ' '));
//      }
      if(result["_v1_current_data"]["ID.Number"] !== undefined && 
         result['_v1_current_data']['Custom_SubComponent4'].toUpperCase() !== "DATAFIX" && 
        result['_v1_current_data']['Custom_SubComponent4'].toUpperCase() !== "DATA FIX" &&
        result['_v1_current_data']['Custom_SubComponent4'].toUpperCase() !== "SQL DATAFIX" &&
         (accountName !== 'Commonwealth of Australia Department of Defence' || 
          (accountName !== 'Commonwealth of Australia Department of Defence' && 
           result['_v1_current_data']['Custom_SubComponent4'].substr(0, 2).toUpperCase() !== 'DD'
          )
         )
        ) {
        
        console.log(
          result["_v1_current_data"]["ID.Number"] + "\t" + 
          result["_v1_current_data"]["ID.Name"] + "\t" + 
          result["_v1_current_data"]["Scope.Name"] + "\t" + 
  //        result["_v1_current_data"]["Source"] + "\t" + 
          result["_v1_current_data"]["IsClosed"] + "\t" +
          result["_v1_current_data"]["IsCompleted"] + "\t" +
//          result["_v1_current_data"]["IsDeleted"] + "\t" +
          result["_v1_current_data"]["IsInactive"] + "\t" +
          result["_v1_current_data"]["Status.Name"] + "\t" +
          result["_v1_current_data"]["AssetState"] + "\t" +
          result["_v1_current_data"]["CreateDate"] + "\t" +
          result["_v1_current_data"]["CreateDateUTC"] + "\t" +
          result['_v1_current_data']['Custom_SFDCProduct2'] + "\t" +
          result['_v1_current_data']['Custom_SFDCProductVersion2'] + "\t" +
          result['_v1_current_data']['Custom_VersionAffected2.Name'] + "\t" +
          result['_v1_current_data']['Custom_InternalSource4.Name'] + "\t" +
          _getScreenId(result['_v1_current_data']['Custom_ScreenID'], result['_v1_current_data']['Custom_SubComponent4'], result["_v1_current_data"]["ID.Name"]) + "\t" +
          result['_v1_current_data']['Custom_Component3'] + "\t" +
          result['_v1_current_data']['Custom_SubComponent4'] + "\t" +
          result['_v1_current_data']['Custom_Severity2.Name'] + "\t" +
          accountName + "\t" +
          result['_v1_current_data']['FoundBy'] + "\t" +
          result['_v1_current_data']['Custom_SFDCCaseNumber2'] + "\t" +
          result['_v1_current_data']['Custom_SFDCChangeReqID'] + "\t" +
          result['_v1_current_data']['Custom_SFDCRequestByDate'] + "\t" +
  //        result['_v1_current_data']['Custom_VersionAffected2'] + "\t" +
          ''
        );
      }
    },

    error: function(err) { 
      console.log("ERROR: " + err);
    }
  });  
}

function _getScreenId(screenId, subComponent, name) {
  var id = '';
  if(screenId !== '') {
    return screenId;
  }
  
  var sub = subComponent.toUpperCase();
  if(subComponent.substr(0, 2) === 'MS') {
    return subComponent.substr(0, 6);
  }
  
  id = _getScreenFromString(name);
  
  if(id !== '') {
    return id;
  }
  
  return screenId;
}

function _getScreenFromString(text) {
  var tokens = text.toUpperCase().split(' ');
  var i;
  
  for(i = 0; i < tokens.length; i++) {
    if(tokens[i].substr(0, 2) === 'MS' && tokens[i].length == 6) {
      return tokens[i].substr(0, 6);
    } else if(tokens[i].substr(0, 2) === 'MSM' && tokens[i].length > 5 && tokens[i].length < 9) {
      return "MSO" + tokens[i].substr(3, 6);
    }
  }
  
  return '';
}

function _getAccountName(name, foundBy) {
  
  if(name === '') {
    name = foundBy;
  }
  
  switch(name) {
    case undefined:
      return '';
      
    case 'DOD01 - DEPT OF DEFENCE':
    case 'DOD01 - DEPT OF DEFENCE,':
    case 'Comminwealth Department of Defence':
    case 'ADF':
    case 'adf':
      return 'Commonwealth of Australia Department of Defence';
  
    case 'ADI02 - ADI LIMITED,':
    case 'ADI02 - THALES AUSTRALIA LIMITED':
      return 'Thales Australia HQ';
      
    case 'Allied Nevada Gold Corp.':
    case 'ANCU1 - ALLIED NEVADA GOLD CORP':
      return 'Allied Nevada Gold Corp';
      
    case 'BBPA1 - ALINTA SERVCO PTY LTD':
    case 'Alinta Energy Group Limited':
      return 'Alinta Energy';
      
    case 'AMT':
    case 'AMT - SYBEX LTD':
    case 'AMT - Sybex':
    case 'AMT01':
    case 'AMT1':
    case 'AMT01 - AMT01,':
      return 'AMT Sybex';
      
    case 'AMC02 - ARCH COAL INC,':
    case 'ARCH Coal':
    case 'Arch Coal, Inc':
    case 'Arch Coal Inc.':
    case 'Arch Coal, Inc.':
    case 'Arch Coal. Inc.':
    case 'Arch Coal':
      return 'Arch Coal Inc';
      
    case 'AMT':
    case 'AMT - SYBEX LTD':
    case 'Client - AMT':
      return 'AMT Sybex';
      
    case 'ARTL1':
    case 'Australian Rail Track Corporation Limited':
      return 'Australian Rail Track';
      
    case 'CAEPCO':
    case 'CAEU1 - JSC CAEPCO':
      return 'JSC Central Asian Power Energy Company';
      
    case 'COMP1 - COMPANIA MINERA ANTAMINA S.A. ,':
      return 'Compania Minera Antamina S.A.';
      
    case 'FALU1 - XSTRATA COPPER CHILE S.A.,':
      return 'Xstrata Chile';
      
    case 'Glencore Qld':
    case 'Glencore Copper Qld':
    case 'Glencore Copper Queensland':
    case 'Glencore Copper Queensland Pty Ltd':
    case 'Glencore Queensland Ltd':
    case 'Glencore Queensland Limited':
      return 'Glencore';
      
    case 'HMC01 - HECLA MINING COMPANY':
    case 'Hecla':
    case 'HMC01':
      return 'Hecla Mining Company';
      
    case 'Hunter Water':
    case 'HUNT1':
    case 'Hunter Water Corp.':
    case 'Hunter Water Corporation, PT Perusahaan Listrik Negara (Persero)':
    case 'HUNT1 - HUNTER WATER CORPORATION':
    case 'HUNT1 - HUNTER WATER CORPORATION,':
    case 'Hunter Water Corp':
      return 'Hunter Water Corporation';
      
    case 'HWE01 - HAWAIIAN ELECTRIC COMPANY INC':
    case 'HWE01 - HAWAIIAN ELECTRIC COMPANY,':
      return 'Hawaiian Electric Company';
    
    case 'HPW01 - HORIZON POWER':
    case 'HPW01':
    case 'Horizon':
    case 'HPW01 - HORIZON POWER,':
      return 'Horizon Power';

    case 'LBT01 - LONG BEACH TRANSIT,':
    case 'LBT01 - LONG BEACH TRANSIT':
      return 'Long Beach Transit';
      
    case 'VICR1 - VICTORIAN ROADS AUTHORITY':
      return 'VicRoads';
      
    case 'Queensland Government, Department of Public Works (QBuild)':
    case 'Qld Government Dept of Public Works':
    case 'Qld Govt Department of Works':
    case 'QBD01 - QBUILD,':
      return 'QBuild';


    case 'EWSS1 - S A WATER':
    case 'EWSS1 - S A WATER,':
    case 'EWSS1 S.A. Water':
    case 'Government of South Australia - Water':
      return 'SA Water';
      
    case 'TRAN1 - TRANS GRID':
      return 'TransGrid';
      
    case 'CJV01 - TIWEST JOINT VENTURE,':
    case 'CJV01 - TRONOX MANAGEMENT PTY LTD':
      return 'Tronox Management Pty Ltd';
      
    case 'SAPU1 - PT SAPTAINDRA SEJATI,':
      return 'PT Sapta Indra Sejati';
      
    case 'QBUILD':
    case 'QBD01 - QBUILD,':
    case 'QBD01 - BUILDING AND ASSET SERVICES':
    case 'QBD01':
    case 'Queensland Government, Department of Public Works':
    case 'Queensland Government Department of Public Works':
    case 'Qld Gov Dept Public Works':
      return 'QBuild';
      
    case 'RIC01 - RAIL INFRASTRUCTURE CORPORATIO,':
    case 'RIC01 - RAILCORP':
    case 'Rail Corporation New South Wales':
      return 'Railcorp NSW';
      
    case 'Snowy':
    case 'Snowy Hydro Ltd':
    case 'Snowy Hyrdro Limited':
    case '':
    case 'Snowy Hydro':
    case 'SNH01 - SNOWY HYDRO LIMITED':
    case 'SNH01 - SNOWY HYDRO LIMITED,':
    case 'SNH01':
      return 'Snowy Hydro Limited';
      
      
    case 'TRAN1':
    case 'TRAN 1':
    case 'TRAN1 - TRANS GRID':
    case 'TRAN1 - TRANSGRID,':
    case 'TRAN2 - TRANSGRID - AMSIP PROJ':
    case 'TRAN2 - TRANSGRID,':
    case 'Tran2 Transgrid':
    case 'Transgrid':
      return 'TransGrid';
      
    case 'Ventyx - Chris Hansell':
    case 'Ventyx - IBD':
    case 'Ventyx - Paul Cook':
    case 'Ventyx IBD - Presales':
    case 'Ventyx Inc':
    case 'Ventyx Inc.':
    case 'Ventyx Ltd':
    case 'Ventyx Test Account':
    case 'Ventyx, Inc':
    case 'Ventyx, Inc.':
    case 'Ventyx, Inc. - IBD':
    case 'Ventyx, Inc. AMT Sybex':
    case 'Ventyx, Inc. IBD':
    case 'Ventyx, Inc.Demo':
    case 'Ventyx. Inc.':
    case 'vENTYX':
      return 'Ventyx';
      
    case 'VICR1 - VICROADS':
    case 'VICR1 - VICTORIAN ROADS AUTHORITY,':
    case 'VicRoads':
      return 'Vic Roads';

    case 'WPC01':
    case 'WPC01 - WESTERN POWER':
    case 'WPC01 - WESTERN POWER CORPORATION,':
    case 'Westernpower':
    case 'Western Power Corporation':
    case 'Western Power Corporation':
      return 'Western Power';
      
    case 'Govt of WA - PTA':
    case 'The Government of Western Australia, Public Transport Authority':
    case 'Govt. of Western Australia - Public Transport Authority (PTA)':
    case 'PTA Wester Australia':
    case 'PTA':
    case 'PTA Western Aust.':
    case 'WAGR1- PTA':
    case 'WAGR1':
    case 'WAGR1 - PUBLIC TRANSPORT AUTHORITY':
    case 'WAGR1 - PUBLIC TRANSPORT AUTHORITY OF ,':
      return 'Govt of WA - PTA';

    case 'FALU1':
    case 'FALU1 - XSTRATA COPPER CHILE S.A.':
    case 'Xstrata Queensland Limited - Chile':
    case 'Xstrata chile':
      return 'Xstrata Chile';
      
    case 'XSTRATA QLD LTD':
    case 'Xstrata QLD':
    case 'Xstrata Qld.':
    case 'Xstrata Queensland Limited':
    case 'Xstrata Queensland Ltd':
    case 'MIM02':
    case 'XSTRATA Qld':
    case 'Xstrata/Glencore QLD':
    case 'Xstrata Queensland Limited':
    case 'Xstrata Queensland Limited - Mt Isa':
    case 'MIM02 - XSTRATA COPPER':
    case 'MIM02 - XSTRATA COPPER,':
    case 'MIM02 Xstrata Copper':
      return 'Xstrata Queensland';

    case 'NORU1':
    case 'Xstrata Canada Copper':
    case 'Xstrata Copper Canada':
    case 'Xstrata Canada':
    case 'XSTRATA':
    case 'NORU1 - XSTRATA COPPER CANADA':
    case 'NORU1 - XSTRATA COPPER CANADA,':
    case 'NORU1 - XTRATA COPPER CANADA':
    case 'Xstrata Copper - Canada':
    case 'Xstrata Queensland Limited - Copper Canada':
      return 'Xstrata Copper Canada';
      
      
    default:
      return name;
  }
}

function _getSubProjects(options) {
  options = options !== undefined ? options : {};
  
  var projectId = (options.projectId !== undefined && options.projectId !== null) ? options.projectId : "";
  var projectName = (options.projectName !== undefined && options.projectName !== null) ? options.projectName : "";
  var programName = (options.programName !== undefined && options.programName !== null) ? options.programName : "";
  var includeChildren = (options.includeChildren !== undefined && options.includeChildren !== null) ? options.includeChildren : true;
  var includeAllChildren = (options.includeAllChildren !== undefined && options.includeAllChildren !== null) ? options.includeAllChildren : false;
  
  var childrenSearchString = "ChildrenAndMe";
  var allChildrenSearchString = "ChildrenMeAndDown";
  
  
  var whereStatement = {};
  var selectStatement = ["ID", "Name", "Inactive", "IsClosed", "IsDeleted", "AssetState", "ScopeLabels",];

  if(includeChildren) {
    if(programName === '') {
      selectStatement.push(childrenSearchString);
    } else {
      childrenSearchString = childrenSearchString + "[ScopeLabels.Name='" + programName + "']";
      selectStatement.push(childrenSearchString);
    }
  } else if(includeAllChildren) {
    if(programName === '') {
      childrenSearchString = allChildrenSearchString;
      selectStatement.push(childrenSearchString);
    } else {
      childrenSearchString = allChildrenSearchString + "[ScopeLabels.Name='" + programName + "']";
      selectStatement.push(childrenSearchString);
    }
  }
  
  if(programName !== "") {
    // TODO: filter by projectName
  }
  if(projectName !== "") {
    whereStatement["Scope.Name"] = projectName;
  }
  if(projectId !== "") {
    whereStatement["Scope.ID"] = projectId;
  }
  
//  console.log("_getSubProjects " + JSON.stringify(options) + " :\t" + includeChildren + " :\t" + JSON.stringify(selectStatement) + " :\t" + whereStatement);
  
  v1.query({
//      from: "PrimaryWorkitem",
    from: 'Scope',
    select: selectStatement,
//    select: [
//      'ID',
//      'Name',
//      'Description',
//      'Inactive',
//      'IsClosed',
//      'IsDeleted',
//      'BeginDate',
//      'EndDate',
//      'IsInactive',
//      'IsReadOnly',
//      'IsDead',
//      'Parent',
//      'Scheme',
//      'BuildProjects',
//      'Custom_CurrentGATarget',
//      'Custom_CustomerCommitment2',
//      'Custom_DevCommittedCompletionDate',
//      'Custom_DevStatusComment',
//      'Custom_DocStatusComment',
//      'Custom_GatePassed',
//      'Custom_GotoMarketLaunch',
//      'Custom_MainObjectivesofRelease',
//      'Custom_OriginalGATarget',
//      'Custom_OverallStatus2',
//      'Custom_PgMStatusComment',
//      'Custom_PressRelease',
//      'Custom_ProcessFollowed',
//      'Custom_QAStatusComment',
//      'Custom_ReleaseVersion',
//      'Custom_SellReadyTarget',
//      'Custom_SRCompleted',
//      'Custom_StatusComment',
//      'Custom_Type',
//      'Custom_TypeofRelease',
//      'Ideas',
//      'Members',
//      'MentionedInExpressions',
//      'Owner',
//      'Reference',
//      'Schedule',
//      'ScopeLabels',
//      'Status',
//      'TargetEstimate',
//      'Targets',
//      'TargetSwag',
//      'TestSuite',
//      'Workers',
//      'Actuals',
//      'AssetState',
//      'AssetType',
//      'Attachments',
//      'CanAddChild',
//      'CanChangeSchedule',
//      'CanMove',
//      'CanUpdate',
//      'Capacities',
//      'ChangeComment',
//      'ChangeDate',
//      'ChangeDateUTC',
//      'ChangedBy',
//      'ChangeReason',
//      'CheckConvertToTeam',
//      'CheckInactivate',
//      'CheckReactivate',
//      'Children',
//      'ChildrenAndDown',
//      'ChildrenAndMe',
//      'ChildrenMeAndDown',
//      'CreateComment',
//      'CreateDate',
//      'CreateDateUTC',
//      'CreatedBy',
//      'CreateReason',
//      'Days',
//      'Duration',
//      'EmbeddedImages',
//      'Environments',
//      'FakeAssetState',
//      'Goals',
//      'History',
//      'Is',
//      'IsDeletable',
//      'IsUndeletable',
//      'Issues',      // ???
//      'Key',
//      'Links',
//      'Messages',
//      'Moment',
//      'MyLastChangeMoment',
//      'Now',
//      'OwnsScheme',
//      'ParentAndMe',
//      'ParentAndUp',
//      'ParentMeAndUp',
//      'Prior',
//      'RegressionPlans',
//      'RegressionTests',
//      'Requests',       // all the request ids for this scope
//      'RetireComment',
//      'RetireDate',
//      'RetireDateUTC',
//      'RetiredBy',
//      'RetireReason',
//      'Retrospectives',
//      'Rooms',
//      'SecuredAssets',
//      'SecurityScope',
//      'StrategicThemes',
//      'Viewers',
//      'Workitems',
//    ],
    where: whereStatement,
    success: function(result) {
      // console.log(JSON.stringify(result, null, ' '));
      if(includeChildren) {
//        console.log("Top project: " + result.Name);
//        console.log(JSON.stringify(result, null, ' '));
        // _getDefectsforProjectProgram({projectName: result.Name, source: "External"});
        
        for(var i = 0; i < result._v1_current_data[childrenSearchString].length; i++) {
          _getSubProjects({projectId: result._v1_current_data[childrenSearchString][i], includeChildren: false, includeAllChildren: true});
        }
      } else if(includeAllChildren) {
//        console.log("Parent project: " + result.Name);
        for(var i = 0; i < result._v1_current_data[childrenSearchString].length; i++) {
//          _getProjectName(result._v1_current_data[childrenSearchString][i]);
          _getDefectsforProjectProgram({projectId: result._v1_current_data[childrenSearchString][i], source: "External"});
        }
      }
    },
    error: function(err) { 
      console.log("ERROR: " + err);
    }
  });  
}

function _getProgramNameId(programName) {
  if(programName === undefined || programName === null) {
    return "";
  }
  
  var whereStatement = {"ScopeLabel.Name": programName};
  
  v1.query({
    from: 'ScopeLabel',
    select: [
      'ID',
      'Priority',
      'Name',
    ],
    where: whereStatement,
    success: function(result) {
      // console.log(JSON.stringify(result, null, ' '));
      console.log(
        result["_v1_current_data"]["ID.Number"] + "," + 
        ''
      );
    },

    error: function(err) { 
      console.log("ERROR: " + err);
    }
  });  
}

function _getProjectName(projectId) {
  if(projectId === undefined || projectId === null) {
    return "";
  }
  
  var whereStatement = {"Scope.ID": projectId};
  
  v1.query({
    from: 'Scope',
    select: [
      'ID',
      'Name',
      'IsDeleted',
    ],
    where: whereStatement,
    success: function(result) {
      console.log(
        result["_v1_current_data"]["Name"] + '\t' +
//        result["_v1_current_data"]["IsDeleted"] + 
        ''
      );
    },

    error: function(err) { 
      console.log("ERROR: " + err);
    }
  });  
}


function padSpaceLeft(value, length) {
  if(value === undefined) {
    return "";
  }
  return (value.toString().length < length) ? padSpaceLeft(" " + value, length) : value;
}

function padSpaceRight(value, length) {
  if(value === undefined) {
    return "";
  }
  return (value.toString().length < length) ? padSpaceRight(value + " ", length) : value;
}

