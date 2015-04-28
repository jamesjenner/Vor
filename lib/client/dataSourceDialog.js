/* jshint browser: true, jquery: true */
/* global BootBoxWiz:false, console:false, DataSource:false   */

function viewDataSourceWizard(mode, dataSource) {
  mode = ((mode !== null && mode !== undefined) ? mode : 'add');
  dataSource = ((dataSource !== null && dataSource !== undefined) ? dataSource : {});
  var title = "Data Source";
  
  
  // TODO: remove hardcoding for add and update values
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
      '</div>' +
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="dataSourceTimeZone">Time Zone</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="dataSourceTimeZone" name="dataSourceTimeZone" type="text" placeholder="Enter the timezone of the data source" class="form-control input-md"> ' +
      '  </div> ' +
      '</div> ' +
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="dataSourceFrequency">Frequency</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="dataSourceFrequency" name="dataSourceFrequency" type="numeric" placeholder="Enter the frequency that data is retreived, in minutes" class="form-control input-md"> ' +
      '  </div> ' +
      '</div> ',
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
  if(mode === 'update') {
    setDataSourceDialogValues(dataSource);
  }
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

function setDataSourceDialogValues(dataSource) {
  $('[name=dataSourceName]').val(dataSource.name);
  $('[name=dataSourceType]').val(dataSource.type);
  $('[name=dataSourceTimeZone]').val(dataSource.timeZone);
  $('[name=dataSourceFrequency]').val(dataSource.pollFrequencyMinutes);

  $('[name=v1Protocol]').val(dataSource.protocol);
  $('[name=v1HostName]').val(dataSource.hostname);
  $('[name=v1Port]').val(dataSource.port);
  $('[name=v1UserName]').val(dataSource.username);
  $('[name=v1Password]').val(dataSource.password);
  $('[name=v1Instance]').val(dataSource.instance);
  
  $('[name=jenkinsProtocol]').val(dataSource.protocol);
  $('[name=jenkinsHostName]').val(dataSource.hostname);
  $('[name=jenkinsPort]').val(dataSource.port);

  $('[name=sfdcProtocol]').val(dataSource.protocol);
  $('[name=sfdcHostName]').val(dataSource.hostname);
  $('[name=sfdcPort]').val(dataSource.port);
  $('[name=sfdcUserName]').val(dataSource.username);
  $('[name=sfdcPassword]').val(dataSource.password);

  $('[name=internalProtocol]').val(dataSource.protocol);
  $('[name=internalHostName]').val(dataSource.hostname);
  $('[name=internalPort]').val(dataSource.port);
  $('[name=internalUserName]').val(dataSource.username);
  $('[name=internalPassword]').val(dataSource.password);
}

function processDataSourceDialog(mode, dataSource) {
  var dialogData = $('.stepwizard .form-horizontal').serializeObject();
  
  // TODO: check bootboxwiz, call to steplogic doesn't appear to support multiple dialogs on one app, using class without scope defined by id
  
  var values = {};
  
  values.name = dialogData.dataSourceName;
  values.type = dialogData.dataSourceType;
  values.timeZone = dialogData.dataSourceTimeZone;
  values.pollFrequencyMinutes = dialogData.dataSourceFrequency;

  switch(dialogData.dataSourceType) {
    case DataSource.TYPE_VERSION_ONE:
      values.protocol   = dialogData.v1Protocol;
      values.hostname   = dialogData.v1HostName;
      values.port       = dialogData.v1Port;
      values.username   = dialogData.v1UserName;
      values.password   = dialogData.v1Password;
      values.instance   = dialogData.v1Instance;
      break;
      
    case DataSource.TYPE_JENKINS:
      values.protocol   = dialogData.jenkinsProtocol;
      values.hostname   = dialogData.jenkinsHostName;
      values.port       = dialogData.jenkinsPort;
      values.username   = '';
      values.password   = '';
      values.v1Instance = '';
      break;
      
    case DataSource.TYPE_SALES_FORCE:
      values.protocol   = dialogData.sfdcProtocol;
      values.hostname   = dialogData.sfdcHostName;
      values.port       = dialogData.sfdcPort;
      values.username   = dialogData.sfdcUserName;
      values.password   = dialogData.sfdcPassword;
      values.v1Instance = '';
      break;
      
    case DataSource.TYPE_INTERNAL:
      values.protocol   = dialogData.internalProtocol;
      values.hostname   = dialogData.internalHostName;
      values.port       = dialogData.internalPort;
      values.username   = dialogData.internalUserName;
      values.password   = dialogData.internalPassword;
      values.v1Instance = '';
      break;
  }

  
  
  switch(mode) {
    case 'add':
      dataSourceManager.add(new DataSource(values));
      break;

    case 'update':
      values.id = dataSource.id;
      dataSourceManager.update(values);
      break;
  }
}