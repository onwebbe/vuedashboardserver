var mongoose = require('./db');
var Schema = mongoose.Schema;


var DashboardConfigSchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  dashboardConfig: {
    type: Map
  }
});

var DashboardConfig = mongoose.model('DashboardConfig', DashboardConfigSchema);
module.exports = DashboardConfig;
// let configContent = {
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
// let configData = new DashboardConfig({
//   dashboardConfig: {
//     success: true,
//     configData: {
//       'headText': 'Title',
//       'screenConfig': {
//         'echartTheme': 'light',
//         'slideStayTime': 10000,
//         'screens': [{
//           'totalRows': 3,
//           'totalColumns': 2,
//           'totalPages': 2,
//           'updateFrequency': '24h',
//           'themeing': 'fiori'
//         }]
//       },
//       'tilesConfig': {
//         'test1': ''
//       },
//       'screens': [{
//         'tilesLayout': [[{
//           'tileName': 'QuanlityTestingStatusTile',
//           'rowSpan': 2,
//           'tileTitle': 'New Code UT Coverage'
//         }, {
//           'tileName': 'DashBoardUTNewCodeCovTile',
//           'rowSpan': 1,
//           'tileTitle': 'New Code UT Coverage - 1'
//         }],
//         [],
//         [],
//         []]
//       }]
//     }
//   }
// });
// configData.save( function (err, res) {
//   if (err) {
//     console.log("Error:" + err);
//   }
//   else {
//       console.log("Res:" + res);
//   }
//   mongoose.disconnect();
// });