/* global $:false,bootbox,document,BootBoxWiz,Server,processPanelMessages,processDataSourceMessages,displayPanelDialog,WidgetManager, AgileSprintManager, JenkinsBuildManager */

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
var jenkinsBuildManager = null;
var widgetManager = null;
var dataSourceManager = null;
var preferenceManager = null;
// TODO: refactor this to get rid of globals
var configMode = false;      
      

function configureApplication() {
  widgetManager = new WidgetManager();
  agileSprintManager = new AgileSprintManager({widgetManager: widgetManager});
  jenkinsBuildManager = new JenkinsBuildManager({widgetManager: widgetManager});
  dataSourceManager = new DataSourceManager();
  preferenceManager = new PreferenceManager();
  
  addApplicationButtonListeners();
  
  // apply select picker styling
  $('.selectpicker').selectpicker();
  
  // apply jasny rowlink logic to tables
  // $('tbody.rowlink').rowlink();
  
  server = new Server({
    messageHandlers: [
      processPanelMessages,
      dataSourceManager.processMessages.bind(dataSourceManager),
      preferenceManager.processMessages.bind(preferenceManager),
      widgetManager.processMessages.bind(widgetManager),
      agileSprintManager.processMessages.bind(agileSprintManager),
      jenkinsBuildManager.processMessages.bind(jenkinsBuildManager),
    ]
  });

  widgetManager.server = server;
  widgetManager.dataSourceManager = dataSourceManager;
  dataSourceManager.server = server;
  preferenceManager.server = server;
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
  preferenceManager.setupPreferencesPane();
}

function enableConfigMode() {
  configMode = true;
  $(".config-buttons").fadeIn("slow", function() {}).addClass('displayButton').css('display', '');
  panelDragAndDrop.enable();
  widgetManager.enableConfigMode();
}
      
function disableConfigMode() {
  configMode = false;
  var currentPaneId = $('.activePane').attr('id');
  
  if(currentPaneId !== "") {
    $("#viewHome").trigger('click');
  }

  panelDragAndDrop.disable();
  widgetManager.disableConfigMode();
  $(".config-buttons").fadeOut("slow", function() {$(".config-buttons").css("display", ""); }).removeClass('displayButton');
}
      

function toggleConfigMode() {
  if(configMode) {
    disableConfigMode();
  } else {
    enableConfigMode();
    addPanelMode = true;
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
  widgetManager.enableConfigMode();
}

function hidePanelButton(buttonId) {
  $('#' + buttonId).addClass('hiddenButton');
  panelDragAndDrop.disable();
  widgetManager.disableConfigMode();
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