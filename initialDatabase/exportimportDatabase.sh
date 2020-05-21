mongoexport --db vuedashboardtiles -c burndowncharts -o burndowncharts_vuedashboardInitialDump.json
mongoexport --db vuedashboardtiles -c burndownchartsprints -o burndownchartsprints_vuedashboardInitialDump.json
mongoexport --db vuedashboardtiles -c burndownchartstories -o burndownchartstories_vuedashboardInitialDump.json
mongoexport --db vuedashboardtiles -c dashboardconfigs -o dashboardconfigs_vuedashboardInitialDump.json
mongoexport --db vuedashboardtiles -c newutcodecoverages -o newutcodecoverages_vuedashboardInitialDump.json


mongoimport --port 27017 --db vuedashboardtiles -c burndowncharts --file burndowncharts_vuedashboardInitialDump.json
mongoimport --port 27017 --db vuedashboardtiles -c burndownchartsprints --file burndownchartsprints_vuedashboardInitialDump.json
mongoimport --port 27017 --db vuedashboardtiles -c dashboardconfigs --file burndownchartstories_vuedashboardInitialDump.json
mongoimport --port 27017 --db vuedashboardtiles -c sprintdays --file dashboardconfigs_vuedashboardInitialDump.json
mongoimport --port 27017 --db vuedashboardtiles -c newutcodecoverages --file newutcodecoverages_vuedashboardInitialDump.json