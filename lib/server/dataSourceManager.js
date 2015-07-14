/*jlint node: true */
/*global require, console, module, process, __dirname */
/*
 * dataSourceManager.js
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
 */

var MeltingPot = require('meltingpot');
var DataSource = require('../shared/dataSource.js');
var VersionOne = require('./versionOne.js');
var AgileSprint = require('../shared/agileSprint.js');
var Jenkins = require('./jenkins.js');
var JenkinsState = require('../shared/jenkinsState.js');

module.exports = DataSourceManager;

function DataSourceManager(options) {
  this.clientComms = ((options.clientComms !== null && options.clientComms !== undefined) ? options.clientComms : null);
  this.dataSourceHandler = ((options.dataSourceHandler !== null && options.dataSourceHandler !== undefined) ? options.dataSourceHandler : null);
  this.widgetHandler = ((options.widgetHandler !== null && options.widgetHandler !== undefined) ? options.widgetHandler : null);
  
  this.connection = null;
  
  this.dataSources = {};
}

DataSourceManager.prototype.start = function() {
  if(this.dataSourceHandler === null) {
    return;
  }

  for(var i = 0; i < this.dataSourceHandler.dataSources.length; i++) {
    switch(this.dataSourceHandler.dataSources[i].type) {
      case DataSource.TYPE_VERSION_ONE:
        this.__initialiseVersionOne(this.dataSourceHandler.dataSources[i]);
        break;

      case DataSource.TYPE_JENKINS:
        this.__initialiseJenkins(this.dataSourceHandler.dataSources[i]);
        break;

      case DataSource.TYPE_SALES_FORCE:
        break;

      case DataSource.TYPE_INTERNAL:
        break;
    }
  }
};

DataSourceManager.prototype.widgetAdded = function(widget) {
  // determine data source id
  
  
  
  for(var i = 0; i < this.dataSourceHandler.dataSources.length; i++) {
    if(this.dataSourceHandler.dataSources[i].id === widget.dataSourceId) {
      this.__processAddWidget(widget, this.dataSourceHandler.dataSources[i]);
      break;
    }
  }
};

DataSourceManager.prototype.__processAddWidget = function(widget, dataSource) {
  switch(dataSource.type) {
    case DataSource.TYPE_VERSION_ONE:
      this.__processAddWidgetForVersionOne(widget, dataSource);
      break;

    case DataSource.TYPE_JENKINS:
      this.__processAddWidgetForJenkins(widget, dataSource);
      break;

    case DataSource.TYPE_SALES_FORCE:
      break;

    case DataSource.TYPE_INTERNAL:
      break;
  }
};

DataSourceManager.prototype.__processAddWidgetForVersionOne = function(widget, dataSource) {
  for(var i = 0; i < this.dataSources[dataSource.id].instances.length; i++) {
    if(this.dataSources[dataSource.id].instances[i].teamName === widget.keyDataElement) {
      // already running, nothing to do
      return;
    }
  }

  this.__startVersionOne(dataSource, widget.keyDataElement);
};

DataSourceManager.prototype.__processAddWidgetForJenkins = function(widget, dataSource) {
  for(var i = 0; i < this.dataSources[dataSource.id].instances.length; i++) {
    if(this.dataSources[dataSource.id].instances[i].name === widget.keyDataElement) {
      // already running, nothing to do
      return;
    }
  }

  this.__startJenkins(dataSource, widget.keyDataElement);
};

DataSourceManager.prototype.__startVersionOne = function(dataSource, teamName) {
  var versionOne = new VersionOne({
    name:     dataSource.name,
    timeZone: dataSource.timeZone,
    hostname: dataSource.hostname,
    instance: dataSource.instance,
    username: dataSource.username,
    password: dataSource.password,
    port:     dataSource.port,
    protocol: dataSource.protocol,
    pollFrequencyMinutes: dataSource.pollFrequencyMinutes,
    teamName: teamName
  });
  
  if(this.dataSources[dataSource.id] === undefined) {
    this.dataSources[dataSource.id] = {
      instances: []
    };
  }
  
  this.dataSources[dataSource.id].instances.push(versionOne);

  versionOne.on(VersionOne.EVENT_SPRINT_DATA_RECEIVED, this._processAgileSprintDataReceived.bind(this));
  versionOne.startMonitor(VersionOne.ALL_MONITORS);
};

DataSourceManager.prototype.__startJenkins = function(dataSource, endPoint) {
  var jenkins = new Jenkins({
    host: dataSource.hostname,
    name: endPoint,
    pollFrequencyMinutes: dataSource.pollFrequencyMinutes
  });

  if(this.dataSources[dataSource.id] === undefined) {
    this.dataSources[dataSource.id] = {
      instances: []
    };
  }
  
  this.dataSources[dataSource.id].instances.push(jenkins);

  jenkins.on(Jenkins.EVENT_DATA_RECEIVED, this._processJenkinsDataReceived.bind(this));
  jenkins.startMonitor();
};


