/* jshint browser: true, jquery: true */
/* global Widget:false, console:false, server:false, viewWidgetWizard:false, ArcGauge:false, c3:false */

// TODO: widgetStyle is incorrect value on modify

var WidgetManager = function(options) {
  this.widgets = [];
  this.widgetsIndex = [];
  this.server = null;
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
  console.log(JSON.stringify(data, null, ' '));
  for(var i = 0; i < this.widgets.length; i++) {
    if(this.widgets[i].keyDataElement === data.keyDataElement) {
      console.log("updating widget: " + this.widgets[i].title);
    }
  }
};


WidgetManager.prototype.__receivedWidgets = function(server, d) {
  // TODO: test logic to remove existing data on DOM (needed for reconnection, but not supported)
  $("#widgetsGrid").empty();

  this.widgets = [];
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
      
    case Widget.DISPLAY_TYPE_HISTORY:
      break;
  }
  
  $('#widget' + widget.id).hide().fadeIn('fast');
    
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
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '    <span id="widgetValue' + 0 + '" class="widget-content widget-bad">2</span>' +
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
    '</div>');
};

WidgetManager.prototype.__addWidgetProgressToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
    '</div>');

  new ArcGauge({
    value: 40, 
    minValue: 0,
    maxValue: 100,
    goodMargin: 5,
    dangerMargin: 20,
    valueType: ArcGauge.VALUES_ACTUAL,
    target: 50,
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
    textSize: 60,
    textColor: "#aaa",
    appendTo: "widgetBody" + widget.id
  });
};

WidgetManager.prototype.__addWidgetGraphDonutToDom = function(widget) {
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    '  <div class="widget-body">' +
    this.__getWidgetControls(widget) + 
    '    <div id="widgetBody' + widget.id + '" class="widget-content c3">' +
    '    </div>  ' +
    '  </div>  ' +
    this.__getWidgetTitle(widget) +
    '</div>');

  c3.generate({
    bindto: '#widgetBody' + widget.id,
    data: {
      type: 'donut',
      columns: [
        ['data1', 10],
        ['data2', 20],
        ['data3', 40],
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
      title: "Story Points", 
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

