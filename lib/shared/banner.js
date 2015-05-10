/*global window, require, console */
/*
 * banner.js
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

// "use strict"

var node = false;

if (typeof module === "undefined") {
  var module = function () {};
  var exports = this.banner = {};
  module.exports = exports;
}
if (typeof require !== "undefined") {
  var uuid = require('node-uuid');
}

module.exports = Banner;

Banner.KEY = 'Banner';

Banner.DEFAULT_HEADLINE = "";
Banner.DEFAULT_SUB_HEADLINE = "";
Banner.DEFAULT_COLOR = 'FFFFFF';

Banner.MESSAGE_ADD_BANNER = 'addBanner';
Banner.MESSAGE_UPDATE_BANNER = 'updateBanner';
Banner.MESSAGE_DELETE_BANNER = 'deleteBanner';
Banner.MESSAGE_GET_BANNERS = 'getBanners';
Banner.MESSAGE_BANNERS = 'banners';

function Banner(options) {
  options = options || {};
  
  var uuidV1 = ((options.uuidV1 !== null && options.uuidV1 !== undefined) ? options.uuidV1 : false);
  
  this.id = ((options.id !== null && options.id !== undefined) ? options.id : uuidV1 ? uuid.v1() : uuid.v4());

  this.headline = ((options.headline !== null && options.headline !== undefined) ? options.headline : Banner.DEFAULT_HEADLINE);
  this.subHeadline = ((options.subHeadline !== null && options.subHeadline !== undefined) ? options.subHeadline : Banner.DEFAULT_SUB_HEADLINE);

  this.content = ((options.content !== null && options.content !== undefined) ? options.content : '');
  
  this.reference = ((options.reference !== null && options.reference !== undefined) ? options.reference : '');
  this.referenceIsURL = ((options.referenceIsURL !== null && options.referenceIsURL !== undefined) ? options.referenceIsURL : false);

  this.headlineColor = ((options.headlineColor !== null && options.headlineColor !== undefined) ? options.headlineColor : Banner.DEFAULT_COLOR);
  this.subHeadlineColor = ((options.subHeadlineColor !== null && options.subHeadlineColor !== undefined) ? options.subHeadlineColor : Banner.DEFAULT_COLOR);
  this.contentColor = ((options.contentColor !== null && options.contentColor !== undefined) ? options.contentColor : Banner.DEFAULT_COLOR);
  this.referenceColor = ((options.referenceColor !== null && options.referenceColor !== undefined) ? options.referenceColor : Banner.DEFAULT_COLOR);
  
  this.effectiveFrom = ((options.effectiveFrom !== null && options.effectiveFrom !== undefined) ? options.effectiveFrom : '');
  this.effectiveTo = ((options.effectiveTo !== null && options.effectiveTo !== undefined) ? options.effectiveTo : '');
}

/* 
 * merge
 */
Banner.merge = function (d1, d2) {
  mergeAttribute(d1, d2, 'headline');
  mergeAttribute(d1, d2, 'subHeadline');
  mergeAttribute(d1, d2, 'content');
  mergeAttribute(d1, d2, 'reference');
  mergeAttribute(d1, d2, 'referenceIsURL');
  mergeAttribute(d1, d2, 'headlineColor');
  mergeAttribute(d1, d2, 'subHeadlineColor');
  mergeAttribute(d1, d2, 'contentColor');
  mergeAttribute(d1, d2, 'referenceColor');
};

function mergeAttribute(object, modifiedObject, attribute) {
  object[attribute] = ((modifiedObject[attribute] !== null && modifiedObject[attribute] !== undefined) ? modifiedObject[attribute] : object[attribute]);
}