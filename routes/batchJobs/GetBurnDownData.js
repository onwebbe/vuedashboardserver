const request = require('superagent');
const logger = require('../../Logger');
const BurnDownDBDataModels = require('../mongodb/BurnDownChartDB');
const BurnDownChartModel = BurnDownDBDataModels.BurnDownChartModel;
const BurnDownChartStoryModel = BurnDownDBDataModels.BurnDownChartStoryModel;
const ConfigDB = require('../mongodb/DashboardConfigDB');
const utils = require('../Utils');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

class GetBurnDownDataCrawler {
  init(config) {
    this._data = {};
    if (config == null) {
      config = {
        baseURL: 'https://jira.successfactors.com/rest/api/2/search?'
      };
    }
    if (!config.baseURL) {
      config.baseURL = 'https://jira.successfactors.com/rest/api/2/search?';
    }
    if (config.module == null) {
      config.module = 'au-cdp';
    }
    if (config.release == null) {
        config.release = 'b1908';
    }
    if (config.sprint == null) {
        config.sprint = 'CDP_B1908_Sprint1';
    }
    if (config.fields == null) {
      // customfield_10002: ticket priority
      config.fields = 'issuetype,self,key,assignee,components,reporter,project,summary,customfield_10002,fixVersions,status,subtasks,aggregatetimeoriginalestimate,aggregatetimespent,aggregateprogress';
    }
    if (config.baseQuery == null) {
      // customfield_10002: ticket priority
      config.baseQuery = 'project in ("Career Development Plan (CDP)") AND (fixVersion in (<releasename1>) OR labels in (<releasename2>, <releasename3>)) AND issuetype = Story AND (status not in (Verified, Invalid, Closed) AND sprint is EMPTY OR sprint = "<sprintname>") ORDER BY Rank ASC';
    }
    if (config.token == null) {
      // customfield_10002: ticket priority
      config.token = 'STMyNjQzMjpXYXJtZXIwOTg3xxx';
    }
    this._config = config;
    this._inited = true;
    logger.info('GetBurnDownData:GetBurnDownDataCrawler:init:config data:\n' + JSON.stringify(this._config));
  }
  start() {
    return new Promise(async(resolve, reject) => {
      if(this._inited == false) {
        reject('Workder not yet been initialized, please do init before start');
      }
      try {
        await this.getBIList();
        resolve();
      } catch (e) {
        logger.info('GetBurnDownData:GetBurnDownDataCrawler:start:exception:' + e);
        reject();
      }
    });
  }
  getBIList() {
    let self = this;
    let queryURL = this._config.baseURL;
    let jql = this._config.baseQuery;

    let releaseName1 = this._config.release;
    let releaseName2 = this._config.release + '_canddiate';
    let releaseName3 = this._config.release + '_canddiate';
    jql = jql.replace('<releasename1>', releaseName1);
    jql = jql.replace('<releasename2>', releaseName2);
    jql = jql.replace('<releasename3>', releaseName3);
    jql = jql.replace('<sprintname>', this._config.sprint);
    let startIndex = 0;
    let filterId = -1;
    var params = {
      jql: jql,
      fields: this._config.fields
    }
    return new Promise(async(resolve, reject) => {
      let chartId = await this.createUpdateChart();
      this.chartId = chartId;
      await this.getBIPageData(queryURL, params);
      resolve();
    });
  }
  async getBIPageData(url, param, startIndex) {
    let baseURL = this._config.baseURL;
    let jql = param.jql;
    let fields = param.fields;
    let self = this;
    let queryURL = baseURL + 'jql='+ jql + '&maxResults=1000&fields=' + fields;
    logger.info('GetBurnDownData:GetBurnDownDataCrawler:getBIPageData:getDataQuery:' + queryURL);
    return new Promise(async(resolve, reject) => {
      request.get(queryURL)
      .set('Authorization', 'Basic ' + this._config.token)
      .set('Accept', 'application/json')
      .end(async(err, res) => {
        logger.info('GetBurnDownData:GetBurnDownDataCrawler:getBIPageData:get Data from Jira');
        await BurnDownChartStoryModel.removeStoryByChartId(self.chartId);
        await self.processBIData(res.body);
        // console.log(res.body);
        // console.log(JSON.stringify(res.body));
        resolve();
      });
    });
  }
  processBIData(rawdata) {
    return new Promise(async(resolve, reject) => {
      let issueList = rawdata.issues;
      let allIssuePromises = [];
      for (let i = 0; i < issueList.length; i++) {
        allIssuePromises.push(this.processOneBI(issueList[i]));
      }
      Promise.all(allIssuePromises).then((result) => {
        logger.info('GetBurnDownData:GetBurnDownDataCrawler:processBIData:All BI Story Data processed');
        resolve();
      }).catch((error) => {
        logger.error('GetBurnDownData:GetBurnDownDataCrawler:processBIData exception:get error in process story data:' + e);
        reject();
      })
    });
  }
  processOneBI(issue) {
    var storyData = {
      chartid: this.chartId,
      storyid: issue.key,
      storyname: issue.fields.summary,
      storyType: issue.fields.issuetype.name,
      estimatedEffort: issue.fields.aggregatetimeoriginalestimate,
      loggedEffort: issue.fields.aggregatetimespent,
      processPercent: issue.fields.aggregateprogress.percent,
      storyData: issue
    }
    return new Promise(async(resolve, reject) => {
      let storyModuleData = new BurnDownChartStoryModel(storyData);
      storyModuleData.save( function (err, res) {
        if (err) {
          logger.error('GetBurnDownData:GetBurnDownDataCrawler:processOneBI:exception' + err);
          reject(err);
        } else {
          logger.debug('GetBurnDownData:GetBurnDownDataCrawler:processOneBI:inserted Story:' + JSON.stringify(res));
          resolve(res._id);
        }
      });
    });
    
  }
  async createUpdateChart () {
    var self = this;
    let today = new Date();
    let release = this._config.release;
    let sprintName = this._config.sprint;
    let moduleName = this._config.module;
    let chartData = {
      date: today,
      release: release,
      sprintName: sprintName,
      moduleName: moduleName
    };
    return new Promise(async(resolve, reject) => {
      let date = chartData.date;
      let existsIDs = []
      try {
        existsIDs = await BurnDownChartModel.isSameDayExists(date);
        logger.info('GetBurnDownData:GetBurnDownDataCrawler:createUpdateChart:is chart exists for today?' + existsIDs.length);
      } catch (e) {
        logger.error('GetBurnDownData:GetBurnDownDataCrawler:createUpdateChart:exception in check same day:' + e);
      }
      
      if (existsIDs.length === 0) {
        var burnDownChart = new BurnDownChartModel(chartData);
        burnDownChart.save( function (err, res) {
          if (err) {
            reject(err);
            logger.error('GetBurnDownData:GetBurnDownDataCrawler:createUpdateChart:exception save story' + err);
          } else {
            resolve(res._id);
            logger.debug('GetBurnDownData:GetBurnDownDataCrawler:createUpdateChart:save story successful:' + JSON.stringify(res));
          }
        });
      } else {
        BurnDownChartModel.updateOne({_id: existsIDs[0]}, chartData, {multi: false, upsert: false}, function(err, docs){
          if (err) {
            logger.error('GetBurnDownData:GetBurnDownDataCrawler:createUpdateChart:exception update story' + err);
            reject();
          } else {
            logger.debug('GetBurnDownData:GetBurnDownDataCrawler:createUpdateChart:update story successful:' + JSON.stringify(docs));
            resolve(existsIDs[0]);
          }
        });
      }
    });
  }
}


