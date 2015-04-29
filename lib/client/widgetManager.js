/* jshint browser: true, jquery: true */
/* global Widget:false, console:false, server:false, viewWidgetWizard:false, ArcGauge:false, c3:false, DataSource:false */

// TODO: widgetStyle is incorrect value on modify

var WidgetManager = function(options) {
  this.widgets = [];
  this.widgetControls = {};
  this.widgetsIndex = [];
  this.server = null;
  this.dataSourceManager = null;
};

WidgetManager.prototype.addWidget = function(widget) {
  // TODO: determine the correct row (row of last element for column + 1)
  this._sendAdd(widget);
};

WidgetManager.prototype.updateWidget = function(widget) {
  this._sendUpdate(widget);
};

WidgetManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case Widget.MESSAGE_WIDGETS:
      this._receivedContent(server, content);
      processed = true;
      break;

    case Widget.MESSAGE_ADD_WIDGET:
      this._receivedAdd(server, new Widget(content));
      processed = true;
      break;

    case Widget.MESSAGE_DELETE_WIDGET:
      this._receivedDelete(server, content);
      processed = true;
      break;

    case Widget.MESSAGE_UPDATE_WIDGET:
      this._receivedUpdate(server, new Widget(content));
      processed = true;
      break;
  }

  return processed;
};

WidgetManager.prototype._receivedAdd = function(server, d) {
  this._addToDom(d);
  displayStatusMessage("The widget has been added", "Widgets");
};

WidgetManager.prototype._receivedDelete = function(server, id) {
  this._removeFromDom(id);
  displayStatusMessage("The widget has been removed", "Widgets");
};

WidgetManager.prototype._receivedUpdate = function(server, widget) {
  var idx = this.widgetsIndex.indexOf(widget.id);
  var currentWidget = null;
  
  if(idx < 0) {
    this.widgets.push(widget);
    this.widgetsIndex.push(widget.id);
  } else {
    currentWidget = this.widgets[idx];
    this.widgets[idx] = widget;
    
    if(currentWidget.title !== widget.title) {
      $('#widgetTitleText' + widget.id).text(widget.title);
    }
    if(currentWidget.type !== widget.type) {
      // TODO: if the type has changed then replace the widget with the correct widget
    }
  }
};

WidgetManager.prototype.receivedData = function(data) {
  var dataSource;

  if(this.dataSourceManager === null) {
    return;
  }
  
  for(var i = 0; i < this.widgets.length; i++) {
    if(this.widgets[i].keyDataElement === data.keyDataElement) {
      dataSource = this.dataSourceManager.getById(this.widgets[i].dataSourceId);
      
      if(dataSource !== null) {
        this._updateWidgetData(this.widgets[i], dataSource.type, data.details);
      }
    }
  }
};

WidgetManager.prototype._updateWidgetData = function(widget, dataSourceType, data) {
  switch(dataSourceType) {
    case DataSource.TYPE_VERSION_ONE:
      if(data.messageType === AgileSprint.MESSAGE_TYPE_SUMMARY) {
        this._updateVersionOneWidgetSummary(widget, data);
      } else if(data.messageType === AgileSprint.MESSAGE_TYPE_BREAKDOWN) {
        this._updateVersionOneWidgetBreakdown(widget, data);
      } else {
        this._updateVersionOneWidgetSummary(widget, data);
        this._updateVersionOneWidgetBreakdown(widget, data);
      }
      break;
      
    case DataSource.TYPE_JENKINS:
      this._updateJenkinsWidget(widget, data);
      break;
      
    case DataSource.TYPE_SALES_FORCE:
      break;
      
    case DataSource.TYPE_INTERNAL:
      break;
  }
};

WidgetManager.prototype._processJenkinsHistory = function(builds) {
  var list = [];
  var i = 0;
  var color = '';
  // value1 = data.builds[0].buildNumber;
  
  for(i = 0; i < builds.length; i++) {
    switch(builds[i].result) {
      // TODO: abstract out the success
      case "SUCCESS":
        color = 'rgb(50,200,50)';
        break;

      case "FAILURE":
        color = 'rgb(200,50,50)';
        break;

      case "ABORTED":
        color = 'grey';
        break;
    }
    
    list.push({value: builds[i].buildNumber, color: color});
  }
  
  return list;
};

