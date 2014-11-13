/* global $:false,bootbox,document,BootBoxWiz */

/*
 * Main javascript logic for index.html
 * 
 * Dependancies:
 *    jquery
 *    css/styles.css
 */

function configureApplication() {
  addApplicationButtonListeners();
}

function addApplicationButtonListeners() {
  
  $("body").on('change', '#toggleConfigMode', function() {
    toggleConfigMode();
  });
  
  $("body").on('click', '#viewHome', function() {
    toggleButtonViewSelection('viewHome');
    showPanelButton('addPanel');
    displayPane("homePane");
  });
  
  $("body").on('click', '#viewSettings', function() {
    toggleButtonViewSelection('viewSettings');
    hidePanelButton('addPanel');
    displayPane("settingsPane");
  });
  
  $("body").on('click', '#viewThemes', function() {
    toggleButtonViewSelection('viewThemes');
    hidePanelButton('addPanel');
    displayPane("themesPane");
  });
    
  $("body").on('click', '#viewContent', function() {
    toggleButtonViewSelection('viewContent');
    hidePanelButton('addPanel');
    displayPane("bannerContentPane");
  });
    
  $("#viewDataSources").on('click', function() {
    // addDataSource();
    toggleButtonViewSelection('viewDataSources');
    hidePanelButton('addPanel');
    displayPane("dataSourcesPane");
  });
  
  $("body").on('click', '#addPanel', function() {
    addPanel();
  });
}

function toggleConfigMode() {
  var currentPaneId = $('.activePane').attr('id');
  
  if(currentPaneId !== "") {
    $("#viewHome").trigger('click');
  }
  
  $(".configButtons").fadeToggle("slow", function() {}).toggleClass('displayButton').css("display","");
}

function toggleButtonViewSelection(buttonId) {
  var previousId = $('.configButtonActive').attr('id');

  $('#' + previousId).toggleClass('configButtonInactive');
  $('#' + previousId).toggleClass('configButtonActive');
  
  $('#' + buttonId).toggleClass('configButtonInactive');
  $('#' + buttonId).toggleClass('configButtonActive');
  
  // toggleClass('configButtonActive');
  
}

function showPanelButton(buttonId) {
  $('#' + buttonId).removeClass('hiddenButton');
}

function hidePanelButton(buttonId) {
  $('#' + buttonId).addClass('hiddenButton');
}

function displayPane(paneId) {
  var previousId = $('.activePane').attr('id');
  
  if(previousId === paneId) {
    return;
  }
  
  $('#' + previousId).fadeToggle("fast", function() {
    $(this).toggleClass('activePane');
    $('#' + paneId).fadeToggle("fast", function() {
      $(this).toggleClass('activePane');
    });
  });
}

function addPanel() {
  bootbox.dialog({
    title: "Add a Panel",
    message: '<div class="row">  ' +
             '  <div class="col-md-12"> ' +
             '    <form class="form-horizontal"> ' +
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="title">Title</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input id="title" name="title" type="text" placeholder="The title of the new panel" class="form-control input-md"> ' +
             '        </div> ' +
             '      </div> ' +
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="icon">Inbuilt Icons</label> ' +
             '        <div class="col-md-4">' + 
             '          <button id="selectPanelIcon" class="btn btn-default iconpicker" data-iconset="fontawesome" role="iconpicker"></button>' +
             '        </div>' +
             '      </div>' +
             '    </form>' +
             '  </div>' +
             '</div>',
    buttons: {
      success: {
        label: "Create",
        className: "",
        callback: function() {
          var title = $('#title').val();
          var icon = $('#selectPanelIcon input').val();

          insertPanel(title, icon);
        }
      }
    }
  });
  
  $('#selectPanelIcon').iconpicker({ 
    iconset: 'fontawesome',
    icon: 'fa-key', 
    rows: 10,
    cols: 10,
    placement: 'bottom',
    search: false,
  });

  $('#selectPanelIcon').on('change', function(e) { 
  //    console.log(e.icon);
  });

  // $('#selectPanelIcon').iconpicker('setIcon', 'fa-group');
}

