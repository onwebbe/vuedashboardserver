FROM node:10-stretch-slim
MAINTAINER i326432
RUN mkdir -p /app
ADD ./vuedashboardserver.tar.gz /app/
WORKDIR /app/vuedashboardserver/
RUN npm install
COPY start.sh /app/vuedashboardserver/start.sh
RUN chmod +x /app/vuedashboardserver/start.sh
ENV PORT=3100
ENV NODE_ENV=production
EXPOSE 3100
CMD ["/app/vuedashboardserver/start.sh"]