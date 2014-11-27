/* global $:false,bootbox,document,BootBoxWiz,Server,processPanelMessages,processDataSourceMessages,displayAddPanelDialog */

/*
 * Main javascript logic for index.html
 * 
 * Dependancies:
 *    jquery
 *    css/styles.css
 */

var server = null;
var addPanelMode = false;

function configureApplication() {
  addApplicationButtonListeners();
  
  // apply select picker styling
  $('.selectpicker').selectpicker();
  
  // apply jasny rowlink logic to tables
  // $('tbody.rowlink').rowlink();
  
  server = new Server({
    messageHandlers: [
      processPanelMessages,
      processDataSourceMessages,
    ]
  });

  server.connect();
}

function addApplicationButtonListeners() {
  
  $("body").on('change', '#toggleConfigMode', function() {
    toggleConfigMode();
  });
  
  $("body").on('click', '#viewHome', function() {
    toggleButtonViewSelection('viewHome');
    showAddPanelButton();
    displayPane("homePane");
  });
  
  $("body").on('click', '#viewSettings', function() {
    toggleButtonViewSelection('viewSettings');
    hideAddPanelButton();
    displayPane("settingsPane");
  });
  
  $("body").on('click', '#viewThemes', function() {
    toggleButtonViewSelection('viewThemes');
    hideAddPanelButton();
    displayPane("themesPane");
  });
    
  $("body").on('click', '#viewContent', function() {
    toggleButtonViewSelection('viewContent');
    hideAddPanelButton();
    displayPane("bannerContentPane");
  });
    
  $("#viewDataSources").on('click', function() {
    toggleButtonViewSelection('viewDataSources');
    hideAddPanelButton();
    displayPane("dataSourcesPane");
  });

  $("body").on('click', '#addPanel', function() {
    displayAddPanelDialog();
  });
  
  // TODO: better manage adding triggers for sub areas 
  setupDataSourcesPane();
}

function toggleConfigMode() {
  var currentPaneId = $('.activePane').attr('id');
  
  if(currentPaneId !== "") {
    $("#viewHome").trigger('click');
  }
  
  $(".configButtons").fadeToggle("slow", function() {}).toggleClass('displayButton').css("display","");
}

function toggleButtonViewSelection(buttonId) {
  var previousId = $('.configButtonActive').attr('id');

  $('#' + previousId).toggleClass('configButtonInactive');
  $('#' + previousId).toggleClass('configButtonActive');
  
  $('#' + buttonId).toggleClass('configButtonInactive');
  $('#' + buttonId).toggleClass('configButtonActive');
}

function showAddPanelButton() {
  showPanelButton('addPanel');
  addPanelMode = true;
}

function hideAddPanelButton() {
  hidePanelButton('addPanel');
  addPanelMode = false;
}

function showPanelButton(buttonId) {
  $('#' + buttonId).removeClass('hiddenButton');
}

function hidePanelButton(buttonId) {
  $('#' + buttonId).addClass('hiddenButton');
}

function displayPane(paneId) {
  var previousId = $('.activePane').attr('id');
  
  if(previousId === paneId) {
    return;
  }
  
  $('#' + previousId).fadeToggle("fast", function() {
    $(this).toggleClass('activePane');
    $('#' + paneId).fadeToggle("fast", function() {
      $(this).toggleClass('activePane');
    });
  });
}

function viewDataSourceDetailPane(key) {
  displayPane("dataSourceDetail");
}