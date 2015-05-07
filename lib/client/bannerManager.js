/* jshint browser: true, jquery: true */
/* global Panel:false, console:false, server:false, addWidget:false */

var BannerManager = function(options) {
  this.displayBanner = true;
};


BannerManager.prototype.preferencesChanged = function(systemPreferences) {
  var column;
  var insertBeforeBanner = false;
  
  if(this.dispalyBanner === systemPreferences.displayBanner) {
    return;
  }
  
  if(this.displayBanner && !systemPreferences.displayBanner) {
    this.remove();
  }

  if(!this.displayBanner && systemPreferences.displayBanner) {
    this.add();
  }
  
  this.displayBanner = systemPreferences.displayBanner;
};

BannerManager.prototype.remove = function() {
  $("#footer").remove();
};

BannerManager.prototype.add = function() {
  $("#homePane").append('<div id="footer" class="column col-sx-12 col-md-12"></div>');
};

BannerManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  return processed;
};
