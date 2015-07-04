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

             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogHeadline">Headline</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input name="bannerDialogHeadline" type="text" placeholder="The headline of the banner" class="form-control input-md" /> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogHeadlineColor">Headline Color</label> ' +
             '        <div id="bannerDialogHeadlineColorDiv" class="col-md-6 component"> ' +
             '          <input name="bannerDialogHeadlineColor" type="text" class="form-control input-md form-component" /> ' +
             '          <span class="input-group-addon form-control "><i></i></span> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogSubHeadline">Sub-Headline</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input name="bannerDialogSubHeadline" type="text" placeholder="The sub-headline of the banner" class="form-control input-md" /> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogSubHeadlineColor">Sub-Headline Color</label> ' +
             '        <div id="bannerDialogSubHeadlineColorDiv" class="col-md-6 component"> ' +
             '          <input name="bannerDialogSubHeadlineColor" type="text" class="form-control input-md form-component" /> ' +
             '          <span class="input-group-addon form-control "><i></i></span> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogReference">Reference</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input name="bannerDialogReference" type="text" placeholder="A human readable reference for the banner topic" class="form-control input-md" /> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogReferenceColor">Reference Color</label> ' +
             '        <div id="bannerDialogReferenceColorDiv" class="col-md-6 component"> ' +
             '          <input name="bannerDialogReferenceColor" type="text" class="form-control input-md form-component" /> ' +
             '          <span class="input-group-addon form-control "><i></i></span> ' +
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
             '          <input name="bannerDialogContent" type="text" placeholder="Banner html content" class="form-control input-md" /> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogContentColor">Content Color</label> ' +
             '        <div id="bannerDialogContentColorDiv" class="col-md-6 component"> ' +
             '          <input name="bannerDialogContentColor" type="text" class="form-control input-md form-component" /> ' +
             '          <span class="input-group-addon form-control"><i></i></span> ' +
             '        </div> ' +
             '      </div> ' +
    
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogEffectiveFrom">Effective From</label> ' +
             '        <div class="col-md-6">' +
             '          <div class="input-group date" id="bannerDialogEffectiveFrom">' +
             '            <input name="bannerDialogEffectiveFrom" type="text" class="form-control" />' +
             '            <span class="input-group-addon datepickerbutton">' +
             '              <span class="fa fa-clock-o form-input-addon-icon">' +
             '              </span>' +
             '            </span>' +
             '          </div>' +
             '        </div>' +
             '      </div> ' +

             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="bannerDialogEffectiveTo">Effective To</label> ' +
             '        <div class="col-md-6">' +
             '          <div class="input-group date" id="bannerDialogEffectiveTo">' +
             '            <input name="bannerDialogEffectiveTo" type="text" class="form-control" />' +
             '            <span class="input-group-addon datepickerbutton">' +
             '              <span class="fa fa-clock-o form-input-addon-icon">' +
             '              </span>' +
             '            </span>' +
             '          </div>' +
             '        </div>' +
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
  
  var dateFieldOptions = {
    showTodayButton: true,
    format: "DD/MM/YYYY",
    icons: {
      time: "fa fa-clock-o",
      date: "fa fa-calendar",
      up: "fa fa-arrow-up",
      down: "fa fa-arrow-down"
    }
  };
  
  $('#bannerDialogEffectiveFrom').datetimepicker(dateFieldOptions);
  $('#bannerDialogEffectiveTo').datetimepicker(dateFieldOptions);
  
  $('#bannerDialogHeadlineColorDiv').colorpicker();
  $('#bannerDialogSubHeadlineColorDiv').colorpicker();
  $('#bannerDialogReferenceColorDiv').colorpicker();
  $('#bannerDialogContentColorDiv').colorpicker();

  $('.selectpicker').selectpicker();
};

BannerDialog.prototype.getValues = function() {
  return this.banner;
};

BannerDialog.prototype._applyValues = function() {
  if(this.mode === BannerDialog.ADD) {
    this.banner = new Banner();
  }

  // TODO: support date fields
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
  this.banner = new Banner(banner);
  
  // TODO: support date fields
  $('[name=bannerDialogHeadline]').val(this.banner.headline);
  $('[name=bannerDialogSubHeadline]').val(this.banner.subHeadline);
  $('[name=bannerDialogContent]').val(this.banner.content);
  $('[name=bannerDialogReference]').val(this.banner.reference);
  $('[name=bannerDialogReferenceIsURL]').val(this.banner.referenceIsURL);
  $('[name=bannerDialogHeadlineColor]').val(this.banner.headlineColor);
  $('[name=bannerDialogSubHeadlineColor]').val(this.banner.subHeadlineColor);
  $('[name=bannerDialogContentColor]').val(this.banner.contentColor);
  $('[name=bannerDialogReferenceColor]').val(this.banner.referenceColor);
  $('[name=bannerDialogEffectiveFrom]').val(this.banner.effectiveFrom);
  $('[name=bannerDialogEffectiveTo]').val(this.banner.effectiveTo);

  $('[name=bannerDialogReferenceIsURL]').prop('checked', this.banner.referenceIsURL).change();
};
