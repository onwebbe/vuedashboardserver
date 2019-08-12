const request = require('superagent');
const cdpAgileDashboardID = 2789;//1298;
const ConfigDB = require('../mongodb/DashboardConfigDB');
const sprintListURL = 'https://jira.successfactors.com/rest/greenhopper/1.0/sprintquery/' + cdpAgileDashboardID;

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