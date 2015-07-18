/* jshint browser: true, jquery: true */
/* global AgileSprint:false, console:false */


var JenkinsBuildManager = function(options) {
//  if(options.server === null || options.server === undefined) {
//    return null;
//  }
  
  this.widgetManager = (options.widgetManager !== null && options.widgetManager !== undefined) ? options.widgetManager : null;
  this.panelManager = (options.panelManager !== null && options.panelManager !== undefined) ? options.panelManager : null;
  
  this.server = options.server;
};

JenkinsBuildManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case JenkinsState.MESSAGE_STATS:
      this.__receivedStats(server, content);
      processed = true;
      break;
      
    case JenkinsState.MESSAGE_CONNECTIVITY_ERROR:
      this.__receivedError(server, content);
      processed = true;
      break;
  }

  return processed;
};

JenkinsBuildManager.prototype.__receivedStats = function(server, d) {
  if(this.widgetManager !== null) {
    this.widgetManager.receivedData(d);
  }
};

JenkinsBuildManager.prototype.__receivedError = function(server, d) {
  if(this.widgetManager !== null) {
    this.widgetManager.receivedError(d);
  }
};