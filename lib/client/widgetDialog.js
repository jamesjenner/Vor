/* jshint browser: true, jquery: true */
/* global BootBoxWiz:false, console:false, Widget:false, addWidget:false, updateWidget:false, dataSources:false */

function viewWidgetWizard(mode, widget, panelId) {
  mode = ((mode !== null && mode !== undefined) ? mode : 'add');
  widget = ((widget !== null && widget !== undefined) ? widget : {});
  var title = "Widget";
  
  switch(mode) {
    case 'add':
      if(panelId === null || panelId === undefined) {
        console.log("ERROR: panelId not specified in add mode for viewWidgetWizard");
        return;
      }
      widget.panelId = panelId;
      title = "Add a Widget";
      break;

    case 'modify':
      title = "Modify Widget";
      break;
  }
  
  var dataSourcesHTML = '';
  
  for(var i = 0; i < dataSourceManager.dataSources.length; i++) {
    dataSourcesHTML +=
      '      <option>' + dataSourceManager.dataSources[i].name + '</option>' 
      ;
  }
  
  var addWidgetWizardDialog = new BootBoxWiz({
    title: title,
    onFinish: function() { processWidgetDialog(mode, widget); },
    guideEnabled: false,
    stepContent: [ {
      type: BootBoxWiz.TYPE_FIXED,
      title: "Step 1 - Widget Creation",
      content:
      '<div class="form-group"> ' +
      '  <label class="col-md-4 control-label" for="widgetTitle">Title</label> ' +
      '  <div class="col-md-6"> ' +
      '    <input name="widgetTitle" type="text" placeholder="Enter the title for the widget" class="form-control input-md" autofocus> ' +
      '  </div> ' +
      '</div> ' +
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetDataSourceName">Data Source</label> ' +
      '  <div class="col-md-4">' + 
      '    <select id="widgetDataSourcePicker" name="widgetDataSourceName" class="widgetselectpicker">' +     
      dataSourcesHTML + 
      '    </select>' + 
      '  </div>' +
      '</div>',
    },
    {
      type: BootBoxWiz.TYPE_DYNAMIC,
      title: "Step 2 - Data Options",
      logic: widgetDialogDatasourceSelector,
      titles: [
        'Data Selection',
        'Job Selection',
        '',
      ],
      content: [
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetVersionOnePeriod">Time Period</label> ' +
      '  <div class="col-md-4">' + 
      '    <select id="widgetVersionOnePeriodPicker" name="widgetVersionOnePeriod" class="widgetselectpicker">' +     
      '      <option>Sprint</option>' + 
      '      <option>Quarter</option>' + 
      '      <option>Release</option>' + 
      '    </select>' + 
      '  </div>' +
      '</div>' +
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetVersionOneDataType">Data Type</label> ' +
      '  <div class="col-md-4">' + 
      '    <select id="widgetVersionOneDataTypePicker" name="widgetVersionOneDataType" class="widgetselectpicker">' +     
      '      <option>Team</option>' + 
      '      <option>Project</option>' + 
      '      <option>Epic</option>' + 
      '    </select>' + 
      '  </div>' +
      '</div>' +
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetVersionOneDataValue">Data Value</label>' +
      '  <div class="col-md-6">' +
      '    <input name="widgetVersionOneDataValue" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the value for the data type" />' +
      '  </div>' +
      '</div>',
        
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetJenkinsJobName">Job Name</label>' +
      '  <div class="col-md-6">' +
      '    <input name="widgetJenkinsJobName" maxlength="200" type="text" required="required" class="form-control" placeholder="Enter the job name for jenkins" />' +
      '  </div>' +
      '</div>',

      ],
    },                  
    {
      type: BootBoxWiz.TYPE_FIXED,
      title: "Step 3 - Widget Type",
      // preProcessingLogic: widgetDialogDataSourceLogic,
      content:
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetType">Widget Type</label> ' +
      '  <div class="col-md-4">' + 
      '    <select id="widgetTypePicker" name="widgetType" class="widgetselectpicker">' +     
      '    </select>' + 
      '  </div>' +
      '</div>' +
      '<div class="form-group">' +
      '  <label class="col-md-4 control-label" for="widgetStyle">Widget Style</label> ' +
      '  <div class="col-md-4">' + 
      '    <select id="widgetStylePicker" name="widgetStyle" class="widgetselectpicker">' +     
      '    </select>' + 
      '  </div>' +
      '</div>' 
    },                  
    {
      type: BootBoxWiz.TYPE_DYNAMIC,
      title: "Step 4 - Widget Options",
      logic: widgetDialogTypeLogic,
      titles: [
        'Value Options',
        'State Options',
        'Progress Gauge Options',
        'Stateless Progress Gauge Options',
        'History Options',
        'Graph Chart Options',
        'Single Vertical Bar Options',
        'Single Horizontal Bar Options',
        'Pie Chart Options',
        'Donut Chart Options'
      ],
      content: [
        '<div class="form-group"> ' +
        '  <label class="col-md-4 control-label" for="widgetTextColor">Text Color</label> ' +
        '  <div id="widgetTextColorDiv" class="col-md-6 component"> ' +
        '    <input name="widgetTextColor" type="text" class="form-control input-md form-component" /> ' +
        '    <span class="input-group-addon form-control "><i></i></span> ' +
        '  </div> ' +
        '</div> '
        ,
        '<div class="form-group"> ' +
        '  <label class="col-md-4 control-label" for="widgetTextColor">Text Color</label> ' +
        '  <div id="widgetTextColorDiv" class="col-md-6 component"> ' +
        '    <input name="widgetTextColor" type="text" class="form-control input-md form-component" /> ' +
        '    <span class="input-group-addon form-control "><i></i></span> ' +
        '  </div> ' +
        '</div> '
        ,
        '<div class="form-group"> ' +
        '  <label class="col-md-4 control-label" for="bannerDialogHeadlineColor">Headline Color</label> ' +
        '  <div id="bannerDialogHeadlineColorDiv" class="col-md-6 component"> ' +
        '    <input name="bannerDialogHeadlineColor" type="text" class="form-control input-md form-component" /> ' +
        '    <span class="input-group-addon form-control "><i></i></span> ' +
        '  </div> ' +
        '</div> ' +
        '<div class="form-group"> ' + 
        '  <label class="col-md-4 control-label" for="bannerDialogReferenceIsURL">Is Reference a URL?</label> ' + 
        '  <div class="col-md-1"> ' + 
        '    <input name="bannerDialogReferenceIsURL" type="checkbox" required="required" class="form-control" data-toggle="toggle" placeholder="" /> ' + 
        '  </div> ' + 
        '</div> '
      ],
    }
    ]
  });
  
  addWidgetWizardDialog.launch();

  $('.widgetselectpicker').selectpicker();
  
  if(mode === 'modify') {
    setWidgetDialogValues(widget);
    $('.widgetselectpicker').selectpicker('refresh');
    setWidgetDialogWidgetTypeValues(addWidgetWizardDialog.getSerializedForm(), widget.type, widget.style);
  }
  
  $("#widgetDataSourcePicker").on('change', function() {
    setWidgetDialogWidgetTypeValues(addWidgetWizardDialog.getSerializedForm(), $('#widgetTypePicker').val(), $('#widgetStylePicker').val());
  });
  
  $("#widgetTypePicker").on('change', function() {
    // TODO: update bootboxwiz to support setting an id to the form for easy selection
    // TODO: add a function to bootboxwiz to get the serialized objects
    setWidgetDialogWidgetStyleValues(addWidgetWizardDialog.getSerializedForm(), $('#widgetTypePicker').val(), $('#widgetStylePicker').val());
  });
}