WidgetManager.prototype._updateJenkinsWidget = function(widget, data) {
  var value1 = 0;
  var value2 = 0;
  var value3 = 0;
  var color = 'rgb(100,100,100)';
  var total = 0;
  var list = [];
  var i;
  
//  console.log("widgetManager._updateJenkinsWidget() type: " + widget.type + " style: " + widget.style + " -> " + JSON.stringify(data, null, " "));
  
  switch(widget.type) {
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_JENKINS].STATE.name:
//      console.log("state widget");
      total = 100;
      value1 = data.progress;
      value2 = data.mostRecentBuildNumber;
      value3 = data.building ? '' : data.mostRecentBuildState;
      break;
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_JENKINS].HISTORY.name:
//      console.log("history widget");
      list = this._processJenkinsHistory(data.builds);
      break;
  }
  
  switch(widget.style) {
    case Widget.DISPLAY_TYPE_VALUE:
//      console.log("update jenkins widget value");
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS_STATELESS:
//      console.log("update jenkins widget progress stateless");
      this._updateWidgetProgressStateless(widget, value1, value2, value3);
      break;
      
    case Widget.DISPLAY_TYPE_HISTORY:
//      console.log("update jenkins widget history");
      this._updateWidgetHistory(widget, list);
      break;
  }
};

WidgetManager.prototype._updateVersionOneWidgetSummary = function(widget, data) {
  var value1 = 0;
  var value2 = 0;
  var value3 = 0;
  var total = 0;

  switch(widget.type) {
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].TOTAL_PROGRESS.name:
      total = data.completedStoryPoints + data.wipStoryPoints + data.backlogStoryPoints;
      value1 = data.percentageDone;
      value2 = data.percentageTarget;
      break;
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].PROGRESS_BY_STATE.name:
      value1 = data.backlogStoryPoints;
      value2 = data.wipStoryPoints;
      value3 = data.completedStoryPoints;
      break;
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].DAYS_LEFT.name:
      break;
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].COMPLETED_STORY_POINTS.name:
      value1 = data.completedStoryPoints;
      break;
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].WIP_STORY_POINTS.name:
      value1 = data.wipStoryPoints;
      break;
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].BACKLOCK_STORY_POINTS.name:
      value1 = data.backlogStoryPoints;
      break;
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].BLOCKED.name:
      value1 = data.blockedItems;
      break;
  }
  
  switch(widget.style) {
    case Widget.DISPLAY_TYPE_VALUE:
      this._updateWidgetValue(widget, value1);
      break;
      
    case Widget.DISPLAY_TYPE_STATE:
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS:
      this._updateWidgetProgress(widget, value1, value2);
      break;
      
    case Widget.DISPLAY_TYPE_HISTORY:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_VERTICAL:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_HORIZONTAL:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_PIE:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_DONUT:
      this._updateWidgetGraphDonutToDom(widget, [
        ['data1', value1],
        ['data2', value2],
        ['data3', value3],
      ]);
      break;
  }
};

