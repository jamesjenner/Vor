
function addPanel(panel) {
  sendAddPanel(panel);
}

function processPanelMessages(server, id, content) {
  var processed = false;

  switch (id) {
    case Panel.MESSAGE_PANELS:
      receivedPanels(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_ADD_PANEL:
      receivedAddPanel(server, new Panel(content));
      processed = true;
      break;

    case Panel.MESSAGE_DELETE_PANEL:
      receivedDeletePanel(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_UPDATE_PANEL:
      // receivedUpdatePanel(server, new Panel(content));
      processed = true;
      break;
  }

  return processed;
}

function isPanelAddMode() {
  // TODO: addPanelMode is global (refer main.js), not really happy about this
  return addPanelMode;
}


function receivedAddPanel(server, d) {
  // get mode
  var buttonsVisible = false;
  
  addPanelToDom(d, isPanelAddMode());
}

function receivedDeletePanel(server, d) {
  // $("#row" + d.id).remove();
  deletePanel(d.id);
}

function receivedPanels(server, d) {
  // TODO: logic to handle resend of panels
  // $(".panelRow").remove();

  var buttonsVisible = isPanelAddMode();
  
  var panelsArray = [];
  
  for (item in d) {
   panelsArray.push(new Panel(d[item]));
  }

  panelsArray.sort(function (a, b) {
      if (a.row < b.row) {
          return -1;
      } else if (a.row > b.row) {
          return 1;
      }
      return 0;
  });

  panelsArray.forEach(function (p) {
    addPanelToDom(p, buttonsVisible);
  });
}

function sendAddPanel(panel) {
  server.sendMessage(Panel.MESSAGE_ADD_PANEL, panel);
  return false;
}

function sendDeletePanel(panel) {
  server.sendMessage(Panel.MESSAGE_DELETE_PANEL, panel);
  return false;
}

function addPanelToDom(panel, buttonsVisible) {
  var displayButtonClass = buttonsVisible ? "displayButton" : "";
  var displayStyle = buttonsVisible ? "block" : "none";
  console.log("adding " + panel.name + " to column: " + panel.column);
  $("#columnContainer" + panel.column).append(
    '<div id="panel' + panel.id + '" class="panel" ' + 
      'data-name="' + panel.name + '" ' +
      'data-icon-name="' + panel.iconName + '" ' +
      'data-icon-type="' + panel.iconType + '" ' +
      'data-column="' + panel.column + '" ' +
      'data-row="' + panel.row + '" ' +
      'data-width="' + panel.width + '">' +
    '  <div class="panel-heading">' +
    '      <div class="btn-group pull-right">' +
    '        <button id="panelBtnAddWidget' + panel.id + '" type="button" class="configButtons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-plus "></i>' +
    '        </button>' +
    '        <button id="panelBtnRemoveWidget' + panel.id + '" type="button" class="configButtons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-minus"></i>' +
    '        </button>' +
    '        <button id="panelBtnDelete' + panel.id + '" type="button" class="configButtons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-trash"></i>' +
    '        </button>' +
    '        <button id="panelBtnMoveDown' + panel.id + '" type="button" class="configButtons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-arrow-down"></i>' +
    '        </button>' +
    '        <button id="panelBtnMoveUp' + panel.id + '" type="button" class="configButtons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-caret-up"></i>' +
    '        </button>' +
    '        <button id="panelBtnMoveLeft' + panel.id + '" type="button" class="configButtons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-arrow-left"></i>' +
    '        </button>' +
    '        <button id="panelBtnMoveRight' + panel.id + '" type="button" class="configButtons btn btn-default btn-sml ' + displayButtonClass + '" style="display: ' + displayStyle + ';">' +
    '          <i class="fa fa-chevron-right"></i>' +
    '        </button>' +
    '      </div>' +
    '    <i class="fa ' + panel.iconName + ' fa-lg"></i> ' + panel.name +
    '  </div>' +
    '  <div class="panel-body widget-container">' +
    '  </div>' +
    '</div>'
  );
  
  $('#panel' + panel.id).hide().fadeIn('slow');
  
  $('#panelBtnAddWidget' + panel.id).on('click', function() {
    addWidget('#panel' + panel.id);
  });
    
  $('#panelBtnRemoveWidget' + panel.id).on('click', function() {
  });
    
  $('#panelBtnDelete' + panel.id).on('click', function() {
    sendDeletePanel(panel)
  });
    
  $('#panelBtnMoveDown' + panel.id).on('click', function() {
    movePanelDown(panel.id);
  });
    
  $('#panelBtnMoveUp' + panel.id).on('click', function() {
    movePanelUp(panel.id);
  });
    
  $('#panelBtnMoveLeft' + panel.id).on('click', function() {
    movePanelLeft(panel.id);
  });
    
  $('#panelBtnMoveRight' + panel.id).on('click', function() {
    movePanelRight(panel.id);
  });
}

function deletePanel(id) {
  $('#panel' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
}

function movePanelDown(id) {
  var panelList = getPanelList(id);
  
  if(panelList['panel' + id].position < (Object.keys(panelList).length - 1)) {
    // move down
    swapPanelVertically(panelList['panel' + id].id, panelList['panel' + id].nextId);
  }
}

function movePanelUp(id) {
  // $('#panel' + id).remove();
  var panelList = getPanelList(id);
  
  if(panelList['panel' + id].position > 0) {
    // move up
    swapPanelVertically(panelList['panel' + id].id, panelList['panel' + id].prevId);
  }
}

function movePanelRight(id) {
  var panel = $('#panel' + id);
  var column = panel.data("column");
  
//  panel
//    .fadeOut('fast', function() {
//      panel.appendTo("#columnContainer" + (column + 1));
//      panel.hide();
//      panel.fadeIn('fast');
//    });

  $('#panel' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "fast", queue: false})
    .fadeOut('fast', function() {
      panel.appendTo("#columnContainer" + (column + 1));
      panel.hide();
      panel.css('height', '');    
      panel.css('padding', '');    
      panel.css('margin', '');    
      panel.fadeIn('fast');
      
  });
}

function movePanelLeft(id) {
  var panel = $('#panel' + id);
  var column = panel.data("column");

  $('#panel' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "fast", queue: false})
    .fadeOut('fast', function() {
      panel.appendTo("#columnContainer" + (column));
      panel.hide();
      panel.css('height', '');    
      panel.css('padding', '');    
      panel.css('margin', '');    
      panel.fadeIn('fast');
  });
}

function getPanelList(id) {
  var prevPanel = null;
  var nextPanel = null;
  var counter = 0;
  var panelList = {};
  
  $('#panel' + id).parent().children().each(function() { 
    panelList[$(this).attr('id')] = {id: $(this).attr('id'), position: counter++, value: this, prevId: null, nextId: null};
    
    if(prevPanel !== null) {
      panelList[$(this).attr('id')].prevId = prevPanel.id;
      prevPanel.nextId = $(this).attr('id');
    }
    
    prevPanel = panelList[$(this).attr('id')];
  });

  return panelList;
}

function swapPanelVertically(a, b){ 
    a = $('#' + a)[0]; 
    b = $('#' + b)[0]; 
  
    var t = a.parentNode.insertBefore(document.createTextNode(''), a); 
  
    b.parentNode.insertBefore(a, b); 
    t.parentNode.insertBefore(b, t); 
    t.parentNode.removeChild(t); 
}

