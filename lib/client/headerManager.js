/* jshint browser: true, jquery: true */
/* global console:false  */
/*
 * headerManager.js
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

function HeaderManager(options) {
  this.displayHeader = true;
  this.logo = '';
  this.title = "Title";
  this.subTitle = "Subtitle";
}

HeaderManager.prototype.preferencesChanged = function (systemPreferences) {
  if (this.logo !== systemPreferences.logo) {
    this.logo = systemPreferences.logo;
    this._updateLogo();
  }
  
  if (this.title !== systemPreferences.title) {
    this.title = systemPreferences.title;
    this._updateTitle();
  }
  
  if (this.subTitle !== systemPreferences.subTitle) {
    this.subTitle = systemPreferences.subTitle;
    this._updateSubTitle();
  }
  
  if (this.displayHeader !== systemPreferences.displayHeader) {
    if (this.displayHeader && !systemPreferences.displayHeader) {
      this._removeHeaderFromMain();
    }

    if (!this.displayHeader && systemPreferences.displayHeader) {
      this._addHeaderToMain();
    }

    this.displayHeader = systemPreferences.displayHeader;
  }
};

HeaderManager.prototype._updateLogo = function () {
  
};

HeaderManager.prototype._updateTitle = function () {
  $('#headerTitle').text(this.title);
};

HeaderManager.prototype._updateSubTitle = function () {
  $('#headerSubTitle').text(this.subTitle);
};

HeaderManager.prototype._removeHeaderFromMain = function () {
  $("#header-logo").addClass('hiddenBanner');
  $("#headerTitleContainer").addClass('hiddenBanner');
  // TODO: reorder controls
  $("#headerControls").removeClass('navbar-right');
  $('body').animate({paddingTop: '50px'});
};

HeaderManager.prototype._addHeaderToMain = function () {
  $("#header-logo").removeClass('hiddenBanner');
  $("#headerTitleContainer").removeClass('hiddenBanner');
  // TODO: reorder controls
  $("#headerControls").addClass('navbar-right');
  $('body').animate({paddingTop: '70px'});
};
