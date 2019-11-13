export NODE_ENV=production
ps -aux | grep UpdateCurrentSprint | awk '{print $2}' | xargs kill
ps -aux | grep GetBurnDownData | awk '{print $2}' | xargs kill
cd /home/sfadmin/nodeProjects/dashbord/vuedashboardserver
/usr/local/bin/node routes/batchJobs/UpdateCurrentSprint.js >> /home/sfadmin/nodeProjects/dashbord/vuedashboardserver/logs/pdateCurrentSprint.log
/usr/local/bin/node routes/batchJobs/GetBurnDownData.js >> /home/sfadmin/nodeProjects/dashbord/vuedashboardserver/logs/fetchBurnDown.log
