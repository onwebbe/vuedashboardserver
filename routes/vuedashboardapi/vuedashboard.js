var express = require('express');
var router = express.Router();

var JenkinsJobsSummaryWorker = require('../workers/JenkinsJobsSummaryWorker');
var GetDashboardConfigWorker = require('../workers/GetDashboardConfigWorker');
var SaveDashboardConfigWorker = require('../workers/SaveDashboardConfigWorker');
var GetNewUTCodeCoverageWorker = require('../workers/GetNewUTCodeCoverageWorker');
var GetQuanlityTestingFailStatusSummaryWorker = require('../workers/GetQuanlityTestingFailStatusSummaryWorker');
var ComponentPiplelineRunStatusWorker = require('../workers/ComponentPiplelineRunStatusWorker');
var GetBurnDownChartWorker = require('../workers/GetBurnDownChartWorker');
var GetJiraIssueListWorker = require('../workers/GetJiraIssueListWorker');
var NewUTCodeCoverageWorker = require('../workers/NewUTCodeCoverageWorker');
var UpdateCurrentSprint = require('../batchJobs/UpdateCurrentSprint');
var GetBurnDownData = require('../batchJobs/GetBurnDownData');


const logger = require('../../Logger');
const utils = require('../Utils');
router.post('/saveDashBoardConfig', function(req, res, next) {
  logger.info('ROUTER:saveDashBoardConfig');
  let saveDashboardConfigWorker = new SaveDashboardConfigWorker({
    'data': JSON.parse(req.body.data)
  });
  saveDashboardConfigWorker.start().then( configdata => {
    if (configdata == null) {
      res.send(utils.composeJSONReply(false, {}, 'Error when saving dashboard config.'));
    } else {
      res.send(utils.composeJSONReply(true, {}, 'Save dashboard config successfully'));
    }
    
  });
});
/* GET home page. */
router.get('/getDashBoardConfig', function(req, res, next) {
  logger.info('ROUTER:getDashBoardConfig');
  let getDashboardConfigWorker = new GetDashboardConfigWorker();
  getDashboardConfigWorker.init();
  getDashboardConfigWorker.start().then( configdata => {
    res.send(utils.composeJSONReply(true, configdata, ''));
  });
  // let configData = {
  //   success: true,
  //   configData: {
  //     'headText': 'Title',
  //     'screenConfig': {
  //       'echartTheme': 'light',
  //       'slideStayTime': 10000,
  //       'screens': [{
  //         'totalRows': 3,
  //         'totalColumns': 2,
  //         'totalPages': 2,
  //         'updateFrequency': '24h',
  //         'themeing': 'fiori'
  //       }]
  //     },
  //     'tilesConfig': {
  //       'test1': ''
  //     },
  //     'screens': [{
  //       'tilesLayout': [[{
  //         'tileName': 'QuanlityTestingStatusTile',
  //         'rowSpan': 2,
  //         'tileTitle': 'New Code UT Coverage'
  //       }, {
  //         'tileName': 'DashBoardUTNewCodeCovTile',
  //         'rowSpan': 1,
  //         'tileTitle': 'New Code UT Coverage - 1'
  //       }],
  //       [],
  //       [],
  //       []]
  //     }]
  //   }
  // };
  // res.send(JSON.stringify(configData));
});
router.get('/fetchJiraSprintTicketInfo', function(req, res, next) {

});
router.get('/fetchJenkinsJobSummary', function(req, res, next) {
  let jenkinsJobsSummaryWorker = new JenkinsJobsSummaryWorker();
  jenkinsJobsSummaryWorker.init();
  jenkinsJobsSummaryWorker.start().then(function (data) {
    res.send(utils.composeJSONReply(true, data, ''));
    
  })
});
router.get('/getNewUTCodeCoverage', function(req, res, next) {
  let getNewUTCodeCoverageWorker = new GetNewUTCodeCoverageWorker();
  getNewUTCodeCoverageWorker.init(req);
  getNewUTCodeCoverageWorker.start().then(function (data) {
    res.send(utils.composeJSONReply(true, data, ''));
  })
});
router.get('/getQuanlityTestingFailStatusSummary', function(req, res, next) {
  let getNewUTCodeCoverageWorker = new GetQuanlityTestingFailStatusSummaryWorker();
  getNewUTCodeCoverageWorker.init();
  getNewUTCodeCoverageWorker.start().then(function (data) {
    res.send(utils.composeJSONReply(true, data, ''));
  })
});
router.get('/getComponentPiplelineRunStatusWorker', function(req, res, next) {
  let getComponentPiplelineRunStatusWorker = new ComponentPiplelineRunStatusWorker();
  getComponentPiplelineRunStatusWorker.init();
  getComponentPiplelineRunStatusWorker.start().then(function (data) {
    res.send(utils.composeJSONReply(true, data, ''));
  })
});

router.get('/getBurnDownChartWorker', function(req, res, next) {
  let getBurnDownChartWorker = new GetBurnDownChartWorker();
  getBurnDownChartWorker.init();
  getBurnDownChartWorker.start().then(function (data) {
    res.send(utils.composeJSONReply(true, data, ''));
  })
});

router.get('/getJiraIssueListWorker',function(req,res,next){
  let getJiraIssueListWorker= new GetJiraIssueListWorker();
  getJiraIssueListWorker.init();
  getJiraIssueListWorker.start().then(function (data) {
    res.send(utils.composeJSONReply(true,data,''));
  })
});
router.get('/getNewUTCodeCoverageFromSonar',function(req,res,next){
  let fetchNewUTCodeCoverageWorker= new NewUTCodeCoverageWorker();
  fetchNewUTCodeCoverageWorker.startAll().then(() => {
    res.send(utils.composeJSONReply(true, {}, ''));
  });
});

router.get('/updateCurrentSprintFromJira',function(req,res,next){
  let updateCurrentSprintFromJira = new UpdateCurrentSprint();
  updateCurrentSprintFromJira.startAll().then(() => {
    res.send(utils.composeJSONReply(true, {}, ''));
  });
});

router.get('/getBurnDownDataFromJira',function(req,res,next){
  let getBurnDownDataFromJira = new GetBurnDownData();
  getBurnDownDataFromJira.startAll().then(() => {
    res.send(utils.composeJSONReply(true, {}, ''));
  });
});
module.exports = router;
