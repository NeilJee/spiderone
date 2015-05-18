/**
 * Created by songgh8316 on 15-5-4.
 */
var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var url = require("url");


var urlvisited = [],urlall=[],urlout=[];

function visiturls(rooturl) {
    //将根节点转化为name和link的形式,后续爬到得URL都以此种形式保存
    var rurl = {
        linkname: "rootweb",
        linkaddress: rooturl
    };


    var q = async.queue(function (task, callback) {
        /*var urlnew=[];*/
        fetchurl(task, rooturl, q);

    }, 100);

    q.push(rurl);
    urlvisited.push(rurl);

    q.drain = function () {

    }

}

function fetchurl(oneurl, rooturl, q) {
    var originurls = [];
    var urlnew = [];
     /*console.log("-----开始 "+oneurl.linkaddress);*/

    if(oneurl.linkaddress.indexOf("skyroam.com.cn")!=-1){
        console.log("----- "+oneurl.linkaddress);
        urlvisited.push(oneurl);
        request(oneurl.linkaddress, function (error, response, body) {

            if (!error && response.statusCode == 200) {

                var $ = cheerio.load(body);

                $("a").each(function (i, e) {
                    if (!$(e).attr("href") || $(e).attr("href").indexOf("void(0)") !=-1) {

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


                //检测抓取到得URL里面是否有重复的URL,若有,则去重
                norepeaturl(originurls);
                //检测去重后的URL是否已经存在了
                isnewurl(originurls, urlnew);

                for (var i = 0; i < urlnew.length; i++) {
                    urlall.push(urlnew[i]);
                }

                q.push(urlnew);
                /*   for(var i=0;i<urlnew.length;i++){
                 console.log(urlnew[i].linkaddress)
                 }*/




            }
        })

    }
    else{
        /*console.log(oneurl.linkaddress);*/
        urlout.push(oneurl);
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
        else{
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


