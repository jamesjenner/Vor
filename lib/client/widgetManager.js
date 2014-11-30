/* jshint browser: true, jquery: true */
/* global Widget:false, console:false, server:false, viewWidgetWizard:false */

function addWidget(widget) {
  // TODO: determine the correct row (row of last element for column + 1)
  sendAddWidget(widget);
}

function updateWidget(widget) {
  // TODO: determine the correct row (row of last element for column + 1)
  sendUpdateWidget(widget);
}

function processWidgetMessages(server, id, content) {
  var processed = false;

  switch (id) {
    case Widget.MESSAGE_WIDGETS:
      receivedWidgets(server, content);
      processed = true;
      break;

    case Widget.MESSAGE_ADD_WIDGET:
      receivedAddWidget(server, new Widget(content));
      processed = true;
      break;

    case Widget.MESSAGE_DELETE_WIDGET:
      receivedDeleteWidget(server, content);
      processed = true;
      break;

    case Widget.MESSAGE_UPDATE_WIDGET:
      receivedUpdateWidget(server, new Widget(content));
      processed = true;
      break;
  }

  return processed;
}

function receivedAddWidget(server, d) {
  addWidgetToDom(d);
}

function receivedDeleteWidget(server, id) {
  deleteWidget(id);
}

function receivedUpdateWidget(server, widget) {
  var idx = widgetsIndex.indexOf(widget.id);
  var currentWidget = null;
  
  if(idx < 0) {
    widgets.push(widget);
    widgetsIndex.push(widget.id);
  } else {
    currentWidget = widgets[idx];
    widgets[idx] = widget;
    
    if(currentWidget.name !== widget.name) {
      $('#widgetRowName' + widget.id).text(widget.name);
    }
    if(currentWidget.type !== widget.type) {
      $('#widgetRowType'  + widget.id).text(widget.type);
    }
  }
}

function receivedWidgets(server, d) {
  // TODO: test logic to remove existing data on DOM (needed for reconnection, but not supported)
  $("#widgetsGrid").empty();

  widgets = [];
  var widget = null;
  
  for (var item in d) {
    widget = new Widget(d[item]);
    widgets.push(widget);
    widgetsIndex.push(widget.id);
    addWidgetToDom(widget);
  }
}

// TODO: sort out this global
var widgets = [];
var widgetsIndex = [];

function sendAddWidget(widget) {
  server.sendMessage(Widget.MESSAGE_ADD_WIDGET, widget);
}

function sendDeleteWidget(id) {
  server.sendMessage(Widget.MESSAGE_DELETE_WIDGET, id);
}

function sendUpdateWidget(widget) {
  server.sendMessage(Widget.MESSAGE_UPDATE_WIDGET, widget);
}

function addWidgetToDom(widget) {
  switch(widget.type) {
    case Widget.DISPLAY_TYPE_VALUE:
      addWidgetValueToDom(widget);
      break;
      
    case Widget.DISPLAY_TYPE_STATE:
      break;
      
    case Widget.DISPLAY_TYPE_GRAPH:
      switch(widget.graphType) {
        case Widget.GRAPH_CHART:
          break;
          
        case Widget.GRAPH_SINGLE_BAR_VERTICAL:
          break;
          
        case Widget.GRAPH_SINGLE_BAR_HORIZONTAL:
          break;
          
        case Widget.GRAPH_PIE:
          break;
          
        case Widget.GRAPH_DONUT:
          break;
      }
      break;
      
    case Widget.DISPLAY_TYPE_PROGRESS:
      break;
      
    case Widget.DISPLAY_TYPE_HISTORY:
      break;
  }
  
  $('#widget' + widget.id).hide().fadeIn('fast');
    
  $('#widgetBtnDelete' + widget.id).on('click', function() {
    sendDeleteWidget(widget.id);
  });
    
  $('#widgetBtnLeft' + widget.id).on('click', function() {
    sendMoveWidgetLeft(widget.id);
  });
    
  $('#widgetBtnRight' + widget.id).on('click', function() {
    sendMoveWidgetRight(widget.id);
  });
  
  $('#widgetBtnProperties' + widget.id).on('click', function() {
    displayWidgetDialog('update', widget);
  });
}

function addWidgetValueToDom(widget) {
  
  $("#panelBody" + widget.panelId).append(
    '<div id="widget' + widget.id + '" class="widget">' +
    '  <div id="widgetBody' + widget.id + '" class="widget-body">' +
    getWidgetControls(widget) + 
    '    <span id="widgetValue' + 0 + '" class="widget-content widget-bad">2</span>' +
    '  </div>  ' +
    getWidgetTitle(widget) +
    '</div>');
}

function getWidgetControls(widget) {
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
}

function getWidgetTitle(widget) {
  return ('  <div class="widget-title">' +
    '    <span id="widgetTitleText' + widget.id + '" class="widget-title-text">' + widget.title + '</span>' +
    '  </div>');
}

function deleteWidget(id) {
  $('#widget' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
}