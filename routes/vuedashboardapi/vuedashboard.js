var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/getDashBoardConfig', function(req, res, next) {
  let configData = {
    success: true,
    configData: {
      'headText': 'Title',
      'screenConfig': {
        'echartTheme': 'dark',
        'slideStayTime': 10000,
        'screens': [{
          'totalRows': 3,
          'totalColumns': 4,
          'totalPages': 2,
          'updateFrequency': '24h',
          'themeing': 'black'
        }]
      },
      'tilesConfig': {
        'test1': ''
      },
      'screens': [{
        'tilesLayout': [[{
          'tileName': 'DashBoardUTNewCodeCovTile',
          'rowSpan': 1,
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

module.exports = router;
