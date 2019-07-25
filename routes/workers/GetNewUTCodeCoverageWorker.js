const CoverageDB = require('../mongodb/NewUTCodeCoverageDB');
const utils = require('../Utils');
const logger = require('../../Logger');
class GetNewUTCodeCoverageWorker {
  init(req, config) {
    let parameters = req.query;
    let max_date = parameters.max_date;
    let theModule = parameters.module;

    if (!max_date) {
      max_date = 5;
    }
    if (!theModule) {
      theModule = 'au-cdp';
    }
    if (config == null) {
      config = {
        max_date: 5
      };
    }
    this.max_date = max_date;
    this.theModule = theModule;
    this._inited = true;
  }
  async start() {
    try {
      return await this.getCodeCoverageData();
    } catch (e) {
      console.log('error:' + e);
    }
  }
  getCodeCoverageData() {
    let self = this;
    var query = utils.generateMongoDateGap('date', utils.generateDateStr(1), 1 - self.max_date);
    var newQuery = {'$and': [
      query, {
        'codeCoverageRawData.component.key': self.theModule
    }]};
    logger.info('GetNewUTCodeCoverageWorker:getCodeCoverageData:query DB:' + JSON.stringify(newQuery));
    return new Promise(async (resolve, reject) => {
      CoverageDB.find(newQuery, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }
}
// let a = new GetNewUTCodeCoverageWorker();
// a.init();
// a.start();
module.exports = GetNewUTCodeCoverageWorker;