/* jshint browser: true, jquery: true */
/* global Panel:false, console:false, server:false */

var PanelDragAndDrop = function(options) {
  if(options.server === null || options.server === undefined) {
    return null;
  }

  this.panelManager = options.panelManager;
  this.server = options.server;
  this.columnSelector = (options.columnSelector !== null && options.columnSelector !== undefined) ? options.columnSelector : ".column-main";
  this.panelSelector = (options.panelSelector !== null && options.panelSelector !== undefined) ? options.panelSelector : ".panel";
  this.handle = (options.handle !== null && options.handle !== undefined) ? options.handle : ".panel-heading";
  this.placeholderClass = (options.placeholderClass !== null && options.placeholderClass !== undefined) ? options.placeholderClass : ".panel-placeholder";
  this.doNotSelect = (options.doNotSelect !== null && options.doNotSelect !== undefined) ? options.doNotSelect : "";
  this.dragClass = (options.dragClass !== null && options.dragClass !== undefined) ? options.dragClass : "";
  
  this.sourceColumnId = '';
  this.targetColumnId = '';
  this.dragPanel = null;
  this.newIndex = 0;
  this.movingColumns = false;
  
  this.applied = false;
};

PanelDragAndDrop.prototype.disable = function() {
  if(this.applied) {
    $(this.columnSelector).sortable('disable');
  }
  $(this.handle).removeClass(this.dragClass);
};

PanelDragAndDrop.prototype.enable = function() {
  $(this.handle).addClass(this.dragClass);
  if(this.applied) {
    $(this.columnSelector).sortable('enable');
  }
};

/*
 * generate backend call here
 */
PanelDragAndDrop.prototype._dragOccured = function() {
  var fromPanel = this._determineColumn(this.sourceColumnId);
  var toPanel = this._determineColumn(this.targetColumnId);
  
  if(this.movingColumns) {
    
  }
  
  this.panelManager.sendMove($(this.dragPanel).data("id"), fromPanel, toPanel, this.newIndex);
};

PanelDragAndDrop.prototype._determineColumn = function(columnId) {
  
  var column = 1;
  var prefix = "column".length;
  
  if(columnId.length > prefix) {
    column = parseInt(columnId.substr(prefix));
  }
  
  return column;
};

/*
 * end backend accept logic
 */
PanelDragAndDrop.prototype.dragAccepted = function() {
  /*
   * The following is what is to be done if the backend accepts the request
   */
  var column = this.movingColumns ? this.targetColumnId : this.sourceColumnId;

  if(this.newIndex > 0) {
    // determine appropriate entry
    var rows = $("#" + column + ">div" + this.panelSelector);

    if(this.movingColumns) {
      // we want the panel before the drop point, for different row this requires adjustment 
      this.newIndex--;
    }

    // add after the correct position
    $(this.dragPanel).insertAfter("#" + rows[this.newIndex].id);
  } else {
    $(this.dragPanel).prependTo("#" + column);
  }
};

PanelDragAndDrop.prototype.apply = function() {
  $(this.columnSelector).sortable({
    connectWith: this.columnSelector,
    handle: this.handle,
    cancel: this.doNotSelect,
    placeholder: this.placeholderClass,
    disabled: true,
    
    beforeStop: this.beforeStopEvent.bind(this),
    remove: function(event, ui) {this.removeEvent(event, ui);}.bind(this),
    update: function(event, ui) {this.updateEvent(event, ui);}.bind(this),
    start: function(event, ui) {this.startEvent(event, ui);}.bind(this),
    stop: function(event, ui) {this.stopEvent(event, ui);}.bind(this),
  });
  this.applied = true;
};

PanelDragAndDrop.prototype.startEvent = function(event, ui) {
  removePanelAddPane();
};

PanelDragAndDrop.prototype.stopEvent = function(event, ui) {
  // no newIndex means drop was not sucessful
  if(this.newIndex < 0) {
    return;
  }

  this.dragPanel = ui.item;
  
  // TODO: add timer to wait for accept response from back end and reverse if not accepted
//  $(event.target).sortable('cancel');
  
  this._dragOccured();
};

PanelDragAndDrop.prototype.beforeStopEvent = function(event, ui) {
  // called irrespective of moving or not between div/lists
  this.sourceColumnId = event.target.id;
  this.targetColumnId = this.sourceColumnId;
  this.movingColumns = false;
  this.newIndex = -1;
};

PanelDragAndDrop.prototype.removeEvent = function(event, ui) {
  // only occurs when moving between divs/lists, event.target is the column removing from
  this.movingColumns = true;
};

PanelDragAndDrop.prototype.updateEvent = function(event, ui) {
  // update action fires twice (presume from/to), but index always equals the drop location 
  this.newIndex = ui.item.index();

  if(ui.sender !== undefined && ui.sender !== null) {
    this.targetColumnId = event.target.id;
  }
};