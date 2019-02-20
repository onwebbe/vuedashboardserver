const CoverageDB = require('../mongodb/NewUTCodeCoverageDB');
const utils = require('../Utils');

class GetNewUTCodeCoverageWorker {
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
      return await this.getCodeCoverageData();
    } catch (e) {
      console.log('error:' + e);
    }
  }
  getCodeCoverageData() {
    return new Promise(async (resolve, reject) => {
      CoverageDB.find(utils.generateMongoDateGap('date', utils.generateDateStr(1), -4), (err, data) => {
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