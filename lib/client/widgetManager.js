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
  this.__sendAddWidget(widget);
};

WidgetManager.prototype.updateWidget = function(widget) {
  this.__sendUpdateWidget(widget);
};

WidgetManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case Widget.MESSAGE_WIDGETS:
      this.__receivedWidgets(server, content);
      processed = true;
      break;

    case Widget.MESSAGE_ADD_WIDGET:
      this.__receivedAddWidget(server, new Widget(content));
      processed = true;
      break;

    case Widget.MESSAGE_DELETE_WIDGET:
      this.__receivedDeleteWidget(server, content);
      processed = true;
      break;

    case Widget.MESSAGE_UPDATE_WIDGET:
      this.__receivedUpdateWidget(server, new Widget(content));
      processed = true;
      break;
  }

  return processed;
};

WidgetManager.prototype.__receivedAddWidget = function(server, d) {
  this.__addWidgetToDom(d);
};

WidgetManager.prototype.__receivedDeleteWidget = function(server, id) {
  this.__removeWidgetFromDom(id);
};

WidgetManager.prototype.__receivedUpdateWidget = function(server, widget) {
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
      dataSource = this.dataSourceManager.getDataSourceById(this.widgets[i].dataSourceId);
      
      if(dataSource !== null) {
        this.__updateWidgetData(this.widgets[i], dataSource.type, data.details);
      }
    }
  }
};

WidgetManager.prototype.__updateWidgetData = function(widget, dataSourceType, data) {
  console.log("update widget data: " + dataSourceType);
  
  switch(dataSourceType) {
    case DataSource.TYPE_VERSION_ONE:
      this.__updateVersionOneWidget(widget, data);
      break;
      
    case DataSource.TYPE_JENKINS:
      this.__updateJenkinsWidget(widget, data);
      break;
      
    case DataSource.TYPE_SALES_FORCE:
      break;
      
    case DataSource.TYPE_INTERNAL:
      break;
  }
};

WidgetManager.prototype.__processJenkinsHistory = function(builds) {
  var list = [];
  var i = 0;
  var color = '';
  // value1 = data.builds[0].buildNumber;
  
  for(i = 0; i < builds.length; i++) {
    switch(builds[i].result) {
      // TODO: abstract out the success
      case "SUCCESS":
        color = 'green';
        break;

      case "FAILURE":
        color = 'red';
        break;

      case "ABORTED":
        color = 'grey';
        break;
    }
    
    list.push({value: builds[i].buildNumber, color: color});
  }
  
  return list;
}

WidgetManager.prototype.__updateJenkinsWidget = function(widget, data) {
  var value1 = 0;
  var value2 = 0;
  var value3 = 0;
  var color = 'green';
  var total = 0;
  var list = [];
  var i;
  
  console.log("widgetManager.__updateJenkinsWidget() type: " + widget.type + " style: " + widget.style + " -> " + JSON.stringify(data, null, " "));
  
  switch(widget.type) {
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_JENKINS].STATE.name:
      console.log("state widget");
      total = 100;
      value1 = data.progress;
      value2 = data.mostRecentBuildNumber;
      value3 = data.building ? '' : data.mostRecentBuildState;
      break;
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_JENKINS].HISTORY.name:
      console.log("history widget");
      list = this.__processJenkinsHistory(data.builds);
      break;
  }
  
  switch(widget.style) {
    case Widget.DISPLAY_TYPE_VALUE:
      console.log("update jenkins widget value");
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS_STATELESS:
      console.log("update jenkins widget progress stateless");
      this.__updateWidgetProgressStateless(widget, value1, value2, value3);
      break;
      
    case Widget.DISPLAY_TYPE_HISTORY:
      console.log("update jenkins widget history");
      this.__updateWidgetHistory(widget, list);
      break;
  }
};

WidgetManager.prototype.__updateVersionOneWidget = function(widget, data) {
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
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].BURN_DOWN.name:
      break;
  
    case DataSource.DISPLAY_OPTIONS[DataSource.TYPE_VERSION_ONE].BURN_UP.name:
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
      this.__updateWidgetValue(widget, value1);
      break;
      
    case Widget.DISPLAY_TYPE_STATE:
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS:
      this.__updateWidgetProgress(widget, value1, value2);
      break;
      
    case Widget.DISPLAY_TYPE_HISTORY:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_CHART:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_VERTICAL:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_HORIZONTAL:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_PIE:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_DONUT:
      this.__updateWidgetGraphDonutToDom(widget, [
        ['data1', value1],
        ['data2', value2],
        ['data3', value3],
      ]);
      break;
  }
};


WidgetManager.prototype.__receivedWidgets = function(server, d) {
  // TODO: test logic to remove existing data on DOM (needed for reconnection, but not supported)
  $("#widgetsGrid").empty();

  this.widgets = [];
  this.widgetControls = {};
  var widget = null;
  
  for (var item in d) {
    widget = new Widget(d[item]);
    this.widgets.push(widget);
    this.widgetsIndex.push(widget.id);
    this.__addWidgetToDom(widget);
  }
};

WidgetManager.prototype.__sendAddWidget = function(widget) {
  this.server.sendMessage(Widget.MESSAGE_ADD_WIDGET, widget);
};

WidgetManager.prototype.__sendDeleteWidget = function(id) {
  this.server.sendMessage(Widget.MESSAGE_DELETE_WIDGET, id);
};

WidgetManager.prototype.__sendUpdateWidget = function(widget) {
  this.server.sendMessage(Widget.MESSAGE_UPDATE_WIDGET, widget);
};

