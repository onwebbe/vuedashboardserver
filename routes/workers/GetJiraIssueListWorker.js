const request = require('superagent');
const logger = require('../../Logger');
const configjs = require('config');
const async = require('async');
const jiraUtils=require('../batchJobs/JiraUtils.js');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

class GetJiraIssueListWorker {
  constructor(config) {
    this.init(config);
  }
  init(config) {
    logger.info('GetJiraIssueListWorker:init:start with config:' + config ? JSON.stringify(config) : null);
    if (config == null) {
      config = {
        baseURL: 'https://jira.successfactors.com/rest/api/2/search?jql=(project="Career+Development+Plan+(CDP)"+or+project="People+Like+Me")+AND+resolution=Unresolved+AND+"Issue+Category"="Live+Customer+Issue"+and+type+=+"Customer+Issue"+order+by+updated+DESC&fields=summary,priority,assignee,created,customfield_10002'
      };
    }
    logger.info('GetJiraIssueListWorker:init:init data for baseURL:' + config.baseURL);
    this._config = config;
    this._inited = true;
  }
  async start() {
    let result = await this.process();
    return result;
  }
  async process() {
    let self = this;
    try{
        let customerIssueLists=await this.getJiraCustomerIssues();
        return customerIssueLists;
    } catch (e) {
        logger.error('GetJiraIssueListWorker:start:error with message:' + e.message);
        throw e;
    }
  }
  getJiraCustomerIssues() {
    logger.info('GetJiraIssueListWorker:getJiraCustomerIssues:Start');
    let url = '';
    if ( this._inited == true ) {
      url = this._config.baseURL;
    }
    logger.info('GetJiraIssueListWorker:getJiraCustomerIssues:before get data from url:' + url);
    return new Promise(async(resolve, reject) => {
      let authToken= await jiraUtils.getAuthToken();
      request
        .get(url)
        .set('Authorization', 'Basic ' + authToken)
        .then(res => {
          resolve(res.body);
      }, err =>{
          reject(err);
      })
      .catch(err => {
        // err.message, err.response
        reject(err);
      })
    });
  }
}

module.exports = GetJiraIssueListWorker;