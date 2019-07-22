const utils = require('../Utils');
var request = require('request').defaults({
  rejectUnauthorized: false,
})
class ComponentPiplelineRunStatusWorker {
  init(config) {
    if (config == null) {
      config = {
        max_date: 5
      };
    }
    this._inited = true;
  }
  async start() {
    try {
      return await this.getPiplelineRunStatus();
    } catch (e) {
      console.log('error:' + e);
    }
  }
  getPiplelineRunStatus () {
    var self = this;
    return new Promise(async (resolve, reject) => {
      let p1 = self.getLastCompletedBuild();
      let p2 = self.getLastFailedBuild();
      let p3 = self.getlastSuccessfulBuild();
      Promise.all([p1, p2, p3]).then(function (results) {
        let completed = results[0];
        let failed = results[1];
        let success = results[2];
        let data = {
          'completed': completed,
          'failed': failed,
          'success': success
        };
        resolve(data);
      });
    });
  }
  getLastCompletedBuild () {
    return new Promise(async (resolve, reject) => {
      request('https://rapidcd.successfactors.sap.corp/job/au-cdp/api/json',function(error,response,body){
        var responseJson = JSON.parse(body);
        var lastCompleted = responseJson.lastCompletedBuild
        var buildnbr = lastCompleted.number
        var newurl = 'https://rapidcd.successfactors.sap.corp/job/au-cdp/' +  buildnbr +'/api/json'
        // to get description which include PR information
        request(newurl, function(error,response,body){
          var response =  JSON.parse(body)
          var desc = response.description
          var author = response.actions[1].parameters[19]
          var finalResponse = {};
          finalResponse['buildInfo'] = lastCompleted;
          finalResponse['description'] = desc;
          finalResponse['owner'] = author;
          finalResponse['timestamp'] = response.timestamp;
          resolve(finalResponse)
        })
      })
    });
  }
  getLastFailedBuild () {
    return new Promise(async (resolve, reject) => {
      request('https://rapidcd.successfactors.sap.corp/job/au-cdp/api/json',function(error,response,body){
        var responseJson = JSON.parse(body);
        var lastFailed = responseJson.lastFailedBuild
        var buildnbr = lastFailed.number
        var newurl = 'https://rapidcd.successfactors.sap.corp/job/au-cdp/' +  buildnbr +'/api/json'
        // to get description which include PR information
        request(newurl, function(error,response,body){
          var response =  JSON.parse(body)
          var desc = response.description
          var author = response.actions[1].parameters[19]
          var finalResponse = {};
          finalResponse['buildInfo'] = lastFailed;
          finalResponse['description'] = desc;
          finalResponse['owner'] = author;
          finalResponse['timestamp'] = response.timestamp;
          resolve(finalResponse)
        })
      })
    });
    
  }
  getlastSuccessfulBuild () {
    return new Promise(async (resolve, reject) => {
      request('https://rapidcd.successfactors.sap.corp/job/au-cdp/api/json',function(error,response,body){
        var responseJson = JSON.parse(body);
        var lastSuccess = responseJson.lastSuccessfulBuild
        var buildnbr = lastSuccess.number
        var newurl = 'https://rapidcd.successfactors.sap.corp/job/au-cdp/' +  buildnbr +'/api/json'
        // to get description which include PR information
        request(newurl, function(error,response,body){  
          var response =  JSON.parse(body)
          var desc = response.description
          var author = response.actions[1].parameters[19]
          var finalResponse = {};
          finalResponse['buildInfo'] = lastSuccess;
          finalResponse['description'] = desc;
          finalResponse['owner'] = author;
          finalResponse['timestamp'] = response.timestamp;
          resolve(finalResponse)
        })
      })
    });
  }
}
// let a = new ComponentPiplelineRunStatusWorker();
// a.init();
// a.start().then(function (data) {
//   console.log(data);
// })
module.exports = ComponentPiplelineRunStatusWorker;