function getDataSourceName(dataSourceId) {
  for(var i = 0; i < dataSourceManager.dataSources.length; i++) {
    if(dataSourceManager.dataSources[i].id === dataSourceId) {
      return dataSourceManager.dataSources[i].name;
    }
  }
}

function setWidgetDialogValues(widget) {
  console.log(JSON.stringify(widget));
  $('[name=widgetTitle]').val(widget.title);
  $('[name=widgetDataSourceName]').val(getDataSourceName(widget.dataSourceId));

  // drop downs are not populated for the following fields, where are they populated?
  $('[name=widgetType]').val(widget.type);
  $('[name=widgetStyle]').val(widget.style);

  $('[name=widgetKeyDataElement]').val(widget.keyDataElement);

  $('[name=widgetMaxValue]').val(widget.maxValue);
  $('[name=widgetMinValue]').val(widget.minValue);
  
  $('[name=widgetMarginSafe]').val(widget.marginSafe);
  $('[name=widgetMarginDanger]').val(widget.marginDanger);
  
  $('[name=widgetTargetDataElement]').val(widget.targetDataElement);
  
  $('[name=widgetVersionOneDataType]').val(widget.widgetVersionOneDataType);
  $('[name=widgetVersionOneDataValue]').val(widget.widgetVersionOneDataValue);
  $('[name=widgetJenkinsJobName]').val(widget.widgetJenkinsJobName);
}