WidgetManager.prototype._updateVersionOneWidgetBreakdown = function(widget, data) {
  var value1 = 0;
  var value2 = 0;
  var value3 = 0;
  var total = 0;

  var isAction = true;
  // TODO: tidy up this code
/* 
 * Burn Down
 * 
 * The start point for the ideal line is the maximum detail estimate across all days (which may not be the first
 * The end point for the ideal line is 0
 * The x coord for the burn down is the todo for the given day (y axis)
 * 
 * Burn Up
 * 
 * blue line - completed - sum of effort to date (i.e. cummulative effort done)
 * red line  - total     - sum of estimate
 * gren line - ideal     - from zero to lastest estimate for latest date
 * 
 * total work - todo
 * completed work - effort performed (actuals val)
 * ideal line (optional, non standard) - projected completed work required to complete todo for the day
 * 
 */
  
  // TODO: update the graph widget

// burn down graph setup:
//
//        [
//          ['goal',   20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0],
//          ['trend',  20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
//          ['actual', 20, 18, 17, 15, 17, 16, 15, 15],
//        ],
//  
// burn up graph setup:
//

  var massagedData = [[],[],[],[],[],[]];
  var i, j;
  var maxEstimate = 0;
  var maxOutstanding = 0;
  var maxYValue = 0;
  var decrementFactor;
  
  var trendX = 4;
  var trend = 1;
  var goal = 0;
  var goalX = 5;
  var actual = 2;
  var actualX = 3;
  var value;
  var xAxisPoint;
  var idx = 1;
  
  /* 
   * data is 
   * [
   *   {date, estimate, workPerformed, outstandingWork}
   * ]
   */
  
  switch(widget.type) {
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].BURN_DOWN.name:
      console.log("burndown");
      if(data.data === null || data.data === undefined || data.data.length === 0) {
        break;
      }
      // TODO: determine how to handle if data for sprint added after start of sprint
      xAxisPoint = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      massagedData[goal][0]   = 'goal';
      massagedData[goalX]     = ['goalx', 1, 10];
      
      massagedData[trend][0]   = 'trend';
      massagedData[trendX][0]  = 'trendx';
      
      massagedData[actual][0]  = 'actual';
      massagedData[actualX][0] = 'actualx';
      
      var actualData = [];
      var trendPoints;
      
      for(i = 0; i < data.data.length; i++) {
        if(data.data[i].estimatedWork > maxEstimate) {
          maxEstimate = parseInt(data.data[i].estimatedWork);
        }
        if(data.data[i].outstandingWork > maxOutstanding) {
          maxOutstanding = parseInt(data.data[i].outstandingWork);
        }
      }

      // setup goal
      maxYValue = maxOutstanding;
      massagedData[goal][1] = maxOutstanding;
      massagedData[goal][2] = 0;

      // x pos 0 is start of day 1, y is the estimate
      actualData[0] = parseInt(data.data[0].estimatedWork);
      // populate from received data
      for(i = 0, idx = 1; i < data.data.length; i++) {
        // start from end of day one on sprint
        value = parseInt(data.data[i].outstandingWork);
        
        if(value > 0) {
          massagedData[actual][idx] = value;
          massagedData[actualX][idx] = i + 1;
          idx++;
        }
        
        actualData[i] =  value;
      }
      
      // setup trend
      trendPoints = calcTrendLine(xAxisPoint, actualData);
      massagedData[trendX][1] = trendPoints[0][0];
      massagedData[trendX][2] = trendPoints[1][0];
      massagedData[trend][1] = trendPoints[0][1];
      massagedData[trend][2] = trendPoints[1][1];
    
      // add 10% to the max y value
      maxYValue *= 1.1;
      break;
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].BURN_UP.name:
      if(data.data === null || data.data === undefined || data.data.length === 0) {
        break;
      }
      /*
       * Burn Up
       * 
       * 'actual' - blue line  - completed - sum of effort to date (i.e. cummulative effort done)
       * 'trend'  - red line   - total     - sum of estimate
       * 'goal'   - green line - ideal     - from zero to lastest estimate for latest date
       * 
       * total work - todo
       * completed work - effort performed (actuals val)
       * ideal line (optional, non standard) - projected completed work required to complete todo for the day
       */
      xAxisPoint = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      massagedData[trend][0] = 'trend';
      massagedData[trendX]    = ['trendx', 1, 10];
      massagedData[goal][0] = 'goal';
      massagedData[goalX]    = ['goalx', 1, 10];
      massagedData[actual][0] = 'actual';
      massagedData[actualX][0] = 'actualx';
      
      // setup goal
      massagedData[goal][1] = 0;
      
      // x pos 0 is start of day 1, y is the estimate
      // include 0 hour on sprint
      massagedData[actual][1] = parseInt(data.data[0].estimatedWork);
      massagedData[actualX][1] = 0;
      
      // populate from received data
      for(i = 0, idx = 1; i < data.data.length; i++) {
        value =  parseInt(data.data[i].estimatedWork);

        if(value > 0) {
          massagedData[trend][idx] = value;
          massagedData[trendX][idx] = i + 1;

          if(value > maxYValue) {
            maxYValue = value;
          }

          // final goal is the last estimated work
          massagedData[goal][2] = value;

          value = parseInt(data.data[i].workPerformed);
          massagedData[actual][idx] = value;
          massagedData[actualX][idx] = i + 1;
          
          idx++;
        }
      }
      
      if(massagedData[actual].length > 1) {
        massagedData[goal][1] = massagedData[actual][1];
        massagedData[goalX][1] = massagedData[actualX][1];
      }
      
      // add 10% to the max y value
      maxYValue *= 1.1;
      
      // TODO: consider not showing initial 0 values on graph
      console.log(widget.type + ": " + JSON.stringify(massagedData));
      break;
      
    default:
      isAction = false;
      break;
  }
  
  if(!isAction) {
    return;
  }

  if(widget.style === Widget.DISPLAY_TYPE_GRAPH_CHART) {
      this._updateWidgetGraphChartToDom(widget, massagedData, maxYValue);
  }
};

