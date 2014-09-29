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
  //    console.log(e.icon);
  });

  $('#selectPanelIcon').iconpicker('setIcon', 'fa-group');
}

function addWidget(panelIdSelecter) {
  bootbox.dialog({
    title: "Add a Widget",
    message: '<div class="row">  ' +
             '  <div class="col-md-12"> ' +
             '    <form class="form-horizontal"> ' +
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="title">Title</label> ' +
             '        <div class="col-md-6"> ' +
             '          <input id="title" name="title" type="text" placeholder="The title of the new widget" class="form-control input-md"> ' +
             '        </div> ' +
             '      </div> ' +
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="icon">Widget Type</label> ' +
             '        <div class="col-md-4">' + 
//             '          <select class="form-control">' + 
             '          <select class="selectpicker">' +     
             '            <option>1</option>' + 
             '            <option>2</option>' + 
             '            <option>3</option>' + 
             '            <option>4</option>' + 
             '            <option>5</option>' + 
             '          </select>' + 
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
          // var icon = $('#selectPanelIcon input').val();

          // insertPanel(title, icon);
        }
      }
    }
  });
  $('.selectpicker').selectpicker();
}

function reloadScreen() {
}

function editSettings() {
}

function toggleConfigMode() {
  $(".configButtons").fadeToggle("fast", function() {});
}

function insertPanel(title, icon, column) {
  title = ((title !== null && title !== undefined) ? title : "");
  icon = ((icon !== null && icon !== undefined) ? icon : "fa-group");
  column = ((column !== null && column !== undefined) ? column : 1);

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
  
  $('#panel' + title).hide().fadeIn('slow');
  
  $('#panelBtnAddWidget' + title).on('click', function() {
    addWidget('#panel' + title);
  });
    
  $('#panelBtnRemoveWidget' + title).on('click', function() {
  });
    
  $('#panelBtnDelete' + title).on('click', function() {
    deletePanel(title);
  });
    
  $('#panelBtnMoveDown' + title).on('click', function() {
    movePanelDown(title);
  });
    
  $('#panelBtnMoveUp' + title).on('click', function() {
    movePanelUp(title);
  });
    
  $('#panelBtnMoveLeft' + title).on('click', function() {
    movePanelLeft(title);
  });
    
  $('#panelBtnMoveRight' + title).on('click', function() {
    movePanelRight(title);
  });
}

function deletePanel(title) {
  $('#panel' + title)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
}

function movePanelDown(title) {
  var panelList = getPanelList(title);
  
  if(panelList['panel' + title].position < (Object.keys(panelList).length - 1)) {
    // move down
    swapPanel(panelList['panel' + title].id, panelList['panel' + title].nextId);
  }
}

function movePanelUp(title) {
  // $('#panel' + title).remove();
  var panelList = getPanelList(title);
  
  if(panelList['panel' + title].position > 0) {
    // move up
    swapPanel(panelList['panel' + title].id, panelList['panel' + title].prevId);
  }
}

function movePanelRight(title) {
  
}

function movePanelLeft(title) {
  
}

function getPanelList(title) {
  var prevPanel = null;
  var nextPanel = null;
  var counter = 0;
  var panelList = {};
  
  $('#panel' + title).parent().children().each(function() { 
    panelList[$(this).attr('id')] = {id: $(this).attr('id'), position: counter++, value: this, prevId: null, nextId: null};
    
    if(prevPanel !== null) {
      panelList[$(this).attr('id')].prevId = prevPanel.id;
      prevPanel.nextId = $(this).attr('id');
    }
    
    prevPanel = panelList[$(this).attr('id')];
  });

  return panelList;
}

function swapPanel(a, b){ 
    a = $('#' + a)[0]; 
    b = $('#' + b)[0]; 
  
    var t = a.parentNode.insertBefore(document.createTextNode(''), a); 
  
    b.parentNode.insertBefore(a, b); 
    t.parentNode.insertBefore(b, t); 
    t.parentNode.removeChild(t); 
}

