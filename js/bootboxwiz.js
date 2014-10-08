this['bootBoxWiz'] = {};
    
BootBoxWiz.COLOR_MODE_RANGE = "colorModeRange";

function BootBoxWiz(options) {
  options = options || {};

  this.onFinish = ((options.onFinish !== null && options.onFinish !== undefined) ? options.onFinish : function() {});

  this.stepBaseId = ((options.stepBaseId !== null && options.stepBaseId !== undefined) ? options.stepBaseId : 'wizardContent');
  this.stepContent = ((options.stepContent !== null && options.stepContent !== undefined) ? options.stepContent : ['']);
  this.stepIds = ((options.stepIds !== null && options.stepIds !== undefined) ? options.stepIds : ['']);
  
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
      '  <svg class="stepwizard-row" viewBox="0 0 1000 50" style="width: inherit">' +
      '    <line x1="0" y1="25" x2="1000" y2="25" style="stroke:darkgray; stroke-width:1" />';
    
    //'    <svg class="stepwizard-row" height="25px" viewBox="0 0 800 50" style="width: inherit">' +
    //'      <text text-anchor="middle" x="200" y="25" style="font-family: Times New Roman; font-size: 24; stroke: #000000; fill: #000000; dominant-baseline: middle; dy=".3em">1</text>' +
    
    var 
    
    for(i = 0; i < this.nbrSteps; i++) {
      messageContent += 
        '    <circle id="wizardStepInd' + this.nbrSteps + '" cx="' + (xFreq + (xFreq * this.nbrSteps)) + '" cy="25" r="20" stroke="darkgray" stroke-width="1" fill="white" />' +
        '    <text id="wizardStepIndText' + this.nbrSteps + '" text-anchor="middle" x="' + (xFreq + (xFreq * this.nbrSteps)) + '" y="25" style="font-size: 18; dominant-baseline: middle;" fill:"lightgray" >' + (this.nbrSteps + 1) + '</text>';

        
//        '    <circle id="wizardStepInd1" cx="200" cy="25" r="20" stroke="#428bca" stroke-width="1" fill="#428bca" />' +
//        '    <text id="wizardStepIndText1" text-anchor="middle" x="200" y="25" style="font-size: 18; dominant-baseline: middle;">1</text>' +
//        '    <circle id="wizardStepInd2" cx="400" cy="25" r="20" stroke="darkgray" stroke-width="1" fill="white" />' +
//        '    <text id="wizardStepIndText2" text-anchor="middle" x="400" y="25" style="font-size: 18; dominant-baseline: middle;" fill:"lightgray" >2</text>' +
//        '    <circle id="wizardStepInd3" cx="600" cy="25" r="20" stroke="darkgray" stroke-width="1" fill="white" />' +
//        '    <text id="wizardStepIndText3" text-anchor="middle" x="600" y="25" style="font-size: 18; dominant-baseline: middle;">3</text>' +
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
      '      <div class="row wizardContent" id="wizardContent' + i + '">' +
      this.stepContent[i] +
      '      </div>';
  }
  
  messageContent += 
    '    </form>' +
    '  </div>' +
    '</div>';
    
    
  this.dialog = bootbox.dialog({
    title: "Add a Widget",
    message: messageContent,
    buttons: {
      previous: {
        label: "Previous",
        // className: "pull-left btn-default",
        className: "btn-default",
        callback: this.previousStep
      },
      next: {
        label: "Next",
        className: "btn-primary",
        callback: this.nextStep
      },
      finish: {
        label: "Finish",
        className: "",
        callback: this.onFinish
      }
    }
  });  

  this.wizNavListItems = $('div.wizardNavPanel div a');
  this.wizContent = $('.wizardContent');
  this.currentWizPanel = 1;
  this.nbrPanels = $('div.wizardNavPanel div a').length;

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
  });
}

BootBoxWiz.prototype.nextStep = function() {
  this._hideWizPanel(this.currentWizPanel++);
  this._showWizPanel(this.currentWizPanel);

  $('#title').focus();

  this._setPreviousDisabled(false);

  if(this.currentWizPanel === this.nbrPanels) {
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

  if(this.currentWizPanel === 1) {
    this._setPreviousDisabled(true);
  }

  return false;
}

BootBoxWiz.prototype._hideAllSteps = function() {
  $('.wizardContent').hide();
}

BootBoxWiz.prototype._hideWizPanel = function(counter) {
  $('#wizardContent' + counter).hide();
  $('#wizardStepInd' + counter).attr("fill", "white");
  $('#wizardStepInd' + counter).attr("stroke", "darkgray");
  $('#wizardStepIndText' + counter).attr("fill", "lightgray");
}

BootBoxWiz.prototype._showWizPanel = function(counter) {
  $('#wizardContent' + counter).show();
  $('#wizardStepInd' + counter).attr("fill", "#428bca");
  $('#wizardStepInd' + counter).attr("stroke", "#428bca");
  $('#wizardStepIndText' + counter).attr("fill", "white");
  $('#title').focus();
}

BootBoxWiz.prototype._setPreviousDisabled = function(disable) {
  getBootBoxButton('previous').prop('disabled', disable);
}

BootBoxWiz.prototype._setNextDisabled = function(disable) {
  getBootBoxButton('next').prop('disabled', disable);
}

BootBoxWiz.prototype._setFinishDisabled = function(disable) {
  getBootBoxButton('finish').prop('disabled', disable);
}

BootBoxWiz.prototype.getBootBoxButton = function(label) {
  return $(".bootbox").find('button[data-bb-handler="' + label + '"]');
}