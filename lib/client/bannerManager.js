/* jshint browser: true, jquery: true */
/* global Panel:false, console:false, server:false, addWidget:false */
/*
 * bannerManager.js
 *
 * Copyright (c) 2015 James G Jenner
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

function BannerManager(options) {
  this.banners = [];
  this.bannersIndex = [];
  this.server = null;
  this.displayBanner = true;
  
  this.bannerDialog = new BannerDialog();
};

BannerManager.prototype.preferencesChanged = function(systemPreferences) {
  var column;
  var insertBeforeBanner = false;
  
  if(this.dispalyBanner === systemPreferences.displayBanner) {
    return;
  }
  
  if(this.displayBanner && !systemPreferences.displayBanner) {
    this._removeBannersFromMain();
  }

  if(!this.displayBanner && systemPreferences.displayBanner) {
    this._removeBannersToMain();
  }
  
  this.displayBanner = systemPreferences.displayBanner;
};

BannerManager.prototype.getByName = function(name) {
  var banner = null;
  
  for(var i = 0; i < this.banners.length; i++) {
    if(this.banners[i].name === name) {
      banner = this.banners[i];
      break;
    }
  }
  
  return banner;
};

BannerManager.prototype.getById = function(id) {
  var banner = null;
  
  var idx = this.bannersIndex.indexOf(id);

  if(idx > -1) {
    banner = this.banners[idx];
  }
  
  return banner;
};

BannerManager.prototype.add = function(banner) {
  this._sendAdd(banner);
};

BannerManager.prototype.update = function(banner) {
  this._sendUpdate(banner);
};

BannerManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case Banner.MESSAGE_BANNERS:
      this._receivedContent(server, content);
      processed = true;
      break;

    case Banner.MESSAGE_ADD_BANNER:
      this._receivedAdd(server, new Banner(content));
      processed = true;
      break;

    case Banner.MESSAGE_DELETE_BANNER:
      this._receivedDelete(server, content);
      processed = true;
      break;

    case Banner.MESSAGE_UPDATE_BANNER:
      this._receivedUpdate(server, new Banner(content));
      processed = true;
      break;
  }

  return processed;
};

BannerManager.prototype._receivedAdd = function(server, d) {
  this._addToGrid(d);
  displayStatusMessage("The Banner Content has been added", "Banner Contents");
};

BannerManager.prototype._receivedDelete = function(server, id) {
  this._removeFromGrid(id);
  displayStatusMessage("The Banner Content has been been removed", "Banner Contents");
};

BannerManager.prototype._receivedUpdate = function(server, banner) {
  var idx = this.bannersIndex.indexOf(banner.id);
  var currentBanner = null;
  
  if(idx < 0) {
    this.banners.push(banner);
    this.bannersIndex.push(banner.id);
  } else {
    currentBanner = this.banners[idx];
    this.banners[idx] = banner;
    
    if(currentBanner.headline !== banner.headline) {
      $('#bannerRowHeadline' + banner.id).text(banner.headline);
    }
    if(currentBanner.subHeadLine !== banner.subHeadLine) {
      $('#bannerRowSubHeadLine'  + banner.id).text(banner.subHeadLine);
    }
  }
};

BannerManager.prototype._receivedContent = function(server, d) {
  $("#bannerGrid").empty();

  this.banners = [];
  var banner = null;
  
  for (var item in d) {
    banner = new Banner(d[item]);
    this.banners.push(banner);
    this.bannersIndex.push(banner.id);
    this._addToGrid(banner);
  }
};

BannerManager.prototype._sendAdd = function(banner) {
  if(this.server !== null) {
    this.server.sendMessage(Banner.MESSAGE_ADD_BANNER, banner);
  }
};

BannerManager.prototype._sendDelete = function(id) {
  if(this.server !== null) {
    this.server.sendMessage(Banner.MESSAGE_DELETE_BANNER, id);
  }
};

BannerManager.prototype._sendUpdate = function(banner) {
  if(this.server !== null) {
    this.server.sendMessage(Banner.MESSAGE_UPDATE_BANNER, banner);
  }
};

BannerManager.prototype._addToGrid = function(banner) {
  $("#bannerGrid").append(
    '<tr id="bannerRow' + banner.id + '">' +
    '  <td><a id="bannerRowHeadline' + banner.id + '" class="bannerRow" href="#inputmask">' + banner.headline + '</a></td>' +
    '  <td id="bannerRowSubHeadLine' + banner.id + '">' + banner.subHeadline + '</td>' +
    '  <td class="rowlink-skip">' + 
    '    <div class="btn-group pull-right">' +
    '      <button id="bannerBtnDelete' + banner.id + '" type="button" class="grid-row-buttons btn btn-default ">' +
    '        <i class="fa fa-trash"></i>' +
    '      </button>' +
    '    </div>' +
    '  </td>' +
    '</tr>'
  );
  
  $('#banner' + banner.id).hide().fadeIn('fast');
    
  $('#bannerPane .rowlink').rowlink();
  $('#bannerRow' + banner.id).on('click', function() {
    this.bannerDialog.display(BannerDialog.UPDATE, banner);
    return false;
  }.bind(this));
  
  $('#bannerBtnDelete' + banner.id).on('click', function() {
    this._sendDelete(banner.id);
    return false;
  }.bind(this));
};

BannerManager.prototype._removeFromGrid = function(id) {
  $('#bannerRow' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
};

BannerManager.prototype.setup = function() {
  $(".bannerRow").on('click', function() {
    return false;
  });
  
  $("#addBanner").on('click', function() {
    this.bannerDialog.display(BannerDialog.ADD);
    return false;
  }.bind(this));
};


BannerManager.prototype._removeBannersFromMain = function() {
};

BannerManager.prototype._removeBannersToMain = function() {
};
