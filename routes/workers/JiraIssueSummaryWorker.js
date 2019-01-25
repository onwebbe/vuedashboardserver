const request = require('superagent');
const logger = require('../../Logger');
const JiraDB = require('../mongodb/JiraIssueSummaryDB');
const cheerio = require('cheerio');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

class JiraIssueSummaryWorker {
  constructor(config) {
    this.init(config);
  }
  init(config) {
    logger.info('JiraIssueSummaryWorker:init:start with config:' + config ? JSON.stringify(config) : null);
    if (config == null) {
      config = {
        baseURL: 'https://jira.successfactors.com/rest/gadget/1.0/twodimensionalfilterstats/generate?filterId=filter-94653&xstattype=customfield_10002&ystattype=customfield_10020&sortDirection=asc&sortBy=natural&numberToShow=5&_=1547808907899'
      };
    }
    logger.info('JiraIssueSummaryWorker:init:init data for baseURL:' + config.baseURL);
    this._config = config;
    this._inited = true;
  }
  start() {
    this.process().then( () => {
      JiraDB.base.disconnect();
    }).catch( () => {
      JiraDB.base.disconnect();
    });
  }
  async process() {
    try {
      let jiraInfo = await this.getJiraData();
      let isInserted = await this.checkIfTodayAlreadyInserted();
      if (!isInserted) {
        await this.saveJiraData(jiraInfo);
      }
    } catch (e) {
      logger.error('JiraIssueSummaryWorker:start:error with message:' + e.message);
      throw e;
    }
  }
  checkIfTodayAlreadyInserted() {
    logger.info('JiraIssueSummaryWorker:checkIfTodayAlreadyInserted:Start');
    let now = new Date();
    let today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return new Promise((resolve, reject) => {
      JiraDB.find({'date': {'$gte': today}, 'date': {'$lt': tomorrow}}, (err, res) => {
        logger.info('JiraIssueSummaryWorker:checkIfTodayAlreadyInserted:is Already Inserted:' + (res.length > 0));
        resolve(res.length > 0);
      });
    });
  }
  saveJiraData(data) {
    logger.info('JiraIssueSummaryWorker:saveJiraData:Start');
    let self = this;
    let newSection = null;
    let regressionSection = null;
    let escapeSection = null;
    for (let i = 0; i < data.rows.length; i++) {
      let row = data.rows[i];
      if (row.cells[0].markup == "New") {
        newSection = row.cells;
      }
      if (row.cells[0].markup == "Regression") {
        regressionSection = row.cells;
      }
      if (row.cells[0].markup == "Escape") {
        escapeSection = row.cells;
      }
    }
    let dbData = {
      'filterTitle': data.filter.filterTitle,
      'filterURL': data.filter.filterUrl,
      'newCount': newSection === null? {}: self._getSectionCount(data.firstRow.cells, newSection),
      'regressionCount': regressionSection === null? {}: self._getSectionCount(data.firstRow.cells, regressionSection),
      'escapeCount': escapeSection === null? {}: self._getSectionCount(data.firstRow.cells, escapeSection),
      'rawData': data
    }
    let record = new JiraDB(dbData);
    return new Promise((resolve, reject) => {
        record.save((err, res) => {
        logger.info('JiraIssueSummaryWorker:saveJiraData:done');;
        });
    });
  }
  _getSectionCount(headerFields, sectionData) {
    let returnSectionData = {};
    for (let i = 0; i < headerFields.length; i++) {
      let headerField = headerFields[i];
      let fieldString = headerField.markup;
      let fieldNumber = parseInt(fieldString);
      let markupString = sectionData[1].markup;
      var $ = cheerio.load(markupString);
      let markupValue = $('a').text().trim();
      returnSectionData[fieldNumber + ''] = markupValue;
    }
    for (let i = 1; i <= 4; i++) {
      if (!returnSectionData[i + '']) {
        returnSectionData[i + ''] = 0;
      }
    }
    return returnSectionData;
  }
  getJiraData() {
    logger.info('JiraIssueSummaryWorker:getJiraData:Start');
    let url = '';
    if ( this._inited == true ) {
      url = this._config.baseURL;
    }
    logger.info('JiraIssueSummaryWorker:getJiraData:before get data from url:' + url);
    return new Promise((resolve, reject) => {
      request
        .get(url)
        .set('Authorization', 'Basic aTMyNjQzMjpDb29sMTIzNA==')
        .then(res => {
          resolve(res.body);
      })
      .catch(err => {
        // err.message, err.response
        reject(err);
      })
    });
  }
  _getDummyData() {
    return {
      "filter": {
          "filterTitle": "CDP-Release-Defects",
          "filterDescription": "",
          "filterUrl": "https://jira.successfactors.com/issues/?filter=94653",
          "empty": false
      },
      "rows": [
          {
              "cells": [
                  {
                      "markup": "    New\n"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+New+AND+%22Ticket+Priority%22+%3D+3-Medium'>0</a>"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+New+AND+%22Ticket+Priority%22+%3D+4-Low'>2</a>"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+New'>2</a>",
                      "classes": [
                          "totals"
                      ]
                  }
              ]
          },
          {
              "cells": [
                  {
                      "markup": "    Regression\n"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+Regression+AND+%22Ticket+Priority%22+%3D+3-Medium'>1</a>"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+Regression+AND+%22Ticket+Priority%22+%3D+4-Low'>0</a>"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+Regression'>1</a>",
                      "classes": [
                          "totals"
                      ]
                  }
              ]
          },
          {
              "cells": [
                  {
                      "markup": "    Escape\n"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+%22Escape%22+AND+%22Ticket+Priority%22+%3D+3-Medium'>18</a>"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+%22Escape%22+AND+%22Ticket+Priority%22+%3D+4-Low'>3</a>"
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Defect+type%22+%3D+%22Escape%22'>21</a>",
                      "classes": [
                          "totals"
                      ]
                  }
              ]
          },
          {
              "cells": [
                  {
                      "markup": "Total Unique Issues:",
                      "classes": [
                          "totals"
                      ]
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Ticket+Priority%22+%3D+3-Medium'>19</a>",
                      "classes": [
                          "totals"
                      ]
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?jql=project+%3D+CDP+AND+issuetype+in+%28Defect%2C+Performance%2C+Security%2C+Task%29+AND+status+in+%28Open%2C+Reopened%2C+Blocked%2C+%22Work+In+Progress%22%29+AND+resolution+%3D+Unresolved+AND+affectedVersion+%3D+b1902+AND+%22Ticket+Priority%22+%3D+4-Low'>5</a>",
                      "classes": [
                          "totals"
                      ]
                  },
                  {
                      "markup": "<a href='https://jira.successfactors.com/issues/?filter=94653'>24</a>",
                      "classes": [
                          "totals"
                      ]
                  }
              ]
          }
      ],
      "firstRow": {
          "cells": [
              {
                  "markup": "    3-Medium\n"
              },
              {
                  "markup": "    4-Low\n"
              },
              {
                  "markup": "T:"
              }
          ]
      },
      "xHeading": "Ticket Priority",
      "yHeading": "Defect type",
      "totalRows": 3
    };
  }
}
let sonarCrawler = new JiraIssueSummaryWorker();
//sonarCrawler.start();