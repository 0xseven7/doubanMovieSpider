/**
 * Created by zcx on 2016/10/4.
 */
var http = require('http');
var url = require('url')
var cheerio = require('cheerio');
var superagent = require('superagent');
var async = require('async');
var eventproxy = require('eventproxy');

var ep = new eventproxy();
var mainUrl = 'https://movie.douban.com/j/search_tags?type=movie';
var movies = [];
var tagUrls = [];
var nowTagUrls = [];


function start() {
    function onRequest(req, res) {
        superagent.get(mainUrl).end(function (err, pres) {
            var movieTags = [];
            movieTags = JSON.parse(pres.text).tags;
            tagUrlStart(req, res, movieTags);
        })
    }
    http.createServer(onRequest).listen(3000, function() {
        console.log('listen at 3000')
    })
}
function tagUrlStart(req, res, movieTags) {
    var page_limit = 0,
        page_start = 20;

        movieTags.forEach(function (movietag) {
        tagUrls.push('https://movie.douban.com/j/search_subjects?type=movie&tag=' + encodeURI(movietag) + // 这里讲中文转为encode，否则无法抓取
            '&sort=recommend&page_limit=20&page_start=');
    })
    for(var i=0; i<50; i++){
        var nowTagUrl = tagUrls[0];
        nowTagUrls.push(nowTagUrl + page_start);
        page_start+=20;
    }
    res.writeHead(200, {'Content-Type':'text/html;charset="utf-8"'})
    var crawlCount = 0;
    var count = 0;
    function crawl(url, callback) {
        crawlCount++;
        var delay = parseInt(Math.random() * 5000, 10)
        console.log("正在执行第" + crawlCount + "次爬取" +"正在抓取的是" + url + "延时" + delay + "毫秒")
        superagent.get(url).end(function (err, pres) {
            if(!pres.text){
                count
            }
            JSON.parse(pres.text).subjects.forEach(function (subject) {
                res.write(count + subject.title + subject.rate  + "</br>");
            })
        })
        setTimeout(function () {
            crawlCount--;
            callback(null, url + "call back content")
        }, delay)
    }
    async.mapLimit(nowTagUrls, 2, function (url, callback) {
        crawl(url, callback);
    }, function (err, result) {
        console.log('final' + result);
    })
}


start();


