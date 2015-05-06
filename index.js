/**
 * Created by songgh8316 on 15-5-4.
 */

var visiturls=require("./visiturls");

var rooturl="http://www.skyroam.com.cn/";

(function Spider(rooturl){


    if(!rooturl){
        console.log("no rooturl set, please set the website you want to visit.");
        return ;
    }
    else{

        visiturls.visiturls(rooturl);

    }

})(rooturl);

