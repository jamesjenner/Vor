
function displayAddPanelDialog() {
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

          addPanel(new Panel({name: title, iconName: icon, iconType: Panel.ICON_FONT_AWESOME}));
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