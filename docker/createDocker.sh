rm vuedashboardserver.tar.gz
tar czvf vuedashboardserver.tar.gz ../../vuedashboardserver
docker build -t vuedashboard:latest .

