/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

const request = require('./rest.js');


var domainName, username, password, timeout;
var prettyprint = false;
var url;

function debug(message) {
    dbg.message("<ACCOUNTS> " + message,4);
}

function help() {
    return `
\x1b[4mAccounts\x1b[0m

\x1b[32mGet Accounts:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    account


\x1b[32mDelete an Account:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    account-delete accountUid

\x1b[32mDelete an Account:\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user 
    -p password 
    account-update accountUid    
`;
}
function init(inDomainName, inUsername, inPassword, inTimeout, inPrettyprint) {
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;

    url = "https://" + domainName + "/apis/v1/rest/projects";
    debug("Username [" + username + "]");
    debug("URL      [" + url + "]");
    debug("Timeout  [" + timeout + "]");
}

/**
 * Call back function to process REST response
 * @param {return data from REST request} data 
 * @param {status} status 
 */
function processResponse(data, status) {
    if (prettyprint == true) {
        console.log(JSON.stringify(data, null, 4));
    }
    else {
        console.log(JSON.stringify(data));
    }

    if (status != 0) {
        process.exit(status);
    }
}

/* Accounts */
function getAccount(projectId) {

    url +="/" + projectId + "/accounts";
    request.get(url, username, password, timeout, processResponse);
}

function deleteAccount(projectId,accountUid) {

    url +="/" + projectId + "/accounts/" + accountUid;
    request.del(url, username, password, timeout,null, processResponse);
}

/**
 * To be completed
 * @param {} projectId 
 * @param {*} accountUid 
 */
function updateConfiguration(projectId,accountUid) {

    //url +="/" + projectId + "/accounts/" + accountUid;
    //request.del(url, username, password, timeout,null, processResponse);
}



module.exports = {
    help, init, getAccount, deleteAccount
};
