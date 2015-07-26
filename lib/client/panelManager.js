/* jshint browser: true, jquery: true */
/* global Panel:false, console:false, server:false, addWidget:false */

var PanelManager = function(options) {
  this.panels = [];
  this.columns = 1;
  this.rows = 2;
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
      this._receivedMove(server, new Panel(content));
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

PanelManager.prototype.determineNextPanelPosition = function () {
  var rows = [];
  var minRow = 99999;
  var maxRow = 0;
  var row = 0;
  var column = 1;
  var i;
  
  for (i = 0; i < this.columns; i++) {
    rows.push(0);
  }
  
  for (i in this.panels) {
    rows[this.panels[i].column - 1]++;
  }
  
  var newRow = false;
  column = 1;
  
  for (i = 0; i < rows.length; i++) {
    if(minRow > rows[i]) {
      minRow = rows[i];
      column = i + 1;
    }
    if(maxRow < rows[i]) {
      maxRow = rows[i];
    }
  }
  
  if (minRow === maxRow) {
    row = maxRow + 1;
    column = 1;
  } else {
    row = minRow;
  }
  
  return {row: row, col: column};
};

PanelManager.prototype._addDefaultWidgets = function(panel, dataSourceType) {
  var i;
  var dataSourceId = '';
  var widgets = [];
  
  for(i = 0; i < dataSourceManager.dataSources.length; i++) {
    if(dataSourceManager.dataSources[i].type === dataSourceType) {
      dataSourceId = dataSourceManager.dataSources[i].id;
      break;
    }
  }
  
  widgets = DataSource.getDefaultPanels(dataSourceType, panel.id, dataSourceId, panel.defaultDataElement);
  
  for(i = 0; i < widgets.length; i++) {
    widgetManager.addWidget(widgets[i]);
  }
};

PanelManager.prototype._receivedAdd = function(server, panel) {
  if(configMode) {
    removePanelAddPane();
  }
  this._addToDom(panel, this.addMode);
  this.panels.push(panel);
  this.panelsIndex.push(panel.id);
  
  switch(panel.style) {
    case Panel.STYLE_AGILE:
      this._addDefaultWidgets(panel, DataSource.TYPE_VERSION_ONE);
      break;
      
    case Panel.STYLE_CI:
      this._addDefaultWidgets(panel, DataSource.TYPE_JENKINS);
      break;
  }
  
  this.dragAndDrop.apply();
  
  if(this.addMode) {
    this.dragAndDrop.enable();
  }
  if(configMode) {
    addPanelAddPane();
  }
  
  displayStatusMessage("The panel has been added", "Panels");
};

PanelManager.prototype._receivedDelete = function(server, id) {
  if(configMode) {
    removePanelAddPane();
  }
  
  this._deleteFromDom(id);
  
  var idx = this.panelsIndex.indexOf(id);
  if(idx > -1) {
    this.panelsIndex.splice(idx, 1);
    this.panels.splice(idx, 1);
  }
  
  if(configMode) {
    addPanelAddPane();
  }
  
  displayStatusMessage("The panel has been removed", "Panels");
};

PanelManager.prototype._receivedMove = function(server, panel) {
  this._moveOnDom(panel);
  var idx = this.panelsIndex.indexOf(panel.id);
  if(idx > -1) {
    this.panels[idx] = panel;
  }
  addPanelAddPane();
  displayStatusMessage("The panel move has been recorded", "Panels");
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
  
  var idx = this.panelsIndex.indexOf(panel.id);
  if(idx > -1) {
    this.panels[idx] = panel;
  }
};

PanelManager.prototype.preferencesChanged = function(systemPreferences) {
  var column;
  
  if(this.columns !== systemPreferences.columns) {
    if(this.columns > systemPreferences.columns) {
      this._removeColumnsOnDom(this.columns, systemPreferences.columns);
    } else {
      this._updateColumnsOnDom(this.columns, systemPreferences.columns);

      this.dragAndDrop.apply();
    }

    this.columns = systemPreferences.columns;
  }
  
  if(this.rows !== systemPreferences.rows) {
    this.rows = systemPreferences.rows;
  }
};

PanelManager.prototype._receivedContent = function(server, d) {
  var panelsArray = [];
  var item;
  var column;
  
  // remove content from home pane
  $("#panelsPane").empty();
  
  // add columns as defined in preferences
  this.columns = preferenceManager.getSystemPreference().columns;
  this.rows = preferenceManager.getSystemPreference().rows;

  for (column = 1; column <= this.columns; column++) {
    this._addColumnToDom(column, this.columns);
  }
  
  for (item in d) {
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
    this.panels.push(p);
    this.panelsIndex.push(p.id);
  }.bind(this));
  
  this.dragAndDrop.apply();
};

PanelManager.prototype._addColumnToDom = function(column, columns) {
  var columnClass = this._getColumnWidthClass(columns);
  if(column === 1) {
    $("#panelsPane").append('<div id="column' + column + '" class="column-main column-left col-sx-12 ' + columnClass + '"> </div>');
  } else {
    $("#panelsPane").append('<div id="column' + column + '" class="column-main col-sx-12 ' + columnClass + '"> </div>');
  }
};

PanelManager.prototype._updateColumnsOnDom = function(oldColumnCount, newColumnCount) {
  var column = 0;
  var oldColumnClass = this._getColumnWidthClass(oldColumnCount);
  var newColumnClass = this._getColumnWidthClass(newColumnCount);
  
  var selection = $("#panelsPane ." + oldColumnClass);
  selection.removeClass(oldColumnClass);
  selection.addClass(newColumnClass);
  
  for(column = oldColumnCount + 1; column <= newColumnCount; column++) {
    $("#panelsPane").append('<div id="column' + column + '" class="column col-sx-12 ' + newColumnClass + '"> </div>');
  }
};

PanelManager.prototype._removeColumnsOnDom = function(oldColumnCount, newColumnCount) {
  for(column = oldColumnCount; column > newColumnCount; column--) {
    $("#column" + column).remove();
  }
  
  var oldColumnClass = this._getColumnWidthClass(oldColumnCount);
  var newColumnClass = this._getColumnWidthClass(newColumnCount);
  
  var selection = $("#panelsPane ." + oldColumnClass);
  selection.removeClass(oldColumnClass);
  selection.addClass(newColumnClass);
};


PanelManager.prototype._getColumnWidthClass = function(columns) {
  var columnClass;
  
  switch(columns) {
    case 1:
      columnClass = "col-md-12";
      break;
      
    case 2:
      columnClass = "col-md-6";
      break;
      
    case 3:
      columnClass = "col-md-4";
      break;
      
    case 4:
      columnClass = "col-md-3";
      break;
      
    default:
      columnClass = "col-md-12";
  }
  
  return columnClass;
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

PanelManager.prototype._addToDom = function(panel, buttonsVisible) {
  var displayButtonClass = buttonsVisible ? "displayButton" : "";
  var displayStyle = buttonsVisible ? "block" : "none";
  var panelClass = "panel";
  
  if(this.columns === 1) {
    panelClass += " panel-left panel-left";
  } else if(panel.column === 1) {
    panelClass += " panel-left";
  } else if(panel.column === this.columns) {
    panelClass += " panel-right";
  }
  
  //$("#columnContainer" + panel.column).append(
  $("#column" + panel.column).append(
    '<div id="panel' + panel.id + '" class="' + panelClass + '" ' + 
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
    '        <button id="panelBtnDelete' + panel.id + '" type="button" class="config-buttons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-trash"></i>' +
    '        </button>' +
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

