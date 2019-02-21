const request = require('superagent');
const logger = require('../../Logger');
const cheerio = require('cheerio');
const configjs = require('config');
const async = require('async');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

class JenkinsJobsSummaryWorker {
  constructor(config) {
    this.init(config);
  }
  init(config) {
    let serverURL = configjs.apiServer.serverURL;
    let jenkinsJobAPIPath = configjs.apiServer.jenkinsjobAPIPath;
    logger.info('JenkinsJobsSummaryWorker:init:start with config:' + config ? JSON.stringify(config) : null);
    if (config == null) {
      config = {
        baseURL: serverURL + jenkinsJobAPIPath
      };
    }
    logger.info('JenkinsJobsSummaryWorker:init:init data for baseURL:' + config.baseURL);
    this._config = config;
    this._inited = true;
  }
  async start() {
    let result = await this.process();
    return result;
    // console.log(result);
  }
  process() {
    let self = this;
    return new Promise(async (resolve, reject) => {
      let jobList = await this.getJobList();
      let jobs = jobList.jobs;
      let jobsBuildDetails = {};
      // for (let i = 0; i < jobs.length; i++) {
      //   let jobBuildDetail = await this.getJobDetails(jobs[i]);
      //   jobsBuildDetails[jobs[i].job_name] = jobBuildDetail;
      // }

      async.each(jobs, function(job, callback) {
        self.getJobDetails(job).then(function (data) {
          jobsBuildDetails[job.job_name] = data;
          callback();
        });
      }, function(err){
        if (err) {
          reject('error happening');
        } else {
          resolve(jobsBuildDetails);
        }
      });
    });
  }
  getJobDetails(job) {
    let self = this;
    let lastBuild = job.last_extract_build;
    let jobName = job.job_name;
    let retriveBuildCount = 3;
    return new Promise(async (resolve, reject) => {
      let usingBuild = lastBuild;
      let jobDetailList = [];
      for (let iterator = 0; iterator < retriveBuildCount;) {
        let jobDetail = await self._retriveJobDetail(jobName, usingBuild);
        if (jobDetail.result != null && jobDetail.result.length > 0) {
          let statusListObj = {};
          for (let i = 0; i < jobDetail.result.length; i++) {
            let result = jobDetail.result[i];
            let status = result._id.status;
            let count = result.summary;
            let statusCountObj = {
              'status': status,
              'count': count
            }
            statusListObj[status] = statusCountObj;
          }
          if (statusListObj['PASSED'] == null) {
            statusListObj['PASSED'] = {
              'status': 'PASSED',
              'count': 0
            };
          }
          if (statusListObj['FAILED'] == null) {
            statusListObj['FAILED'] = {
              'status': 'FAILED',
              'count': 0
            };
          }
          statusListObj = this._mergeStatus(statusListObj, iterator == 0 ? 'latest' : 'latest-' + iterator);
          jobDetailList.push(statusListObj);
          iterator ++;
        }
        usingBuild --;
        // if goes to the first job but all jobs are failed, break it.
        if (usingBuild == 0) {
          break;
        }
      }
      resolve(jobDetailList.reverse());
    });
  }
  _mergeStatus(statusListObj, buildNumber) {
    let statusMapping = {
      'FIXED': 'PASSED',
      'REGRESSION': 'FAILED',
      'PASSED': 'PASSED',
      'FAILED': 'FAILED'
    }
    let mergedStatusList = {};
    for ( let status in statusListObj ) {
      if (statusListObj[status] != null) {
        let count = statusListObj[status].count;
        let mappedStatus = statusMapping[status];
        if (mergedStatusList[mappedStatus] == null) {
          mergedStatusList[mappedStatus] = count;
          mergedStatusList['buildNumber'] = buildNumber;
        } else {
          mergedStatusList[mappedStatus] += count;
        }
      }
    }
    return mergedStatusList;
  }
  _retriveJobDetail(jobname, buildnum) {
    let buildDetailURL = this._config.baseURL + '/api/jobsummary/' + jobname + '/' + buildnum;
    logger.info('JenkinsJobsSummaryWorker:_retriveJobDetail:Get data from:' + buildDetailURL);
    return new Promise((resolve, reject) => {
      request.get(buildDetailURL).then(res => {
        // res.body, res.headers, res.status
        try {
          resolve(res.body);
        } catch (e) {
          logger.error('JenkinsJobsSummaryWorker:get job list info error:' + e.message);
          reject(err.message);
        }
        
      })
      .catch(err => {
          logger.error('JenkinsJobsSummaryWorker:get job list info error:' + e.message);
        reject(err.message);
      })
    });
  }
  getJobList() {
      let jobListURL = this._config.baseURL + '/jobs'
      logger.info('JenkinsJobsSummaryWorker:getJobList:try get the jobs from:' + jobListURL);
      return new Promise((resolve, reject) => {
        request.get(jobListURL).then(res => {
          // res.body, res.headers, res.status
          try {
            resolve(res.body);
          } catch (e) {
            logger.error('JenkinsJobsSummaryWorker:get job list info error:' + e.message);
            reject(err.message);
          }
          
        })
        .catch(err => {
            logger.error('JenkinsJobsSummaryWorker:get job list info error:' + err.message);
          reject(err.message);
        })
      });
  }
}
// let jenkinsJobsSummaryWorker = new JenkinsJobsSummaryWorker();
// jenkinsJobsSummaryWorker.init();
// jenkinsJobsSummaryWorker.start().then(function (data) {
//   console.log(data);
// })
module.exports = JenkinsJobsSummaryWorker;