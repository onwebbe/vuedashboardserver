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
        baseURL: 'https://jira.successfactors.com/rest/api/2/search?jql=(project="Career+Development+Plan+(CDP)"+or+project="People+Like+Me")+AND+resolution=Unresolved+AND+"Issue+Category"!="Internal+Issue"+and+type+=+"Customer+Issue"+order+by+updated+DESC&fields=summary,priority,assignee,created,customfield_10002'
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
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3')
        .set('Cookie', 'SESSIONCOOKIE=SessionCookie; LOGOUTCOOKIE=1cd60907-7062-4e3c-b2c2-511c928a6db2; jira.editor.user.mode=source; JSESSIONID=396EB3CFEF8F3EEF10569BF2F29C5881; SAMLCOOKIE=XliGA8a5JKYaLjnOYR9BJFAVj7QADPUdeRH5sqfFBnEz5Ec7Xqnt/WXcp75cfR9TIyUeqLDnOXrnXGSozPfylQ==; atlassian.xsrf.token=AU6R-ZM9V-XXIL-R3RX_ec5435c194cbf45804bdec934adca96e5a9a7f2d_lin')
        .set('Sec-Fetch-User', '?1')
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
// let getJiraIssueListWorker= new GetJiraIssueListWorker();
// getJiraIssueListWorker.init();
// getJiraIssueListWorker.start().then(function (data) {
//   console.log(data);
// });