WidgetManager.prototype._receivedContent = function(server, d) {
  // TODO: test logic to remove existing data on DOM (needed for reconnection, but not supported)
  $("#widgetsGrid").empty();

  this.widgets = [];
  this.widgetControls = {};
  var widget = null;
  
  for (var item in d) {
    widget = new Widget(d[item]);
    this.widgets.push(widget);
    this.widgetsIndex.push(widget.id);
    this._addToDom(widget);
  }
};

WidgetManager.prototype._sendAdd = function(widget) {
  this.server.sendMessage(Widget.MESSAGE_ADD_WIDGET, widget);
};

WidgetManager.prototype._sendDelete = function(id) {
  this.server.sendMessage(Widget.MESSAGE_DELETE_WIDGET, id);
};

WidgetManager.prototype._sendUpdate = function(widget) {
  this.server.sendMessage(Widget.MESSAGE_UPDATE_WIDGET, widget);
};

WidgetManager.prototype._removeFromDom = function(id) {
  $('#widget' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
};

WidgetManager.prototype._addToDom = function(widget) {
  switch(widget.style) {
    case Widget.DISPLAY_TYPE_VALUE:
      this._addWidgetValueToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_STATE:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_CHART:
      this._addWidgetGraphChartToDom(widget);
      break;

    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_VERTICAL:
      break;

    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_HORIZONTAL:
      break;

    case Widget.DISPLAY_TYPE_GRAPH_PIE:
      break;
          
    case Widget.DISPLAY_TYPE_GRAPH_DONUT:
      this._addWidgetGraphDonutToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS:
      this._addWidgetProgressToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS_STATELESS:
      this._addWidgetProgressStatelessToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_HISTORY:
      this._addWidgetHistoryToDom(widget);
      break;
  }
  
  // note, problem with d3 (used by c3) is that correct width is incorrectly calculated
  // to solve, trigger a resize when adding new elements
  // $('#widget' + widget.id).hide().fadeIn('fast').trigger('resize');
  $('#widget' + widget.id).trigger('resize');
    
  $('#widgetBtnDelete' + widget.id).on('click', function() {
    this._sendDelete(widget.id);
  }.bind(this));
    
  $('#widgetBtnLeft' + widget.id).on('click', function() {
    this.__sendMoveWidgetLeft(widget.id);
  }.bind(this));
    
  $('#widgetBtnRight' + widget.id).on('click', function() {
    this.__sendMoveWidgetRight(widget.id);
  }.bind(this));
  
  $('#widgetBtnProperties' + widget.id).on('click', function() {
    viewWidgetWizard('modify', widget);
  }.bind(this));
};

WidgetManager.prototype._addWidgetValueToDom = function(widget) {
  // TODO: appending the widget container to the panel appears to be identical, consolidate?
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this._getWidgetDragOverlay(widget) + 
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this._getWidgetControls(widget) + 
    '  </div>  ' +
    this._getWidgetTitle(widget) +
    '</div>');
  
  this.widgetControls[widget.id] = new NumGauge({
    value: 0, 
    goodMargin: 0,
    dangerMargin: 1,
    valueType: NumGauge.VALUES_ACTUAL,
    goodColor: "rgb(100,100,100)",
    warningColor: "rgb(200,200,50)",
    dangerColor: "rgb(200,50,50)",
    appendTo: "widgetBody" + widget.id
  });
};

WidgetManager.prototype._updateWidgetValue = function(widget, value) {
  this.widgetControls[widget.id].setValue(value);
};

WidgetManager.prototype._updateWidgetProgress = function(widget, value, target) {
  this.widgetControls[widget.id].setTarget(target);
  this.widgetControls[widget.id].setValue(value);
};

WidgetManager.prototype._updateWidgetProgressStateless = function(widget, value, buildNumber, state) {
  // this.widgetControls[widget.id].setTarget(target);
//  console.log("update jenkins stateless, value: " + value + " build: " + buildNumber + " state: " + state);
  var color = '';
  
  switch(state) {
      case "SUCCESS":
        color = 'rgb(50,200,50)';
        break;

      case "FAILURE":
        color = 'rgb(200,50,50)';
        break;

      case "ABORTED":
        color = 'grey';
        break;
      
      default:
        color = '#0E74CF';
  }

  this.widgetControls[widget.id].setIndicatorColor(color);
  this.widgetControls[widget.id].setText(buildNumber);
  this.widgetControls[widget.id].setValue(value);
};

