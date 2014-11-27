/* jshint browser: true, jquery: true */
/* global DataSource:false, console:false, server:false, viewDataSourceWizard:false */

function addDataSource(dataSource) {
  // TODO: determine the correct row (row of last element for column + 1)
  sendAddDataSource(dataSource);
}

function updateDataSource(dataSource) {
  // TODO: determine the correct row (row of last element for column + 1)
  sendUpdateDataSource(dataSource);
}

function processDataSourceMessages(server, id, content) {
  var processed = false;

  switch (id) {
    case DataSource.MESSAGE_DATA_SOURCES:
      receivedDataSources(server, content);
      processed = true;
      break;

    case DataSource.MESSAGE_ADD_DATA_SOURCE:
      receivedAddDataSource(server, new DataSource(content));
      processed = true;
      break;

    case DataSource.MESSAGE_DELETE_DATA_SOURCE:
      receivedDeleteDataSource(server, content);
      processed = true;
      break;

    case DataSource.MESSAGE_UPDATE_DATA_SOURCE:
      receivedUpdateDataSource(server, new DataSource(content));
      processed = true;
      break;
  }

  return processed;
}

function receivedAddDataSource(server, d) {
  addDataSourceToDom(d);
}

function receivedDeleteDataSource(server, id) {
  deleteDataSource(id);
}

function receivedUpdateDataSource(server, dataSource) {
  var idx = dataSourcesIndex.indexOf(dataSource.id);
  var currentDataSource = null;
  
  if(idx < 0) {
    dataSources.push(dataSource);
    dataSourcesIndex.push(dataSource.id);
  } else {
    currentDataSource = dataSources[idx];
    dataSources[idx] = dataSource;
    
    if(currentDataSource.name !== dataSource.name) {
      $('#dataSourceRowName' + dataSource.id).text(dataSource.name);
    }
    if(currentDataSource.type !== dataSource.type) {
      $('#dataSourceRowType'  + dataSource.id).text(dataSource.type);
    }
  }
}

function receivedDataSources(server, d) {
  // TODO: test logic to remove existing data on DOM (needed for reconnection, but not supported)
  $("#dataSourcesGrid").empty();

  dataSources = [];
  var dataSource = null;
  
  for (var item in d) {
    dataSource = new DataSource(d[item]);
    dataSources.push(dataSource);
    dataSourcesIndex.push(dataSource.id);
    addDataSourceToDom(dataSource);
  }
}

// TODO: sort out this global
var dataSources = [];
var dataSourcesIndex = [];

function sendAddDataSource(dataSource) {
  server.sendMessage(DataSource.MESSAGE_ADD_DATA_SOURCE, dataSource);
}

function sendDeleteDataSource(id) {
  server.sendMessage(DataSource.MESSAGE_DELETE_DATA_SOURCE, id);
}

function sendUpdateDataSource(dataSource) {
  server.sendMessage(DataSource.MESSAGE_UPDATE_DATA_SOURCE, dataSource);
}

function addDataSourceToDom(dataSource) {
  $("#dataSourcesGrid").append(
    '<tr id="dataSourceRow' + dataSource.id + '">' +
    '  <td><a id="dataSourceRowType' + dataSource.id + '" class="dataSourceRow" href="#inputmask">' + dataSource.type + '</a></td>' +
    '  <td id="dataSourceRowName' + dataSource.id + '">' + dataSource.name + '</td>' +
    '  <td class="rowlink-skip">' + 
    '    <div class="btn-group pull-right">' +
    '      <button id="dataSourceBtnDelete' + dataSource.id + '" type="button" class="gridRowButtons btn btn-default ">' +
    '        <i class="fa fa-trash"></i>' +
    '      </button>' +
    '    </div>' +
    '  </td>' +
    '</tr>'
  );
  
  $('#dataSource' + dataSource.id).hide().fadeIn('fast');
    
  $('#dataSourcesPane .rowlink').rowlink();
  $('#dataSourceRow' + dataSource.id).on('click', function() {
    // TODO: sort out this logic
    viewDataSourceWizard('update', dataSource);
    return false;
  });
  
  $('#dataSourceBtnDelete' + dataSource.id).on('click', function() {
    sendDeleteDataSource(dataSource.id);
  });
}

function deleteDataSource(id) {
  $('#dataSourceRow' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
}


function dataSourceDialogSourceLogic(fields) {
  var paymentType = ((fields.paymentType !== null && fields.paymentType !== undefined) ? fields.paymentType : 'Version One');

  switch(paymentType) {
    case "Version One":
      return 0;
      
    case "Jenkins":
      return 1;
      
    case "Hudson":
      return 2;
      
    case "Salesforce.com":
      return 3;
      
    case "Internal":
      return 4;
  }

  return 0;
}

function setupDataSourcesPane() {
  $(".dataSourceRow").on('click', function() {
    // viewDataSourceDetailPane($(this).attr("data-key"));
    return false;
  });
  
  $("#addDataSource").on('click', function() {
    viewDataSourceWizard('add', {});
    // viewDataSourceDetailPane($(this).attr("data-key"));
    return false;
  });
}
