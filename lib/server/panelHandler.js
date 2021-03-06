/*jlint node: true */
/*global require, console, module, __dirname */
/*
 * panelHandler.js
 *
 * Copyright (C) 2014 by James Jenner
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

var MeltingPot = require('meltingpot');

var Panel = require('../shared/panel.js');
var fs = require('fs');

module.exports = PanelHandler;

// util.inherits(Comms, EventEmitter);

PanelHandler.PANELS_FILE = 'panels.json';

function PanelHandler(options) {
  this.dataDirectory = ((options.dataDirectory !== null && options.dataDirectory !== undefined) ? options.dataDirectory : './');
  this.preferenceHandler = ((options.dataDirectory !== null && options.preferenceHandler !== undefined) ? options.preferenceHandler : function(){});
  this.widgetHandler = ((options.widgetHandler !== null && options.widgetHandler !== undefined) ? options.widgetHandler : null);

  // EventEmitter.call(this);
  this.panels = [];
  this._load();
  this.maxColumns = 2;
  
  // rows start at 0 while columns start at 1, a tad confusing
  
  // TODO: add logic to support a settings/property for max columns
  
  // TODO: add log/debug logic
}

PanelHandler.prototype.addPanel = function (data) {
  var panel = new Panel(data);

  var nextPosition = this._determineNextPanelPosition();
  
  panel.row = nextPosition.row;
  panel.column = nextPosition.col;
  
  
  this.panels.push(panel);

  this._save();

  return panel;
};

PanelHandler.prototype.movePanel = function(data) {
  var panel = null;
  var idx;
//    id: panelId, 
//    sourceColumn: sourceColumn,
//    targetColumn: targetColumn,
//    row: row
  
  if (data === null || data === undefined) {
    return;
  }
  
  if (data.id === null || data.id === undefined) {
    return;
  }
  
  panel = this._findById(data.id);
  
  if (panel === null) {
    return;
  }
  
  // TODO: add validation 
//  if(data.row > this._getNumberOfPanels(panel.column - 1)) {
//  }
//    if(data.targetColumn < 1 || data.targetColumn > this.maxColumns) {
//      return '';
//    }
//
     
  // update the row for the target
  if(data.sourceColumn !== data.targetColumn) {

    // correct source column panels
    for(idx = 0; idx < this.panels.length; idx++) {
      if(this.panels[idx].column === panel.column && this.panels[idx].row > panel.row) {
        this.panels[idx].row--;
      }
    }

    // correct target column panels
    for(idx = 0; idx < this.panels.length; idx++) {
      
      if(this.panels[idx].column === data.targetColumn && 
         this.panels[idx].row >= data.row) {
        this.panels[idx].row++;
      }
    }

    panel.column = data.targetColumn;
  } else if(data.row < panel.row) {

    for(idx = 0; idx < this.panels.length; idx++) {
      if(this.panels[idx].column === data.targetColumn && 
         this.panels[idx].id !== panel.id && 
         this.panels[idx].row >= data.row && this.panels[idx].row <= panel.row) {
        this.panels[idx].row++;
      }
    }
  } else if(data.row > panel.row) {

    for(idx = 0; idx < this.panels.length; idx++) {
      
      if(this.panels[idx].column === data.targetColumn && 
         this.panels[idx].id !== panel.id && 
         this.panels[idx].row >= panel.row && this.panels[idx].row <= data.row) {
        this.panels[idx].row--;
      }
    }
  }

  panel.row = data.row;
  
  this._save();
  
  return panel;
};

PanelHandler.prototype.movePanelDown = function (id) {
  var originalPanel = null;
  var swapPanel = null;
  var newRow;
  
  if (id === null || id === undefined) {
    // TODO: add log or debug option
    return;
  }

  originalPanel = this._findById(id);

  if((originalPanel.row + 1) > (this.panels.length - 1)) {
    return '';
  }
  
  if (originalPanel !== null) {
    swapPanel = this._findByColumnRow(originalPanel.column, originalPanel.row + 1);
  }

  if (swapPanel !== null) {
    newRow = swapPanel.row;
    swapPanel.row = originalPanel.row;
    originalPanel.row = newRow;
    
    this._save();
  }

  return id;
};

PanelHandler.prototype.movePanelUp = function (id) {
  var originalPanel = null;
  var swapPanel = null;
  var newRow;
  
  if (id === null || id === undefined) {
    // TODO: add log or debug option
    return;
  }

  originalPanel = this._findById(id);

  if(originalPanel.row < 1) {
    return '';
  }
  
  if (originalPanel !== null) {
    swapPanel = this._findByColumnRow(originalPanel.column, originalPanel.row - 1);
  }

  if (swapPanel !== null) {
    newRow = swapPanel.row;
    swapPanel.row = originalPanel.row;
    originalPanel.row = newRow;
    
    this._save();
  }
  
  return id;
};

PanelHandler.prototype.movePanelLeft = function (id) {
  var panel = null;
  var oldColumn = 0;
  var oldRow = 0;
  
  if (id === null || id === undefined) {
    // TODO: add log or debug option
    return;
  }

  panel = this._findById(id);

  if (panel !== null) {
    if((panel.column - 1) < 1) {
      return '';
    }

    // find last position on left
    
    oldColumn = panel.column;
    oldRow = panel.row;
    panel.row = this._getNumberOfPanels(panel.column - 1); // first row is always zero
    panel.column--; // adjust column after counting, otherwise out by one
    
    // update rows from where removed
    for(var i = 0; i < this.panels.length; i++) {
      if(this.panels[i].column === oldColumn && this.panels[i].row > oldRow) {
        this.panels[i].row--;
      }
    }
    
    this._save();
  }

  return panel;
};


PanelHandler.prototype.movePanelRight = function (id) {
  var panel = null;
  var oldColumn = 0;
  var oldRow = 0;
  
  if (id === null || id === undefined) {
    // TODO: add log or debug option
    return;
  }

  panel = this._findById(id);

  if (panel !== null) {
    if((panel.column + 1) > this.maxColumns) {
      return '';
    }

    // find last position on left
    
    oldColumn = panel.column;
    oldRow = panel.row;
    panel.row = this._getNumberOfPanels(panel.column + 1); // first row is always zero
    panel.column++; // adjust column after counting, otherwise out by one
    
    // update rows from where removed
    for(var i = 0; i < this.panels.length; i++) {
      if(this.panels[i].column === oldColumn && this.panels[i].row > oldRow) {
        this.panels[i].row--;
      }
    }
    
    this._save();
  }

  return panel;
};


/*
 * updatePanel updates the panel
 * 
 * Note: this will not add the panel if it doesn't exist
 * 
 * returns the resulting panel (merged) if identified by id, otherwise null
 */
