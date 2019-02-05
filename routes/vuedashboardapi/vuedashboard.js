var express = require('express');
var router = express.Router();

var JenkinsJobsSummaryWorker = require('../workers/JenkinsJobsSummaryWorker');
var GetDashboardConfigWorker = require('../workers/GetDashboardConfigWorker');
var SaveDashboardConfigWorker = require('../workers/SaveDashboardConfigWorker');
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
    res.send(utils.composeJSONReply(true, configdata.dashboardConfig, ''));
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
module.exports = router;
