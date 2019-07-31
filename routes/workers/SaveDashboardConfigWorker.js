const logger = require('../../Logger');
const ConfigDB = require('../mongodb/DashboardConfigDB');
class SaveDashboardConfigWorker {
  constructor(config) {
    logger.info('SaveDashboardConfigWorker:constructor:');
    this.init(config);
  }
  init(config) {
    logger.info('SaveDashboardConfigWorker:init:config is ' + config);
    if (config != null) {
      this._config = config;
    }
  }
  async start() {
    logger.info('SaveDashboardConfigWorker:start:Start process');
    try {
      let configData = await this.saveDashboardConfig();
      return '';
    } catch (e) {
      return null;
    }
  }
  saveDashboardConfig() {
    let self = this;
    logger.info('SaveDashboardConfigWorker:saveDashboardConfig:Start get Data');
    return new Promise(async (resolve, reject) => {
      if (self._config != null && self._config.data != null) {
        console.log(self._config.data);
        ConfigDB.update({}, {$set: {'dashboardConfig': self._config.data.dashboardConfig, 'burndownchartconfig': self._config.data.burndownchartconfig}}, {safe: true, overwrite: true, multi: true}, (err, res) => {
          console.log(err);
          if (err) {
            logger.error('SaveDashboardConfigWorker:saveDashboardConfig:save data Failed.');
            reject(err);
          } else {
            logger.info('SaveDashboardConfigWorker:saveDashboardConfig:Successfully save the config');
            resolve();
          }
        });
      } else {
        logger.error('SaveDashboardConfigWorker:saveDashboardConfig:save data Failed. get null from config');
        reject('SaveDashboardConfigWorker:saveDashboardConfig:save data Failed.');
      }
    });
  }
}

module.exports = SaveDashboardConfigWorker;