// TODO: remove dataSources as a global
function setWidgetDialogWidgetTypeValues(fields, typeValue, styleValue) {
  var i;
  var add = false;
  var dataSource = null;
  var widgetTypePicker = $('#widgetTypePicker');
  
  widgetTypePicker.empty();
  
  dataSource = dataSourceManager.getByName(fields.widgetDataSourceName);
  
  if(dataSource !== null) {
    for(var type in DataSource.DISPLAY_OPTIONS[dataSource.type]) {
      widgetTypePicker.append(
        '<option>' +
        DataSource.DISPLAY_OPTIONS[dataSource.type][type].name +
        '</option>');
    }
  }
  
  if(typeValue !== null && typeValue !== undefined) { 
    $('[name=widgetType]').val(typeValue);
  }
  widgetTypePicker.selectpicker('refresh');
  
  setWidgetDialogWidgetStyleValues(fields, typeValue, styleValue);
}

function setWidgetDialogWidgetStyleValues(fields, typeValue, styleValue) {
  var dataSource = null;
  var widgetStylePicker = $('#widgetStylePicker');
  
  widgetStylePicker.empty();

  dataSource = dataSourceManager.getByName(fields.widgetDataSourceName);
  
  if(dataSource !== null) {
    for(var type in DataSource.DISPLAY_OPTIONS[dataSource.type]) {
      if(DataSource.DISPLAY_OPTIONS[dataSource.type][type].display !== undefined && DataSource.DISPLAY_OPTIONS[dataSource.type][type].display !== null) {
        if(DataSource.DISPLAY_OPTIONS[dataSource.type][type].name === typeValue) {
          for(i = 0; i < DataSource.DISPLAY_OPTIONS[dataSource.type][type].display.length; i++) {
            widgetStylePicker.append(
              '<option data-subtext="">' +
              DataSource.DISPLAY_OPTIONS[dataSource.type][type].display[i] +
              '</option>');
          }
        }
      }
    }
  }
  
  if(styleValue !== null && styleValue !== undefined) { 
    $('[name=widgetStyle]').val(styleValue);
  }
  
  widgetStylePicker.selectpicker('refresh');
}

function widgetDialogDatasourceSelector(fields) {
  switch(fields.widgetStyle) {
    case DataSource.TYPE_VERSION_ONE: 
      return 0;
      
    case DataSource.TYPE_JENKINS: 
      return 1;
      
    case DataSource.TYPE_SALES_FORCE: 
      return 2;
  }

  return 0;
}

