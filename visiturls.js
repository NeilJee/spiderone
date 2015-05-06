/**
 * Created by songgh8316 on 15-5-4.
 */
var request = require("request");
var cheerio = require("cheerio");
var async = require("async");
var url = require("url");


var urlvisited = [],urlall=[],urlout=[];

function visiturls(rooturl) {
    var rurl = {
        linkname: "rootweb",
        linkaddress: rooturl
    };
    /*    function onecallback(urlnew){
     console.log("new new "+urlnew.length);
     q.push(urlnew,onecallback);
     for(var i=0;i<urlnew.length;i++){
     urlvisited.push(urlnew[i]);
     }
     }*/

    var q = async.queue(function (task, callback) {
        /*var urlnew=[];*/
        fetchurl(task, rooturl, q);

        /*callback(urlnew);*/
        /*q.push(urlnew);
         for(var i=0;i<urlnew.length;i++){
         urlvisited.push(urlnew[i]);
         }*/

    }, 100);

    q.push(rurl);
    urlvisited.push(rurl);

    q.drain = function () {
        /*console.log("urlall length is " + urlall.length);
        for (var i = 0; i < urlall.length; i++) {
            console.log(urlall[i].linkname + " " + urlall[i].linkaddress)
        }
        console.log("urlvisited length is " + urlvisited.length);
        for (var i = 0; i < urlvisited.length; i++) {
            console.log(urlvisited[i].linkname + " " + urlvisited[i].linkaddress)
        }*/
        /*console.log("urlout length is " + urlout.length);*/
        /*for (var i = 0; i < urlout.length; i++) {
            console.log(urlout[i].linkname + " " + urlout[i].linkaddress)
        }*/


    }
    /*    q.empty=function(){
     for(var i=0;i<urlvisited.length;i++){
     console.log("empty "+urlvisited[i].linkname+" "+urlvisited[i].linkaddress)
     }
     }*/


    /*        async.eachLimit(urlwait,5,function(url,callback){
     fetchurl(url,rooturl);

     },function(error){
     if(error){
     console.log("visiturl error");
     }
     else{

     console.log("one circle just finished");
     }

     })*/


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


                /* console.log("origin count "+originurls.length);
                 for(var one in originurls){
                 console.log(originurls[one].linkaddress);
                 }*/
                norepeaturl(originurls);
                /*console.log("origin2 count "+originurls.length);

                 for(var one in originurls){
                 console.log(originurls[one].linkaddress);
                 }*/
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

//判断是否已存在于抓过的URL列表和等待抓取的URL列表,若是,则不加入newurl列表;若之前没有此url,则加入newurl列表
function isnewurl(originurls, urlnew) {
    for (var oneurl in originurls) {
        if (!isurlexist(originurls[oneurl], urlall) /*&& (!isurlexist(originurls[oneurl],urlwait))*/) {
            urlnew.push(originurls[oneurl]);
        }
        else{
            /*console.log(originurls[oneurl].linkaddress+" exist in urlvisited!");*/
        }
    }

    /*console.log("new url count " + urlnew.length);*/

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