function addWidget(panelIdSelecter) {
  var addWidgetWizardDialog = new BootBoxWiz({
    title: 'Add a Widget',
    guideEnabled: false,
    stepContent: [ {
      type: BootBoxWiz.TYPE_FIXED,
      title: "Step 1",
      content:
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="widgetTitle">Title</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="widgetTitle" name="widgetTitle" type="text" placeholder="Enter the title for the widget" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div> ' +
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetType">Type</label> ' +
      '  <div class="col-md-4">' + 
      '    <select name="widgetType" class="selectpicker">' +     
      '      <option>Value</option>' + 
      '      <option>State</option>' + 
      '      <option>Graph</option>' + 
      '      <option>Graph Over Time</option>' + 
      '      <option>History</option>' + 
      '    </select>' + 
      '  </div>' +
      '</div>' +
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetDataSource">Data Source</label> ' +
      '  <div class="col-md-4">' + 
      '    <select name="widgetDataSource" class="selectpicker">' +     
      '      <option>Version One</option>' + 
      '      <option>Jenkins</option>' + 
      '      <option>Hudson</option>' + 
      '      <option>Salesforce.com</option>' + 
      '      <option>Internal</option>' + 
      '    </select>' + 
      '  </div>' +
      '</div>',
    },
    {
      type: BootBoxWiz.TYPE_DYNAMIC,
      title: "Step 2",
      logic: addWidgetDialogWidgetTypeLogic,
      titles: [
        'Paypal',
        'Credit Card',
        'Electronic Funds Transfer',
        'Bitcoin',
      ],
      content: [

      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1HostName">Hostname</label>' +
      '      <input name="v1HostName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the hostname" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Instance">Instance</label>' +
      '      <input name="v1Instance" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the version one instance" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1UserName">Username</label>' +
      '      <input name="v1UserName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter username" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Password">Password</label>' +
      '      <input name="v1Password" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the password" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Port">Port</label>' +
      '      <input name="v1Port" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the port" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Protocol">Protocol</label>' +
      '      <input name="v1Protocol" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the protocol (http|https)" />' +
      '    </div>' +
      '  </div>' +
      '</div>',

      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="creditCardName">Name</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="creditCardName" name="creditCardName" type="text" placeholder="Enter the name on the credit card" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div> ' +
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="creditCardNumber">Credit Card Number</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="creditCardNumber" name="creditCardNumber" type="text" placeholder="Enter the number of the credit card" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div>' +
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="creditCardExpiry">Expiry Date</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="creditCardExpiry" name="creditCardExpiry" type="text" placeholder="Enter the expiry for the credit card" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div>' +
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="creditCardSecurity">Credit Card Security</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="creditCardSecurity" name="creditCardSecurity" type="text" placeholder="Enter the credit card security id" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div>',


      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="eftAccountName">Account Name</label>' +
      '      <input name="eftAccountName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the name of your account" />' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="eftBSB">BSB</label>' +
      '      <input name="eftBSB" maxlength="8" type="text" required="required" class="form-control" placeholder="Enter your bank\'s BSB" />' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="eftAccountNumber">Account Number</label>' +
      '      <input name="eftAccountNumber" maxlength="30" type="text" required="required" class="form-control" placeholder="Enter your bank account" />' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="eftReference">Reference</label>' +
      '      <input name="eftReference" maxlength="30" type="text" class="form-control" placeholder="Enter a reference" />' +
      '    </div>' +
      '  </div>' +
      '</div>',

      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="bitcoinTransId">To Address</label>' +
      '      <input name="bitcoinTransId" maxlength="100" type="text" required="required" class="form-control" placeholder="Enter the transaction id" />' +
      '    </div>' +
      '  </div>' +
      '</div>',
      ],
    },
    {
      type: BootBoxWiz.TYPE_FIXED,
      title: "Step 3",
      content: 
      '<div class="col-xs-12">' +
      '  <label class="col-md-4 control-label" for="feedback">Feedback?</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="feedback" name="feedback" type="text" placeholder="Enter feedback on your transaction experiance" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div>'
    }
    ]
  });
  addWidgetWizardDialog.launch();
  $('.selectpicker').selectpicker();
}

function addWidgetDialogWidgetTypeLogic(fields) {
  var paymentType = ((fields.paymentType !== null && fields.paymentType !== undefined) ? fields.paymentType : 'Value');

  switch(paymentType) {
    case "Value":
      return 0;
      
    case "State":
      return 1;
      
    case "Graph":
      return 2;
      
    case "Graph Over Time":
      return 3;
      
    case "History":
      return 4;
  }

  return 0;
}

