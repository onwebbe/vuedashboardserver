const request = require('superagent');
const logger = require('../../Logger');
const cheerio = require('cheerio');
const configjs = require('config');
const async = require('async');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

class GetQuanlityTestingFailStatusSummaryWorker {
  constructor(config) {
    this.init(config);
  }
  init(config) {
    let serverURL = configjs.apiServer.serverURL;
    let jenkinsJobAPIPath = configjs.apiServer.jenkinsjobAPIPath;
    logger.info('GetQuanlityTestingFailStatusSummaryWorker:init:start with config:' + config ? JSON.stringify(config) : null);
    if (config == null) {
      config = {
        baseURL: serverURL + jenkinsJobAPIPath
      };
    }
    logger.info('GetQuanlityTestingFailStatusSummaryWorker:init:init data for baseURL:' + config.baseURL);
    this._config = config;
    this._inited = true;
  }
  async start() {
    let result = await this.process();
    // console.log(JSON.stringify(result));
    return result;
  }
  process() {
    let self = this;
    return new Promise(async (resolve, reject) => {
      let jobList = await this.getJobList();
      let jobs = jobList.jobs;
      let jobCaseFailSummary = {};
      async.each(jobs, function(job, callback) {
        self._retriveJobCaseSummary(job).then(function (data) {
          jobCaseFailSummary[job.job_name] = data;
          callback();
        })
      }, function(err){
        if (err) {
          reject('error happening');
        } else {
          resolve(jobCaseFailSummary);
        }
      });
    });
  }
  getJobList() {
    let jobListURL = this._config.baseURL + '/jobs'
    logger.info('GetQuanlityTestingFailStatusSummaryWorker:getJobList:try get the jobs from:' + jobListURL);
    return new Promise((resolve, reject) => {
      request.get(jobListURL).then(res => {
        // res.body, res.headers, res.status
        try {
        resolve(res.body);
        } catch (e) {
        logger.error('GetQuanlityTestingFailStatusSummaryWorker:get job list info error:' + e.message);
        reject(err.message);
        } 
      })
      .catch(err => {
          logger.error('GetQuanlityTestingFailStatusSummaryWorker:get job list info error:' + e.message);
          reject(err.message);
      })
    });
  }
  _retriveJobCaseSummary(job) {
    let jobName = job.job_name;
    let buildDetailURL = this._config.baseURL + '/api/jobanalysis/' + jobName + '/failed/5'
    logger.info('GetQuanlityTestingFailStatusSummaryWorker:_retriveJobCaseSummary:Get data from:' + buildDetailURL);
    return new Promise((resolve, reject) => {
      request.get(buildDetailURL).then(res => {
        // res.body, res.headers, res.status
        try {
          resolve(res.body);
        } catch (e) {
          logger.error('GetQuanlityTestingFailStatusSummaryWorker:get job list info error:' + e.message);
          reject(err.message);
        }
      })
      .catch(err => {
          logger.error('GetQuanlityTestingFailStatusSummaryWorker:get job list info error:' + e.message);
        reject(err.message);
      })
    });
  }
}
// let getQuanlityTestingFailStatusSummaryWorker = new GetQuanlityTestingFailStatusSummaryWorker();
// getQuanlityTestingFailStatusSummaryWorker.init();
// getQuanlityTestingFailStatusSummaryWorker.start().then(function (data) {
//   console.log(data);
// })
module.exports = GetQuanlityTestingFailStatusSummaryWorker;