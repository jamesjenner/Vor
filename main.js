/* global $:false,bootbox,document,BootBoxWiz,Server,processPanelMessages,processDataSourceMessages,displayAddPanelDialog */

/*
 * Main javascript logic for index.html
 * 
 * Dependancies:
 *    jquery
 *    css/styles.css
 */

var server = null;
var addPanelMode = false;

function configureApplication() {
  addApplicationButtonListeners();
  
  // apply select picker styling
  $('.selectpicker').selectpicker();
  
  // apply jasny rowlink logic to tables
  $('tbody.rowlink').rowlink();
  
  server = new Server({
    messageHandlers: [
      processPanelMessages,
      processDataSourceMessages,
    ]
  });

  server.connect();
}

function addApplicationButtonListeners() {
  
  $("body").on('change', '#toggleConfigMode', function() {
    toggleConfigMode();
  });
  
  $("body").on('click', '#viewHome', function() {
    toggleButtonViewSelection('viewHome');
    showAddPanelButton();
    displayPane("homePane");
  });
  
  $("body").on('click', '#viewSettings', function() {
    toggleButtonViewSelection('viewSettings');
    hideAddPanelButton();
    displayPane("settingsPane");
  });
  
  $("body").on('click', '#viewThemes', function() {
    toggleButtonViewSelection('viewThemes');
    hideAddPanelButton();
    displayPane("themesPane");
  });
    
  $("body").on('click', '#viewContent', function() {
    toggleButtonViewSelection('viewContent');
    hideAddPanelButton();
    displayPane("bannerContentPane");
  });
    
  $("#viewDataSources").on('click', function() {
    toggleButtonViewSelection('viewDataSources');
    hideAddPanelButton();
    displayPane("dataSourcesPane");
  });

  $("body").on('click', '#addPanel', function() {
    displayAddPanelDialog();
  });
  
  // TODO: better manage adding triggers for sub areas 
  setupDataSourcesPane();
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
}

function showAddPanelButton() {
  showPanelButton('addPanel');
  addPanelMode = true;
}

function hideAddPanelButton() {
  hidePanelButton('addPanel');
  addPanelMode = false;
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

function viewDataSourceDetailPane(key) {
  displayPane("dataSourceDetail");
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