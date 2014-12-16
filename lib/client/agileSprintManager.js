/* jshint browser: true, jquery: true */
/* global AgileSprint:false, console:false */


var AgileSprintManager = function(options) {
//  if(options.server === null || options.server === undefined) {
//    return null;
//  }
  
  this.widgetManager = (options.widgetManager !== null && options.widgetManager !== undefined) ? options.widgetManager : null;
  this.panelManager = (options.panelManager !== null && options.panelManager !== undefined) ? options.panelManager : null;
  
  this.server = options.server;
};

AgileSprintManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case AgileSprint.MESSAGE_STATS:
      this.__receivedStats(server, content);
      processed = true;
      break;
  }

  return processed;
};

AgileSprintManager.prototype.__receivedStats = function(server, d) {
  if(this.widgetManager !== null) {
    this.widgetManager.receivedData(d);
  }
};