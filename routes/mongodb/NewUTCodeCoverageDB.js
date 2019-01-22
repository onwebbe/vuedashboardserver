var mongoose = require('mongoose');
var Schema = mongoose.Schema;
``
mongoose.connect('mongodb://localhost:32768/vuedashboardtiles');


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
