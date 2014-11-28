/* jshint browser: true, jquery: true */
/* global BootBoxWiz:false, console:false, Widget:false, addWidget:false, updateWidget:false, dataSources:false */

function addWidget(panelId) {
  viewWidgetWizard(panelId, 'add');
}

function viewWidgetWizard(panelId, mode, widget) {
  mode = ((mode !== null && mode !== undefined) ? mode : 'add');
  widget = ((widget !== null && widget !== undefined) ? widget : {});
  var title = "Widget";
  
  switch(mode) {
    case 'add':
      title = "Add a Widget";
      break;

    case 'update':
      title = "Modify Widget";
      break;
  }
  
  var dataSourcesHTML = '';
  
  for(var i = 0; i < dataSources.length; i++) {
    dataSourcesHTML +=
      '      <option>' + dataSources[i].name + '</option>' 
      ;
  }
  
  var addWidgetWizardDialog = new BootBoxWiz({
    title: title,
    onFinish: function() { processWidgetDialog(mode, widget); },
    guideEnabled: false,
    stepContent: [ {
      type: BootBoxWiz.TYPE_FIXED,
      title: "Step 1",
      content:
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="widgetName">Name</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input id="widgetName" name="widgetName" type="text" placeholder="Enter the name for the data source" class="form-control input-md" autofocus> ' +
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
      dataSourcesHTML + 
      '    </select>' + 
      '  </div>' +
      '</div>',
    },
    {
      type: BootBoxWiz.TYPE_DYNAMIC,
      title: "Step 2",
      logic: widgetDialogSourceLogic,
      titles: [
        '',
        '',
        '',
        '',
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

function widgetDialogSourceLogic(fields) {
  // TODO: get type based on data source selection
  var widgetType = fields.widgetType;

  switch(widgetType) {
//    case Widget.TYPE_VERSION_ONE:
//      return 0;
//      
//    case Widget.TYPE_JENKINS:
//      return 1;
//      
//    case Widget.TYPE_SALES_FORCE:
//      return 3;
//      
//    case Widget.TYPE_INTERNAL:
//      return 4;
  }

  return 0;
}

function processWidgetDialog(mode, widget) {
  var dialogData = $('.stepwizard .form-horizontal').serializeObject();
  var title = $('#title').val();
  var icon = $('#selectPanelIcon input').val();
  
  // TODO: check bootboxwiz, call to steplogic doesn't appear to support multiple dialogs on one app, using class without scope defined by id
  
//  widget.name = dialogData.widgetName;
//  widget.type = dialogData.widgetType;
//  
//  switch(dialogData.widgetType) {
//    case Widget.TYPE_VERSION_ONE:
//      widget.protocol   = dialogData.v1Protocol;
//      widget.hostname   = dialogData.v1HostName;
//      widget.port       = dialogData.v1Port;
//      widget.username   = dialogData.v1UserName;
//      widget.password   = dialogData.v1Password;
//      widget.v1Instance = dialogData.v1Instance;
//      break;
//      
//    case Widget.TYPE_JENKINS:
//      widget.protocol   = dialogData.jenkinsProtocol;
//      widget.hostname   = dialogData.jenkinsHostName;
//      widget.port       = dialogData.jenkinsPort;
//      widget.username   = '';
//      widget.password   = '';
//      widget.v1Instance = '';
//      break;
//      
//    case Widget.TYPE_SALES_FORCE:
//      widget.protocol   = dialogData.sfdcProtocol;
//      widget.hostname   = dialogData.sfdcHostName;
//      widget.port       = dialogData.sfdcPort;
//      widget.username   = dialogData.sfdcUserName;
//      widget.password   = dialogData.sfdcPassword;
//      widget.v1Instance = '';
//      break;
//      
//    case Widget.TYPE_INTERNAL:
//      widget.protocol   = dialogData.internalProtocol;
//      widget.hostname   = dialogData.internalHostName;
//      widget.port       = dialogData.internalPort;
//      widget.username   = dialogData.internalUserName;
//      widget.password   = dialogData.internalPassword;
//      widget.v1Instance = '';
//      break;
//  }
  
  switch(mode) {
    case 'add':
//      addWidget(new Widget(widget));
      break;

    case 'update':
//      updateWidget(widget);
      break;
  }
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