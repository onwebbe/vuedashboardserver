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
module.exports = {
  composeJSONReply
}