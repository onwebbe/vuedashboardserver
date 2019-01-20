var mongoose = require('mongoose');
var Schema = mongoose.Schema;
``
mongoose.connect('mongodb://localhost:32768/vuedashboardtiles');


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
    of: String
  }, /* map will will have severity as key for example  1, 2, 3, 4 */
  regressionCount: {
    type: Map,
    of: String
  },
  escapeCount: {
    type: Map,
    of: String
  },
  rawData: Map
});

var JiraIssueSummary = mongoose.model('JiraIssueSummary', JiraIssueSummarySchema);
Animal.findByName('fido', function(err, animals) {
  console.log(animals);
});