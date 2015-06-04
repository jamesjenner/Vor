/* jshint browser: true, jquery: true */
/* global console:false  */
/*
 * screenManager.js
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

function ScreenManager(options) {
  this.screenPaddingTop = 0;
  this.screenPaddingBottom = 0;
  this.screenPaddingLeft = 0;
  this.screenPaddingRight = 0;
}


ScreenManager.prototype.preferencesChanged = function (systemPreferences) {
  var updatePadding = false;
  
  if (this.screenPaddingTop !== systemPreferences.screenPaddingTop) {
    this.screenPaddingTop = systemPreferences.screenPaddingTop;
    updatePadding = true;
  }

  if (this.screenPaddingBottom !== systemPreferences.screenPaddingBottom) {
    this.screenPaddingBottom = systemPreferences.screenPaddingBottom;
    updatePadding = true;
  }

  if (this.screenPaddingLeft !== systemPreferences.screenPaddingLeft) {
    this.screenPaddingLeft = systemPreferences.screenPaddingLeft;
    updatePadding = true;
  }

  if (this.screenPaddingRight !== systemPreferences.screenPaddingRight) {
    this.screenPaddingRight = systemPreferences.screenPaddingRight;
    updatePadding = true;
  }

  if (updatePadding) {
    this._updatePadding();
  }
};

ScreenManager.prototype._updatePadding = function () {
  // adjust main screen
  $('html').css("padding-top", this.screenPaddingTop + 'px');
  $('html').css("padding-bottom", this.screenPaddingBottom + 'px');
  $('html').css("padding-left", this.screenPaddingLeft + 'px');
  $('html').css("padding-right", this.screenPaddingRight + 'px');
  
  // adust background image (otherwise gets chopped off)
  $('html').css("background-position-x", this.screenPaddingLeft + 'px');
  $('html').css("background-position-y", this.screenPaddingRight + 'px');
  
  // adjust the 'heading' as it is fixed to the top
  $('div .navbar-fixed-top').css("padding-top", this.screenPaddingTop + 'px');
  $('div .navbar-fixed-top').css("padding-left", this.screenPaddingLeft + 'px');
};