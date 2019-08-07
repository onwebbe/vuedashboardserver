const BurnDownDBDataModels = require('../mongodb/BurnDownChartDB');
const BurnDownChartModel = BurnDownDBDataModels.BurnDownChartModel;
const BurnDownChartStoryModel = BurnDownDBDataModels.BurnDownChartStoryModel;
const BurnDownChartSprintModel = BurnDownDBDataModels.BurnDownChartSprintModel;
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
      return responseData;
    } catch (e) {
      console.log('error:' + e);
    }
    return '';
  }
  getChartData(moduleName, release, sprint) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      BurnDownChartModel.find({
        moduleName: moduleName,
        sprintName: sprint,
        release: release
      }, async (err, res) => {
        if (err) {
          logger.error('GetBurnDownChartWorker:getChartData exception:get error in get chart data:' + err);
          reject(err);
          return;
        }
        let chartData = res;

        let responseData = [];
        let firstEstimated = 0;
        for (let i = 0; i < chartData.length; i++) {
          let value = chartData[i];
          let chartid = value.id;
          let calculatedDate = value.date;
          if (calculatedDate.getDay() !== 0 && calculatedDate.getDay() !== 6) {
            let storyList = await self.getStoryList(chartid);
            let sprintInfo = await self.getSprintInfo(chartid);
            sprintInfo = sprintInfo[0];
            let effort = self.getEffortFromStoryList(storyList);
            if (firstEstimated === 0) {
              firstEstimated = effort.estimated;
            }
            let tmpData = {
              date: new Date(value.date).getTime(),
              bestrun: firstEstimated - self.getBestRunEffort(sprintInfo, firstEstimated, calculatedDate),
              estimated: effort.estimated,
              logged: effort.logged
            };
            responseData.push(tmpData);
          }
        }
        resolve(responseData);
      });
    });
  }
  getEffortFromStoryList(storyList) {
    let estimated = 0;
    let logged = 0;
    for (let i = 0; i < storyList.length; i++) {
      let value = storyList[i];
      estimated += value.estimatedEffort;
      logged += value.loggedEffort;
    }
    return {
      estimated: estimated,
      logged: logged
    }
  }
  getBestRunEffort(sprintInfo, effort, calculatedDate) {
    let sprintStart = new Date(parseInt(sprintInfo.startDate));
    let sprintEnd = new Date(parseInt(sprintInfo.endDate));
    let todayDate = calculatedDate;
    let sprintTotalDay = utils.calculateDay(sprintStart, sprintEnd);
    let todayDay = utils.calculateDay(sprintStart, todayDate);
    if (todayDay === 0) {
      todayDay = 1;
    }
    return (effort / sprintTotalDay) * todayDay;
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
        resolve(res);
      })
    });
  }
  getSprintInfo(chartid) {
    return new Promise(async (resolve, reject) => {
      BurnDownChartSprintModel.find({
        chartid: chartid
      }, (err, res) => {
        if (err) {
          logger.error('GetBurnDownChartWorker:getSprintInfo exception:get error in get sprint data:' + err);
          reject(err);
          return;
        }
        resolve(res);
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