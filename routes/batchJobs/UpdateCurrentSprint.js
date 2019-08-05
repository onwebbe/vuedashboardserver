const jiraUtils = require('./JiraUtils');
const ConfigDB = require('../mongodb/DashboardConfigDB');

class UpdateCurrentSprint {
  start() {
    return new Promise(async (resolve, reject) => {
      let allSprints = await jiraUtils.listAllSprints();
      let activeSprint = allSprints.filter((sprintItem) => {
        // if (sprintItem.state != 'CLOSED' && sprintItem.name == 'CDP_B1908_Sprint2') {
        if (sprintItem.state === 'ACTIVE') {
          return true;
        } else {
          return false;
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
          burndownchartconfig.sprintid = activeSprint[0].id;
          burndownchartconfig.latestRelease = releaseName;
          burndownchartconfig.latestSprint = activeSprintName;
          ConfigDB.update({_id: id}, {$set: {'burndownchartconfig': burndownchartconfig}}, (error, res) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(res);
          })
        });
      } else {
        ConfigDB.find({}, (err, res) => {
          if (err) {
            reject(err);
          }
          let currentConfig = res[0].toJSON();
          let id = res[0]._id;
          let burndownchartconfig = currentConfig.burndownchartconfig;
          if (burndownchartconfig.release === '' && burndownchartconfig.sprint === '') {
            resolve(burndownchartconfig);
            return;
          }
          burndownchartconfig.release = '';
          burndownchartconfig.sprint = '';
          burndownchartconfig.sprintid = '';
          ConfigDB.update({_id: id}, {$set: {'burndownchartconfig': burndownchartconfig}}, (error, res) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(res);
          })
        });
      }
    });
  }
}

async function startProcess() {
  let t = new UpdateCurrentSprint();
  try {
    await t.start();
  } catch(e) {}
  
  ConfigDB.db.close();
}
startProcess();