PanelHandler.prototype.updatePanel = function (data) {
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
//    console.log((new Date()) + ' Update panel failed, id is not specififed.');
    return;
  }

  var panel = this._findById(data.id);

  if (panel !== null) {
    // merge the data from the msg into the vehicle
    Panel.merge(panel, data);

    // save the panels
    this._save();
  }
  
//  if (panel === null && this.debug) {
//    console.log((new Date()) + ' Update panel failed, panel not found: ' + data.id + " : " + data.name);
//  }
  
  return panel;
};

/*
 * removePanel removes a panel
 * 
 * returns true if sucessful, otherwise false
 */
PanelHandler.prototype.removePanel = function (id) {
  // if the message isn't set and the id isn't set then do nothing
  if (id === null || id === undefined) {
    // TODO: sort out log reporting
    return false;
  }

  var panel = this._findById(id);
  
  var adjust = false;
  var row = panel.row;
  var idx = -1;
  var len = this.panels.length;
  var i = 0;

  // determine entry
  for(i = 0; i < len; i++) {
    if(this.panels[i].id === panel.id) {
      idx = i;
      break;
    }
  }
  
  if (idx === -1) {
    return false;
  }
  
  this.panels.splice(idx, 1);
  len--;
  
  // reorder row
  for(i = idx; i < len; i++) {
    if(this.panels[i].column === panel.column) {
      this.panels[i].row = row++;
    }
  }
  
  this._save();

  this.widgetHandler.removeWidgetsForPanel(id);
  
  return true;
};

