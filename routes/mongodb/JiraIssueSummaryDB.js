var mongoose = require('./db');

var Schema = mongoose.Schema;

var JiraIssueSummarySchema = new Schema({
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  filterTitle: String,
  filterURL: String,
  newCount: {
    type: Map,
    of: Number
  }, /* map will will have severity as key for example  1, 2, 3, 4 */
  regressionCount: {
    type: Map,
    of: Number
  },
  escapeCount: {
    type: Map,
    of: Number
  },
  rawData: Map
});

var JiraIssueSummary = mongoose.model('JiraIssueSummary', JiraIssueSummarySchema);
module.exports = JiraIssueSummary;
 

// JiraIssueSummary.find({}, (err, res) => {
//   console.log(new Date(res[0].date));
// })
// let jira1 = new JiraIssueSummary({
//   filterTitle: 'title',
//   filterURL: 'http://',
//   newCount: {
//     '1': 0,
//     '2': 5,
//     '3': 10,
//     '4': 20
//   },
//   regressionCount: {
//     '1': 0,
//     '2': 1,
//     '3': 3,
//     '4': 1
//   },
//   escapeCount: {
//     '1': 0,
//     '2': 2,
//     '3': 5,
//     '4': 8
//   }
// });
// jira1.save( function (err, res) {
//   if (err) {
//     console.log("Error:" + err);
//   }
//   else {
//       console.log("Res:" + res);
//   }
// });