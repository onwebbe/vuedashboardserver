const request = require('superagent');
const logger = require('../../Logger');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

class JiraIssueSummaryWorker {
  init(config) {
    logger.info('JiraIssueSummaryWorker:init:start with config:' + config ? JSON.stringify(config) : null);
    if (config == null) {
      config = {
        baseURL: 'https://jira.successfactors.com/rest/gadget/1.0/twodimensionalfilterstats/generate?filterId=filter-94653&xstattype=customfield_10002&ystattype=customfield_10020&sortDirection=asc&sortBy=natural&numberToShow=5&_=1547808907899'
      };
    }
    logger.info('JiraIssueSummaryWorker:init:init data for baseURL:' + config.baseURL);
    this._config = config;
    this._inited = true;
  }
  async start() {
    try {
      let jiraInfo = await getJiraData();
    } catch (e) {
      logger.error('JiraIssueSummaryWorker:getJiraData:error with message:' + e.message);
    }
  }
  saveJiraData() {
    
  }
  getJiraData() {
    logger.info('JiraIssueSummaryWorker:getJiraData:Start');
    let url = '';
    if ( this._inited == true ) {
      url = this._config.baseURL;
    }
    logger.info('JiraIssueSummaryWorker:getJiraData:before get data from url:' + url);
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .set('Authorization', 'Basic aTMyNjQzMjpDb29sMTIzNA==')
        .then(res => {
          resolve(JSON.parse(res.body));
      })
      .catch(err => {
        // err.message, err.response
        reject(err.message);
      })
    });
  }
}
let sonarCrawler = new JiraIssueSummaryWorker();
sonarCrawler.init();
sonarCrawler.start();