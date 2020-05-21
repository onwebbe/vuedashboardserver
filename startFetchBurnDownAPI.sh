#!/bin/bash
curl http://10.129.126.28:3100/api/vuedashboard/updateCurrentSprintFromJira > fetchBurndown.log
curl http://10.129.126.28:3100/api/vuedashboard/getBurnDownDataFromJira  > fetchBurndown.log