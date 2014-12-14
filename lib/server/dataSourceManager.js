/*jlint node: true */
/*global require, console, module, process, __dirname */
/*
 * dataSourceManager.js
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

var  DataSource = require('../shared/dataSource.js');
var  VersionOne = require('./versionOne.js');

module.exports = DataSourceManager;

function DataSourceManager(options) {
  this.dataSourceHandler = ((options.dataSourceHandler !== null && options.dataSourceHandler !== undefined) ? options.dataSourceHandler : null);
  
  this.dataSources = {};
}

DataSourceManager.prototype.start = function() {
  if(this.dataSourceHandler === null) {
    return;
  }

  console.log("DataSourceManager: starting... ");
  
  for(var i = 0; i < this.dataSourceHandler.dataSources.length; i++) {
    console.log("DataSourceManager: starting: " + this.dataSourceHandler.dataSources[i].name);
    switch(this.dataSourceHandler.dataSources[i].type) {
      case DataSource.TYPE_VERSION_ONE:
        this.dataSources[this.dataSourceHandler.dataSources[i].id] = new VersionOne({
          hostname: this.dataSourceHandler.dataSources[i].hostname,
          instance: this.dataSourceHandler.dataSources[i].instance,
          username: this.dataSourceHandler.dataSources[i].username,
          password: this.dataSourceHandler.dataSources[i].password,
          port: this.dataSourceHandler.dataSources[i].port,
          protocol: this.dataSourceHandler.dataSources[i].protocol,
          pollFrequencyMinutes: this.dataSourceHandler.dataSources[i].pollFrequencyMinutes,
          // teamName: this.dataSourceHandler.dataSources[i].
        });
        this.dataSources[this.dataSourceHandler.dataSources[i].id].startMonitor(VersionOne.ALL_MONITORS);
        break;

      case DataSource.TYPE_JENKINS:
        break;

      case DataSource.TYPE_SALES_FORCE:
        break;

      case DataSource.TYPE_INTERNAL:
        break;
    }
  }
};

DataSourceManager.prototype.stop = function() {
  if(this.dataSourceHandler === null) {
    return;
  }
  
  for(var dataSource in this.dataSources) {
    this.dataSources[dataSource].stopMonitor();
  }
  
  this.dataSources = {};
};

DataSourceManager.prototype.add = function(dataSource) {
  
};

DataSourceManager.prototype.remove = function(id) {
  
  if(this.dataSources[id] !== null && this.dataSources[id] !== undefined) {
    this.dataSources[id].stopMonitor();
    // TODO: add remove logic
  }
};
