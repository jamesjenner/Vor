/* jshint browser: true, jquery: true */
/* global bootbox:false, console:false, Banner:false, addBanner:false */
/*
 * bannerDialog.js
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


BannerDialog.ADD = 'add';
BannerDialog.UPDATE = 'update';

function BannerDialog(options) {
};


BannerDialog.prototype.display = function (mode, banner) {
  var title = '';
  var buttonLabel = '';
  this.mode = mode;
  banner = (banner !== undefined || banner !== null) ? banner : {};

  switch(this.mode) {
    case BannerDialog.ADD:
      title = "Add a Banner";
      buttonLabel = "Create";
      break;

    case BannerDialog.UPDATE:
      title = "Modify Banner";
      buttonLabel = "Apply"
      break;
  }  
  
  var successCallback = this._applyValues.bind(this);
  
  bootbox.dialog({
    title: title,
    message: '<div class="row">  ' +
             '  <div class="col-md-12"> ' +
             '    <form class="form-horizontal"> ' +
    
//  $('[name=bannerDialogReferenceIsURL]').val(banner.referenceIsURL);
//  $('[name=bannerDialogHeadlineColor]').val(banner.headlineColor);
//  $('[name=bannerDialogSubHeadlineColor]').val(banner.subHeadlineColor);
//  $('[name=bannerDialogContentColor]').val(banner.contentColor);
//  $('[name=bannerDialogReferenceColor]').val(banner.referenceColor);
//  $('[name=bannerDialogEffectiveFrom]').val(banner.effectiveFrom);
//  $('[name=bannerDialogEffectiveTo]').val(banner.effectiveTo);
    
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogHeadline">Headline</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input name="bannerDialogHeadline" type="text" placeholder="The headline of the banner" class="form-control input-md"> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogSubHeadline">Sub-Headline</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input name="bannerDialogSubHeadline" type="text" placeholder="The sub-headline of the banner" class="form-control input-md"> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogReference">Reference</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input name="bannerDialogReference" type="text" placeholder="A human readable reference for the banner topic" class="form-control input-md"> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' + 
             '        <label class="col-md-4 control-label" for="bannerDialogReferenceIsURL">Is Reference a URL?</label> ' + 
             '        <div class="col-md-1"> ' + 
             '          <input name="bannerDialogReferenceIsURL" type="checkbox" required="required" class="form-control" data-toggle="toggle" placeholder="" /> ' + 
             '        </div> ' + 
             '      </div> ' + 
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogContent">Content</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input name="bannerDialogContent" type="text" placeholder="Banner html content" class="form-control input-md"> ' +
             '        </div> ' +
             '      </div> ' +
    
             '    </form>' +
             '  </div>' +
             '</div>',
    buttons: {
      success: {
        label: buttonLabel,
        className: "",
        callback: successCallback
      }
    }
  });
  
  if(this.mode === BannerDialog.UPDATE) {
    this._setValues(banner);
  } else {
    this._setValues(new Banner());
  }

  $('[name=bannerDialogReferenceIsURL]').bootstrapToggle({
    on: 'Yes',
    off: 'No'
  });  

  $('.selectpicker').selectpicker();
};

BannerDialog.prototype.getValues = function() {
  return this.banner;
};

BannerDialog.prototype._applyValues = function() {
  if(this.mode === BannerDialog.ADD) {
    this.banner = new Banner();
  }
  
  this.banner.headline = $('[name=bannerDialogHeadline]').val();
  this.banner.subHeadline = $('[name=bannerDialogSubHeadline]').val();
  this.banner.content = $('[name=bannerDialogContent]').val();
  this.banner.reference = $('[name=bannerDialogReference]').val();
  this.banner.headlineColor = $('[name=bannerDialogHeadlineColor]').val();
  this.banner.subHeadlineColor = $('[name=bannerDialogSubHeadlineColor]').val();
  this.banner.contentColor = $('[name=bannerDialogContentColor]').val();
  this.banner.referenceColor = $('[name=bannerDialogReferenceColor]').val();
  this.banner.effectiveFrom = $('[name=bannerDialogEffectiveFrom]').val();
  this.banner.effectiveTo = $('[name=bannerDialogEffectiveTo]').val();

  this.banner.referenceIsURL = this._getCheckedValue('bannerDialogReferenceIsURL');
  
  if(this.mode === BannerDialog.ADD) {
    bannerManager.add(this.banner);
  } else {
    bannerManager.update(this.banner);
  }
};


BannerDialog.prototype._getCheckedValue = function(fieldName) {
  if($('[name=' + fieldName + ']:checked').val()) {
    return true;
  } else {
    return false;
  }
};

BannerDialog.prototype._setValues = function(banner) {
  this.banner = banner;
  
  $('[name=bannerDialogHeadline]').val(banner.headline);
  $('[name=bannerDialogSubHeadline]').val(banner.subHeadline);
  $('[name=bannerDialogContent]').val(banner.content);
  $('[name=bannerDialogReference]').val(banner.reference);
  $('[name=bannerDialogReferenceIsURL]').val(banner.referenceIsURL);
  $('[name=bannerDialogHeadlineColor]').val(banner.headlineColor);
  $('[name=bannerDialogSubHeadlineColor]').val(banner.subHeadlineColor);
  $('[name=bannerDialogContentColor]').val(banner.contentColor);
  $('[name=bannerDialogReferenceColor]').val(banner.referenceColor);
  $('[name=bannerDialogEffectiveFrom]').val(banner.effectiveFrom);
  $('[name=bannerDialogEffectiveTo]').val(banner.effectiveTo);

  $('[name=bannerDialogReferenceIsURL]').prop('checked', this.banner.referenceIsURL).change();
};