WidgetManager.prototype._updateWidgetHistory = function(widget, list) {
  var i = 0;
  
  for(i = 0; i < list.length; i++) {
    this.widgetControls[widget.id].pushValue(list[i].value, list[i].color);
  }
};

WidgetManager.prototype._addWidgetProgressStatelessToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this._getWidgetDragOverlay(widget) + 
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this._getWidgetControls(widget) + 
    '  </div>  ' +
    this._getWidgetTitle(widget) +
    '</div>');

  this.widgetControls[widget.id] = new ArcGauge({
    value: 0, 
    minValue: 0,
    maxValue: 100,
    valueType: ArcGauge.VALUES_ACTUAL,
    textDisplayMode: ArcGauge.DISPLAY_VALUE,
    colorMode: ArcGauge.COLOR_MODE_MANUAL,
    barColor: '#0E74CF',
    displayTarget: false,
    width: "100%",
    height: "100%",
    innerRadius: 60,
    outerRadius: 93,
    backgroundColor: "#333",
    textSize: 30,
    textColor: "#aaa",
    appendTo: "widgetBody" + widget.id
  });
};

WidgetManager.prototype._addWidgetProgressToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this._getWidgetDragOverlay(widget) + 
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this._getWidgetControls(widget) + 
    '  </div>  ' +
    this._getWidgetTitle(widget) +
    '</div>');

  this.widgetControls[widget.id] = new ArcGauge({
    value: 0, 
    target: 0,
    minValue: 0,
    maxValue: 100,
    goodMargin: 5,
    dangerMargin: 20,
    valueType: ArcGauge.VALUES_ACTUAL,
    width: "100%",
    height: "100%",

    innerRadius: 60,
    outerRadius: 93,
    markerInnerRadius: 95,
    markerOuterRadius: 100,
    
    goodColor: "rgb(50,200,50)",
    warningColor: "rgb(255,255,50)",
    dangerColor: "rgb(200,50,50)",
    markColor: "rgba(150, 150, 150, .8)",
    backgroundColor: "#333",
    textSize: 50,
    textColor: "#aaa",
    appendTo: "widgetBody" + widget.id
  });
};

WidgetManager.prototype._addWidgetHistoryToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this._getWidgetDragOverlay(widget) + 
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this._getWidgetControls(widget) + 
    '  </div>  ' +
    this._getWidgetTitle(widget) +
    '</div>');

  this.widgetControls[widget.id] = new ListGauge({
    value: 3, 
    goodMargin: 2,
    dangerMargin: 5,
    valueType: ListGauge.VALUES_INT,
    direction: ListGauge.DIRECTION_TOP_DOWN,

//    goodColor: "rgb(50,200,50)",
//    warningColor: "rgb(255,255,50)",
//    dangerColor: "rgb(200,50,50)",
    
    goodColor: "rgb(50,200,50)",
    warningColor: "rgb(200,200,50)",
    dangerColor: "rgb(200,50,50)",
    appendTo: "widgetBody" + widget.id
   });
};

WidgetManager.prototype._updateWidgetGraphDonutToDom = function(widget, data) {
  this.widgetControls[widget.id].load({
    columns: data
  });
};

WidgetManager.prototype._updateWidgetGraphChartToDom = function(widget, data, maxY) {
  this.widgetControls[widget.id].axis.max({y: maxY});  
  
  this.widgetControls[widget.id].load({
    columns: data
  });
};

WidgetManager.prototype._addWidgetGraphDonutToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this._getWidgetDragOverlay(widget) + 
    '  <div class="widget-body">' +
    this._getWidgetControls(widget) + 
    '    <div id="widgetBody' + widget.id + '" class="widget-content c3">' +
    '    </div>  ' +
    '  </div>  ' +
    this._getWidgetTitle(widget) +
    '</div>');

  this.widgetControls[widget.id] = c3.generate({
    bindto: '#widgetBody' + widget.id,
    data: {
      type: 'donut',
      columns: [
        ['data1', 1],
        ['data2', 1],
        ['data3', 1],
      ],
      names: {
        data1: 'Not Started', 
        data2: 'WIP', 
        data3: 'Done'
      },
      // labels: ['a', 'b', 'c'],
      // labels: true,
      colors: {
        data1: '#aa0000', 
        data2: '#ddaa00', 
        data3: '#00aa00'
      },
    },

    donut: {
      // title: "Story Points", 
      sort: false,
      expand: true, // ???
      width: 40,
      label: { 
        threshold: 0.12,
        format: function (d, a) { return d; },
        show: true 
      },
    },
    legend: {
      show: false
    },
  });
};
        
