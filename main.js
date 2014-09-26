/* global $:false */

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
  
  $("body").on('click', '#addPanel', function() {
    addPanel();
  });
    
  $("body").on('click', '#reloadScreen', function() {
    reloadScreen();
  });
    
  $("body").on('click', '#editSettings', function() {
    editSettings();
  });
    
  // $("#toggleConfigMode").onchange(function() {
  $("body").on('change', '#toggleConfigMode', function() {
    toggleConfigMode();
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
});

$('#selectPanelIcon').on('change', function(e) { 
    console.log(e.icon);
});

$('#selectPanelIcon').iconpicker('setIcon', 'fa-group');
  
}

function reloadScreen() {
}

function editSettings() {
}

function toggleConfigMode() {
  $(".configButtons").fadeToggle("fast", function() {});
}

function insertPanel(title, icon, column) {
  title = ((title != null && title !== undefined) ? title : "");
  icon = ((icon != null && icon !== undefined) ? icon : "fa-group");
  column = ((column != null && column !== undefined) ? column : 1);

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
  
  $('#panelBtnAddWidget' + title).on('click', function() {
  });
    
  $('#panelBtnRemoveWidget' + title).on('click', function() {
  });
    
  $('#panelBtnDelete' + title).on('click', deletePanel(title));
    
  $('#panelBtnMoveDown' + title).on('click', function() {
  });
    
  $('#panelBtnMoveUp' + title).on('click', function() {
  });
    
  $('#panelBtnMoveLeft' + title).on('click', function() {
  });
    
  $('#panelBtnMoveRight' + title).on('click', function() {
  });
}

function deletePanel(title) {
  $('#panel' + title).remove();
}