function widgetDialogTypeLogic(fields) {
  // var dataSource = dataSourceManager.getByName(fields.widgetDataSourceName);

// DataSource.DISPLAY_OPTIONS[dataSource.type][fields.widgetStyle].display[i] +  

//    DataSource.TYPE_VERSION_ONE
//    DataSource.TYPE_JENKINS
//    DataSource.TYPE_SALES_FORCE
    
    
  switch(fields.widgetStyle) {
    case Widget.DISPLAY_TYPE_VALUE:
      return 0;
    
    case Widget.DISPLAY_TYPE_STATE:
      return 1;
    
    case Widget.DISPLAY_TYPE_PROGRESS:
      return 2;
    
    case Widget.DISPLAY_TYPE_PROGRESS_STATELESS:
      return 3;
    
    case Widget.DISPLAY_TYPE_HISTORY:
      return 4;
    
    case Widget.DISPLAY_TYPE_GRAPH_CHART:
      return 5;
    
    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_VERTICAL:
      return 6;
    
    case Widget.DISPLAY_TYPE_GRAPH_SINGLE_BAR_HORIZONTAL:
      return 7;
    
    case Widget.DISPLAY_TYPE_GRAPH_PIE:
      return 8;

    case Widget.DISPLAY_TYPE_GRAPH_DONUT:
      return 9;
  }

  return 0;
}

function processWidgetDialog(mode, widget) {
  var dialogData = $('.stepwizard .form-horizontal').serializeObject();
  
  // TODO: check bootboxwiz, call to steplogic doesn't appear to support multiple dialogs on one app, using class without scope defined by id
  
  widget.title = dialogData.widgetTitle;
  widget.type = dialogData.widgetType;
  widget.style = dialogData.widgetStyle;

  dataSource = dataSourceManager.getByName(dialogData.widgetDataSourceName);

  if(dataSource !== null) {
      widget.dataSourceId = dataSource.id;
  }
  
  widget.keyDataElement = dialogData.widgetKeyDataElement;
  
  switch(dataSource.type) {
    case DataSource.TYPE_VERSION_ONE:
      widget.widgetVersionOneDataType = dialogData.widgetVersionOneDataType;
      widget.widgetVersionOneDataValue = dialogData.widgetVersionOneDataValue;
      break;
      
    case DataSource.TYPE_JENKINS:
      widget.widgetJenkinsJobName = dialogData.widgetJenkinsJobName;
      break;
      
    case DataSource.TYPE_SALES_FORCE:
      break;
  }
  
//  switch(dialogData.widgetType) {
//    case Widget.DISPLAY_TYPE_VALUE:
//      break;
//      
//    case Widget.DISPLAY_TYPE_PROGRESS:
//      widget.targetDataElement = dialogData.widgetTargetDataElement;
//      widget.marginSafe = dialogData.widgetMarginSafe;
//      widget.marginDanger = dialogData.widgetMarginDanger;
//      widget.minValue = dialogData.widgetMinValue;
//      widget.maxValue = dialogData.widgetMaxValue;
//      break;
//      
//    case Widget.DISPLAY_TYPE_STATE:
//      break;
//      
//    case Widget.DISPLAY_TYPE_GRAPH:
//      break;
//      
//    case Widget.DISPLAY_TYPE_HISTORY:
//      break;
//  }
  
  switch(mode) {
    case 'add':
      widgetManager.addWidget(new Widget(widget));
      break;

    case 'modify':
      widgetManager.updateWidget(widget);
      break;
  }
}

function addWidgetDialogWidgetTypeLogic(fields) {
  var paymentType = ((fields.paymentType !== null && fields.paymentType !== undefined) ? fields.paymentType : 'Value');

  switch(paymentType) {

    case Widget.DISPLAY_TYPE_VALUE:
      return 0;
      
    case Widget.DISPLAY_TYPE_PROGRESS:
      return 1;
      
    case Widget.DISPLAY_TYPE_PROGRESS_STATELESS:
      return 2;
      
    case Widget.DISPLAY_TYPE_STATE:
      return 3;
      
    case Widget.DISPLAY_TYPE_GRAPH:
      return 4;
      
    case Widget.DISPLAY_TYPE_HISTORY :
      return 5;
  }

  return 0;
}