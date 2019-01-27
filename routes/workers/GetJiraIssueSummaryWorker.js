const logger = require('../../Logger');
const JiraDB = require('../mongodb/JiraIssueSummaryDB');

class GetJiraIssueSummaryWorker{
  constructor(config) {
    this.init(config);
  }
  init(config) {
    if (config == null) {
      config = {};
    }
    if (config.retriveDate === null) {
      let now = new Date();
      config.retriveDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  }
  async start() {
    JiraDB.find({'date': {'$eq': this.config.retriveDate}}, (err, res) => {
      return res;
    });
  }
}
module.exports = GetJiraIssueSummaryWorker;