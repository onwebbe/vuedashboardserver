const request = require('superagent');
const cdpAgileDashboardID = 2789;//1298;
const ConfigDB = require('../mongodb/DashboardConfigDB');
const sprintListURL = 'https://jira.successfactors.com/rest/greenhopper/1.0/sprintquery/' + cdpAgileDashboardID;
const utils = require('../Utils');

function getAuthToken() {
  return new Promise(async(resolve, reject) => {
    ConfigDB.find({}, async (error, res) => {
      // ConfigDB.db.close();
      if (error) {
        reject();
      } else {
        let data = res[0].toJSON().burndownchartconfig.token;
        data = utils.dec(data);
        resolve(data);
      }
    })
  });
}
function listAllSprints() {
  return new Promise(async(resolve, reject) => {
    let authToken = await getAuthToken();
    request.get(sprintListURL)
    .set('Authorization', 'Basic ' + authToken)
    .set('Accept', 'application/json')
    .end(async(err, res) => {
      if (err) {
        reject();
        return;
      }
      resolve(res.body.sprints);
    });
  });
}

module.exports = {
  getAuthToken,
  listAllSprints
}