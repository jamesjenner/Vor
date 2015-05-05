/*global window, require, console */
/*
 * dataSource.js
 *
 * Copyright (c) 2014 James G Jenner
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

// "use strict"

var node = false;

if (typeof module == "undefined") {
  var module = function () {};
  var exports = this.dataSource = {};
  module.exports = exports;
}
if (typeof require != "undefined") {
  var uuid = require('node-uuid');
  var Widget = require('./widget.js');
}

module.exports = DataSource;

DataSource.KEY = 'DataSource';

DataSource.TYPE_VERSION_ONE = 'Version One';
DataSource.TYPE_JENKINS = 'Jenkins';
DataSource.TYPE_SALES_FORCE = 'Sales Force';
DataSource.TYPE_INTERNAL = 'Internal';

DataSource.DISPLAY_OPTIONS = {};

DataSource.getDefaultPanels = function(type, panelId, dataSourceId, dataElement) {
  switch(type) {
    case DataSource.TYPE_VERSION_ONE:
      return [
        new Widget({
          type: 'Blocked',
          style: Widget.DISPLAY_TYPE_VALUE,
          title: 'Blockers',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
        new Widget({
          type: 'Total Progress',
          style: Widget.DISPLAY_TYPE_PROGRESS,
          title: 'Progress',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
        new Widget({
          type: 'Progress by State',
          style: Widget.DISPLAY_TYPE_GRAPH_DONUT,
          title: 'Story Points',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
        new Widget({
          type: 'Burn Down',
          style: Widget.DISPLAY_TYPE_GRAPH_CHART,
          title: 'Burn Down',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
        new Widget({
          type: 'Burn Up',
          style: Widget.DISPLAY_TYPE_GRAPH_CHART,
          title: 'Burn Up',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
      ];
      
    case DataSource.TYPE_JENKINS:
      return [
        new Widget({
          type: 'State',
          style: Widget.DISPLAY_TYPE_PROGRESS_STATELESS,
          title: 'Build',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
        new Widget({
          type: 'History',
          style: Widget.DISPLAY_TYPE_HISTORY,
          title: 'History',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
        new Widget({
          type: 'State',
          style: Widget.DISPLAY_TYPE_PROGRESS_STATELESS,
          title: 'Unit Test',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
        new Widget({
          type: 'State',
          style: Widget.DISPLAY_TYPE_PROGRESS_STATELESS,
          title: 'System Test',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
        new Widget({
          type: 'State',
          style: Widget.DISPLAY_TYPE_PROGRESS_STATELESS,
          title: 'Deploy',
          panelId: panelId,
          dataSourceId: dataSourceId,
          keyDataElement: dataElement,
        }),
      ];
  }
  
  return [];
};

DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE] = {
//    SPRINT: {
      TOTAL_PROGRESS: {
        name: "Total Progress", 
        display: [
          Widget.DISPLAY_TYPE_VALUE,
          Widget.DISPLAY_TYPE_PROGRESS,
        ],
      },
      PROGRESS_BY_STATE: {
        name: "Progress by State", 
        display: [
          Widget.DISPLAY_TYPE_GRAPH_PIE,
          Widget.DISPLAY_TYPE_GRAPH_DONUT,
          Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_VERTICAL,
          Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_HORIZONTAL
        ],
      },
      BURN_DOWN: {
        name: "Burn Down",
        display: [
          Widget.DISPLAY_TYPE_GRAPH_CHART
        ],
      },
      BURN_UP: {
        name: "Burn Up",
        display: [
          Widget.DISPLAY_TYPE_GRAPH_CHART,
        ],
      },
      DAYS_LEFT: {
        name: "Days Left",
        display: [
          Widget.DISPLAY_TYPE_VALUE,
          Widget.DISPLAY_TYPE_PROGRESS,
        ],
      },
      COMPLETED_STORY_POINTS: {
        name: "Completed (Story Points)",
        display: [
          Widget.DISPLAY_TYPE_VALUE,
        ],
      },
      WIP_STORY_POINTS: {
        name: "WIP (Story Points)",
        display: [
          Widget.DISPLAY_TYPE_VALUE,
        ],
      },
      BACKLOCK_STORY_POINTS: {
        name: "Backlog (Story Points)",
        display: [
          Widget.DISPLAY_TYPE_VALUE,
        ],
      },
      BLOCKED: {
        name: "Blocked",
        display: [
          Widget.DISPLAY_TYPE_VALUE,
        ],
      },
//    },
//    QUARTER: {
//      TOTAL_PROGRESS: {
//        name: "Total Progress", 
//        display: [
//          Widget.DISPLAY_TYPE_VALUE,
//          Widget.DISPLAY_TYPE_PROGRESS,
//        ],
//      },
//    },
//    RELEASE: {
//      TOTAL_PROGRESS: {
//        name: "Total Progress", 
//        display: [
//          Widget.DISPLAY_TYPE_VALUE,
//          Widget.DISPLAY_TYPE_PROGRESS,
//        ],
//      },
//    },
  };

DataSource.DISPLAY_OPTIONS[DataSource.TYPE_JENKINS] = {
  STATE: {
    name: "State", 
    display: [
      Widget.DISPLAY_TYPE_VALUE,
      Widget.DISPLAY_TYPE_PROGRESS_STATELESS,
    ],
  },
  HISTORY: {
    name: "History",
    display: [
      Widget.DISPLAY_TYPE_HISTORY,
    ],
  },
};

DataSource.JENKINS_ELEMENTS = {
};

DataSource.DEFAULT_NAME = 'DataSource Name';
DataSource.DEFAULT_TYPE = DataSource.TYPE_VERSION_ONE;
DataSource.DEFAULT_POLL_FREQUENCY = 1;

DataSource.MESSAGE_ADD_DATA_SOURCE = 'addDataSource';
DataSource.MESSAGE_DELETE_DATA_SOURCE = 'deleteDataSource';
DataSource.MESSAGE_UPDATE_DATA_SOURCE = 'updateDataSource';
DataSource.MESSAGE_GET_DATA_SOURCES = 'getDataSources';
DataSource.MESSAGE_DATA_SOURCES = 'dataSources';


function DataSource(options) {
  options = options || {};
  
  var uuidV1 = ((options.uuidV1 !== null && options.uuidV1 !== undefined) ? options.uuidV1 : false);
  
  this.id = ((options.id !== null && options.id !== undefined) ? options.id : uuidV1 ? uuid.v1() : uuid.v4());
  this.type = ((options.type !== null && options.type !== undefined) ? options.type : DataSource.DEFAULT_TYPE);
  this.name = ((options.name !== null && options.name !== undefined) ? options.name : DataSource.DEFAULT_NAME);
  this.timeZone = ((options.timeZone !== null && options.timeZone !== undefined) ? options.timeZone : '');
  this.pollFrequencyMinutes = ((options.pollFrequencyMinutes !== null && options.pollFrequencyMinutes !== undefined) ? options.pollFrequencyMinutes : DataSource.DEFAULT_POLL_FREQUENCY);
  
  this.protocol = ((options.protocol !== null && options.protocol !== undefined) ? options.protocol : '');
  this.hostname = ((options.hostname !== null && options.hostname !== undefined) ? options.hostname : '');
  this.port = ((options.port !== null && options.port !== undefined) ? options.port : '');
  this.instance = ((options.instance !== null && options.instance !== undefined) ? options.instance : '');
  this.username = ((options.username !== null && options.username !== undefined) ? options.username : '');
  this.password = ((options.password !== null && options.password !== undefined) ? options.password : '');
}

/* 
 * merge
 */
DataSource.merge = function (d1, d2) {
  mergeAttribute(d1, d2, 'type');
  mergeAttribute(d1, d2, 'name');
  mergeAttribute(d1, d2, 'timeZone');
  mergeAttribute(d1, d2, 'pollFrequencyMinutes');
  mergeAttribute(d1, d2, 'protocol');
  mergeAttribute(d1, d2, 'hostname');
  mergeAttribute(d1, d2, 'port');
  mergeAttribute(d1, d2, 'instance');
  mergeAttribute(d1, d2, 'username');
  mergeAttribute(d1, d2, 'password');
};

function mergeAttribute(object, modifiedObject, attribute) {
  object[attribute] = ((modifiedObject[attribute] !== null && modifiedObject[attribute] !== undefined) ? modifiedObject[attribute] : object[attribute]);
}