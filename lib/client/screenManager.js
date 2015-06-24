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
  this.screenPaddingEnabled = false;
  this.screenBurnGuard = false;

  this.colors = ['#FF0000','#00FF00','#0000FF'];
  this.currentColor = 0;
  this.delay = 5000;
  this.scrollDelay = 1000;
  this.burnGuardLine;
  this.currentTimer;
}


ScreenManager.prototype.preferencesChanged = function (systemPreferences) {
  var updatePadding = false;
  var updateBurnGuard = false;
  
  if (this.screenPaddingTop !== systemPreferences.screenPaddingTop) {
    updatePadding = true;
  }

  if (this.screenPaddingBottom !== systemPreferences.screenPaddingBottom) {
    updatePadding = true;
  }

  if (this.screenPaddingLeft !== systemPreferences.screenPaddingLeft) {
    updatePadding = true;
  }

  if (this.screenPaddingRight !== systemPreferences.screenPaddingRight) {
    updatePadding = true;
  }
  
  if (this.screenPaddingEnabled !== systemPreferences.screenPaddingEnabled) {
    this.screenPaddingEnabled = systemPreferences.screenPaddingEnabled;
    updatePadding = true;
  }

  if (this.screenBurnGuard !== systemPreferences.screenBurnGuard) {
    this.screenBurnGuard = systemPreferences.screenBurnGuard;
    updateBurnGuard = true;
  }
  
  if (updatePadding) {
    if(this.screenPaddingEnabled) {
      this.screenPaddingTop = systemPreferences.screenPaddingTop;
      this.screenPaddingBottom = systemPreferences.screenPaddingBottom;
      this.screenPaddingLeft = systemPreferences.screenPaddingLeft;
      this.screenPaddingRight = systemPreferences.screenPaddingRight;
    } else {
      this.screenPaddingTop = 0;
      this.screenPaddingBottom = 0;
      this.screenPaddingLeft = 0;
      this.screenPaddingRight = 0;
    }

    this._updatePadding();
  }
  
  if (updateBurnGuard) {
    this._updateBurnGuard();
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
  $('html').css("background-position-y", this.screenPaddingTop + 'px');
  
  // adjust the 'heading' as it is fixed to the top
  $('div .navbar-fixed-top').css("padding-top", this.screenPaddingTop + 'px');
  $('div .navbar-fixed-top').css("padding-left", this.screenPaddingLeft + 'px');
};

/**
 * burn guard logic originally provided via stackoverflow by Brad Christie.
 * 
 * Refer http://jsfiddle.net/bradchristie/4w2K3/3/ and http://stackoverflow.com/a/4741944/1125784
 */
ScreenManager.prototype._updateBurnGuard = function () {
  if(this.screenBurnGuard) {
    burnGuardLine = $('<div>').attr('id', 'burnGuard').css({
        'background-color': '#FF00FF',
        'width': '1px',
        'height': '100%',
        'position': 'absolute',
        'top': '0px',
        'left': '0px',
        'display': 'none'
    }).appendTo('body');
    
    this.currentTimer = setTimeout(this._burnGuardAnimate.bind(this), this.delay);
  } else {
    $('#burnGuard').remove();
    
    if(this.currentTimer !== null && this.currentTimer !== undefined) {
      clearTimeout(this.currentTimer);
    }
  }
};

ScreenManager.prototype._burnGuardAnimate = function () {
  this.currentColor = ++this.currentColor % 3;

  var rColor = this.colors[this.currentColor];

  burnGuardLine.css({
    'left': '0px',
    'background-color': rColor,
  }).show().animate({
    'left': $(window).width()+'px'
  }, this.scrollDelay, function () {
    $(this).hide();
  });

  this.currentTimer = setTimeout(this._burnGuardAnimate.bind(this), this.delay);
}

