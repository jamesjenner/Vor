/*jlint node: true */
/*global require, console, module, __dirname */
/*
 * bannerHandler.js
 *
 * Copyright (C) 2015 by James Jenner
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

var Banner = require('../shared/banner.js');
var fs = require('fs');

module.exports = BannerHandler;

// util.inherits(Comms, EventEmitter);

BannerHandler.BANNER_FILE = 'banner.json';

function BannerHandler(options) {
  this.dataDirectory = ((options.dataDirectory !== null && options.dataDirectory !== undefined) ? options.dataDirectory : './');
  
  // EventEmitter.call(this);
  this.banners = [];
  this._load();
  
  // TODO: add log/debug logic
}

BannerHandler.prototype.addBanner = function (data) {
  var banner = new Banner(data);

  this.banners.push(banner);

  this._save();

  return banner;
};

/*
 * updateBanner updates the banner
 * 
 * Note: this will not add the banner if it doesn't exist
 * 
 * returns the resulting banner (merged) if identified by id, otherwise null
 */
BannerHandler.prototype.updateBanner = function (data) {
  if (data === null || data === undefined || data.id === null || data.id === undefined) {
//    console.log((new Date()) + ' Update banner failed, id is not specififed.');
    return;
  }

  var banner = this._findById(data.id);

  if (banner !== null) {
    // merge the data from the msg into the vehicle
    Banner.merge(banner, data);

    // save the banner
    this._save();
  }
  
//  if (banner === null && this.debug) {
//    console.log((new Date()) + ' Update banner failed, banner not found: ' + data.id + " : " + data.name);
//  }
  
  return banner;
};

/*
 * removeBanner removes a banner
 * 
 * returns true if sucessful, otherwise false
 */
BannerHandler.prototype.removeBanner = function (id) {
  // if the message isn't set and the id isn't set then do nothing
  if (id === null || id === undefined) {
    // TODO: sort out log reporting
    return false;
  }

  var banner = this._findById(id);
  
  var idx = -1;
  var len = this.banners.length;

  // determine entry
  for(var i = 0; i < len; i++) {
    if(this.banners[i].id === banner.id) {
      idx = i;
      break;
    }
  }
  
  if (idx === -1) {
    return false;
  }
  
  this.banners.splice(idx, 1);
  
  this._save();
  
  return true;
};

/** 
 * _findById - finds the banner based on it's id
 *
 * returns null if not found, otherwise the banner
 */
BannerHandler.prototype._findById = function (id) {
  var banner = null;

  // if id isn't set then return
  if (id === null || id === undefined) {
    return banner;
  }

  for (var i in this.banners) {
    if (this.banners[i].id === id) {
      return this.banners[i];
    }
  }

  return banner;
};

BannerHandler.prototype._load = function() {
  this.banners = [];

  try {
    this.banners = JSON.parse(fs.readFileSync(this.dataDirectory + BannerHandler.BANNER_FILE));
  } catch (e) {
    if (e.code === 'ENOENT') {
      // ENOENT is file not found, that is okay, just means no records
    } else {
      // unknown error, lets throw
      throw e;
    }
  }

  if (this.banners) {
    // TODO: add sorting for new structure of banner... not sure if possible
    // banner.sort(compareName);
  } else {
    this.banners = [];
  }
};

BannerHandler.prototype._save = function() {
  fs.writeFileSync(this.dataDirectory + BannerHandler.BANNER_FILE, JSON.stringify(this.banners, null, '\t'));
};

BannerHandler.prototype.setupCommsListeners = function(comms) {
  comms.on(MeltingPot.Comms.NEW_CONNECTION_ACCEPTED, function (c) {
    comms.sendMessage(c, Banner.MESSAGE_BANNERS, this.banners);
  }.bind(this));
  
  comms.on(Banner.MESSAGE_ADD_BANNER, function (c, d) {
    comms.sendMessage(c, Banner.MESSAGE_ADD_BANNER, this.addBanner(d));
  }.bind(this));

  comms.on(Banner.MESSAGE_UPDATE_BANNER, function (c, d) {
    var banner = this.updateBanner(d);
    
    if (banner !== null) {
      comms.sendMessage(c, Banner.MESSAGE_UPDATE_BANNER, banner);
    }
  }.bind(this));

  comms.on(Banner.MESSAGE_DELETE_BANNER, function (c, d) {
    if(this.removeBanner(d)) {
      comms.sendMessage(c, Banner.MESSAGE_DELETE_BANNER, d);
    }
  }.bind(this));

  comms.on(Banner.MESSAGE_GET_BANNERS, function (c) {
    comms.sendMessage(c, Banner.MESSAGE_BANNERS, this.banners);
  }.bind(this));
};

BannerHandler.messageHandler = function (comms, connection, msgId, msgBody) {
  var messageProcessed = false;
  
  switch (msgId) {
    case Banner.MESSAGE_ADD_BANNER:
      comms.emit(Banner.MESSAGE_ADD_BANNER, connection, msgBody);
      messageProcessed = true;
      break;

    case Banner.MESSAGE_DELETE_BANNER:
      comms.emit(Banner.MESSAGE_DELETE_BANNER, connection, msgBody);
      messageProcessed = true;
      break;

    case Banner.MESSAGE_UPDATE_BANNER:
      comms.emit(Banner.MESSAGE_UPDATE_BANNER, connection, msgBody);
      messageProcessed = true;
      break;

    case Banner.MESSAGE_GET_BANNER:
      comms.emit(Banner.MESSAGE_GET_BANNERS, connection);
      messageProcessed = true;
      break;
  }
  
  return messageProcessed;
};

