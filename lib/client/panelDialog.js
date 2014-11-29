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
        label: buttonLabel,
        className: "",
        callback: function() {
          var title = $('#title').val();
          var icon = $('#selectPanelIcon input').val();

          if(mode === 'add') {
            addPanel(new Panel({name: title, iconName: icon, iconType: Panel.ICON_FONT_AWESOME}));
          } else {
            panel.name = $('#title').val();
            panel.iconName = $('#selectPanelIcon input').val();
            updatePanel(panel);
          }
        }
      }
    }
  });
  
  if(mode === 'update') {
    setPanelDialogValues(panel);
    iconPickerDefaults.icon = panel.iconName;
  }
  
  $('#selectPanelIcon').iconpicker(iconPickerDefaults);
  
  $('#selectPanelIcon').on('change', function(e) { 
  //    console.log(e.icon);
  });

  // $('#selectPanelIcon').iconpicker('setIcon', 'fa-group');
}

function setPanelDialogValues(panel) {
  $('[name=title]').val(panel.name);
}
