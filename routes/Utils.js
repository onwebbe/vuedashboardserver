const moment = require('moment');
const ConfigDB = require('./mongodb/DashboardConfigDB');

function composeJSONReply(isSuccess, response, message) {
  if (message == null) {
    message = '';
  }
  let replyJSON = {};
  replyJSON.success = isSuccess;
  replyJSON.message = message;
  let responseJSONObj = null;
  if (response instanceof String) {
    responseJSONObj = JSON.parse(response);
  } else {
    responseJSONObj = response;
  }
  replyJSON.data = responseJSONObj;
  return JSON.stringify(replyJSON);
}
function _padFieldLeft(field, length, padCharacter) {
  field = field.toString();
  padCharacter = padCharacter.toString();
  if (field.length > length) {
    return field;
  }
  let returnField = '';
  let paddingCount = length - field.length;
  for ( let i = 0; i < paddingCount; i++) {
    returnField += padCharacter;
  }
  returnField += field;
  return returnField;
}
function generateMongoDateCheckObj(fieldName, date) {
  return generateMongoDateGap(fieldName, date, 1)
}
/*
 * genereated mongodb default date string for query or update, using date object will cause utc timezone problem
 * but the problem not exists when using string
 */
function generateDateStr(gap) {
  if (gap == null) {
    gap == 0;
  }
  var oneDayTime = 60 * 60 * 24 * 1000;
  let date = new Date();
  date = new Date(date.getTime() + (gap * oneDayTime));
  let dateYear = date.getFullYear();
  let dateMonth = date.getMonth();
  let dateDay = date.getDate();
  let thisDay = dateYear + '-' + _padFieldLeft(dateMonth + 1, 2, '0') + '-' + _padFieldLeft(dateDay, 2, 0) + 'T00:00:00.000Z';
  return thisDay;
}

function generateMongoDateGap(fieldName, date, dateGap) {
  let thisDay = date;
  if ( date == null ) {
    thisDay = generateDateStr(0);
  }
  let nextDay = generateDateStr(dateGap);
  let queryObj = {};
  queryObj['$and'] = [];
  query1 = {};
  if (dateGap >= 0) {
    query1[fieldName] = {'$gte': thisDay};
  } else {
    query1[fieldName] = {'$lt': thisDay};
  }
  
  query2 = {};
  if (dateGap >= 0) {
    query2[fieldName] = {'$lt': nextDay};
  } else {
    query2[fieldName] = {'$gte': nextDay};
  }
  queryObj['$and'].push(query1);
  queryObj['$and'].push(query2);
  return queryObj;
}

function generateMongoDateGapISODate(fieldName, date, dateGap) {
  let thisDay = date;
  if ( date == null ) {
    thisDay = generateDateStr(0);
  }
  let nextDay = generateDateStr(dateGap);
  let queryObj = {};
  queryObj['$and'] = [];
  query1 = {};
  if (dateGap >= 0) {
    query1[fieldName] = {'$gte': new Date(thisDay)};
  } else {
    query1[fieldName] = {'$lt': new Date(thisDay)};
  }
  
  query2 = {};
  if (dateGap >= 0) {
    query2[fieldName] = {'$lt': new Date(nextDay)};
  } else {
    query2[fieldName] = {'$gte': new Date(nextDay)};
  }
  queryObj['$and'].push(query1);
  queryObj['$and'].push(query2);
  return queryObj;
}

function calculateDay(start, end) {
  let startTime = moment(start).startOf('day');
  let endTime = moment(end).startOf('day');
  let totalDay = 0;
  for (let i = startTime.toDate().getTime(); i <= endTime.toDate().getTime(); i += (60 * 60 * 24 * 1000)) {
    let currentDate = new Date(i);
    if (currentDate.getDay() != 0 && currentDate.getDay() != 6) {
      totalDay++;
    }
  }
  return totalDay;
}

function getAuthToken() {
  return new Promise(async(resolve, reject) => {
    ConfigDB.find({}, async (error, res) => {
      // ConfigDB.db.close();
      if (error) {
        reject();
      } else {
        resolve(res[0].toJSON().burndownchartconfig.token);
      }
    })
  });
}
module.exports = {
  composeJSONReply,
  generateMongoDateCheckObj,
  generateMongoDateGap,
  generateDateStr,
  generateMongoDateGapISODate,
  calculateDay,
  getAuthToken
}