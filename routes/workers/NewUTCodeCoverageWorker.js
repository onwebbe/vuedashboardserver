const request = require('superagent');
const CoverageDB = require('../mongodb/NewUTCodeCoverageDB');
const utils = require('../Utils');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

class SonarCrawler {
  init(config) {
    this._data = {};
    if (config == null) {
      config = {
        baseURL: 'https://sf-sonar.devprod.sap.corp/api/measures/component'
      };
    }
    if (!config.baseURL) {
      config.baseURL = 'https://sf-sonar.devprod.sap.corp/api/measures/component';
    }
    if (config.module == null) {
      config.module = 'au-cdp';
    }
    if (config.fields == null) {
      config.fields = ['new_coverage', 'coverage'];
    }
    this._config = config;
    this._inited = true;
  }
  start() {
    return new Promise(async(resolve, reject) => {
      try {
        await this.getNewCodeCoverage();
        await this.getNewCodeDetail();
        await this.saveData();
        resolve();
      } catch (e) {
        console.log('error:' + e);
        reject();
      }
    });
  }
  getNewCodeCoverage() {
    let self = this;
    let url = '';
    if ( this._inited == true ) {
      url = this._config.baseURL + '?componentKey=' + this._config.module;
      let fieldsString = this._config.fields[0];
      for ( let index in this._config.fields) {
        if ( index != null && index > 0) {
          let field = this._config.fields[index];
          fieldsString += ',' + field;
        }
      }
      url += '&metricKeys=' + fieldsString;
    }
    return new Promise((resolve, reject) => {
      console.log('url1:' + url);
      let self = this;
      request.get(url).then(res => {
        // res.body, res.headers, res.status
        let bodyObj = res.body;
        let measurements = bodyObj.component.measures;
        let dataObj = {};
        for (let i = 0; i < measurements.length; i++) {
          let measure = measurements[i];
          if (measure.metric === 'coverage') {
            dataObj.coverage = measure.value;
          } else if (measure.metric === 'new_coverage') {
            dataObj.new_coverage = (measure.periods != null && measure.periods.length > 0? measure.periods[0].value : 0);
            dataObj.new_coverage = parseFloat(dataObj.new_coverage);
          }
        }
        self._data.codeCoverage = dataObj;
        self._data.codeCoverageRawData = bodyObj;
        resolve();
      })
      .catch(err => {
        // err.message, err.response
        console.log(err.message);
      })
    });
  }
  getNewCodeDetail() {
    let config = this._config;
    let url = 'https://sf-sonar.devprod.sap.corp/api/measures/component_tree?pageSize=200&metricSortFilter=withMeasuresOnly&metricPeriodSort=1&asc=true&ps=100&metricSort=new_coverage&s=metricPeriod&baseComponentKey=' + config.module + '&metricKeys=coverage%2Cnew_coverage%2Cnew_uncovered_lines%2Cnew_uncovered_conditions&strategy=leaves';

    return new Promise((resolve, reject) => {
      console.log('url2:' + url);
      request.get(url).then(res => {
        // res.body, res.headers, res.status
        // console.log(res.body);
        resolve();
      })
      .catch(err => {
        // err.message, err.response
        console.log(err.message);
      })
    });
  }
  saveData() {
    let self = this;
    return new Promise(async (resolve, reject) => {
      try {
        let foundObjIDs = await self.checkIfRequireToInsert();
        console.log('checkIfRequireToInsert:' + foundObjIDs);
        if (foundObjIDs != null) {
          await self.updateCodeCoverageData(foundObjIDs);
        } else {
          await self.insertCodeCoverageData();
        }
        resolve();
      } catch (e) {
        console.log('saveDataError:' + e);
        reject(e);
      }
    });
  }
  updateCodeCoverageData(objectIds) {
    let self = this;
    return new Promise((resolve, reject) => {
      let saveData = {
        'codeCoverage': self._data.codeCoverage,
        'codeCoverageRawData': self._data.codeCoverageRawData,
        'date': new Date()
      };
      CoverageDB.updateMany({_id: {$in: objectIds}}, saveData, {multi: true, upsert: false}, function(err, docs){
        if (err) {
          console.log('更改失败：' + JSON.stringify(docs));
          reject();
        } else {
          console.log('更改成功：' + JSON.stringify(docs));
          resolve();
        }
        // console.log('更改成功：' + docs);
      });
    });
  }
  insertCodeCoverageData() {
    let self = this;
    return new Promise((resolve, reject) => {
      let saveData = {
        'codeCoverage': self._data.codeCoverage,
        'codeCoverageRawData': self._data.codeCoverageRawData
      };
      let coverageDB = new CoverageDB(saveData);
      coverageDB.save( function (err, res) {
        if (err) {
          reject(err);
          console.log("Error:" + err);
        } else {
          resolve();
          console.log("Res:" + res);
        }
      });
    });
  }
  checkIfRequireToInsert() {
    // let dateQuery = utils.generateMongoDateCheckObj('date');
    let dateQuery = utils.generateMongoDateGap('date', utils.generateDateStr(2), -2)
    return new Promise((resolve, reject) => {
      CoverageDB.find(dateQuery, (err, data) => {
        if (err) {
          reject(err);
        }
        if (data != null) {
          let isFound = null;
          let today = new Date();
          for (let i = 0; i < data.length; i++) {
            let dataDate = data[i].date;
            if (dataDate.getFullYear() == today.getFullYear() &&
                  dataDate.getMonth() == today.getMonth() &&
                  dataDate.getDate() == today.getDate() ) {
              if (isFound == null) {
                isFound = [];
              }
              isFound.push(data[i]._id);
            }
          }
          if (isFound) {
            resolve(isFound);
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }
}
let sonarCrawlerCDP = new SonarCrawler();
sonarCrawlerCDP.init();

let sonarCrawlerPLM = new SonarCrawler();
sonarCrawlerPLM.init({
  module: 'au-leonardoml'
});

async function startAll() {
  try {
    await sonarCrawlerCDP.start();
  } catch (e) {}
  try {
    await sonarCrawlerPLM.start();
  } catch (e) {}
  CoverageDB.db.close();
}
startAll();
// https://sf-sonar.devprod.sap.corp/api/measures/component?componentKey=au-cdp&metricKeys=new_coverage