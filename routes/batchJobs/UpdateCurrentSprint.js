const jiraUtils = require('./JiraUtils');
const ConfigDB = require('../mongodb/DashboardConfigDB');

class UpdateCurrentSprint {
  start() {
    return new Promise(async (resolve, reject) => {
      let allSprints = await jiraUtils.listAllSprints();
      let activeSprint = allSprints.filter((sprintItem) => {
        if (sprintItem.status != 'CLOSED' && sprintItem.name == 'CDP_B1908_Sprint2') {
          return true;
        }
      });
      if (activeSprint.length === 1) {
        ConfigDB.find({}, (err, res) => {
          if (err) {
            reject(err);
          }
          let currentConfig = res[0].toJSON();
          let id = res[0]._id;
          let burndownchartconfig = currentConfig.burndownchartconfig;
          let activeSprintName = activeSprint[0].name;
          let releaseName = activeSprintName.split('_')[1].toLowerCase();
          burndownchartconfig.release = releaseName;
          burndownchartconfig.sprint = activeSprintName;
          ConfigDB.update({_id: id}, {$set: {'burndownchartconfig': burndownchartconfig}}, (error, res) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(res);
          })
        });
      } else {
        reject();
      }
    });
  }
}

let t = new UpdateCurrentSprint();
t.start();