function addWidgetDialogDataSourceLogic(fields) {
  var paymentType = ((fields.paymentType !== null && fields.paymentType !== undefined) ? fields.paymentType : 'Version One');

  switch(paymentType) {
    case "Version One":
      return 0;
      
    case "Jenkins":
      return 1;
      
    case "Hudson":
      return 2;
      
    case "Salesforce.com":
      return 3;
      
    case "Internal":
      return 4;
  }

  return 0;
}

function addDataSource(panelIdSelecter) {
  var addWidgetWizardDialog = new BootBoxWiz({
    title: 'Add a Data Source',
    guideEnabled: false,
    stepContent: [ {
      type: BootBoxWiz.TYPE_FIXED,
      title: "Step 1",
      content:
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="dataSourceName">Name</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="dataSourceName" name="dataSourceName" type="text" placeholder="Enter the name for the data source" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div> ' +
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="dataSourceType">Type</label> ' +
      '  <div class="col-md-4">' + 
      '    <select name="dataSourceType" class="selectpicker">' +     
      '      <option>Version One</option>' + 
      '      <option>Jenkins</option>' + 
      '      <option>Hudson</option>' + 
      '      <option>Salesforce.com</option>' + 
      '      <option>Internal</option>' + 
      '    </select>' + 
      '  </div>' +
      '</div>',
    },
    {
      type: BootBoxWiz.TYPE_DYNAMIC,
      title: "Step 2",
      logic: addDataSourceDialogSourceLogic,
      titles: [
        'Version One',
        'Jenkins',
        'Hudson',
        'Salesforce.com',
        'Internal',
      ],
      content: [

      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1HostName">Hostname</label>' +
      '      <input name="v1HostName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the hostname" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Instance">Instance</label>' +
      '      <input name="v1Instance" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the version one instance" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1UserName">Username</label>' +
      '      <input name="v1UserName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter username" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Password">Password</label>' +
      '      <input name="v1Password" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the password" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Port">Port</label>' +
      '      <input name="v1Port" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the port" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Protocol">Protocol</label>' +
      '      <input name="v1Protocol" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the protocol (http|https)" />' +
      '    </div>' +
      '  </div>' +
      '</div>',

      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="creditCardName">Name</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="creditCardName" name="creditCardName" type="text" placeholder="Enter the name on the credit card" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div> ' +
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="creditCardNumber">Credit Card Number</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="creditCardNumber" name="creditCardNumber" type="text" placeholder="Enter the number of the credit card" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div>' +
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="creditCardExpiry">Expiry Date</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="creditCardExpiry" name="creditCardExpiry" type="text" placeholder="Enter the expiry for the credit card" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div>' +
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="creditCardSecurity">Credit Card Security</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="creditCardSecurity" name="creditCardSecurity" type="text" placeholder="Enter the credit card security id" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div>',


      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="eftAccountName">Account Name</label>' +
      '      <input name="eftAccountName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the name of your account" />' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="eftBSB">BSB</label>' +
      '      <input name="eftBSB" maxlength="8" type="text" required="required" class="form-control" placeholder="Enter your bank\'s BSB" />' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="eftAccountNumber">Account Number</label>' +
      '      <input name="eftAccountNumber" maxlength="30" type="text" required="required" class="form-control" placeholder="Enter your bank account" />' +
      '    </div>' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="eftReference">Reference</label>' +
      '      <input name="eftReference" maxlength="30" type="text" class="form-control" placeholder="Enter a reference" />' +
      '    </div>' +
      '  </div>' +
      '</div>',

      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="bitcoinTransId">To Address</label>' +
      '      <input name="bitcoinTransId" maxlength="100" type="text" required="required" class="form-control" placeholder="Enter the transaction id" />' +
      '    </div>' +
      '  </div>' +
      '</div>',
      ],
    }
    ]
  });
  addWidgetWizardDialog.launch();
  $('.selectpicker').selectpicker();
}

function addDataSourceDialogSourceLogic() {
  var paymentType = ((fields.paymentType !== null && fields.paymentType !== undefined) ? fields.paymentType : 'Version One');

  switch(paymentType) {
    case "Version One":
      return 0;
      
    case "Jenkins":
      return 1;
      
    case "Hudson":
      return 2;
      
    case "Salesforce.com":
      return 3;
      
    case "Internal":
      return 4;
  }

  return 0;
}

