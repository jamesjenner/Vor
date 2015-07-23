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
var widgetDragAndDrop;
var agileSprintManager = null;
var jenkinsBuildManager = null;
var panelManager = null;
var widgetManager = null;
var dataSourceManager = null;
var preferenceManager = null;
var bannerManager = null;
var headerManager = null;
var screenManager = null;
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
  bannerManager = new BannerManager();
  headerManager = new HeaderManager();
  screenManager = new ScreenManager();
  
  addApplicationButtonListeners();
  
  // apply select picker styling
  $('.selectpicker').selectpicker();
  
  // apply jasny rowlink logic to tables
  // $('tbody.rowlink').rowlink();
  
  server = new Server({
    autoReconnect: true,
    connectionListener: connectionOccured,
    disconnectionListener: disconnectionOccured,
    errorListener: commsErrorOccured,
    messageHandlers: [
      dataSourceManager.processMessages.bind(dataSourceManager),
      preferenceManager.processMessages.bind(preferenceManager),
      bannerManager.processMessages.bind(bannerManager),
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
  bannerManager.server = server;
  localPreferenceManager.server = server;
  server.connect();

  preferenceManager.addModfiedListener(panelManager);
  preferenceManager.addModfiedListener(bannerManager);
  preferenceManager.addModfiedListener(headerManager);
  preferenceManager.addModfiedListener(screenManager);
  
  panelDragAndDrop = new PanelDragAndDrop({
    panelManager: panelManager,
    server: server, 
    columnSelector: ".column-main", 
    panelSelector: ".panel", 
    handle: ".panel-heading", 
    placeholderClass: "panel-placeholder",
    doNotSelect: ".panel-controls .addPanel",
    dragClass: "draggable",
  });
  
  panelManager.dragAndDrop = panelDragAndDrop;
  
  widgetDragAndDrop = new WidgetDragAndDrop({
    widgetManager: widgetManager,
    server: server, 
    panelSelector: ".widget-container", 
    widgetSelector: ".widget", 
    handle: ".widget-drag-overlay", 
    placeholderClass: "widget-placeholder",
//    doNotSelect: ".panel-controls",
    dragClass: "draggable",
  });
  
  widgetManager.dragAndDrop = widgetDragAndDrop;
}

function connectionOccured(event) {
  removePermanentWarningMessage(disconnectionMessage);
  disconnectionMessage = null;
  displayStatusMessage("The server is connected", "Communications");
}

var disconnectionMessage = null;

function disconnectionOccured(event) {
  if(disconnectionMessage === null) {
    disconnectionMessage = displayPermanentWarningMessage("The server is disconnected", "Communications");
  }
}

function commsErrorOccured(event) {
  // displayErrorMessage("An error occured connecting to the server (" + event.currentTarget.url + ")", "Communications");
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
    
  $("body").on('click', '#viewBannerContent', function() {
    toggleButtonViewSelection('viewBannerContent');
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
  bannerManager.setup();
}

function enableConfigMode() {
  configMode = true;
  $(".config-buttons").fadeIn("slow", function() {}).addClass('displayButton').css('display', '');
  addPanelAddPane();
  panelDragAndDrop.enable();
  widgetDragAndDrop.enable();
  widgetManager.enableConfigMode();
}

function addPanelAddPane() {
//  $(".config-buttons").fadeIn("slow", function() {}).addClass('displayButton').css('display', '');
  var panelClass = "add-panel";
  
  var nextPosition = this.panelManager.determineNextPanelPosition();
  
  if(this.panelManager.columns === 1) {
    panelClass += " panel-left panel-left";
  } else if(nextPosition.col === 1) {
    panelClass += " panel-left";
  } else if(nextPosition.col === this.panelManager.columns) {
    panelClass += " panel-right";
  }
  
  $("#column" + nextPosition.col).append(
    '<div id="panelAddHolder" class="' + panelClass + '">' +
    '  <div id="panelBodyAdd" class="add-panel-container widget-container">' +
    '    <object id="panelAddHolderAddCircle" class="panel-single-action" type="image/svg+xml" data="../images/add_circle.svg" />' +
    '  </div>' +
    '</div>'
  );

  $("#panelAddHolder").hide().fadeIn('slow');
  
  var a = document.getElementById("panelAddHolderAddCircle");
  
  a.addEventListener("load",function() {
    var svgDoc = a.contentDocument;
    var styleElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
    styleElement.textContent = "svg { fill: #aaa }"; // add whatever you need here
    svgDoc.getElementById("svg_add_circle_plus").appendChild(styleElement);

    var hiddenCircle = svgDoc.getElementById("svg_add_circle_hidden_circle_group");
    var plus = svgDoc.getElementById("svg_add_circle_plus");
    var circle = svgDoc.getElementById("svg_add_circle_circle");
    circle.setAttribute("fill", "white");
    circle.setAttribute("fill-opacity", ".75");
    circle.setAttribute("visibility", "hidden");
    plus.setAttribute("fill", "white");
    plus.setAttribute("fill-opacity", ".75");

    hiddenCircle.onmouseover = function(evt) {
      circle.setAttribute("visibility", "visible");
    };
    
    circle.onmouseleave = function(evt) {
      circle.setAttribute("visibility", "hidden");
    };
    
    hiddenCircle.onmousedown = function(evt) {
      circle.setAttribute("fill-opacity", "1");
      plus.setAttribute("fill-opacity", "1");
      displayPanelDialog('add');
    };
    
    hiddenCircle.onmouseup = function(evt) {
      circle.setAttribute("fill-opacity", ".75");
      plus.setAttribute("fill-opacity", ".75");
    };
  }, false);
}
      
function removePanelAddPane() {
  $("#panelAddHolder").fadeOut('slow').remove();
  // $(".config-buttons").fadeOut("slow", function() {$(".config-buttons").css("display", ""); }).removeClass('displayButton');
}
      
function disableConfigMode() {
  configMode = false;
  var currentPaneId = $('.activePane').attr('id');
  
  if(currentPaneId !== "") {
    $("#viewHome").trigger('click');
  }

  removePanelAddPane();
  panelDragAndDrop.disable();
  widgetDragAndDrop.disable();
  widgetManager.disableConfigMode();
  $(".config-buttons").fadeOut("slow", function() {$(".config-buttons").css("display", ""); }).removeClass('displayButton');
}
      

function toggleConfigMode() {
  if(configMode) {
    disableConfigMode();
  } else {
    enableConfigMode();
    panelManager.addMode = true;
    widgetManager.addMode = true;
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
  widgetManager.addMode = true;
}

function hideAddPanelButton() {
  hidePanelButton('addPanel');
  panelManager.addMode = false;
  widgetManager.addMode = false;
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
  if(screenManager !== null) {
    $('#toast-container').css("padding-left", screenManager.screenPaddingLeft + 'px');
    $('#toast-container').css("padding-bottom", screenManager.screenPaddingBottom + 'px');
  }
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
  if(screenManager !== null) {
    $('#toast-container').css("padding-left", screenManager.screenPaddingLeft + 'px');
    $('#toast-container').css("padding-bottom", screenManager.screenPaddingBottom + 'px');
  }
}

function displayPermanentWarningMessage(message, title) {
  var message;
  
  toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-bottom-left",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "500",
    "timeOut": "0",
    "extendedTimeOut": "0",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
    "tapToDismiss": false
  };
  
  message = toastr.warning(message, title);
  
  if(screenManager !== null) {
    $('#toast-container').css("padding-left", screenManager.screenPaddingLeft + 'px');
    $('#toast-container').css("padding-bottom", screenManager.screenPaddingBottom + 'px');
  }
  
  return message;
}

function removePermanentWarningMessage(message) {
  if(message !== null) {
    toastr.clear(message);
  }
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
  
  if(screenManager !== null) {
    $('#toast-container').css("padding-left", screenManager.screenPaddingLeft + 'px');
    $('#toast-container').css("padding-bottom", screenManager.screenPaddingBottom + 'px');
  }
}