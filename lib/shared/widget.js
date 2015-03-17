/*global window, require, console */
/*
 * widget.js
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
  var exports = this.widget = {};
  module.exports = exports;
}
if (typeof require != "undefined") {
  var uuid = require('node-uuid');
}

module.exports = Widget;

Widget.KEY = 'Widget';

Widget.DISPLAY_TYPE_VALUE = 'Value';
Widget.DISPLAY_TYPE_STATE = 'State';
Widget.DISPLAY_TYPE_PROGRESS = 'Progress Gauge';
Widget.DISPLAY_TYPE_PROGRESS_STATELESS = 'Stateless Progress Gauge';
Widget.DISPLAY_TYPE_HISTORY = 'History';
Widget.DISPLAY_TYPE_GRAPH_CHART = "Graph Chart";
Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_VERTICAL = "Single Vertical Bar";
Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_HORIZONTAL = "Single Horizontal Bar";
Widget.DISPLAY_TYPE_GRAPH_PIE = "Pie Chart";
Widget.DISPLAY_TYPE_GRAPH_DONUT = "Donut Chart";

Widget.THRESHOLD_PERCENTAGE_RANGE = "Percentage Range";
Widget.THRESHOLD_NUMERIC_RANGE = "Numeric Range";
Widget.THRESHOLD_NUMERIC_ABSOLUTE = "Numeric Absolute";
Widget.THRESHOLD_RANGE = "Range";

Widget.DEFAULT_TITLE = 'Widget Title';
Widget.DEFAULT_DISPLAY_TYPE = "";
Widget.DEFAULT_DISPLAY_STYLE = "";
Widget.DEFAULT_THRESHOLD_MODE = Widget.THRESHOLD_NUMERIC_RANGE;
Widget.DEFAULT_GRAPH_TYPE = Widget.GRAPH_CHART;

Widget.MESSAGE_ADD_WIDGET = 'addWidget';
Widget.MESSAGE_DELETE_WIDGET = 'deleteWidget';
Widget.MESSAGE_UPDATE_WIDGET = 'updateWidget';
Widget.MESSAGE_GET_WIDGETS = 'getWidgets';
Widget.MESSAGE_WIDGETS = 'widgets';

function Widget(options) {
  options = options || {};
  
  var uuidV1 = ((options.uuidV1 !== null && options.uuidV1 !== undefined) ? options.uuidV1 : false);
  
  this.id = ((options.id !== null && options.id !== undefined) ? options.id : uuidV1 ? uuid.v1() : uuid.v4());
  this.title = ((options.title !== null && options.title !== undefined) ? options.title : Widget.DEFAULT_TITLE);
  this.type = ((options.type !== null && options.type !== undefined) ? options.type : Widget.DEFAULT_DISPLAY_TYPE);
  this.style = ((options.style !== null && options.style !== undefined) ? options.style : Widget.DEFAULT_DISPLAY_STYLE);
  
  this.dataSourceId = ((options.dataSourceId !== null && options.dataSourceId !== undefined) ? options.dataSourceId : '');
  this.panelId = ((options.panelId !== null && options.panelId !== undefined) ? options.panelId : '');

  this.keyDataElement = ((options.keyDataElement !== null && options.keyDataElement !== undefined) ? options.keyDataElement : '');
  
  this.graphType = ((options.graphType !== null && options.graphType !== undefined) ? options.graphType : Widget.DEFAULT_GRAPH_TYPE);

  this.thresholdMode = ((options.thresholdMode !== null && options.thresholdMode !== undefined) ? options.thresholdMode : Widget.DEFAULT_THRESHOLD_MODE);
  this.marginSafe = ((options.marginSafe !== null && options.marginSafe !== undefined) ? options.marginSafe : 0);
  this.marginDanger = ((options.marginDanger !== null && options.marginDanger !== undefined) ? options.marginDanger : 0);
  this.targetDataElement = ((options.targetDataElement !== null && options.targetDataElement !== undefined) ? options.targetDataElement : '');

  this.displayLabels = ((options.displayLabels !== null && options.displayLabels !== undefined) ? options.displayLabels : false);
  this.targetValue = ((options.targetValue !== null && options.targetValue !== undefined) ? options.targetValue : false);
  this.maxValue = ((options.maxValue !== null && options.maxValue !== undefined) ? options.maxValue : false);
  this.minValue = ((options.minValue !== null && options.minValue !== undefined) ? options.minValue : false);
}

/* 
 * merge
 */
Widget.merge = function (d1, d2) {
  mergeAttribute(d1, d2, 'title');
  mergeAttribute(d1, d2, 'type');
  mergeAttribute(d1, d2, 'style');
  mergeAttribute(d1, d2, 'dataSourceId');
  mergeAttribute(d1, d2, 'panelId');
  mergeAttribute(d1, d2, 'keyDataElement');
  mergeAttribute(d1, d2, 'graphType');
  mergeAttribute(d1, d2, 'thresholdMode');
  mergeAttribute(d1, d2, 'marginSafe');
  mergeAttribute(d1, d2, 'marginDanger');
  mergeAttribute(d1, d2, 'targetDataElement');
  mergeAttribute(d1, d2, 'displayLabels');
  mergeAttribute(d1, d2, 'targetValue');
  mergeAttribute(d1, d2, 'minValue');
  mergeAttribute(d1, d2, 'maxValue');
};

function mergeAttribute(object, modifiedObject, attribute) {
  object[attribute] = ((modifiedObject[attribute] !== null && modifiedObject[attribute] !== undefined) ? modifiedObject[attribute] : object[attribute]);
}