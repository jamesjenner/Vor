/*jlint node: true */
/*global require, console, module, __dirname */
/*
 * widgetHandler.js
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

var Widget = require('../shared/widget.js');
var fs = require('fs');

module.exports = WidgetHandler;

// util.inherits(Comms, EventEmitter);

WidgetHandler.WIDGETS_FILE = 'widgets.json';

function WidgetHandler(options) {
  this.dataDirectory = ((options.dataDirectory !== null && options.dataDirectory !== undefined) ? options.dataDirectory : './');
  
  // EventEmitter.call(this);
  this.widgets = [];
  this._load();
  
  this.dataSourceManager = null;
  // TODO: add log/debug logic
}

WidgetHandler.prototype.addWidget = function (data) {
  var widget = new Widget(data);

  widget.column = this._determineNextWidgetPosition(widget.panelId);

  this.widgets.push(widget);
  
  this._save();
  
  if(this.dataSourceManager !== null) {
    this.dataSourceManager.widgetEvent("added", widget);
  }

  return widget;
};

WidgetHandler.prototype._determineNextWidgetPosition = function(panelId) {
  var idx;
  var nextPosition = 0;
  
  for(idx = 0; idx < this.widgets.length; idx++) {
    if(this.widgets[idx].panelId === panelId) {
      nextPosition++;
    }
  }
  
  return nextPosition;
}

/*
 * updateWidget updates the widget
 * 
 * Note: this will not add the widget if it doesn't exist
 * 
 * returns the resulting widget (merged) if identified by id, otherwise null
 */
WidgetHandler.prototype.updateWidget = function (data) {
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
//    console.log((new Date()) + ' Update widget failed, id is not specififed.');
    return;
  }

  var widget = this._findById(data.id);

  if (widget !== null) {
    // merge the data from the msg into the vehicle
    Widget.merge(widget, data);

    // save the widgets
    this._save();
  }
  
//  if (widget === null && this.debug) {
//    console.log((new Date()) + ' Update widget failed, widget not found: ' + data.id + " : " + data.name);
//  }
  
  if(this.dataSourceManager !== null) {
    this.dataSourceManager.widgetEvent("modified", widget, data);
  }
  
  
  return widget;
};

/*
 * moveWidget move the widget 
 * 
 * returns the resulting widget (moved) if identified by id, otherwise null
 */
WidgetHandler.prototype.moveWidget = function (data) {
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
//    console.log((new Date()) + ' Move widget failed, id is not specififed.');
    return null;
  }

  var widget = this._findById(data.id);

  if (widget === null) {
    return null;
  }

  if(data.column < widget.column) {
    for(idx = 0; idx < this.widgets.length; idx++) {
      if(this.widgets[idx].panelId === widget.panelId && 
         this.widgets[idx].id !== widget.id &&
        this.widgets[idx].column >= data.column && this.widgets[idx].column < widget.column && this.widgets[idx].column < this.widgets.length) {
        this.widgets[idx].column++;
      }
    }
  } else if(data.column > widget.column) {
    for(idx = 0; idx < this.widgets.length; idx++) {
      if(this.widgets[idx].panelId === widget.panelId && 
         this.widgets[idx].id !== widget.id &&
        this.widgets[idx].column >= widget.column && this.widgets[idx].column <= data.column && this.widgets[idx].column > 0) {
        this.widgets[idx].column--;
      }
    }
  }

  widget.column = data.column;

  this._save();
  
  return widget;
};


/*
 * removeWidget removes a widget
 * 
 * returns true if sucessful, otherwise false
 */
WidgetHandler.prototype.removeWidget = function (id) {
  // if the message isn't set and the id isn't set then do nothing
  if (id === null || id === undefined) {
    // TODO: sort out log reporting
    return false;
  }

  var widget = this._findById(id);
  
  var idx = -1;
  var len = this.widgets.length;

  // determine entry
  for(var i = 0; i < len; i++) {
    if(this.widgets[i].id === widget.id) {
      idx = i;
      break;
    }
  }
  
  if (idx === -1) {
    return false;
  }
  
  this.widgets.splice(idx, 1);
  
  this._save();
  
  if(this.dataSourceManager !== null) {
    this.dataSourceManager.widgetEvent("removed", widget);
  }
  
  return true;
};

/*
 * removeWidgetsForPanel removes a widget
 * 
 * returns true if sucessful, otherwise false
 */
WidgetHandler.prototype.removeWidgetsForPanel = function (panelId) {
  // if the message isn't set and the panelId isn't set then do nothing
  if (panelId === null || panelId === undefined) {
    // TODO: sort out log reporting
    return false;
  }
  
  var idx = this.widgets.length;
  var dirty = false;

  while (idx--) {
    if (this.widgets[idx].panelId === panelId) {
      if(this.dataSourceManager !== null) {
        this.dataSourceManager.widgetEvent("removed", this.widgets[idx]);
      }
      
      this.widgets.splice(idx, 1);
      dirty = true;
    }
  }
  
  if(dirty) {
    this._save();
  }
  
  return true;
};