function getDashboardConfig() {
  logger.info('GetDashboardConfigWorker:getDashboardConfig:Start get Data');
  return new Promise( (resolve, reject) => {
    ConfigDB.find({}).sort({date: -1}).limit(1).exec(async(err, res) => {
      if (err) {
        logger.error('GetDashboardConfigWorker:getDashboardConfig:get data Failed.');
        reject(err);
      } else {
        let chartConfig = res[0].toJSON().burndownchartconfig;
        if (chartConfig == null || chartConfig.release === '' || chartConfig.release == null
          || chartConfig.sprint === '' || chartConfig.sprint == null) {
            reject('Current no active sprint, not process');
            return;
        }
        let getBurnDownDataCrawler = new GetBurnDownDataCrawler();
        if (chartConfig) {
          getBurnDownDataCrawler.init(chartConfig);
        } else {
          getBurnDownDataCrawler.init();
        }
        try {
          await getBurnDownDataCrawler.start();
        } catch (e) {
          reject(e);
        }
        resolve()
      }
    });
  });
}

async function startProcess() {
  try {
    await getDashboardConfig();
  } catch (e) {
    logger.error('GetBurnDownData:error when start:' + e);
  }
  BurnDownChartModel.db.close();
  BurnDownChartStoryModel.db.close();
  ConfigDB.db.close();
}

startProcess();