var request = require('superagent');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

class SonarCrawler {
  init(config) {
    if (config == null) {
      config = {
        baseURL: 'https://sf-sonar.devprod.sap.corp/api/measures/component'
      };
    }
    if (config.module == null) {
      config.module = 'au-cdp';
    }
    if (config.fields == null) {
      config.fields = ['new_coverage'];
    }
    this._config = config;
    this._inited = true;
  }
  async start() {
    try {
      await this.getNewCodeCoverage();
      await this.getNewCodeDetail();
    } catch (e) {
      console.log(e);
    }
  }
  getNewCodeCoverage() {
    let url = '';
    if ( this._inited == true ) {
      url = this._config.baseURL + '?componentKey=' + this._config.module;
      let fieldsString = this._config.fields[0];
      for ( let index in this._config.fields) {
        if ( index != null && index > 1) {
          let field = this._config.fields[index];
          field += ',' + field;
        }
      }
      url += '&metricKeys=' + fieldsString;
    }
    return new Promise((resolve, reject) => {
      console.log('url1:' + url);
      request.get(url).then(res => {
        // res.body, res.headers, res.status
        console.log(res.body);
        resolve();
      })
      .catch(err => {
        // err.message, err.response
        console.log(err.message);
        
      })
    });
  }
  getNewCodeDetail() {
    let config = this._config;
    let url = 'https://sf-sonar.devprod.sap.corp/api/measures/component_tree?pageSize=200&metricSortFilter=withMeasuresOnly&metricPeriodSort=1&asc=true&ps=100&metricSort=new_coverage&s=metricPeriod&baseComponentKey=' + config.module + '&metricKeys=new_coverage%2Cnew_uncovered_lines%2Cnew_uncovered_conditions&strategy=leaves';
    console.log('ssssssss------------');

    return new Promise((resolve, reject) => {
      console.log('url2:' + url);
      request.get(url).then(res => {
        // res.body, res.headers, res.status
        console.log(res.body);
        resolve();
      })
      .catch(err => {
        // err.message, err.response
        console.log(err.message);
        
      })
    });
  }
}
let sonarCrawler = new SonarCrawler();
sonarCrawler.init();
sonarCrawler.start();
// https://sf-sonar.devprod.sap.corp/api/measures/component?componentKey=au-cdp&metricKeys=new_coverage