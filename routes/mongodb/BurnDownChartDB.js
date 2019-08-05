var mongoose = require('./db');
const utils = require('../Utils');
const logger = require('../../Logger');
var Schema = mongoose.Schema;

var BurnDownChart = new Schema({
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  release: String,
  sprintName: String,
  moduleName: {
    type: String,
    default: 'CDP'
  }
});
var BurnDownChartModel = mongoose.model('BurnDownChart', BurnDownChart);
BurnDownChartModel.isSameDayExists = function (date) {
  let self = this;
  if (!date) {
    date = new Date();
  }
  let dateQuery = utils.generateMongoDateGapISODate('date', utils.generateDateStr(0), 1);
  logger.info('BurnDownChartDB:BurnDownChartModel:isSameDayExists:queryString:' + JSON.stringify(dateQuery));
  return new Promise((resolve, reject) => {
    self.find(dateQuery, function (errror, res) {
      if (res === null) {
        resolve([]);
        return;
      }
      let foundIDs = [];
      for (let i = 0; i < res.length; i++) {
        let item = res[i];
        foundIDs.push(item._id);
      }
      resolve(foundIDs);
    });
  });
}

var BurnDownChartStory = new Schema({
  chartid: {type: mongoose.Schema.Types.ObjectId, ref: 'BurnDownChart'},
  storyid: String,
  storyname: String,
  storyType: String,
  estimatedEffort: Number,
  loggedEffort: Number,
  processPercent: Number,
  storyData: Map
});
var BurnDownChartStoryModel = mongoose.model('BurnDownChartStory', BurnDownChartStory);
BurnDownChartStoryModel.removeStoryByChartId = function (chartId) {
  let dateQuery = {chartid: chartId};
  return new Promise((resolve, reject) => {
    if (chartId === null) {resolve();}
    logger.info('BurnDownChartDB:BurnDownChartStoryModel:removeStoryByChartId:queryString:' + JSON.stringify(dateQuery));
    this.deleteMany(dateQuery, function (error, res) {
      if ( error === null ) {
        logger.info('BurnDownChartDB:BurnDownChartStoryModel:removeStoryByChartId:deletedRecordCount:' + res ? res.length : 0);
        logger.info('BurnDownChartDB:BurnDownChartStoryModel:removeStoryByChartId:deletedRecord:' + JSON.stringify(res));
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

var BurnDownChartSprint = new Schema({
  chartid: {type: mongoose.Schema.Types.ObjectId, ref: 'BurnDownChart'},
  sprintid: String,
  sprintName: String,
  state: String,
  startDate: String,
  endDate: String,
  daysRemaining: Number,
  sprintData: Map
});
var BurnDownChartSprintModel = mongoose.model('BurnDownChartSprint', BurnDownChartSprint);

module.exports = {BurnDownChartModel, BurnDownChartStoryModel, BurnDownChartSprintModel};
