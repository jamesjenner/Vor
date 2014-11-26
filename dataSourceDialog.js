
function viewDataSourceWizard(mode, dataSource) {
  var mode = ((mode !== null && mode !== undefined) ? mode : 'add');
  var dataSource = ((dataSource !== null && dataSource !== undefined) ? dataSource : {});
  var title = "Data Source";
  
  switch(mode) {
    case 'add':
      title = "Add a Data Source";
      break;

    case 'update':
      title = "Modify Data Source";
      break;
  }
  
  var addWidgetWizardDialog = new BootBoxWiz({
    title: title,
    onFinish: function() { processDataSourceDialog(mode, dataSource); },
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
      logic: dataSourceDialogSourceLogic,
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

function dataSourceDialogSourceLogic(fields) {
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

function processDataSourceDialog(mode, dataSource) {
  var dialogData = $('.stepwizard .form-horizontal').serializeObject();
  var title = $('#title').val();
  var icon = $('#selectPanelIcon input').val();
  
  
  
  console.log(dialogData);
  // TODO: check bootboxwiz, call to steplogic doesn't appear to support multiple dialogs on one app, using class without scope defined by id
  // TODO: assign data from dialog
  // dataSourceName
//  dataSourceType
//  v1HostName
//  v1Instance
//  v1UserName
//  v1Protocol
//  v1Port
//  v1Password
  
  switch(mode) {
    case 'add':
//       addDataSource();
      break;

    case 'update':
//      updateDataSource();
      break;
  }
}