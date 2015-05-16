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
  this.rotationPeriod = 5000;
  
  this.bannerDialog = new BannerDialog();
}

BannerManager.prototype.preferencesChanged = function(systemPreferences) {
  var column;
  var insertBeforeBanner = false;
  
  if(this.rotationPeriod !== systemPreferences.bannerRotationPeriod) {
    this.rotationPeriod = systemPreferences.bannerRotationPeriod;
    
    this._updateCarouselRotationPeriod();
  }
  
  if(this.displayBanner !== systemPreferences.displayBanner) {
    if(this.displayBanner && !systemPreferences.displayBanner) {
      this._removeBannersFromMain();
    }

    if(!this.displayBanner && systemPreferences.displayBanner) {
      this._addBannersToMain();
    }

    this.displayBanner = systemPreferences.displayBanner;
  }
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
  this.banners.push(d);
  this.bannersIndex.push(d.id);
  this._addToGrid(d);
  this._addToCarousel(d);
  this._initialiseCarousel();
  displayStatusMessage("The Banner Content has been added", "Banner Contents");
};

BannerManager.prototype._receivedDelete = function(server, id) {
  this._removeFromGrid(id);
  this._removeFromCarousel(id);
  this._initialiseCarousel();
  
  var idx = this.bannersIndex.indexOf(id);
  if(idx > -1) {
    this.bannersIndex.splice(idx, 1);
    this.banners.splice(idx, 1);
  }
  
  displayStatusMessage("The Banner Content has been been removed", "Banner Contents");
};

BannerManager.prototype._receivedUpdate = function(server, banner) {
  var idx = this.bannersIndex.indexOf(banner.id);
  
  if(idx < 0) {
    this.banners.push(banner);
    this.bannersIndex.push(banner.id);
    this._addToGrid(banner);
    this._addToCarousel(banner);
  } else {
    this._updateGrid(this.banners[idx], banner);
    this._updateCarousel(this.banners[idx], banner);
    
    this.banners[idx] = banner;
  }
  
  this._initialiseCarousel();
  displayStatusMessage("The Banner Content has been updated", "Banner Contents");
};

BannerManager.prototype._receivedContent = function(server, d) {
  var first = true;
  $("#bannerGrid").empty();

  this.banners = [];
  var banner = null;
  
  for (var item in d) {
    banner = new Banner(d[item]);
    this.banners.push(banner);
    this.bannersIndex.push(banner.id);
    this._addToGrid(banner);
    this._addToCarousel(banner, first);
    first = false;
  }
  this._initialiseCarousel();
  displayStatusMessage("The Banner Content has been initialised", "Banner Contents");
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

BannerManager.prototype._updateGrid = function(currentBanner, newBanner) {
  if(currentBanner.headline !== newBanner.headline) {
    $('#bannerRowHeadline' + newBanner.id).text(newBanner.headline);
  }
  if(currentBanner.subHeadline !== newBanner.subHeadline) {
    $('#bannerRowSubHeadLine'  + newBanner.id).text(newBanner.subHeadline);
  }
};

BannerManager.prototype._addToCarousel = function(banner, selected) {
  var classes = selected ? "item active" : "item";
  
  $('#bannerCarouselContent').append(
    '<div id="bannerCarouselItem' + banner.id + '" class="' + classes + '">' +
    '  <div class="widget-container">' +
    '    <span id="bannerCarouselItem' + banner.id + 'Headline" class="banner-headline" style="color: ' + banner.headlineColor + '">' +
    '      ' + banner.headline + 
    '    </span>' +
    '    <div class="banner-subheadline-container">' +
    '      <span id="bannerCarouselItem' + banner.id + 'SubHeadline" class="banner-subheadline" style="color: ' + banner.subHeadlineColor + '">' +
    '        ' + banner.subHeadline +
    '      </span>' +
    '      <span id="bannerCarouselItem' + banner.id + 'Reference" class="banner-reference" style="color: ' + banner.referenceColor + '">' +
    '        ' + banner.reference +
    '      </span>' +
    '    </div>' +
    '  </div>' +
    '</div>'
  );
};

BannerManager.prototype._removeFromCarousel = function(id) {
  $('#bannerCarouselItem' + id).remove();
};

BannerManager.prototype._updateCarousel = function(currentBanner, newBanner) {
  if(currentBanner.headline !== newBanner.headline) {
    $('#bannerCarouselItem' + newBanner.id + 'Headline').text(newBanner.headline);
  }
  if(currentBanner.headlineColor !== newBanner.headlineColor) {
    $('#bannerCarouselItem' + newBanner.id + 'Headline').css("color", newBanner.headlineColor);
  }
  
  if(currentBanner.subHeadline !== newBanner.subHeadline) {
    $('#bannerCarouselItem'  + newBanner.id + 'SubHeadline').text(newBanner.subHeadline);
  }
  if(currentBanner.subHeadlineColor !== newBanner.subHeadlineColor) {
    $('#bannerCarouselItem' + newBanner.id + 'SubHeadline').css("color", newBanner.subHeadlineColor);
  }
  
  if(currentBanner.reference !== newBanner.reference) {
    $('#bannerCarouselItem'  + newBanner.id + 'Reference').text(newBanner.reference);
  }
  if(currentBanner.referenceColor !== newBanner.referenceColor) {
    $('#bannerCarouselItem' + newBanner.id + 'Reference').css("color", newBanner.referenceColor);
  }
};

BannerManager.prototype._initialiseCarousel = function() {
  // TODO: figure out why there is a delay before first is selected, is it a html rendering issue?
  $('#bannerCarouselContent').carousel();
};

BannerManager.prototype._updateCarouselRotationPeriod = function() {
  var carousel = $('#bannerCarouselContent');
  var opt = carousel.data()['bs.carousel'].options;
  opt.interval = this.rotationPeriod;
  carousel.data({options: opt})
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
  $("#bannersPane").addClass('hiddenBanner');
};

BannerManager.prototype._addBannersToMain = function() {
  $("#bannersPane").removeClass('hiddenBanner');
};
