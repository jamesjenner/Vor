this['bootBoxWiz'] = {};
    
BootBoxWiz.COLOR_MODE_RANGE = "colorModeRange";

function BootBoxWiz(options) {
  options = options || {};

  this.onFinish = ((options.onFinish !== null && options.onFinish !== undefined) ? options.onFinish : function() {});

  this.title = ((options.title !== null && options.title !== undefined) ? options.title : 'Wizard');

  
  this.stepBaseId = ((options.stepBaseId !== null && options.stepBaseId !== undefined) ? options.stepBaseId : 'wizard');
  this.stepContent = ((options.stepContent !== null && options.stepContent !== undefined) ? options.stepContent : ['']);
  
  this.guideEnabled = ((options.guideEnabled !== null && options.guideEnabled !== undefined) ? options.guideEnabled : true);
  
  this.nbrSteps = this.stepContent.length;
  
  this.currentStep = 1;
}

BootBoxWiz.prototype.launch = function() {
  var messageContent = '';
  var i;
  var xFreq = 1000 / this.nbrSteps;
  
  if(this.guideEnabled) {
    messageContent += 
      '<div class="stepwizard">' +
      '  <svg class="stepwizard-row" height="25px" viewBox="0 0 1000 50" style="width: inherit; padding-bottom:15px;">' +
      '    <line x1="0" y1="25" x2="1000" y2="25" style="stroke:darkgray; stroke-width:1" />';
    
    for(i = 0; i < this.nbrSteps; i++) {
      messageContent += 
        '    <circle id="' + this.stepBaseId + 'StepInd' + i + '" cx="' + ((xFreq / 2) + (xFreq * i)) + '" cy="25" r="20" stroke="darkgray" stroke-width="1" fill="white" />' +
        '    <text id="' + this.stepBaseId + 'StepIndText' + i + '" text-anchor="middle" x="' + ((xFreq / 2) + (xFreq * i)) + '" y="25" style="font-size: 18; dominant-baseline: middle;" fill:"lightgray" >' + (i + 1) + '</text>';
    }

    messageContent += 
      '  </svg>' +
      '</div>';
  }

  messageContent += 
    '<div class="row">  ' +
    '  <div class="col-md-12"> ' +
    '    <form class="form-horizontal"> ';
  
  for(var i = 0; i < this.nbrSteps; i++) {
    messageContent += 
      '      <div class="row ' + this.stepBaseId + 'wizardContent" id="' + this.stepBaseId + 'Content' + i + '">' +
      this.stepContent[i] +
      '      </div>';
  }
  
  messageContent += 
    '    </form>' +
    '  </div>' +
    '</div>';
    
  this.dialog = bootbox.dialog({
    title: this.title,
    message: messageContent,
    buttons: {
      previous: {
        label: "Previous",
        // className: "pull-left btn-default",
        className: "btn-default",
        callback: this.previousStep.bind(this)
      },
      next: {
        label: "Next",
        className: "btn-primary",
        // callback: function () {return this.nextStep()}.bind(this)
        callback: this.nextStep.bind(this)
      },
      finish: {
        label: "Finish",
        className: "",
        callback: this.onFinish
      }
    }
  });  

  // this.wizNavListItems = $('div.wizardNavPanel div a');
  // this.wizContent = $('.' + this.stepBaseId + 'wizardContent');
  this.currentWizPanel = 0;

//    // listen for clicks on wizard nav buttons
//    wizNavListItems.on('click', function (e) {
//      e.preventDefault();
//      var $target = $($(this).attr('href'));
//      var $item = $(this);
//
//      if(!$item.hasClass('disabled')) {
//        this.wizNavListItems.removeClass('btn-primary').addClass('btn-default');
//        $item.addClass('btn-primary');
//        this.wizContent.hide();
//        $target.show();
//        $target.find('input:eq(0)').focus();
//      }
//    }.bind(this));

  this._hideAllSteps();
  this._showWizPanel(this.currentWizPanel);

  this.dialog.on("shown.bs.modal", function(dialog) {
    $('#title').focus();
    this._setPreviousDisabled(true);
    this._setFinishDisabled(true);
  }.bind(this));
}

BootBoxWiz.prototype.nextStep = function() {
  this._hideWizPanel(this.currentWizPanel++);
  this._showWizPanel(this.currentWizPanel);

  $('#title').focus();

  this._setPreviousDisabled(false);

  if(this.currentWizPanel === (this.nbrSteps - 1)) {
    this._setNextDisabled(true);
    this._setFinishDisabled(false);
  }

  return false;
}

BootBoxWiz.prototype.previousStep = function() {
  this._hideWizPanel(this.currentWizPanel--);
  this._showWizPanel(this.currentWizPanel);

  $('#title').focus();

  this._setNextDisabled(false);
  this._setFinishDisabled(true);

  if(this.currentWizPanel === 0) {
    this._setPreviousDisabled(true);
  }

  return false;
}

BootBoxWiz.prototype._hideAllSteps = function() {
  $('.' + this.stepBaseId + 'wizardContent').hide();
}

BootBoxWiz.prototype._hideWizPanel = function(counter) {
  $('#' + this.stepBaseId + 'Content' + counter).hide();
  $('#' + this.stepBaseId + 'StepInd' + counter).attr("fill", "white");
  $('#' + this.stepBaseId + 'StepInd' + counter).attr("stroke", "darkgray");
  $('#' + this.stepBaseId + 'StepIndText' + counter).attr("fill", "lightgray");
}

BootBoxWiz.prototype._showWizPanel = function(counter) {
  $('#' + this.stepBaseId + 'Content' + counter).show();
  $('#' + this.stepBaseId + 'StepInd' + counter).attr("fill", "#428bca");
  $('#' + this.stepBaseId + 'StepInd' + counter).attr("stroke", "#428bca");
  $('#' + this.stepBaseId + 'StepIndText' + counter).attr("fill", "white");
  $('#title').focus();
}

BootBoxWiz.prototype._setPreviousDisabled = function(disable) {
  this._getBootBoxButton('previous').prop('disabled', disable);
}

BootBoxWiz.prototype._setNextDisabled = function(disable) {
  this._getBootBoxButton('next').prop('disabled', disable);
}

BootBoxWiz.prototype._setFinishDisabled = function(disable) {
  this._getBootBoxButton('finish').prop('disabled', disable);
}

BootBoxWiz.prototype._getBootBoxButton = function(label) {
  return $(".bootbox").find('button[data-bb-handler="' + label + '"]');
}