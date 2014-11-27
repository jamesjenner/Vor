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
  // get current data
  var currentDataSourceElement = $('#dataSource' + dataSource.id);
  
  var currentDataSource = new DataSource(currentDataSourceElement.data());
  
  console.log("current data for " + dataSource.id + " is: " + JSON.stringify(currentDataSource, null, " "));
  
  // apply changes to DOM
  if(currentDataSource.name !== dataSource.name) {
    
  }
  
  if(currentDataSource.iconName !== dataSource.iconName) {
    
  }
  
  // update data attributes for id
  
}

function receivedDataSources(server, d) {
  // TODO: logic to handle resend of dataSources
  // $(".dataSourceRow").remove();

  var dataSourcesArray = [];
  
  for (var item in d) {
   dataSourcesArray.push(new DataSource(d[item]));
  }

  dataSourcesArray.sort(function (a, b) {
      if (a.row < b.row) {
          return -1;
      } else if (a.row > b.row) {
          return 1;
      }
      return 0;
  });

  dataSourcesArray.forEach(function (p) {
    addDataSourceToDom(p);
  });
}

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
    '  <td><a class="dataSourceRow" href="#inputmask">' + dataSource.type + '</a></td>' +
    '  <td>' + dataSource.name + '</td>' +
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
  
  dataSources.push(dataSource);
}

// TODO: sort out this global
var dataSources = [];

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
