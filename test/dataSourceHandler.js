/*jshint node: true*/
/*global describe, it, beforeEach, afterEach, before, after */

var fs = require('fs');
var should = require('chai').should();
var DataSourceHandler = require('../lib/server/dataSourceHandler.js');
var Message = require('../lib/shared/dataSource.js');

// expect(wsDefsProcessed).to.deep.equal(expected.def, testDesc + ": definitions do not match");
    
describe('#DataSourceHandler', function() {
  before(function() {
    // backup the existing 
    if (fs.existsSync(DataSourceHandler.DATA_SOURCES_FILE)) {
      fs.renameSync(DataSourceHandler.DATA_SOURCES_FILE, DataSourceHandler.DATA_SOURCES_FILE + ".tmp");
    }
  });
  beforeEach(function() {
    // create a version for testing
    fs.writeFileSync(DataSourceHandler.DATA_SOURCES_FILE, JSON.stringify(
[
	{
		"id": "40fa0bae-a79d-4ded-9cda-bfeb43feae1f",
		"name": "AAA",
	},
	{
		"id": "bf5a7fe8-3f30-4465-8629-80ec2fc04fa0",
		"name": "BBB",
	},
	{
		"id": "64a0dd4a-0965-43e0-8016-3402662d467a",
		"name": "CCC",
	},
	{
		"id": "978f05e0-eae6-4ae9-933d-1e8e11651fe8",
		"name": "DDD",
	},
	{
		"id": "40fa0bae-1111-4ded-9cda-bfeb43feae1f",
		"name": "EEE",
	},
	{
		"id": "bf5a7fe8-1111-4465-8629-80ec2fc04fa0",
		"name": "FFF",
	},
	{
		"id": "64a0dd4a-1111-43e0-8016-3402662d467a",
		"name": "GGG",
	},
	{
		"id": "978f05e0-1111-4ae9-933d-1e8e11651fe8",
		"name": "HHH",
	}
], 
      null, 
      '\t'));
  });
  
  
  afterEach(function() {
    // delete the test version
    fs.unlinkSync(DataSourceHandler.DATA_SOURCES_FILE);
  });
  
  after(function() {
    // restore the original 
    if (fs.existsSync(DataSourceHandler.DATA_SOURCES_FILE + ".tmp")) {
      fs.renameSync(DataSourceHandler.DATA_SOURCES_FILE + ".tmp", DataSourceHandler.DATA_SOURCES_FILE);
    }

  });
  
  it('adds dataSource correctly', function(done) {
    var dataSourceHandler = new DataSourceHandler();
    dataSourceHandler.addDataSource({ "name": "III" });
    done();
    
    dataSourceHandler.dataSources.length.should.equal(9);
  });
  it('deletes dataSource correctly', function(done) {
    var dataSourceHandler = new DataSourceHandler();

    dataSourceHandler.removeDataSource("bf5a7fe8-3f30-4465-8629-80ec2fc04fa0");
    done();
    
    dataSourceHandler.dataSources.length.should.equal(7);
    dataSourceHandler.dataSources[0].id.should.equal("40fa0bae-a79d-4ded-9cda-bfeb43feae1f");
    dataSourceHandler.dataSources[1].id.should.equal("64a0dd4a-0965-43e0-8016-3402662d467a");
    dataSourceHandler.dataSources[2].id.should.equal("978f05e0-eae6-4ae9-933d-1e8e11651fe8");
  });

});
