/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const rest = require('./rest.js');
const dbg = require('./debug.js');


var domainName, username,password,timeout,prettyprint;
var url;

function debug(message){
    dbg.message("<RECIPE> " + message);
}

function init(inDomainName, inUsername, inPassword,inTimeout,inPrettyPrint){
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyPrint;
    url = "https://" + domainName + "/apis/v1/rest/recipes" ;
    debug("Username [" + username + "]");
    debug("URL      [" + url + "]");
    debug("Timeout  [" + timeout + "]");
}

/**
 * Call back function to process REST response
 * @param {return data from REST request} data 
 * @param {status} status 
 */
 function processResponse(data,status){
    if(prettyprint==true){
        console.log(JSON.stringify(data,null,4));
    }
    else{
        console.log(JSON.stringify(data));
    }
    
    if(status!=0){
        process.exit(status);
    }
}

function create(filename){
    debug("Creating Recipe from file [" + filename + "]");
    rest.postUploadFile(url,username,password,timeout,undefined,filename,processResponse);
}

function list(recipeUid){
    if(recipeUid)url+="/" + recipeUid;
    debug("List Recipes [" + recipeUid + "]");
    rest.get(url,username,password,timeout,processResponse); 
}


function del(recipeUid){
    debug("Deleting Recipe with ID [" + recipeUid + "]");
    url += "/" + recipeUid;
    rest.del(url,username,password,timeout,{},processResponse);
}

module.exports = { init, list, del, create };
