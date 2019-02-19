var mongoose = require('./db');
var Schema = mongoose.Schema;

var NewUTCodeCoverage = new Schema({
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  codeCoverage: {
    type: Map,
    of: Number
  },
  newCodeCoverDetail: {
    type: Map,
    of: String
  },
  codeCoverageRawData: Map,
  newCodeCoverDetailRawData: Map
});

var NewUTCodeCoverage = mongoose.model('NewUTCodeCoverage', NewUTCodeCoverage);
module.exports = NewUTCodeCoverage;

// let newCodeCoverageInfo = {
//   codeCoverage: {
//     percent: 50,
//     lineToCover: 1028
//   },
//   newCodeCoverDetail: {
//     percent: 89,
//     lineToCover: 103
//   },
//   codeCoverageRawData: {
//     percent: 50,
//     lineToCover: 1028
//   },
//   newCodeCoverDetailRawData: {
//     percent: 50,
//     lineToCover: 1028
//   }
// };
// let newCodeCoverageData = new NewUTCodeCoverage(newCodeCoverageInfo);
// newCodeCoverageData.save( function (err, res) {
//   if (err) {
//     console.log("Error:" + err);
//   } else {
//       console.log("Res:" + res);
//   }
//   mongoose.disconnect();
// });
  





