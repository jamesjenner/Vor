/* global $:false,bootbox,document,BootBoxWiz,Server,processPanelMessages,processDataSourceMessages,displayPanelDialog,WidgetManager, AgileSprintManager, JenkinsBuildManager */

/*
 * Main javascript logic for index.html
 * 
 * Dependancies:
 *    jquery
 *    css/styles.css
 */

var server = null;
var panelDragAndDrop;
var agileSprintManager = null;
var jenkinsBuildManager = null;
var panelManager = null;
var widgetManager = null;
var dataSourceManager = null;
var preferenceManager = null;
var localPreferenceManager = null;
// TODO: refactor this to get rid of globals
var configMode = false;      
      

function configureApplication() {
  panelManager = new PanelManager();
  widgetManager = new WidgetManager();
  agileSprintManager = new AgileSprintManager({widgetManager: widgetManager});
  jenkinsBuildManager = new JenkinsBuildManager({widgetManager: widgetManager});
  dataSourceManager = new DataSourceManager();
  preferenceManager = new PreferenceManager();
  localPreferenceManager = new LocalPreferenceManager();
  
  addApplicationButtonListeners();
  
  // apply select picker styling
  $('.selectpicker').selectpicker();
  
  // apply jasny rowlink logic to tables
  // $('tbody.rowlink').rowlink();
  
  server = new Server({
    connectionListener: connectionOccured,
    disconnectionListener: disconnectionOccured,
    errorListener: commsErrorOccured,
    messageHandlers: [
      dataSourceManager.processMessages.bind(dataSourceManager),
      preferenceManager.processMessages.bind(preferenceManager),
      localPreferenceManager.processMessages.bind(localPreferenceManager),
      panelManager.processMessages.bind(panelManager),
      widgetManager.processMessages.bind(widgetManager),
      agileSprintManager.processMessages.bind(agileSprintManager),
      jenkinsBuildManager.processMessages.bind(jenkinsBuildManager),
    ]
  });

  panelManager.server = server;
  widgetManager.server = server;
  widgetManager.dataSourceManager = dataSourceManager;
  dataSourceManager.server = server;
  preferenceManager.server = server;
  localPreferenceManager.server = server;
  server.connect();

  panelDragAndDrop = new PanelDragAndDrop({
    panelManager: panelManager,
    server: server, 
    columnSelector: ".column", 
    panelSelector: ".panel", 
    handle: ".panel-heading", 
    placeholderClass: "panel-placeholder",
    doNotSelect: ".panel-controls",
    dragClass: "draggable",
  });
  
  panelManager.dragAndDrop = panelDragAndDrop;
}

function connectionOccured(event) {
  displayStatusMessage("The server is connected", "Communications");
}

function disconnectionOccured(event) {
  displayWarningMessage("The server is disconnected", "Communications");
}

function commsErrorOccured(event) {
  displayErrorMessage("An error occured connecting to the server (" + event.currentTarget.url + ")", "Communications");
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
  dataSourceManager.setup();
  localPreferenceManager.setup();
  preferenceManager.setup();
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
    panelManager.addMode = true;
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
  panelManager.addMode = true;
}

function hideAddPanelButton() {
  hidePanelButton('addPanel');
  panelManager.addMode = false;
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

function displayStatusMessage(message, title) {
  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-bottom-left",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "500",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "tapToDismiss": true
  };
  toastr.success(message, title);
}

function displayWarningMessage(message, title) {
  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-bottom-left",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "500",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "tapToDismiss": true
  };
  toastr.warning(message, title);
}

function displayErrorMessage(message, title) {
  toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-bottom-left",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    // "hideDuration": "500",
    "timeOut": "2000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "tapToDismiss": true
  };
  toastr.error(message, title);
}