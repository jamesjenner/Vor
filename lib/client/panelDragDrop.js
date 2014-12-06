/* jshint browser: true, jquery: true */
/* global Panel:false, console:false, server:false */

var PanelDragAndDrop = function(server, columnSelector, panelSelector, handle, placeholder) {
  if(server === null) {
    return null;
  }

  this.server = server;
  this.columnSelector = (columnSelector !== null && columnSelector !== undefined) ? columnSelector : ".column";
  this.panelSelector = (panelSelector !== null && panelSelector !== undefined) ? panelSelector : ".panel";
  this.handle = (handle !== null && handle !== undefined) ? handle : ".panel-heading";
  this.placeholder = (placeholder !== null && placeholder !== undefined) ? placeholder : ".panel-placeholder";
  
  this.sourceColumnId = '';
  this.targetColumnId = '';
  this.dragPanel = null;
  this.newIndex = 0;
  this.movingColumns = false;
};

/*
 * generate backend call here
 */
PanelDragAndDrop.prototype._dragOccured = function() {
  
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
    $( ".column" ).sortable({
      connectWith: ".column",
      handle: ".panel-heading",
      cancel: ".panel-toggle",
      placeholder: "panel-placeholder",
//  $(this.columnSelector).sortable({
//    connectWith: this.columnSelector,
//    handle: this.handle,
//    cancel: ".panel-toggle",
//    placeholder: this.placeholder,

      out: function() { 
        console.log("out");
      },
    beforeStop: this.beforeStopEvent.bind(this),
    remove: function(event, ui) {this.removeEvent(event, ui);}.bind(this),
    update: function(event, ui) {this.updateEvent(event, ui);}.bind(this),
    stop: function(event, ui) {this.stopEvent(event, ui);}.bind(this),
  });
};

PanelDragAndDrop.prototype.stopEvent = function(event, ui) {
  // no newIndex means drop was not sucessful
  if(this.newIndex < 0) {
    return;
  }

  this.dragPanel = ui.item;
  
  $(event.target).sortable('cancel');
  
  this._dragOccured();
};

PanelDragAndDrop.prototype.beforeStopEvent = function(event, ui) {
  // called irrespective of moving or not between div/lists
  this.sourceColumnId = event.target.id;
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