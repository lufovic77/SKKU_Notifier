/**
* Created by md98 on 17. 7. 26.
    */
/**
* Modified by lufovic77(lufovic77@gmail.com) on 09 . 23 . 18
*/    

    // urls
let sw_url = 'http://cs.skku.edu/news/recent/list';
/*
let cse_url = 'http://cse.cau.ac.kr/20141201/sub05/sub0501.php';
let csedb = 'db/cse.db';
let accord_url = 'http://cse.cau.ac.kr/20141201/sub04/sub0403.php';
let accorddb = 'db/accord.db';
*/
let request = require('request');
let cheerio = require('cheerio');
let moment = require('moment');
let fs = require('fs');
let data = {};
let old_data = require('./data/old_data.json');
let today = moment().format('YYYY.MM.DD');
logger=require('./logger.js').logger('log/'+today+'.log');
let recent_days=[];
// Read ICT Page

function requestSW(){
    return new Promise(function(resolve,reject) {
        request(ict_url, function (error, response, body) {
            if (error) {
                logger.log('error', error); 
                reject(error);
            }
            resolve(body);
        });
    });
}
function parseSW(body){
    let postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.table-hover.dataTable.no-footer tbody tr');
        postElements.each(function () {
            let children = $(this).children();
            let row = {
                'url': sw_url+'?cmd=view&idx='+$(children[0]).find('a').attr('href').replace(/[^0-9]/g,''),
                'title': $(children[1]).text().replace(/[\n\t\r]/g, ''),
                'last_update' : $(children[2]).text()
            };
            if(row['title'].substr(row['title'].length-2, 2)=='새글'){
                row['title']=row['title'].substr(0, row['title'].length-2);
            }
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushSW(postarray){
    return new Promise(function(resolve, reject) {
        data['sw'] = postarray;
        resolve();
    });
}
function filter_date(){
    today = moment().format('YYYY.MM.DD');
    data['sw'] = data['sw'].filter(function(item){return item['last_update']==today;})
}

function filter_old(){
    data['sw'] = data['sw'].filter(function(item){return !old_data['sw'].some(function(obj){return obj.title==item.title;})});
}
function update_old(){
    old_data['sw'] = old_data['sw'].concat(data['sw']);
}


function _update() {
    let sw = new Promise(function(resolve, reject){
        requestSW()
            .then(parseSW)
            .then(pushSW)
            .then(function(){
                resolve();
            })
            .catch(function(error){
                logger.log('error', error);
            });
    });
    /*
    let cse = new Promise(function(resolve, reject){
        requestCse()
            .then(parseCse)
            .then(pushCse)
            .then(function(){
                resolve();
            })
            .catch(function(error){
                logger.log('error', error);
            });
    });
    let accord = new Promise(function(resolve, reject){
        requestAccord()
            .then(parseAccord)
            .then(pushAccord)
            .then(function(){
                resolve();
            })
            .catch(function(error){
                logger.log('error', error);
            });
    })
    */
    Promise.all([ict, cse, accord]).then(function(){
        filter_date();
        filter_old();
        fs.writeFileSync('data/data.json', JSON.stringify(data),'utf8');
        logger.log('info', data);
        update_old();
        fs.writeFileSync('data/old_data.json', JSON.stringify(old_data), 'utf8');
    }).catch(function(error){
        filter_date();
        filter_old();
        fs.writeFileSync('data/data.json', JSON.stringify(data),'utf8');
        logger.log('info', data);
        update_old();
        fs.writeFileSync('data/old_data.json', JSON.stringify(old_data), 'utf8');
    });
}

exports.update=_update;
let schedule = require('node-schedule');
let scrapping_rule = new schedule.RecurrenceRule();
scrapping_rule.minute = new schedule.Range(0,59,5);
schedule.scheduleJob(scrapping_rule, function() {
    logger.log('info', 'cronjob start update');
    _update();
});
let log_rule = new schedule.RecurrenceRule();
log_rule.hour = 21;
schedule.scheduleJob(log_rule, function(){
    for(let i=0;i<8;i++){
        recent_days[i]=moment().subtract(i,'days').format('YYYY.MM.DD');
    }
    logger=require('./logger.js').logger('log/'+today+'.log');
    fs.unlink('log/'+recent_days[7]+'.log', function(err){
        logger.log('info', recent_days[7]+'.log file delete');
    });
});
