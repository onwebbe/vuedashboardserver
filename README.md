# vue dashboard
VUE based Dashboard framework

## System requirement
Database: mongodb<br/>
node 10<br/>

## Project dependency
In this project, there are several UI sub-projects related.<br/>
All these project already been compiled and included but if any change required, please download and build<br/>
NOTE:  when run the project, please export NODE_ENV=production and then<br/>
node bin/www<br/>
all apis will be under /api
/api/vuedashboard/saveDashBoardConfig
/api/vuedashboard/getDashBoardConfig
/api/vuedashboard/fetchJenkinsJobSummary
/api/vuedashboard/getNewUTCodeCoverage
/api/vuedashboard/getQuanlityTestingFailStatusSummary
/api/vuedashboard/getComponentPiplelineRunStatusWorker
/api/vuedashboard/getBurnDownChartWorker
/api/vuedashboard/getJiraIssueListWorker
/api/vuedashboard/getNewUTCodeCoverageFromSonar
/api/vuedashboard/updateCurrentSprintFromJira
/api/vuedashboard/getBurnDownDataFromJira

### vue dashboard UI
https://github.com/onwebbe/vuedashboard.git
This is pure VUE based UI project which provides the display layer of the dashboard<br/>
NOTE:  when build the UI project, please export NODE_ENV=production<br/>
after build, copy the file from dist of the UI project to ./public/vuedashboard<br/>
access url for this will be http://xx.xx.xx.xx:xxxx/vuedashboard<br/>

### json config UI
https://github.com/onwebbe/vuejsonconfigui.git
To update the configuration easier, a VUE based UI available user to using web page to maintain the configurations.
NOTE:  when build the UI project, please export NODE_ENV=production
after build, copy the file from dist of the UI project to ./public/vuejsonconfig<br/>
access url for this will be http://xx.xx.xx.xx:xxxx/vuejsonconfig<br/>

## Docker and DockerConfig
please use docker build in ./docker folder<br/>
go docker folder<br/>
run below command to create your docker<br/>
docker build -t vuedashboard:latest .


In docker-compose file, please define your network and also add mysql as link and dependency for this image, the network aliases should be 'mongodb'

## Docker Compose sample
version: "3"<br/>
networks:<br/>
  local:<br/>
  db_apps:<br/>
    driver: bridge<br/>
<br/>
services:<br/>
  mongodb:<br/>
    image: mongo:3.6.12<br/>
    ports:<br/>
      - 37117:27017<br/>
    networks:<br/>
      db_apps:<br/>
        aliases:<br/>
          - mongodb<br/>
    volumes:<br/>
      - /data/docker/docker-volumns/mongodb-data:/data/db<br/>
    container_name: mongoDB-Production<br/>
  aglie_tracker:<br/>
    image: 10.129.126.28:5000/vuedashboard:latest<br/>
    container_name: agile-tracker<br/>
    depends_on: <br/>
      - mongodb <br/>
    ports:<br/>
      - 3100:3100<br/>
    networks:<br/>
      - db_apps<br/>
    restart: always <br/>

## Initialize Database
Initialize database data already exists under folder ./initialDatabase<br/>
There are 2 types of restore script avaible.

### vueDashboardInitialDump.tar.gz
tar xzvf vueDashboardInitialDump.tar.gz<br/>
There will be a set of json file and using below command to import the collection one by one.<br/>
mongoimport --port 27017 --db vuedashboardtiles -c burndowncharts --file burndowncharts_vuedashboardInitialDump.json<br/>
mongoimport --port 27017 --db vuedashboardtiles -c burndownchartsprints --file burndownchartsprints_vuedashboardInitialDump.json<br/>
mongoimport --port 27017 --db vuedashboardtiles -c dashboardconfigs --file burndownchartstories_vuedashboardInitialDump.json<br/>
mongoimport --port 27017 --db vuedashboardtiles -c sprintdays --file dashboardconfigs_vuedashboardInitialDump.json<br/>
mongoimport --port 27017 --db vuedashboardtiles -c newutcodecoverages --file newutcodecoverages_vuedashboardInitialDump.json<br/>

### dump.tar
this is a bson format package which could import by mongodb using below command</b>
tar xvf dump.tar
you will get a folder named "vuedashboardtiles" and using below command to restore all data at once<br/>
mongorestore -d vuedashboardtiles vuedashboardtiles<br/>