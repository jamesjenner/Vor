/*jlint node: true */
/*global require, console, module, __dirname */
/*
 * dataSourceHandler.js
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

var DataSource = require('../shared/dataSource.js');
var fs = require('fs');

module.exports = DataSourceHandler;

// util.inherits(Comms, EventEmitter);

DataSourceHandler.DATA_SOURCES_FILE = 'dataSources.json';

function DataSourceHandler(options) {
  this.dataDirectory = ((options.dataDirectory !== null && options.dataDirectory !== undefined) ? options.dataDirectory : './');
  
  // EventEmitter.call(this);
  this.dataSources = [];
  this._load();
  
  // TODO: add log/debug logic
}

DataSourceHandler.prototype.addDataSource = function (data) {
  var dataSource = new DataSource(data);

  this.dataSources.push(dataSource);

  this._save();

  return dataSource;
};

/*
 * updateDataSource updates the dataSource
 * 
 * Note: this will not add the dataSource if it doesn't exist
 * 
 * returns the resulting dataSource (merged) if identified by id, otherwise null
 */
DataSourceHandler.prototype.updateDataSource = function (data) {
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
//    console.log((new Date()) + ' Update dataSource failed, id is not specififed.');
    return;
  }

  var dataSource = this._findById(data.id);

  if (dataSource !== null) {
    // merge the data from the msg into the vehicle
    DataSource.merge(dataSource, data);

    // save the dataSources
    this._save();
  }
  
//  if (dataSource === null && this.debug) {
//    console.log((new Date()) + ' Update dataSource failed, dataSource not found: ' + data.id + " : " + data.name);
//  }
  
  return dataSource;
};

/*
 * removeDataSource removes a dataSource
 * 
 * returns true if sucessful, otherwise false
 */
DataSourceHandler.prototype.removeDataSource = function (id) {
  // if the message isn't set and the id isn't set then do nothing
  if (id === null || id === undefined) {
    // TODO: sort out log reporting
    return false;
  }

  var dataSource = this._findById(id);
  
  var idx = -1;
  var len = this.dataSources.length;

  // determine entry
  for(var i = 0; i < len; i++) {
    if(this.dataSources[i].id === dataSource.id) {
      idx = i;
      break;
    }
  }
  
  if (idx === -1) {
    return false;
  }
  
  this.dataSources.splice(idx, 1);
  
  this._save();
  
  return true;
};

/** 
 * _findById - finds the dataSource based on it's id
 *
 * returns null if not found, otherwise the dataSource
 */
DataSourceHandler.prototype._findById = function (id) {
  var dataSource = null;

  // if id isn't set then return
  if (id === null || id === undefined) {
    return dataSource;
  }

  for (var i in this.dataSources) {
    if (this.dataSources[i].id === id) {
      return this.dataSources[i];
    }
  }

  return dataSource;
};

DataSourceHandler.prototype._load = function() {
  this.dataSources = [];

  try {
    this.dataSources = JSON.parse(fs.readFileSync(this.dataDirectory + DataSourceHandler.DATA_SOURCES_FILE));
  } catch (e) {
    if (e.code === 'ENOENT') {
      // ENOENT is file not found, that is okay, just means no records
    } else {
      // unknown error, lets throw
      throw e;
    }
  }

  if (this.dataSources) {
    // TODO: add sorting for new structure of dataSources... not sure if possible
    // dataSources.sort(compareName);
  } else {
    this.dataSources = [];
  }
};

DataSourceHandler.prototype._save = function() {
  fs.writeFileSync(this.dataDirectory + DataSourceHandler.DATA_SOURCES_FILE, JSON.stringify(this.dataSources, null, '\t'));
};

DataSourceHandler.prototype.setupCommsListeners = function(comms) {
  comms.on(MeltingPot.Comms.NEW_CONNECTION_ACCEPTED, function (c) {
    comms.sendMessage(c, DataSource.MESSAGE_DATA_SOURCES, this.dataSources);
  }.bind(this));
  
  comms.on(DataSource.MESSAGE_ADD_DATA_SOURCE, function (c, d) {
    comms.sendMessage(c, DataSource.MESSAGE_ADD_DATA_SOURCE, this.addDataSource(d));
  }.bind(this));

  comms.on(DataSource.MESSAGE_UPDATE_DATA_SOURCE, function (c, d) {
    var dataSource = this.updateDataSource(d);
    
    if (dataSource !== null) {
      comms.sendMessage(c, DataSource.MESSAGE_UPDATE_DATA_SOURCE, dataSource);
    }
  }.bind(this));

  comms.on(DataSource.MESSAGE_DELETE_DATA_SOURCE, function (c, d) {
    if(this.removeDataSource(d)) {
      comms.sendMessage(c, DataSource.MESSAGE_DELETE_DATA_SOURCE, d);
    }
  }.bind(this));

  comms.on(DataSource.MESSAGE_GET_DATA_SOURCES, function (c) {
    comms.sendMessage(c, DataSource.MESSAGE_DATA_SOURCES, this.dataSources);
  }.bind(this));
};

DataSourceHandler.messageHandler = function (comms, connection, msgId, msgBody) {
  var messageProcessed = false;
  
  switch (msgId) {
    case DataSource.MESSAGE_ADD_DATA_SOURCE:
      comms.emit(DataSource.MESSAGE_ADD_DATA_SOURCE, connection, msgBody);
      messageProcessed = true;
      break;

    case DataSource.MESSAGE_DELETE_DATA_SOURCE:
      comms.emit(DataSource.MESSAGE_DELETE_DATA_SOURCE, connection, msgBody);
      messageProcessed = true;
      break;

    case DataSource.MESSAGE_UPDATE_DATA_SOURCE:
  // TODO: sort out logs
  //  if (self.loggingIn) {
  //    self.loggerIn.info('update dataSource', data);
  //  }
      comms.emit(DataSource.MESSAGE_UPDATE_DATA_SOURCE, connection, msgBody);
      messageProcessed = true;
      break;

    case DataSource.MESSAGE_GET_DATA_SOURCES:
      comms.emit(DataSource.MESSAGE_GET_DATA_SOURCES, connection);
      messageProcessed = true;
      break;
  }
  
  return messageProcessed;
};

