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
        this.__startVersionOne(this.dataSourceHandler.dataSources[i]);
        break;

      case DataSource.TYPE_JENKINS:
        this.__startJenkins(this.dataSourceHandler.dataSources[i]);
        break;

      case DataSource.TYPE_SALES_FORCE:
        break;

      case DataSource.TYPE_INTERNAL:
        break;
    }
  }
};

DataSourceManager.prototype.__startVersionOne = function(dataSource) {
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
    this.dataSources[dataSource.id] = new VersionOne({
      name:     dataSource.name,
      timeZone: dataSource.timeZone,
      hostname: dataSource.hostname,
      instance: dataSource.instance,
      username: dataSource.username,
      password: dataSource.password,
      port:     dataSource.port,
      protocol: dataSource.protocol,
      pollFrequencyMinutes: dataSource.pollFrequencyMinutes,
      teamName: teamNames[i]
    });

    this.dataSources[dataSource.id].on(VersionOne.EVENT_SPRINT_DATA_RECEIVED, this._processAgileSprintDataReceived.bind(this));
    this.dataSources[dataSource.id].startMonitor(VersionOne.ALL_MONITORS);
  }
};

DataSourceManager.prototype.__startJenkins = function(dataSource) {
  // iterate through each widget to see if the data source is in use
  if(this.widgetHandler === null) {
    return;
  }
  
  var jenkinsName = [];
  
  for(var i = 0; i < this.widgetHandler.widgets.length; i++) {
    if(this.widgetHandler.widgets[i].dataSourceId === dataSource.id && 
       this.widgetHandler.widgets[i].keyDataElement.length > 0 &&
       jenkinsName.indexOf(this.widgetHandler.widgets[i].keyDataElement) < 0) {
      jenkinsName.push(this.widgetHandler.widgets[i].keyDataElement);
    }
  }
  
  for(i = 0; i < jenkinsName.length; i++) {
    this.dataSources[dataSource.id] = new Jenkins({
      host: dataSource.hostname,
      name: jenkinsName[i],
      pollFrequencyMinutes: dataSource.pollFrequencyMinutes
    });

    this.dataSources[dataSource.id].on(Jenkins.EVENT_DATA_RECEIVED, this.__processJenkinsDataReceived.bind(this));
    this.dataSources[dataSource.id].startMonitor();
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
    var dataSourceKeys =  Object.keys(this.dataSources);
    console.log("dataSourceManager : " + dataSourceKeys);
    
    for(var i = 0; i < dataSourceKeys.length; i++) {
      if (this.dataSources[dataSourceKeys[i]] instanceof VersionOne) {
        console.log("\tprocess datasource " + this.dataSources[dataSourceKeys[i]].sprintData);
      } else if (this.dataSources[dataSourceKeys[i]] instanceof Jenkins) {
      }
    }
    this.connection = c;
  }.bind(this));
};

DataSourceManager.prototype._processAgileSprintDataReceived = function(teamName, agileSprint) {
  if(this.connection !== null) {
    this.clientComms.sendMessage(this.connection, AgileSprint.MESSAGE_STATS, {keyDataElement: teamName, details: agileSprint});
  }
};

DataSourceManager.prototype.__processJenkinsDataReceived = function(name, data) {
  if(this.connection !== null) {
    this.clientComms.sendMessage(this.connection, JenkinsState.MESSAGE_STATS, {keyDataElement: name, details: data});
  }
};