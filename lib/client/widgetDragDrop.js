/* jshint browser: true, jquery: true */
/* global Panel:false, console:false, server:false */

var WidgetDragAndDrop = function(options) {
  if(options.server === null || options.server === undefined) {
    return null;
  }

  this.server = options.server;
  this.widgetManager = options.widgetManager;
  this.panelSelector = (options.panelSelector !== null && options.panelSelector !== undefined) ? options.panelSelector : ".panel";
  this.widgetSelector = (options.widgetSelector !== null && options.widgetSelector !== undefined) ? options.widgetSelector : ".widget";
  this.handle = (options.handle !== null && options.handle !== undefined) ? options.handle : ".widget-title";
  this.placeholderClass = (options.placeholderClass !== null && options.placeholderClass !== undefined) ? options.placeholderClass : ".widget-placeholder";
  this.doNotSelect = (options.doNotSelect !== null && options.doNotSelect !== undefined) ? options.doNotSelect : "";
  this.dragClass = (options.dragClass !== null && options.dragClass !== undefined) ? options.dragClass : "";
  
  this.panelId = '';
  this.dragWidget = null;
  this.newIndex = 0;
  
  this.applied = false;
};

WidgetDragAndDrop.prototype.disable = function() {
  if(this.applied) {
    $(this.panelSelector).sortable('disable');
  }
  $(this.handle).removeClass(this.dragClass);
};

WidgetDragAndDrop.prototype.enable = function() {
  $(this.handle).addClass(this.dragClass);
  if(!this.applied) {
    this.apply();
  }
  if(this.applied) {
    $(this.panelSelector).sortable('enable');
  }
};

/*
 * generate backend call here
 */
WidgetDragAndDrop.prototype._dragOccured = function() {
  this.widgetManager.sendMove($(this.dragWidget).data("id"), $(this.dragWidget).data("panel-id"), this.newIndex);
};

/*
 * end backend accept logic
 */
WidgetDragAndDrop.prototype.dragAccepted = function() {
  /*
   * The following is what is to be done if the backend accepts the request
   */
  // determine appropriate entry
  var rows = $("#" + this.panelId + ">div" + this.widgetSelector);
  
  // add after the correct position
  if(this.newIndex > this.oldIndex) {
    $(this.dragWidget).insertAfter("#" + rows[this.newIndex].id);
  } else {
    $(this.dragWidget).insertBefore("#" + rows[this.newIndex].id);
  }
};

WidgetDragAndDrop.prototype.apply = function() {
  $(this.panelSelector).sortable({
    connectWith: this.panelSelector,
    handle: this.handle,
    cancel: this.doNotSelect,
    placeholder: this.placeholderClass,
    disabled: true,
    
    beforeStop: this.beforeStopEvent.bind(this),
    update: function(event, ui) {this.updateEvent(event, ui);}.bind(this),
    stop: function(event, ui) {this.stopEvent(event, ui);}.bind(this),
  });
  this.applied = true;
};

WidgetDragAndDrop.prototype.stopEvent = function(event, ui) {
  // no newIndex means drop was not sucessful
  if(this.newIndex < 0) {
    return;
  }

  this.dragWidget = ui.item;
  this.oldIndex = ui.item.index();
  
  // TODO: add timer to wait for accept response from back end and reverse if not accepted
//  $(event.target).sortable('cancel');
  
  this._dragOccured();
};

WidgetDragAndDrop.prototype.beforeStopEvent = function(event, ui) {
  // called irrespective of moving or not between div/lists
  this.panelId = event.target.id;
  this.newIndex = -1;
};

WidgetDragAndDrop.prototype.updateEvent = function(event, ui) {
  // update action fires twice (presume from/to), but index always equals the drop location 
  this.newIndex = ui.item.index();
};