WidgetHandler.prototype.otherVersionOneWidgetsExist = function (widgetExclude) {
  for (i = 0; i < this.widgets.length; i++) {
    if (this.widgets[i].id !== widgetExclude.id &&
      this.widgets[i].widgetVersionOneDataType === widgetExclude.widgetVersionOneDataType && 
      this.widgets[i].widgetVersionOneDataValue === widgetExclude.widgetVersionOneDataValue) {
      return true;
    }
  }
  
  return false;
};

WidgetHandler.prototype.otherJenkinsWidgetsExist = function (widgetExclude) {
  for (i = 0; i < this.widgets.length; i++) {
    if (this.widgets[i].id !== widgetExclude.id &&
      this.widgets[i].widgetJenkinsJobName === widgetExclude.widgetJenkinsJobName) {
      return true;
    }
  }
  
  return false;
};

/** 
 * _findById - finds the widget based on it's id
 *
 * returns null if not found, otherwise the widget
 */
WidgetHandler.prototype._findById = function (id) {
  var widget = null;

  // if id isn't set then return
  if (id === null || id === undefined) {
    return widget;
  }

  for (var i in this.widgets) {
    if (this.widgets[i].id === id) {
      return this.widgets[i];
    }
  }

  return widget;
};

WidgetHandler.prototype._load = function() {
  this.widgets = [];

  try {
    this.widgets = JSON.parse(fs.readFileSync(this.dataDirectory + WidgetHandler.WIDGETS_FILE));
  } catch (e) {
    if (e.code === 'ENOENT') {
      // ENOENT is file not found, that is okay, just means no records
    } else {
      // unknown error, lets throw
      throw e;
    }
  }

  if (this.widgets) {
    // TODO: add sorting for new structure of widgets... not sure if possible
    // widgets.sort(compareName);
  } else {
    this.widgets = [];
  }
};

WidgetHandler.prototype._save = function() {
  fs.writeFileSync(this.dataDirectory + WidgetHandler.WIDGETS_FILE, JSON.stringify(this.widgets, null, '\t'));
};

WidgetHandler.prototype.setupCommsListeners = function(comms) {
  comms.on(MeltingPot.Comms.NEW_CONNECTION_ACCEPTED, function (c) {
    comms.sendMessage(c, Widget.MESSAGE_WIDGETS, this.widgets);
  }.bind(this));
  
  comms.on(Widget.MESSAGE_ADD_WIDGET, function (c, d) {
    comms.sendMessage(c, Widget.MESSAGE_ADD_WIDGET, this.addWidget(d));
  }.bind(this));

  comms.on(Widget.MESSAGE_UPDATE_WIDGET, function (c, d) {
    var widget = this.updateWidget(d);
    
    if (widget !== null) {
      comms.sendMessage(c, Widget.MESSAGE_UPDATE_WIDGET, widget);
    }
  }.bind(this));

  comms.on(Widget.MESSAGE_MOVE_WIDGET, function (c, d) {
    var widget = this.moveWidget(d);
    
    if (widget !== null) {
      comms.sendMessage(c, Widget.MESSAGE_MOVE_WIDGET, widget);
    }
  }.bind(this));

  comms.on(Widget.MESSAGE_DELETE_WIDGET, function (c, d) {
    if(this.removeWidget(d)) {
      comms.sendMessage(c, Widget.MESSAGE_DELETE_WIDGET, d);
    }
  }.bind(this));

  comms.on(Widget.MESSAGE_GET_WIDGETS, function (c) {
    comms.sendMessage(c, Widget.MESSAGE_WIDGETS, this.widgets);
  }.bind(this));
};

WidgetHandler.messageHandler = function (comms, connection, msgId, msgBody) {
  var messageProcessed = false;
  
  switch (msgId) {
    case Widget.MESSAGE_ADD_WIDGET:
      comms.emit(Widget.MESSAGE_ADD_WIDGET, connection, msgBody);
      messageProcessed = true;
      break;

    case Widget.MESSAGE_DELETE_WIDGET:
      comms.emit(Widget.MESSAGE_DELETE_WIDGET, connection, msgBody);
      messageProcessed = true;
      break;

    case Widget.MESSAGE_UPDATE_WIDGET:
  // TODO: sort out logs
  //  if (self.loggingIn) {
  //    self.loggerIn.info('update widget', data);
  //  }
      comms.emit(Widget.MESSAGE_UPDATE_WIDGET, connection, msgBody);
      messageProcessed = true;
      break;

    case Widget.MESSAGE_MOVE_WIDGET:
      comms.emit(Widget.MESSAGE_MOVE_WIDGET, connection, msgBody);
      messageProcessed = true;
      break;
      
    case Widget.MESSAGE_GET_WIDGETS:
      comms.emit(Widget.MESSAGE_GET_WIDGETS, connection);
      messageProcessed = true;
      break;
  }
  
  return messageProcessed;
};

