/* jshint browser: true, jquery: true */
/* global DataSource:false, console:false, server:false, viewDataSourceWizard:false */

var DataSourceManager = function(options) {
  this.dataSources = [];
  this.dataSourcesIndex = [];
  this.server = null;
};

DataSourceManager.prototype.getDataSourceByName = function(name) {
  var dataSource = null;
  
  for(var i = 0; i < this.dataSources.length; i++) {
    if(this.dataSources[i].name === name) {
      dataSource = this.dataSources[i];
      break;
    }
  }
  
  return dataSource;
};

DataSourceManager.prototype.getDataSourceById = function(id) {
  var dataSource = null;
  
  var idx = this.dataSourcesIndex.indexOf(id);

  if(idx > -1) {
    dataSource = this.dataSources[idx];
  }
  
  return dataSource;
};

DataSourceManager.prototype.addDataSource = function(dataSource) {
  // TODO: determine the correct row (row of last element for column + 1)
  this.__sendAddDataSource(dataSource);
};

DataSourceManager.prototype.updateDataSource = function(dataSource) {
  // TODO: determine the correct row (row of last element for column + 1)
  this.__sendUpdateDataSource(dataSource);
};

DataSourceManager.prototype.processMessages = function(server, id, content) {
  var processed = false;

  switch (id) {
    case DataSource.MESSAGE_DATA_SOURCES:
      this.__receivedDataSources(server, content);
      processed = true;
      break;

    case DataSource.MESSAGE_ADD_DATA_SOURCE:
      this.__receivedAddDataSource(server, new DataSource(content));
      processed = true;
      break;

    case DataSource.MESSAGE_DELETE_DATA_SOURCE:
      this.__receivedDeleteDataSource(server, content);
      processed = true;
      break;

    case DataSource.MESSAGE_UPDATE_DATA_SOURCE:
      this.__receivedUpdateDataSource(server, new DataSource(content));
      processed = true;
      break;
  }

  return processed;
};

DataSourceManager.prototype.__receivedAddDataSource = function(server, d) {
  this.__addDataSourceToDom(d);
};

DataSourceManager.prototype.__receivedDeleteDataSource = function(server, id) {
  this.__deleteDataSource(id);
};

DataSourceManager.prototype.__receivedUpdateDataSource = function(server, dataSource) {
  var idx = this.dataSourcesIndex.indexOf(dataSource.id);
  var currentDataSource = null;
  
  if(idx < 0) {
    this.dataSources.push(dataSource);
    this.dataSourcesIndex.push(dataSource.id);
  } else {
    currentDataSource = this.dataSources[idx];
    this.dataSources[idx] = dataSource;
    
    if(currentDataSource.name !== dataSource.name) {
      $('#dataSourceRowName' + dataSource.id).text(dataSource.name);
    }
    if(currentDataSource.type !== dataSource.type) {
      $('#dataSourceRowType'  + dataSource.id).text(dataSource.type);
    }
  }
};

DataSourceManager.prototype.__receivedDataSources = function(server, d) {
  // TODO: test logic to remove existing data on DOM (needed for reconnection, but not supported)
  $("#dataSourcesGrid").empty();

  this.dataSources = [];
  var dataSource = null;
  
  for (var item in d) {
    dataSource = new DataSource(d[item]);
    this.dataSources.push(dataSource);
    this.dataSourcesIndex.push(dataSource.id);
    this.__addDataSourceToDom(dataSource);
  }
};

DataSourceManager.prototype.__sendAddDataSource = function(dataSource) {
  if(this.server !== null) {
    this.server.sendMessage(DataSource.MESSAGE_ADD_DATA_SOURCE, dataSource);
  }
};

DataSourceManager.prototype.__sendDeleteDataSource = function(id) {
  if(this.server !== null) {
    this.server.sendMessage(DataSource.MESSAGE_DELETE_DATA_SOURCE, id);
  }
};

DataSourceManager.prototype.__sendUpdateDataSource = function(dataSource) {
  if(this.server !== null) {
    this.server.sendMessage(DataSource.MESSAGE_UPDATE_DATA_SOURCE, dataSource);
  }
};

DataSourceManager.prototype.__addDataSourceToDom = function(dataSource) {
  $("#dataSourcesGrid").append(
    '<tr id="dataSourceRow' + dataSource.id + '">' +
    '  <td><a id="dataSourceRowType' + dataSource.id + '" class="dataSourceRow" href="#inputmask">' + dataSource.type + '</a></td>' +
    '  <td id="dataSourceRowName' + dataSource.id + '">' + dataSource.name + '</td>' +
    '  <td class="rowlink-skip">' + 
    '    <div class="btn-group pull-right">' +
    '      <button id="dataSourceBtnDelete' + dataSource.id + '" type="button" class="grid-row-buttons btn btn-default ">' +
    '        <i class="fa fa-trash"></i>' +
    '      </button>' +
    '    </div>' +
    '  </td>' +
    '</tr>'
  );
  
  $('#dataSource' + dataSource.id).hide().fadeIn('fast');
    
  $('#dataSourcesPane .rowlink').rowlink();
  $('#dataSourceRow' + dataSource.id).on('click', function() {
    // TODO: remove viewDataSourceWizard as global?
    viewDataSourceWizard('update', dataSource);
    return false;
  }.bind(this));
  
  $('#dataSourceBtnDelete' + dataSource.id).on('click', function() {
    this.__sendDeleteDataSource(dataSource.id);
    return false;
  }.bind(this));
};

DataSourceManager.prototype.__deleteDataSource = function(id) {
  $('#dataSourceRow' + id)
    .animate({height: 0, padding: 0, margin: 0}, {easing: "linear", duration: "slow", queue: false})
    .fadeOut('slow', function() {
    this.remove();
  });
};

DataSourceManager.prototype.setupDataSourcesPane = function() {
  $(".dataSourceRow").on('click', function() {
    // viewDataSourceDetailPane($(this).attr("data-key"));
    return false;
  });
  
  $("#addDataSource").on('click', function() {
    viewDataSourceWizard('add', {});
    // viewDataSourceDetailPane($(this).attr("data-key"));
    return false;
  });
};