DataSourceManager.prototype.__initialiseVersionOne = function(dataSource) {
  // iterate through each widget to see if the data source is in use
  if(this.widgetHandler === null) {
    return;
  }
  
  var teamNames = [];

  for(var i = 0; i < this.widgetHandler.widgets.length; i++) {
    if(this.widgetHandler.widgets[i].dataSourceId === dataSource.id && 
       this.widgetHandler.widgets[i].keyDataElement.length > 0 &&
       teamNames.indexOf(this.widgetHandler.widgets[i].keyDataElement) < 0) {
      teamNames.push(this.widgetHandler.widgets[i].keyDataElement);
    }
  }
  
  for(i = 0; i < teamNames.length; i++) {
    this.__startVersionOne(dataSource, teamNames[i]);
  }
};

DataSourceManager.prototype.__initialiseJenkins = function(dataSource) {
  // iterate through each widget to see if the data source is in use
  if(this.widgetHandler === null) {
    return;
  }
  
  var jenkinsEndpoint = [];
  
  this.dataSources[dataSource.id] = {
    instances: []
  };
  
  for(var i = 0; i < this.widgetHandler.widgets.length; i++) {
    if(this.widgetHandler.widgets[i].dataSourceId === dataSource.id && 
       this.widgetHandler.widgets[i].keyDataElement.length > 0 &&
       jenkinsEndpoint.indexOf(this.widgetHandler.widgets[i].keyDataElement) < 0) {
      jenkinsEndpoint.push(this.widgetHandler.widgets[i].keyDataElement);
    }
  }
  
  for(i = 0; i < jenkinsEndpoint.length; i++) {
    this.__startJenkins(dataSource, jenkinsEndpoint[i]);
  }
};

DataSourceManager.prototype.stop = function() {
  if(this.dataSourceHandler === null) {
    return;
  }
  
  for(var dataSource in this.dataSources) {
    this.dataSources[dataSource].stopMonitor();
  }
  
  this.dataSources = {};
};

DataSourceManager.prototype.add = function(dataSource) {
  
};

DataSourceManager.prototype.remove = function(id) {
  
  if(this.dataSources[id] !== null && this.dataSources[id] !== undefined) {
    this.dataSources[id].stopMonitor();
    // TODO: add remove logic
  }
};

DataSourceManager.prototype.setupCommsListeners = function(comms) {
  comms.on(MeltingPot.Comms.NEW_CONNECTION_ACCEPTED, function (c) {
    // TODO: decide on action when connection accepted, possibly start polling at this time
    // comms.sendMessage(c, Panel.MESSAGE_PANELS, this.panels);
    // TODO: only sends to last connection, doesn't broardcast, is this correct behaviour?
    console.log("dataSourceManager, connection accepted");
    this.connection = c;
    
    var dataSourceKeys =  Object.keys(this.dataSources);
    // console.log("dataSourceManager : " + dataSourceKeys);
    
    for(var i = 0; i < dataSourceKeys.length; i++) {
      for (var j = 0; j < this.dataSources[dataSourceKeys[i]].instances.length; j++) {
        // console.log("\t\t" + j);
        if (this.dataSources[dataSourceKeys[i]].instances[j] instanceof VersionOne) {
          // console.log("\tprocess versionone datasource: " + this.dataSources[dataSourceKeys[i]].instances[j].name + " for team " + this.dataSources[dataSourceKeys[i]].instances[j].teamName);
          this._processAgileSprintDataReceived(this.dataSources[dataSourceKeys[i]].instances[j].teamName, this.dataSources[dataSourceKeys[i]].instances[j].sprintData);
        } else if(this.dataSources[dataSourceKeys[i]].instances[j] instanceof Jenkins) {
          // console.log("\tprocess jenkins   datasource: " + this.dataSources[dataSourceKeys[i]].instances[j].name + " for for " + this.dataSources[dataSourceKeys[i]].instances[j].name);
          this._processJenkinsDataReceived(this.dataSources[dataSourceKeys[i]].instances[j].name, this.dataSources[dataSourceKeys[i]].instances[j].getJenkinsState());
        }
      }
      
      // TODO: sort out burndown, calc incorrectly when plan, gives browser invalid value error, could be just client side in widgetManager.js
      // TODO: sort out jenkins, currently not passing history information
      
//      if (this.dataSources[dataSourceKeys[i]] instanceof VersionOne) {
//        console.log("\tprocess datasource " + JSON.stringify(this.dataSources[dataSourceKeys[i]].sprintData, null, ' '));
//      } else if (this.dataSources[dataSourceKeys[i]] instanceof Jenkins) {
//        
//      }
    }
  }.bind(this));
};

DataSourceManager.prototype._processAgileSprintDataReceived = function(teamName, agileSprint) {
  if(this.connection !== null) {
    this.clientComms.sendMessage(this.connection, AgileSprint.MESSAGE_STATS, {keyDataElement: teamName, details: agileSprint});
  }
};

DataSourceManager.prototype._processJenkinsDataReceived = function(name, data) {
  if(this.connection !== null) {
    this.clientComms.sendMessage(this.connection, JenkinsState.MESSAGE_STATS, {keyDataElement: name, details: data});
  }
};