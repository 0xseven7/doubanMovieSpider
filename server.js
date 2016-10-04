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
        page_start = 0,
        crowlCount = 0;
    movieTags.forEach(function (movietag) {
        tagUrls.push('https://movie.douban.com/j/search_subjects?type=movie&tag=' + encodeURI(movietag)+ // 这里讲中文转为encode，否则无法抓取
            '&sort=recommend&page_limit=20&page_start=');
    })
    res.writeHead(200, {'Content-Type':'text/html;charset="utf-8"'})
    var tagIndex = 0;
    var timer = setInterval(crawl, 100);

    function crawl() {
        var crawlUrl = tagUrls[tagIndex];
        page_start += 20;

        crawlUrl += page_start;
        console.log("正在执行第" + crowlCount + "次爬取" + "共" + crawlUrl + "条信息")
        superagent.get(crawlUrl).end(function (err, pres) {
            console.log()
            if(!JSON.parse(pres.text).subjects[0]){
                clearInterval(timer);
                tagIndex++;
                timer = setInterval(crawl, 1000)
                page_start = 0;
            } else {
                JSON.parse(pres.text).subjects.forEach(function (subject) {
                    res.write(movieTags[tagIndex] + crowlCount + subject.title + subject.rate + "</br>");
                    crowlCount++;
                })
            }

        })
    }
}
start();


