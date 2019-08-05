const BurnDownDBDataModels = require('../mongodb/BurnDownChartDB');
const BurnDownChartModel = BurnDownDBDataModels.BurnDownChartModel;
const BurnDownChartStoryModel = BurnDownDBDataModels.BurnDownChartStoryModel;
const ConfigDB = require('../mongodb/DashboardConfigDB');
const utils = require('../Utils');
const logger = require('../../APILogger');
class GetBurnDownChartWorker {
  init(req, config) {
    this._inited = true;
  }
  async start() {
    try {
      let configData = await this.getConfig();
      let releaseID = configData.burndownchartconfig.latestRelease;
      let sprintID = configData.burndownchartconfig.latestSprint;
      let moduleName = configData.burndownchartconfig.module;
      let responseData = await this.getChartData(moduleName, releaseID, sprintID);
    } catch (e) {
      console.log('error:' + e);
    }
  }
  getChartData(moduleName, release, sprint) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      BurnDownChartModel.find({
        moduleName: moduleName,
        sprintName: sprint,
        release: release
      }, (err, res) => {
        if (err) {
          logger.error('GetBurnDownChartWorker:getChartData exception:get error in get chart data:' + err);
          reject(err);
          return;
        }
        let chartData = res.toJSON();

        let responseData = [];
        chartData.map(async (value, key, arr) => {
          let storyList = await self.getStoryList();
          let effort = self.getEffortFromStoryList(storyList);
          let tmpData = {
            date: new Date(value.date).getTime(),
            estimated: effort.effort,
            logged: effort.logged
          };
          responseData.push(tmpData);
        });
        resolve(responseData);
      });
    });
  }
  getEffortFromStoryList(storyList) {
    let estimated = 0;
    let logged = 0;
    storyList.map(async (value, key, arr) => {
      estimated += value.estimatedEffort;
      logged += value.loggedEffort;
    });
    return {
      estimated: estimated,
      logged: logged
    }
  }
  getStoryList(chartid) {
    return new Promise(async (resolve, reject) => {
      BurnDownChartStoryModel.find({
        chartid: chartid
      }, (err, res) => {
        if (err) {
          logger.error('GetBurnDownChartWorker:getStoryList exception:get error in get story data:' + err);
          reject(err);
          return;
        }
        resolve(res.toJSON());
      })
    });
  }
  getConfig() {
    let self = this;
    var query = utils.generateMongoDateGap('date', utils.generateDateStr(1), 1 - self.max_date);
    var newQuery = {'$and': [
      query, {
        'codeCoverageRawData.component.key': self.theModule
    }]};
    logger.info('GetNewUTCodeCoverageWorker:getCodeCoverageData:query DB:' + JSON.stringify(newQuery));
    return new Promise(async (resolve, reject) => {
      ConfigDB.find({}, (err, res) => {
        if (err) {
          logger.error('GetBurnDownChartWorker:getConfig exception:get error in get config data:' + err);
          reject(err);
          return;
        }
        let configData = res[0].toJSON();
        resolve(configData);
      });
    });
  }
}
// let x = new GetBurnDownChartWorker();
// let a = new Date('2019-08-05');
// let b = new Date('2019-08-16');
// console.log(x.calculateDay(a, b));
// let a = new GetNewUTCodeCoverageWorker();
// a.init();
// a.start();
module.exports = GetBurnDownChartWorker;