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

var Panel = require('./shared/panel.js');
var fs = require('fs');

module.exports = PanelHandler;

// util.inherits(Comms, EventEmitter);

PanelHandler.PANELS_FILE = 'panels.json';

function PanelHandler(options) {
  // EventEmitter.call(this);
  this.panels = [];
  this._load();
}

PanelHandler.prototype.addPanel = function (data) {
  // TODO: add logic to check if the panel exists, based on name
  var panel = new Panel(data);

  this.panels.push(panel);

  this._save();

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
  // if the message isn't set and the id isn't set then do nothing
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
//    console.log((new Date()) + ' Update panel failed, id is not specififed.');
    return;
  }

  // find the vehicle
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
PanelHandler.prototype.removePanel = function (data) {
  // if the message isn't set and the id isn't set then do nothing
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
//    console.log((new Date()) + ' Update panel failed, id is not specififed.');
    return;
  }

  var idx = -1;
  
  for(var i = 0, l = this.panels.length; i < l; i++) {
    if(this.panels[i].id === data.id) {
      idx = i;
      break;
    }
  }
  
  if (idx === -1) {
    return false;
  }
  
  this.panels.splice(idx, 1);
  
  this._save();
  
  return true;
};

/** 
 * findById - finds the panel based on it's id
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

PanelHandler.prototype._load = function() {
  this.panels = {};

  try {
    this.panels = JSON.parse(fs.readFileSync(PanelHandler.PANELS_FILE));
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
    this.panels = {};
  }
};

PanelHandler.prototype._save = function() {
  fs.writeFileSync(PanelHandler.PANELS_FILE, JSON.stringify(this.panels, null, '\t'));
};