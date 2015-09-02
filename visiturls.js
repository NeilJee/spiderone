/**
 * Created by songgh8316 on 15-5-4.
 */
var request = require("request");
var cheerio = require("cheerio");
//var async = require("async");
var url = require("url");
var EventProxy = require("eventproxy");


var urlvisited = [], urlall = [], urlout = [];
var originurls = [];
var urlnew = [];

var ep = new EventProxy();
var ep2 = new EventProxy();


function visiturls(rooturl) {

//    var q=async.queue(function(task,callback){
//        fetchurl(task, rooturl);
//        callback();
//    },5);

    //将根节点转化为name和link的形式,后续爬到得URL都以此种形式保存
    var rurl = {
        linkname: "rootweb",
        linkaddress: rooturl
    };
    urlnew.push(rurl);

// 注册ep.after，重复异步协作，次数够了之后会调用回调
    function nextround() {
        ep.after("overone", urlnew.length, function (content) {
//           console.log("new url count is "+urlnew.length);
//           console.log("all url count is "+urlall.length);
//           console.log("out url count is "+urlout.length);
//           console.log("visited url count is "+urlvisited.length+"\n");
            //清空urlnew数组
            urlnew.splice(0, urlnew.length);

            //检测抓取到得URL里面是否有重复的URL,若有,则去重
            norepeaturl(originurls);

            //检测去重后的URL是否已经存在了，最终返回urlnew是下一轮去爬的
            isnewurl(originurls, urlnew);

            //清空originurls数组
            originurls.splice(0, originurls.length);

            if (urlnew.length > 0) {
                nextround2();

                for (var i = 0; i < urlnew.length; i++) {
                    fetchurl(urlnew[i], rooturl, 2);
                }
            }
            else {
                console.log("all url done!!!!!!!")
            }


//           nextround();

        });

        /*console.log("newurl "+urlnew.length);*/
//       q.push(urlnew);
    }

    function nextround2() {
        ep2.after("overone", urlnew.length, function (content) {
//            console.log("new url count is "+urlnew.length);
//            console.log("all url count is "+urlall.length);
//            console.log("out url count is "+urlout.length);
//            console.log("visited url count is "+urlvisited.length+"\n");
            //清空urlnew数组
            urlnew.splice(0, urlnew.length);

            //检测抓取到得URL里面是否有重复的URL,若有,则去重
            norepeaturl(originurls);

            //检测去重后的URL是否已经存在了，最终返回urlnew是下一轮去爬的
            isnewurl(originurls, urlnew);

            //清空originurls数组
            originurls.splice(0, originurls.length);

            if (urlnew.length > 0) {
                nextround();

                for (var i = 0; i < urlnew.length; i++) {
                    fetchurl(urlnew[i], rooturl, 1);
                }
            }
            else {
                console.log("all url done!!!!!!!")
            }

//           nextround();

        });

        /*console.log("newurl "+urlnew.length);*/
//       q.push(urlnew);
    }

    nextround();

    //初次爬取
    for (var i = 0; i < urlnew.length; i++) {
        fetchurl(urlnew[i], rooturl, 1);
    }


}

function fetchurl(oneurl, rooturl, tag) {

    /*console.log("-----开始 "+oneurl.linkaddress);*/

    if (oneurl.linkaddress.indexOf("rorokuku.info") != -1) { //确保在root域名下
        console.log("+++++ " + oneurl.linkname + "  " + oneurl.linkaddress);
        urlvisited.push(oneurl);
        urlall.push(oneurl);
        request(oneurl.linkaddress, function (error, response, body) {

            if (!error && response.statusCode == 200) {

                var $ = cheerio.load(body);

                $("a").each(function (i, e) {
                    if (!$(e).attr("href") || $(e).attr("href").indexOf("void(0)") != -1) {

                    }
                    else {

                        var jpos = $(e).attr("href").indexOf("#");

                        if (jpos == -1) {

                            var ourl = {
                                "linkname": $(e).text().trim() ? $(e).text().trim() : "noname",
                                "linkaddress": url.resolve(rooturl, $(e).attr("href"))
                            };
                            originurls.push(ourl);
                        }
                        else {

                            var ourl = {
                                "linkname": $(e).text().trim() ? $(e).text().trim() : "noname",
                                "linkaddress": url.resolve(rooturl, $(e).attr("href").substring(0, jpos))
                            };
                            originurls.push(ourl);
                        }
                    }


                })

            }
            if (tag == 1) {
                ep.emit("overone", body);
            }
            else if (tag == 2) {
                ep2.emit("overone", body);
            }

        })

    }
    else {
        console.log("----- " + oneurl.linkname.replace(/\s/g, "") + "  " + oneurl.linkaddress);
        urlout.push(oneurl);
        if (tag == 1) {
            ep.emit("overone", "not skyroam.cn content");
        }
        else if (tag == 2) {
            ep2.emit("overone", "not skyroam.cn content");
        }

    }


}

//将每一个获得的URL列表去重
function norepeaturl(urls) {
    for (var i = 0; i < urls.length - 1; i++) {
        var url1 = urls[i].linkaddress;
        for (var j = i + 1; j < urls.length; j++) {
            var url2 = urls[j].linkaddress;
            if (url1 == url2) {
                /*console.log(url1+" same as "+url2);*/
                urls.splice(j, 1);
                j--;
            }
        }
    }
}

//判断是否已存在于URL列表,若是,则忽略;若之前没有此url,则加入newurl列表
function isnewurl(originurls, urlnew) {
    for (var oneurl in originurls) {
        if (!isurlexist(originurls[oneurl], urlall) /*&& (!isurlexist(originurls[oneurl],urlwait))*/) {
            urlnew.push(originurls[oneurl]);
        }
        else {
            /*console.log(originurls[oneurl].linkaddress+" exist in urlvisited!");*/
        }
    }


}
//判断一个URL是否在一个URL列表中
function isurlexist(url, urls) {
    for (var oneurl in urls) {
        if (url.linkaddress == urls[oneurl].linkaddress) {
            return true;
        }
    }
    return false;
}

exports.visiturls = visiturls;


