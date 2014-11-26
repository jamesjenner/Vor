/* jshint browser: true, jquery: true */
/* global BootBoxWiz:false, console:false, DataSource:false, addDataSource:false, updateDataSource:false  */

function viewDataSourceWizard(mode, dataSource) {
  mode = ((mode !== null && mode !== undefined) ? mode : 'add');
  dataSource = ((dataSource !== null && dataSource !== undefined) ? dataSource : {});
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
      '      <option>' + DataSource.TYPE_VERSION_ONE + '</option>' + 
      '      <option>' + DataSource.TYPE_JENKINS + '</option>' + 
      '      <option>' + DataSource.TYPE_SALES_FORCE + '</option>' + 
      '      <option>' + DataSource.TYPE_INTERNAL + '</option>' + 
      '    </select>' + 
      '  </div>' +
      '</div>',
    },
    {
      type: BootBoxWiz.TYPE_DYNAMIC,
      title: "Step 2",
      logic: dataSourceDialogSourceLogic,
      titles: [
        DataSource.TYPE_VERSION_ONE,
        DataSource.TYPE_JENKINS,
        DataSource.TYPE_SALES_FORCE,
        DataSource.TYPE_INTERNAL,
      ],
      content: [

      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1Protocol">Protocol</label>' +
      '      <input name="v1Protocol" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the protocol (http|https)" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="v1HostName">Hostname</label>' +
      '      <input name="v1HostName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the hostname" />' +
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
      '</div>',

      '<div class="form-group"> ' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="jenkinsProtocol">Protocol</label>' +
      '      <input name="jenkinsProtocol" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the protocol (http|https)" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="jenkinsHostName">Hostname</label>' +
      '      <input name="jenkinsHostName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the hostname" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="jenkinsPort">Port</label>' +
      '      <input name="jenkinsPort" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the port" />' +
      '    </div>' +
      '  </div>' +
      '</div>',

      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="sfdcProtocol">Protocol</label>' +
      '      <input name="sfdcProtocol" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the protocol (http|https)" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="sfdcHostName">Hostname</label>' +
      '      <input name="sfdcHostName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the hostname" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="sfdcUserName">Username</label>' +
      '      <input name="sfdcUserName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter username" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="sfdcPassword">Password</label>' +
      '      <input name="sfdcPassword" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the password" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="sfdcPort">Port</label>' +
      '      <input name="sfdcPort" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the port" />' +
      '    </div>' +
      '  </div>' +
      '</div>',

      '<div class="col-xs-12">' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="internalProtocol">Protocol</label>' +
      '      <input name="internalProtocol" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the protocol (http|https)" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="internalHostName">Hostname</label>' +
      '      <input name="internalHostName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the hostname" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="internalPort">Port</label>' +
      '      <input name="internalPort" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the port" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="internalUserName">Username</label>' +
      '      <input name="internalUserName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter username" />' +
      '    </div>' +
      '  </div>' +
      '  <div class="col-md-12">' +
      '    <div class="form-group">' +
      '      <label class="control-label" for="internalPassword">Password</label>' +
      '      <input name="internalPassword" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the password" />' +
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
  var dataSourceType = fields.dataSourceType;

  switch(dataSourceType) {
    case DataSource.TYPE_VERSION_ONE:
      return 0;
      
    case DataSource.TYPE_JENKINS:
      return 1;
      
    case DataSource.TYPE_SALES_FORCE:
      return 3;
      
    case DataSource.TYPE_INTERNAL:
      return 4;
  }

  return 0;
}

function processDataSourceDialog(mode, dataSource) {
  var dialogData = $('.stepwizard .form-horizontal').serializeObject();
  var title = $('#title').val();
  var icon = $('#selectPanelIcon input').val();
  
  // TODO: check bootboxwiz, call to steplogic doesn't appear to support multiple dialogs on one app, using class without scope defined by id
  
  dataSource.name = dialogData.dataSourceName;
  dataSource.type = dialogData.dataSourceType;
  
  switch(dialogData.dataSourceType) {
    case DataSource.TYPE_VERSION_ONE:
      dataSource.protocol   = dialogData.v1Protocol;
      dataSource.hostname   = dialogData.v1HostName;
      dataSource.port       = dialogData.v1Port;
      dataSource.username   = dialogData.v1UserName;
      dataSource.password   = dialogData.v1Password;
      dataSource.v1Instance = dialogData.v1Instance;
      break;
      
    case DataSource.TYPE_JENKINS:
      dataSource.protocol   = dialogData.jenkinsProtocol;
      dataSource.hostname   = dialogData.jenkinsHostName;
      dataSource.port       = dialogData.jenkinsPort;
      dataSource.username   = '';
      dataSource.password   = '';
      dataSource.v1Instance = '';
      break;
      
    case DataSource.TYPE_SALES_FORCE:
      dataSource.protocol   = dialogData.sfdcProtocol;
      dataSource.hostname   = dialogData.sfdcHostName;
      dataSource.port       = dialogData.sfdcPort;
      dataSource.username   = dialogData.sfdcUserName;
      dataSource.password   = dialogData.sfdcPassword;
      dataSource.v1Instance = '';
      break;
      
    case DataSource.TYPE_INTERNAL:
      dataSource.protocol   = dialogData.internalProtocol;
      dataSource.hostname   = dialogData.internalHostName;
      dataSource.port       = dialogData.internalPort;
      dataSource.username   = dialogData.internalUserName;
      dataSource.password   = dialogData.internalPassword;
      dataSource.v1Instance = '';
      break;
  }
  
  switch(mode) {
    case 'add':
//       addDataSource();
      addDataSource(new DataSource(dataSource));
      break;

    case 'update':
//      updateDataSource();
      updateDataSource(dataSource);
      break;
  }
}