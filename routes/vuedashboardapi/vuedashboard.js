var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/getDashBoardConfig', function(req, res, next) {
  let configData = {
    success: true,
    configData: {
      'headText': 'Title',
      'screenConfig': {
        'echartTheme': 'light',
        'slideStayTime': 10000,
        'screens': [{
          'totalRows': 3,
          'totalColumns': 3,
          'totalPages': 2,
          'updateFrequency': '24h',
          'themeing': 'fiori'
        }]
      },
      'tilesConfig': {
        'test1': ''
      },
      'screens': [{
        'tilesLayout': [[{
          'tileName': 'DashBoardUTNewCodeCovTile',
          'rowSpan': 2,
          'tileTitle': 'New Code UT Coverage'
        }, {
          'tileName': 'DashBoardUTNewCodeCovTile',
          'rowSpan': 1,
          'tileTitle': 'New Code UT Coverage - 1'
        }],
        [],
        [],
        []]
      }]
    }
  };
  res.send(JSON.stringify(configData));
});

router.get('/fetchJiraSprintTicketInfo', function(req, res, next) {

});
module.exports = router;
