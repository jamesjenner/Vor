/* jshint browser: true, jquery: true */
/* global Panel:false, console:false, server:false, addWidget:false */

var PanelManager = function(options) {
  this.panels = [];
  this.panelsIndex = [];
  this.server = null;
  this.addMode = false;
  this.dragAndDrop = null;
};

PanelManager.prototype.getByName = function(name) {
  var panel = null;
  
  for(var i = 0; i < this.panels.length; i++) {
    if(this.panels[i].name === name) {
      panel = this.panels[i];
      break;
    }
  }
  
  return panel;
};

PanelManager.prototype.getById = function(id) {
  var panel = null;
  
  var idx = this.panelsIndex.indexOf(id);

  if(idx > -1) {
    panel = this.panels[idx];
  }
  
  return panel;
};


PanelManager.prototype.add = function(panel) {
  this._sendAdd(panel);
};

PanelManager.prototype.update = function(panel) {
  this._sendUpdate(panel);
};

PanelManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case Panel.MESSAGE_PANELS:
      this._receivedContent(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_ADD_PANEL:
      this._receivedAdd(server, new Panel(content));
      processed = true;
      break;

    case Panel.MESSAGE_DELETE_PANEL:
      this._receivedDelete(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_UPDATE_PANEL:
      this._receivedUpdate(server, new Panel(content));
      processed = true;
      break;
      
    case Panel.MESSAGE_MOVE_PANEL:
      this._receivedMove(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL_UP:
      this._receivedMoveUp(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL_DOWN:
      this._receivedMoveDown(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL_LEFT:
      this._receivedMoveLeft(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL_RIGHT:
      this._receivedMoveRight(server, content);
      processed = true;
      break;
  }

  return processed;
};

PanelManager.prototype._receivedAdd = function(server, d) {
  this._addToDom(d, this.addMode);
  
  this.dragAndDrop.apply();
  
  if(this.addMode) {
    this.dragAndDrop.enable();
  }
  
};

PanelManager.prototype._receivedDelete = function(server, id) {
  this._deleteFromDom(id);
};

PanelManager.prototype._receivedMove = function(server, content) {
  this._moveOnDom(content);
};

PanelManager.prototype._receivedMoveUp = function(server, id) {
  this._moveUpOnDom(id);
};

PanelManager.prototype._receivedMoveDown = function(server, id) {
  this._moveDownOnDom(id);
};

PanelManager.prototype._receivedMoveLeft = function(server, panel) {
  this._changeColumnOnDom(panel);
};

PanelManager.prototype._receivedMoveRight = function(server, panel) {
  this._changeColumnOnDom(panel);
};

PanelManager.prototype._receivedUpdate = function(server, panel) {
  // get current data
  var currentPanelElement = $('#panel' + panel.id);
  
  var currentPanel = new Panel(currentPanelElement.data());
  
  // apply changes to DOM
  if(currentPanel.name !== panel.name) {
    $('#panelName' + panel.id).text(panel.name);
    currentPanelElement.data('name', panel.name);
  }

// ignore this for now, presume that only via move left/right that this can happen
//  if(currentPanel.column !== panel.column) {
//    
//  }
  
  if(currentPanel.iconName !== panel.iconName) {
    $('#panelIcon' + panel.id).removeClass(currentPanel.iconName).addClass(panel.iconName);
    currentPanelElement.data('icon-name', panel.iconName);
  }
};

PanelManager.prototype._receivedContent = function(server, d) {
  // TODO: logic to handle resend of panels
  // $(".panelRow").remove();

  var panelsArray = [];
  
  for (var item in d) {
   panelsArray.push(new Panel(d[item]));
  }

  panelsArray.sort(function (a, b) {
      if (a.row < b.row) {
          return -1;
      } else if (a.row > b.row) {
          return 1;
      }
      return 0;
  });

  panelsArray.forEach(function (p) {
    this._addToDom(p, this.addMode);
  }.bind(this));
  
  this.dragAndDrop.apply();
};

PanelManager.prototype._sendAdd = function(panel) {
  this.server.sendMessage(Panel.MESSAGE_ADD_PANEL, panel);
};

PanelManager.prototype._sendDelete = function(id) {
  this.server.sendMessage(Panel.MESSAGE_DELETE_PANEL, id);
};

PanelManager.prototype._sendUpdate = function(panel) {
  this.server.sendMessage(Panel.MESSAGE_UPDATE_PANEL, panel);
};

PanelManager.prototype.sendMove = function(panelId, sourceColumn, targetColumn, row) {
  this.server.sendMessage(Panel.MESSAGE_MOVE_PANEL, {
    id: panelId, 
    sourceColumn: sourceColumn,
    targetColumn: targetColumn,
    row: row
  });
};

//PanelManager.prototype._sendMoveUp = function(id) {
//  this.server.sendMessage(Panel.MESSAGE_MOVE_PANEL_UP, id);
//};
//
//PanelManager.prototype._sendMoveDown = function(id) {
//  this.server.sendMessage(Panel.MESSAGE_MOVE_PANEL_DOWN, id);
//};
//
//PanelManager.prototype._sendMoveLeft = function(id) {
//  this.server.sendMessage(Panel.MESSAGE_MOVE_PANEL_LEFT, id);
//};
//
//PanelManager.prototype._sendMoveRight = function(id) {
//  this.server.sendMessage(Panel.MESSAGE_MOVE_PANEL_RIGHT, id);
//};

PanelManager.prototype._addToDom = function(panel, buttonsVisible) {
  var displayButtonClass = buttonsVisible ? "displayButton" : "";
  var displayStyle = buttonsVisible ? "block" : "none";

  //$("#columnContainer" + panel.column).append(
  $("#column" + panel.column).append(
    '<div id="panel' + panel.id + '" class="panel" ' + 
      'data-id="' + panel.id + '" ' +
      'data-name="' + panel.name + '" ' +
      'data-icon-name="' + panel.iconName + '" ' +
      'data-icon-type="' + panel.iconType + '" ' +
      'data-width="' + panel.width + '">' +
    '  <div class="panel-heading">' +
    '      <div class="panel-controls btn-group pull-right">' +
    '        <button id="panelBtnAddWidget' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-plus "></i>' +
    '        </button>' +
//    '        <button id="panelBtnRemoveWidget' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
//    '          <i class="fa fa-minus"></i>' +
//    '        </button>' +
    '        <button id="panelBtnDelete' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-trash"></i>' +
    '        </button>' +
//    '        <button id="panelBtnMoveDown' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
//    '          <i class="fa fa-chevron-down"></i>' +
//    '        </button>' +
//    '        <button id="panelBtnMoveUp' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
//    '          <i class="fa fa-chevron-up"></i>' +
//    '        </button>' +
//    '        <button id="panelBtnMoveLeft' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
//    '          <i class="fa fa-chevron-left"></i>' +
//    '        </button>' +
//    '        <button id="panelBtnMoveRight' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
//    '          <i class="fa fa-chevron-right"></i>' +
//    '        </button>' +
    '        <button id="panelBtnModify' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-sliders"></i>' +
    '        </button>' +
    '      </div>' +
    '    <i id="panelIcon' + panel.id + '" class="fa ' + panel.iconName + ' fa-lg"></i> <span id="panelName' + panel.id + '">' + panel.name + '</span>' +
    '  </div>' +
    '  <div id="panelBody' + panel.id + '" class="widget-container">' +
    '  </div>' +
    '</div>'
  );
  
  $('#panel' + panel.id).hide().fadeIn('slow');
  
  $('#panelBtnAddWidget' + panel.id).on('click', function() {
    viewWidgetWizard('add', {}, panel.id);
  }.bind(this));
    
  $('#panelBtnDelete' + panel.id).on('click', function() {
    this._sendDelete(panel.id);
  }.bind(this));
    
//  $('#panelBtnMoveDown' + panel.id).on('click', function() {
//    this._sendMoveDown(panel.id);
//  }.bind(this));
//    
//  $('#panelBtnMoveUp' + panel.id).on('click', function() {
//    this._sendMoveUp(panel.id);
//  }.bind(this));
//    
//  $('#panelBtnMoveLeft' + panel.id).on('click', function() {
//    this._sendMoveLeft(panel.id);
//  }.bind(this));
//    
//  $('#panelBtnMoveRight' + panel.id).on('click', function() {
//    this._sendMoveRight(panel.id);
//  }.bind(this));
//  
  
  $('#panelBtnModify' + panel.id).on('click', function() {
    displayPanelDialog('update', panel);
  }.bind(this));
};

PanelManager.prototype._deleteFromDom = function(id) {
  $('#panel' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
};

PanelManager.prototype._moveOnDom = function(content) {
  // TODO: only update if a timer expires before update panel response is received
  // this is due to flickering if we cancel the drag event and wait for backend to confirm
  
//  content.panelId
//  content.sourceColumn
//  content.targetColumn
//  var row = content.row;
//  
//  if(row > 0) {
//    // determine appropriate entry
//    var rows = $("#" + "column" + content.targetColumn + ">div" + ".panel");
//
//    if(content.sourceColumn !== content.targetColumn) {
//      // we want the panel before the drop point, for different row this requires adjustment
//      row--;
//    }
//
//    // add after the correct position
//    $('#panel' + content.id).insertAfter("#" + rows[row].id);
//  } else {
//    $('#panel' + content.id).prependTo("#" + "column" + content.targetColumn);
//  }
};

PanelManager.prototype._moveDownOnDom = function(id) {
  var panelList = this._getList(id);
  
  if(panelList['panel' + id].position < (Object.keys(panelList).length - 1)) {
    // move down
    this._swapVertically(panelList['panel' + id].id, panelList['panel' + id].nextId);
  }
};

PanelManager.prototype._moveUpOnDom = function(id) {
  var panelList = this._getList(id);
  
  if(panelList['panel' + id].position > 0) {
    // move up
    this._swapVertically(panelList['panel' + id].id, panelList['panel' + id].prevId);
  }
};

PanelManager.prototype._changeColumnOnDom = function(panelData) {
  var panel = $('#panel' + panelData.id);
  
  $('#panel' + panelData.id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "fast", queue: false})
    .fadeOut('fast', function() {
      panel
        .appendTo("#columnContainer" + panelData.column)
        .hide()
        .css('height', '')
        .css('padding', '')
        .css('margin', '')
        .fadeIn('fast');
      
  });
};

PanelManager.prototype._getList = function(id) {
  var prevPanel = null;
  var nextPanel = null;
  var counter = 0;
  var panelList = {};
  
  $('#panel' + id).parent().children().each(function() { 
    panelList[$(this).attr('id')] = {
      id: $(this).attr('id'), 
      position: counter++, 
      value: this, 
      prevId: null, 
      nextId: null
    };
    
    if(prevPanel !== null) {
      panelList[$(this).attr('id')].prevId = prevPanel.id;
      prevPanel.nextId = $(this).attr('id');
    }
    
    prevPanel = panelList[$(this).attr('id')];
  });

  return panelList;
};

PanelManager.prototype._swapVertically = function(a, b){ 
    a = $('#' + a)[0]; 
    b = $('#' + b)[0]; 
  
    var t = a.parentNode.insertBefore(document.createTextNode(''), a); 
  
    b.parentNode.insertBefore(a, b); 
    t.parentNode.insertBefore(b, t); 
    t.parentNode.removeChild(t); 
};

