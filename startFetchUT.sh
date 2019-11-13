export NODE_ENV=production
ps -aux | grep NewUTCodeCoverageWorker | awk '{print $2}' | xargs kill
cd /home/sfadmin/nodeProjects/dashbord/vuedashboardserver
/usr/local/bin/node routes/workers/NewUTCodeCoverageWorker.js >> /home/sfadmin/nodeProjects/dashbord/vuedashboardserver/logs/fetchUT.log