PanelHandler.prototype._determineNextPanelPosition = function () {
  var rows = [];
  var minRow = 99999;
  var maxRow = 0;
  var row = 0;
  var column = 1;
  var i;
  
  var preferences = this.preferenceHandler.getSystemPreference();

  for (i = 0; i < preferences.columns; i++) {
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

PanelHandler.prototype._getNumberOfPanels = function (column) {
  var count = 0;
  
  if (column === null || column === undefined) {
    column = 0;
  }

  for (var i in this.panels) {
    if (this.panels[i].column === column) {
      count++;
    }
  }

  return count;
};

/** 
 * _findById - finds the panel based on it's id
 *
 * returns null if not found, otherwise the panel
 */
PanelHandler.prototype._findById = function (id) {
  var panel = null;

  // if id isn't set then return
  if (id === null || id === undefined) {
    return panel;
  }

  for (var i in this.panels) {
    if (this.panels[i].id === id) {
      return this.panels[i];
    }
  }

  return panel;
};

/** 
 * _findByColumnRow - finds the panel for the specified row and column
 *
 * returns null if not found, otherwise the panel
 */
PanelHandler.prototype._findByColumnRow = function (column, row) {
  var panel = null;

  // if id isn't set then return
  if (row === null || row === undefined || column === null || column === undefined) {
    return panel;
  }

  for (var i in this.panels) {
    if ( this.panels[i].column === column && this.panels[i].row === row) {
      return this.panels[i];
    }
  }

  return panel;
};

PanelHandler.prototype._load = function() {
  this.panels = [];

  try {
    this.panels = JSON.parse(fs.readFileSync(this.dataDirectory + PanelHandler.PANELS_FILE));
  } catch (e) {
    if (e.code === 'ENOENT') {
      // ENOENT is file not found, that is okay, just means no records
    } else {
      // unknown error, lets throw
      throw e;
    }
  }

  if (this.panels) {
    // TODO: add sorting for new structure of panels... not sure if possible
    // panels.sort(compareName);
  } else {
    this.panels = [];
  }
};

PanelHandler.prototype._save = function() {
  fs.writeFileSync(this.dataDirectory + PanelHandler.PANELS_FILE, JSON.stringify(this.panels, null, '\t'));
};

PanelHandler.prototype.setupCommsListeners = function(comms) {
  comms.on(MeltingPot.Comms.NEW_CONNECTION_ACCEPTED, function (c) {
    comms.sendMessage(c, Panel.MESSAGE_PANELS, this.panels);
  }.bind(this));
  
  comms.on(Panel.MESSAGE_ADD_PANEL, function (c, d) {
    comms.sendMessage(c, Panel.MESSAGE_ADD_PANEL, this.addPanel(d));
  }.bind(this));

  comms.on(Panel.MESSAGE_MOVE_PANEL, function (c, d) {
    comms.sendMessage(c, Panel.MESSAGE_MOVE_PANEL, this.movePanel(d));
  }.bind(this));
  
  comms.on(Panel.MESSAGE_MOVE_PANEL_UP, function (c, d) {
    comms.sendMessage(c, Panel.MESSAGE_MOVE_PANEL_UP, this.movePanelUp(d));
  }.bind(this));

  comms.on(Panel.MESSAGE_MOVE_PANEL_DOWN, function (c, d) {
    comms.sendMessage(c, Panel.MESSAGE_MOVE_PANEL_DOWN, this.movePanelDown(d));
  }.bind(this));
  
  comms.on(Panel.MESSAGE_MOVE_PANEL_LEFT, function (c, d) {
    comms.sendMessage(c, Panel.MESSAGE_MOVE_PANEL_LEFT, this.movePanelLeft(d));
  }.bind(this));

  comms.on(Panel.MESSAGE_MOVE_PANEL_RIGHT, function (c, d) {
    comms.sendMessage(c, Panel.MESSAGE_MOVE_PANEL_RIGHT, this.movePanelRight(d));
  }.bind(this));

  comms.on(Panel.MESSAGE_UPDATE_PANEL, function (c, d) {
    var panel = this.updatePanel(d);
    
    if (panel !== null) {
      comms.sendMessage(c, Panel.MESSAGE_UPDATE_PANEL, panel);
    }
  }.bind(this));

  comms.on(Panel.MESSAGE_DELETE_PANEL, function (c, d) {
    if(this.removePanel(d)) {
      comms.sendMessage(c, Panel.MESSAGE_DELETE_PANEL, d);
    }
  }.bind(this));

  comms.on(Panel.MESSAGE_GET_PANELS, function (c) {
    comms.sendMessage(c, Panel.MESSAGE_PANELS, this.panels);
  }.bind(this));
};

PanelHandler.messageHandler = function (comms, connection, msgId, msgBody) {
  var messageProcessed = false;
  
  switch (msgId) {
    case Panel.MESSAGE_ADD_PANEL:
      comms.emit(Panel.MESSAGE_ADD_PANEL, connection, msgBody);
      messageProcessed = true;
      break;

    case Panel.MESSAGE_DELETE_PANEL:
      comms.emit(Panel.MESSAGE_DELETE_PANEL, connection, msgBody);
      messageProcessed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL:
      comms.emit(Panel.MESSAGE_MOVE_PANEL, connection, msgBody);
      messageProcessed = true;
      break;
      
    case Panel.MESSAGE_MOVE_PANEL_UP:
      comms.emit(Panel.MESSAGE_MOVE_PANEL_UP, connection, msgBody);
      messageProcessed = true;
      break;
      
    case Panel.MESSAGE_MOVE_PANEL_DOWN:
      comms.emit(Panel.MESSAGE_MOVE_PANEL_DOWN, connection, msgBody);
      messageProcessed = true;
      break;
      
    case Panel.MESSAGE_MOVE_PANEL_LEFT:
      comms.emit(Panel.MESSAGE_MOVE_PANEL_LEFT, connection, msgBody);
      messageProcessed = true;
      break;
      
    case Panel.MESSAGE_MOVE_PANEL_RIGHT:
      comms.emit(Panel.MESSAGE_MOVE_PANEL_RIGHT, connection, msgBody);
      messageProcessed = true;
      break;
      
    case Panel.MESSAGE_UPDATE_PANEL:
  // TODO: sort out logs
  //  if (self.loggingIn) {
  //    self.loggerIn.info('update panel', data);
  //  }
      comms.emit(Panel.MESSAGE_UPDATE_PANEL, connection, msgBody);
      messageProcessed = true;
      break;

    case Panel.MESSAGE_GET_PANELS:
      comms.emit(Panel.MESSAGE_GET_PANELS, connection);
      messageProcessed = true;
      break;
  }
  
  return messageProcessed;
};

