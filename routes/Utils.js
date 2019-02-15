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
function generateDateObj(gap) {
  if (gap == null) {
    gap == 0;
  }
  let date = new Date();
  let dateYear = date.getFullYear();
  let dateMonth = date.getMonth();
  let dateDay = date.getDate();
  let thisDay = new Date(dateYear + '-' + _padFieldLeft(dateMonth + 1, 2, '0') + '-' + _padFieldLeft(dateDay + gap, 2, 0) + 'T00:00:00.000Z');
  return thisDay;
}
function generateMongoDateGap(fieldName, date, dateGap) {
  if ( date == null ) {
    date = new Date();
  }
  let thisDay = date;
  let nextDay = generateDateObj(dateGap);
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
module.exports = {
  composeJSONReply,
  generateMongoDateCheckObj,
  generateMongoDateGap,
  generateDateObj
}