WidgetManager.prototype.__removeWidgetFromDom = function(id) {
  $('#widget' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
};

WidgetManager.prototype.__addWidgetToDom = function(widget) {
  switch(widget.style) {
    case Widget.DISPLAY_TYPE_VALUE:
      this.__addWidgetValueToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_STATE:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH_CHART:
      this.__addWidgetGraphChart(widget);
      break;

    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_VERTICAL:
      break;

    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_HORIZONTAL:
      break;

    case Widget.DISPLAY_TYPE_GRAPH_PIE:
      break;
          
    case Widget.DISPLAY_TYPE_GRAPH_DONUT:
      this.__addWidgetGraphDonutToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS:
      this.__addWidgetProgressToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS_STATELESS:
      this.__addWidgetProgressStatelessToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_HISTORY:
      this.__addWidgetHistoryToDom(widget);
      break;
  }
  
  // note, problem with d3 (used by c3) is that correct width is incorrectly calculated
  // to solve, trigger a resize when adding new elements
  // $('#widget' + widget.id).hide().fadeIn('fast').trigger('resize');
  $('#widget' + widget.id).trigger('resize');
    
  $('#widgetBtnDelete' + widget.id).on('click', function() {
    this.__sendDeleteWidget(widget.id);
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

WidgetManager.prototype.__addWidgetValueToDom = function(widget) {
  // TODO: appending the widget container to the panel appears to be identical, consolidate?
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this.__getWidgetDragOverlay(widget) + 
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
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

WidgetManager.prototype.__updateWidgetValue = function(widget, value) {
  this.widgetControls[widget.id].setValue(value);
};

WidgetManager.prototype.__updateWidgetProgress = function(widget, value, target) {
  this.widgetControls[widget.id].setTarget(target);
  this.widgetControls[widget.id].setValue(value);
};

WidgetManager.prototype.__updateWidgetProgressStateless = function(widget, value, buildNumber, state) {
  // this.widgetControls[widget.id].setTarget(target);
  console.log("update jenkins stateless, value: " + value + " build: " + buildNumber + " state: " + state);
  var color = '';
  
  switch(state) {
      case "SUCCESS":
        color = 'green';
        break;

      case "FAILURE":
        color = 'red';
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

WidgetManager.prototype.__updateWidgetHistory = function(widget, list) {
  var i = 0;
  
  for(i = 0; i < list.length; i++) {
    this.widgetControls[widget.id].pushValue(list[i].value, list[i].color);
  }
};

WidgetManager.prototype.__addWidgetProgressStatelessToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this.__getWidgetDragOverlay(widget) + 
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
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

WidgetManager.prototype.__addWidgetProgressToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this.__getWidgetDragOverlay(widget) + 
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
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

WidgetManager.prototype.__addWidgetHistoryToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this.__getWidgetDragOverlay(widget) + 
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
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
    
    goodColor: "rgb(100,100,100)",
    warningColor: "rgb(200,200,50)",
    dangerColor: "rgb(200,50,50)",
    appendTo: "widgetBody" + widget.id
   });
};

WidgetManager.prototype.__updateWidgetGraphDonutToDom = function(widget, data) {
  this.widgetControls[widget.id].load({
    columns: data
  });
};

WidgetManager.prototype.__addWidgetGraphDonutToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this.__getWidgetDragOverlay(widget) + 
    '  <div class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '    <div id="widgetBody' + widget.id + '" class="widget-content c3">' +
    '    </div>  ' +
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
    '</div>');

  this.widgetControls[widget.id] = c3.generate({
    bindto: '#widgetBody' + widget.id,
    data: {
      type: 'donut',
      columns: [
        ['data1', 1],
        ['data2', 2],
        ['data3', 4],
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
        
WidgetManager.prototype.__addWidgetGraphChart = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    this.__getWidgetDragOverlay(widget) + 
    '  <div class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '    <div id="widgetBody' + widget.id + '" class="widget-content c3">' +
    '    </div>  ' +
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
    '</div>');
  var burndownChart5 = c3.generate({
    bindto: '#widgetBody' + widget.id,
//      padding: {
//        top: 30,
//        right: 20,
//        bottom: 0,
//        left: 30,
//      },
      data: {
        columns: [
          ['goal',   20, 18, 16, 14, 12, 10, 8, 6, 4, 2, 0],
          ['trend',  20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10],
          ['actual', 20, 18, 17, 15, 17, 16, 15, 15],
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
          show: true,
          padding: { top: 0, bottom: 0},
          max: 20,
          min: 0,
          ticks: 5
        },
        x: {
          show: true,
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
            {value: 0, text: ''},
            {value: 5, text: ''},
            {value: 10, text: ''},
          ],
          // show: true,
        },
        y: {
          type: 'tick',
          lines: [
            {value: 5, text: ''},
            {value: 10, text: ''},
            {value: 15, text: ''},
            {value: 20, text: ''},
          ],
          // show: true,
        }
      }
    });  
};


WidgetManager.prototype.__getWidgetControls = function(widget) {
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

WidgetManager.prototype.__getWidgetTitle = function(widget) {
  return ('  <div class="widget-title">' +
    '    <span id="widgetTitleText' + widget.id + '" class="widget-title-text">' + widget.title + '</span>' +
    '  </div>');
};

WidgetManager.prototype.__getWidgetDragOverlay = function(widget) {
  return ('<div class="widget-drag-overlay widget-drag-overlay-hidden"></div>')
};

WidgetManager.prototype.enableConfigMode = function() {
  $('.widget-drag-overlay').removeClass('widget-drag-overlay-hidden');
};

WidgetManager.prototype.disableConfigMode = function() {
  $('.widget-drag-overlay').addClass('widget-drag-overlay-hidden');
};