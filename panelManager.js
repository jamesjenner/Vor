/* jshint browser: true, jquery: true */
/* global Panel:false, console:false, server:false, addWidget:false */

function addPanel(panel) {
  // TODO: determine the correct row (row of last element for column + 1)
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
      receivedUpdatePanel(server, new Panel(content));
      processed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL_UP:
      console.log("content: " + content);
      receivedMovePanelUp(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL_DOWN:
      receivedMovePanelDown(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL_LEFT:
      receivedMovePanelLeft(server, content);
      processed = true;
      break;

    case Panel.MESSAGE_MOVE_PANEL_RIGHT:
      receivedMovePanelRight(server, content);
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
  addPanelToDom(d, isPanelAddMode());
}

function receivedDeletePanel(server, id) {
  deletePanel(id);
}

function receivedMovePanelUp(server, id) {
  movePanelUp(id);
}

function receivedMovePanelDown(server, id) {
  movePanelDown(id);
}

function receivedMovePanelLeft(server, panel) {
  changePanelColumn(panel);
}

function receivedMovePanelRight(server, panel) {
  changePanelColumn(panel);
}

function receivedUpdatePanel(server, panel) {
  // get current data
  var currentPanelElement = $('#panel' + panel.id);
  
  var currentPanel = new Panel(currentPanelElement.data());
  
  console.log("current data for " + panel.id + " is: " + JSON.stringify(currentPanel, null, " "));
  
  // apply changes to DOM
  if(currentPanel.name !== panel.name) {
    
  }
  
  if(currentPanel.column !== panel.column) {
    changePanelColumn(panel);
  }
  
  if(currentPanel.iconName !== panel.iconName) {
    
  }
  
  // update data attributes for id
  
}

function receivedPanels(server, d) {
  // TODO: logic to handle resend of panels
  // $(".panelRow").remove();

  var buttonsVisible = isPanelAddMode();
  
  var panelsArray = [];
  
  for (var item in d) {
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
}

function sendDeletePanel(id) {
  server.sendMessage(Panel.MESSAGE_DELETE_PANEL, id);
}

function sendUpdatePanel(panel) {
  server.sendMessage(Panel.MESSAGE_UPDATE_PANEL, panel);
}

function sendMovePanelUp(id) {
  server.sendMessage(Panel.MESSAGE_MOVE_PANEL_UP, id);
}

function sendMovePanelDown(id) {
  server.sendMessage(Panel.MESSAGE_MOVE_PANEL_DOWN, id);
}

function sendMovePanelLeft(id) {
  server.sendMessage(Panel.MESSAGE_MOVE_PANEL_LEFT, id);
}

function sendMovePanelRight(id) {
  server.sendMessage(Panel.MESSAGE_MOVE_PANEL_RIGHT, id);
}

function addPanelToDom(panel, buttonsVisible) {
  var displayButtonClass = buttonsVisible ? "displayButton" : "";
  var displayStyle = buttonsVisible ? "block" : "none";

  $("#columnContainer" + panel.column).append(
    '<div id="panel' + panel.id + '" class="panel" ' + 
      'data-name="' + panel.name + '" ' +
      'data-iconName="' + panel.iconName + '" ' +
      'data-iconType="' + panel.iconType + '" ' +
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
    sendDeletePanel(panel.id);
  });
    
  $('#panelBtnMoveDown' + panel.id).on('click', function() {
    sendMovePanelDown(panel.id);
  });
    
  $('#panelBtnMoveUp' + panel.id).on('click', function() {
    sendMovePanelUp(panel.id);
  });
    
  $('#panelBtnMoveLeft' + panel.id).on('click', function() {
    sendMovePanelLeft(panel.id);
  });
    
  $('#panelBtnMoveRight' + panel.id).on('click', function() {
    sendMovePanelRight(panel.id);
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
  var panelList = getPanelList(id);
  
  if(panelList['panel' + id].position > 0) {
    // move up
    swapPanelVertically(panelList['panel' + id].id, panelList['panel' + id].prevId);
  }
}

function changePanelColumn(panelData) {
  var panel = $('#panel' + panelData.id);
  
  $('#panel' + panelData.id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "fast", queue: false})
    .fadeOut('fast', function() {
      panel
        .appendTo("#columnContainer" + panelData.column)
        .hide()
        .css('height', '')
        .css('padding', '')
        .css('margin', '')
        .fadeIn('fast');
      
  });
}

function getPanelList(id) {
  var prevPanel = null;
  var nextPanel = null;
  var counter = 0;
  var panelList = {};
  
  $('#panel' + id).parent().children().each(function() { 
    panelList[$(this).attr('id')] = {
      id: $(this).attr('id'), 
      position: counter++, 
      value: this, 
      prevId: null, 
      nextId: null
    };
    
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

