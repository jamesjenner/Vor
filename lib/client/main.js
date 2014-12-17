/* global $:false,bootbox,document,BootBoxWiz,Server,processPanelMessages,processDataSourceMessages,displayPanelDialog,WidgetManager, AgileSprintManager */

/*
 * Main javascript logic for index.html
 * 
 * Dependancies:
 *    jquery
 *    css/styles.css
 */

var server = null;
var addPanelMode = false;
var panelDragAndDrop;
var agileSprintManager = null;
var widgetManager = null;
var dataSourceManager = null;

function configureApplication() {
  widgetManager = new WidgetManager();
  agileSprintManager = new AgileSprintManager({widgetManager: widgetManager});
  dataSourceManager = new DataSourceManager();
  
  addApplicationButtonListeners();
  
  // apply select picker styling
  $('.selectpicker').selectpicker();
  
  // apply jasny rowlink logic to tables
  // $('tbody.rowlink').rowlink();
  
  server = new Server({
    messageHandlers: [
      processPanelMessages,
      dataSourceManager.processMessages.bind(dataSourceManager),
      widgetManager.processMessages.bind(widgetManager),
      agileSprintManager.processMessages.bind(agileSprintManager),
    ]
  });

  widgetManager.server = server;
  dataSourceManager.server = server;
  server.connect();

  panelDragAndDrop = new PanelDragAndDrop({
    server: server, 
    columnSelector: ".column", 
    panelSelector: ".panel", 
    handle: ".panel-heading", 
    placeholderClass: "panel-placeholder",
    doNotSelect: ".panel-controls",
    dragClass: "draggable",
  });
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
    displayPanelDialog('add');
  });
  
  // TODO: better manage adding triggers for sub areas 
  dataSourceManager.setupDataSourcesPane();
}


// TODO: refactor this to get rid of globals
var configMode = false;      
      
function enableConfigMode() {
  configMode = true;
  $(".config-buttons").fadeIn("slow", function() {}).addClass('displayButton');
  panelDragAndDrop.enable();
}
      
function disbaleConfigMode() {
  configMode = false;
  var currentPaneId = $('.activePane').attr('id');
  
  if(currentPaneId !== "") {
    $("#viewHome").trigger('click');
  }

  panelDragAndDrop.disable();
  $(".config-buttons").fadeOut("slow", function() {$(".config-buttons").css("display", ""); }).removeClass('displayButton');
}
      

function toggleConfigMode() {
  if(configMode) {
    disbaleConfigMode();
  } else {
    enableConfigMode();
  }
}

function toggleButtonViewSelection(buttonId) {
  var previousId = $('.config-button-active').attr('id');

  $('#' + previousId).toggleClass('config-button-inactive');
  $('#' + previousId).toggleClass('config-button-active');
  
  $('#' + buttonId).toggleClass('config-button-inactive');
  $('#' + buttonId).toggleClass('config-button-active');
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
  panelDragAndDrop.enable();
}

function hidePanelButton(buttonId) {
  $('#' + buttonId).addClass('hiddenButton');
  panelDragAndDrop.disable();
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