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
//             '        <span class="help-block">Here goes your name</span>' +
             '        </div> ' +
             '      </div> ' +
             '      <div class="form-group"> ' +
             '        <label class="col-md-4 control-label" for="icon">Icon</label> ' +
//             '        <div class="col-md-4">' + 
             '        <div class="col-md-4 fuelux">' + 
    
//             '          <div class="list-group">' +
//             '            <a href="#" class="list-group-item active">' +
//             '              <p class="list-group-item-heading">List group item heading</p>' +
//             '              <p class="list-group-item-text"><i class="fa fa-users fa-lg"></i></p>' +
//             '            </a>' +
//             '            <a href="#" class="list-group-item">' +
//             '              <p class="list-group-item-text"><i class="fa fa-users fa-lg"></i></p>' +
//             '            </a>' +
//             '          </div>' +

//             '          <div class="btn-group selectlist" data-resize="auto" data-initialize="selectlist" id="mySelectlist">' +
             '          <div class="btn-group selectlist" data-initialize="selectlist" id="iconSelectlist">' +
             '            <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" type="button">' +
             '              <span class="selected-label"></span>' +
             '              <span class="caret"></span>' +
             '              <span class="sr-only">Toggle Dropdown</span>' +
             '            </button>' +
             '            <ul class="dropdown-menu" role="menu">' +
             '              <li data-value="a"><a href="#"><i class="fa fa-users fa-lg"></i></a></li>' +
             '              <li data-value="b"><a href="#"><i class="fa fa-camera fa-lg"></i></a></li>' +
             '            </ul>' +
             '            <input class="hidden hidden-field" name="mySelectlist" readonly="readonly" aria-hidden="true" type="text"/>' +
             '          </div>' +
    
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
          
        }
      }
    }
  });
}

function reloadScreen() {
}

function editSettings() {
}

function toggleConfigMode() {
  $(".configButtons").fadeToggle("fast", function() {});
}