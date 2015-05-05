/* jshint browser: true, jquery: true */
/* global bootbox:false, console:false, Panel:false, addPanel:false */

function displayPanelDialog(mode, panel) {
  var iconPickerDefaults = {
    iconset: 'fontawesome',
    icon: '',
    rows: 10,
    cols: 10,
    placement: 'bottom',
    search: false,
  };
  var title = '';
  var buttonLabel = '';
  panel = (panel !== undefined || panel !== null) ? panel : {};

  // TODO: remove hardcoded 'add' and 'update'
  
  switch(mode) {
    case 'add':
      title = "Add a Panel";
      buttonLabel = "Create";
      break;

    case 'update':
      title = "Modify Panel";
      buttonLabel = "Apply"
      break;
  }  
  
  bootbox.dialog({
    title: title,
    message: '<div class="row">  ' +
             '  <div class="col-md-12"> ' +
             '    <form class="form-horizontal"> ' +
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="title">Title</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input id="panelDialogTitle" name="panelDialogTitle" type="text" placeholder="The title of the new panel" class="form-control input-md"> ' +
             '        </div> ' +
             '      </div> ' +
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="icon">Inbuilt Icons</label> ' +
             '        <div class="col-md-4">' + 
             '          <button id="selectPanelIcon" class="btn btn-default iconpicker" data-iconset="fontawesome" role="iconpicker"></button>' +
             '        </div>' +
             '      </div>' +
             '      <div class="form-group">' +
             '        <label class="col-md-4 control-label" for="panelDialogStyle">Style</label> ' +
             '        <div class="col-md-4">' + 
             '          <select name="panelDialogStyle" class="selectpicker">' +     
             '            <option>' + Panel.STYLE_NONE + '</option>' +
             '            <option>' + Panel.STYLE_AGILE + '</option>' +
             '            <option>' + Panel.STYLE_CI + '</option>' +
             '          </select>' + 
             '        </div>' +
             '      </div>' +
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="panelDialogDataElement">Data Element</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input id="panelDialogDataElement" name="panelDialogDataElement" type="text" placeholder="The data element for the style" class="form-control input-md"> ' +
             '        </div> ' +
             '      </div> ' +
             '    </form>' +
             '  </div>' +
             '</div>',
    buttons: {
      success: {
        label: buttonLabel,
        className: "",
        callback: function() {
          var title = $('#panelDialogTitle').val();
          var icon = $('#selectPanelIcon input').val();
          var style = $('[name=panelDialogStyle]').val();
          var dataElement = $('[name=panelDialogDataElement]').val();

          if(mode === 'add') {
            panelManager.add(new Panel({name: title, iconName: icon, iconType: Panel.ICON_FONT_AWESOME, style: style, defaultDataElement: dataElement}));
          } else {
            panel.name = title;
            panel.iconName = icon;
            panel.style = style;
            panel.defaultDataElement = dataElement;
            panelManager.update(panel);
          }
        }
      }
    }
  });
  
  if(mode === 'update') {
    setPanelDialogValues(panel);
    iconPickerDefaults.icon = panel.iconName;
  }

  $('.selectpicker').selectpicker();
  
  $('#selectPanelIcon').iconpicker(iconPickerDefaults);
  
  $('#selectPanelIcon').on('change', function(e) { 
  //    console.log(e.icon);
  });

  // $('#selectPanelIcon').iconpicker('setIcon', 'fa-group');
}

function setPanelDialogValues(panel) {
  $('[name=panelDialogTitle]').val(panel.name);
  $('[name=panelDialogStyle]').val(panel.style);
  $('[name=panelDialogDataElement]').val(panel.defaultDataElement);
}