WidgetManager.prototype._addWidgetGraphChartToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this._getWidgetDragOverlay(widget) + 
    '  <div class="widget-body">' +
    this._getWidgetControls(widget) + 
    '    <div id="widgetBody' + widget.id + '" class="widget-content c3">' +
    '    </div>  ' +
    '  </div>  ' +
    this._getWidgetTitle(widget) +
    '</div>');
  this.widgetControls[widget.id] = c3.generate({
    bindto: '#widgetBody' + widget.id,
//      padding: {
//        top: 30,
//        right: 20,
//        bottom: 0,
//        left: 30,
//      },
      data: {
        xs: {
          'goal': 'goalx',
          'trend': 'trendx',
          'actual': 'actualx',
        },
        columns: [
          ['goal',  20,  0],
          ['goalx',  0, 10],
          ['trend', 20,  0],
          ['trendx', 0, 10],
          ['actual', ],
          ['actualx', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ],
        types: {
          // actual: 'area',
          // goal: 'area',  // some alpha is being applied automatically to area, need to turn off....
        },
//        regions: {
//          trend: [{
//            start: 0, 
//            style: 'dashed'
//          }],
//        },
        colors: {
          goal:   'rgba(100,100,100,1)', 
          trend:  'rgba(220,0,0,1)', 
          actual: 'rgba(20,130,230,1)'
        }
      },
      axis: {
        y: {
          show: false,
          padding: { top: 0, bottom: 0},
          max: 20,
          min: 0,
          ticks: 5
        },
        x: {
          show: false,
          padding: { left: 0, right: 0},
          max: 10,
          min: 0,
          tick: {
            fit: true,
            count: 3,
          
            // centered: false,
            // format: undefined,
            // culling: {},
            // culling_max: 2,
            // values: null,
            // rotate: undefined,
            // outer: true,
          
          },
        }
      },
      legend: {
        show: false
      },
      point: {
        show: false,
      },
      grid: {
        x: {
          type: 'tick',
          lines: [
            {value: 1, text: '1'},
            {value: 2, text: '2'},
            {value: 3, text: '3'},
            {value: 4, text: '4'},
            {value: 5, text: '5'},
            {value: 6, text: '6'},
            {value: 7, text: '7'},
            {value: 8, text: '8'},
            {value: 9, text: '9'},
            {value: 10, text: '10'},
          ],
          // show: true,
        },
//        y: {
//          type: 'tick',
//          lines: [
//            {value: 5, text: ''},
//            {value: 10, text: ''},
//            {value: 15, text: ''},
//            {value: 20, text: ''},
//          ],
//          // show: true,
//        }
      }
    });  
};


WidgetManager.prototype._getWidgetControls = function(widget) {
  return (
    '    <div class="widget-controls widget-controls-top">' +
    '      <button id="widgetBtnDelete' + widget.id + '" type="button" class="btn btn-default btn-sml btn-left config-buttons">' +
    '        <i class="fa fa-trash"></i>' +
    '      </button>' +
    '      <button id="widgetBtnProperties' + widget.id + '" type="button" class="btn btn-default btn-sml btn-right config-buttons">' +
    '        <i class="fa fa-sliders"></i>' +
    '      </button>' +
    '    </div>' +
    '    <div class="widget-controls widget-controls-bottom">' +
    '      <button id="widgetBtnLeft' + widget.id + '" type="button" class="btn btn-default btn-sml btn-left config-buttons">' +
    '        <i class="fa fa-chevron-left"></i>' +
    '      </button>' +
    '      <button id="widgetBtnRight' + widget.id + '" type="button" class="btn btn-default btn-sml btn-right config-buttons">' +
    '        <i class="fa fa-chevron-right"></i>' +
    '      </button>' +
    '    </div>');
};

WidgetManager.prototype._getWidgetTitle = function(widget) {
  return ('  <div class="widget-title">' +
    '    <span id="widgetTitleText' + widget.id + '" class="widget-title-text">' + widget.title + '</span>' +
    '  </div>');
};

WidgetManager.prototype._getWidgetDragOverlay = function(widget) {
  return ('<div class="widget-drag-overlay widget-drag-overlay-hidden"></div>');
};

WidgetManager.prototype.enableConfigMode = function() {
  $('.widget-drag-overlay').removeClass('widget-drag-overlay-hidden');
};

WidgetManager.prototype.disableConfigMode = function() {
  $('.widget-drag-overlay').addClass('widget-drag-overlay-hidden');
};