function insertPanel(title, icon, column) {
  title = ((title !== null && title !== undefined) ? title : "");
  icon = ((icon !== null && icon !== undefined) ? icon : "fa-group");
  column = ((column !== null && column !== undefined) ? column : 1);

  $("#columnContainer" + column).append(
    '<div id="panel' + title + '" class="panel">' +
    '  <div class="panel-heading">' +
    '      <div class="btn-group pull-right">' +
    '        <button id="panelBtnAddWidget' + title + '" type="button" class="configButtons btn btn-default btn-sml" style="display: block;">' +
    '          <i class="fa fa-plus "></i>' +
    '        </button>' +
    '        <button id="panelBtnRemoveWidget' + title + '" type="button" class="configButtons btn btn-default btn-sml" style="display: block;">' +
    '          <i class="fa fa-minus"></i>' +
    '        </button>' +
    '        <button id="panelBtnDelete' + title + '" type="button" class="configButtons btn btn-default btn-sml" style="display: block;">' +
    '          <i class="fa fa-trash"></i>' +
    '        </button>' +
    '        <button id="panelBtnMoveDown' + title + '" type="button" class="configButtons btn btn-default btn-sml" style="display: block;">' +
    '          <i class="fa fa-arrow-down"></i>' +
    '        </button>' +
    '        <button id="panelBtnMoveUp' + title + '" type="button" class="configButtons btn btn-default btn-sml" style="display: block;">' +
    '          <i class="fa fa-caret-up"></i>' +
    '        </button>' +
    '        <button id="panelBtnMoveLeft' + title + '" type="button" class="configButtons btn btn-default btn-sml" style="display: block;">' +
    '          <i class="fa fa-arrow-left"></i>' +
    '        </button>' +
    '        <button id="panelBtnMoveRight' + title + '" type="button" class="configButtons btn btn-default btn-sml" style="display: block;">' +
    '          <i class="fa fa-chevron-right"></i>' +
    '        </button>' +
    '      </div>' +
    '    <i class="fa ' + icon + ' fa-lg"></i> ' + title +
    '  </div>' +
    '  <div class="panel-body widget-container">' +
    '  </div>' +
    '</div>'
  );
  
  $('#panel' + title).hide().fadeIn('slow');
  
  $('#panelBtnAddWidget' + title).on('click', function() {
    addWidget('#panel' + title);
  });
    
  $('#panelBtnRemoveWidget' + title).on('click', function() {
  });
    
  $('#panelBtnDelete' + title).on('click', function() {
    deletePanel(title);
  });
    
  $('#panelBtnMoveDown' + title).on('click', function() {
    movePanelDown(title);
  });
    
  $('#panelBtnMoveUp' + title).on('click', function() {
    movePanelUp(title);
  });
    
  $('#panelBtnMoveLeft' + title).on('click', function() {
    movePanelLeft(title);
  });
    
  $('#panelBtnMoveRight' + title).on('click', function() {
    movePanelRight(title);
  });
}

function deletePanel(title) {
  $('#panel' + title)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
}

function movePanelDown(title) {
  var panelList = getPanelList(title);
  
  if(panelList['panel' + title].position < (Object.keys(panelList).length - 1)) {
    // move down
    swapPanel(panelList['panel' + title].id, panelList['panel' + title].nextId);
  }
}

function movePanelUp(title) {
  // $('#panel' + title).remove();
  var panelList = getPanelList(title);
  
  if(panelList['panel' + title].position > 0) {
    // move up
    swapPanel(panelList['panel' + title].id, panelList['panel' + title].prevId);
  }
}

function movePanelRight(title) {
  
}

function movePanelLeft(title) {
  
}

function getPanelList(title) {
  var prevPanel = null;
  var nextPanel = null;
  var counter = 0;
  var panelList = {};
  
  $('#panel' + title).parent().children().each(function() { 
    panelList[$(this).attr('id')] = {id: $(this).attr('id'), position: counter++, value: this, prevId: null, nextId: null};
    
    if(prevPanel !== null) {
      panelList[$(this).attr('id')].prevId = prevPanel.id;
      prevPanel.nextId = $(this).attr('id');
    }
    
    prevPanel = panelList[$(this).attr('id')];
  });

  return panelList;
}

function swapPanel(a, b){ 
    a = $('#' + a)[0]; 
    b = $('#' + b)[0]; 
  
    var t = a.parentNode.insertBefore(document.createTextNode(''), a); 
  
    b.parentNode.insertBefore(a, b); 
    t.parentNode.insertBefore(b, t); 
    t.parentNode.removeChild(t); 
}

