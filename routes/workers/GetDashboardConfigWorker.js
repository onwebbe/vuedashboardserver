const logger = require('../../Logger');
const ConfigDB = require('../mongodb/DashboardConfigDB');
class GetDashboardConfigWorker {
  constructor(config) {
    logger.info('GetDashboardConfigWorker:constructor:');
    this.init(config);
  }
  init(config) {
    logger.info('GetDashboardConfigWorker:init:config is ' + config);
    if (config == null) {
      config = {};
    }
  }
  async start() {
    logger.info('GetDashboardConfigWorker:start:Start process');
    let configData = await this.getDashboardConfig();
    return configData;
  }
  getDashboardConfig() {
    logger.info('GetDashboardConfigWorker:getDashboardConfig:Start get Data');
    return new Promise(async (resolve, reject) => {
      ConfigDB.find({}).sort({date: -1}).limit(1).exec((err, res) => {
        if (err) {
          logger.error('GetDashboardConfigWorker:getDashboardConfig:get data Failed.');
          reject(err);
        } else {
          logger.info('GetDashboardConfigWorker:getDashboardConfig:Successfully get the config');
          resolve(res[0]);
        }
      });
    });
  }
}

module.exports = GetDashboardConfigWorker;