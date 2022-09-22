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
    dbg.message("<THEMES> " + message,4);
}

function help() {
    return `
\x1b[4mThemes\x1b[0m

\x1b[32mLists whitelabel themes\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    theme [theme-uid]

    The theme settings returned can be use as a way to create the theme.
    You can use jq to retrieve the theme settings by piping the output to jq, e.g.

    node wmiocli.js -d env -u user -p pass theme fl40018d9a1a273bb8aa92bf | jq -c .output.settings.theme > ~/dracula-theme.txt

\x1b[32mDeletes a whitelabel theme\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    theme-delete [theme-uid]  

\x1b[32mCreates a new whitelabel theme\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    theme-create dracula 'desc' [theme-settings] "Footer Text" "About Page"

    Theme settings can be used from the list example above, e.g.
    node wmiocli.js -d env -u user -p pass theme-create dracula7 'updated' "\`cat ~/dracula-theme.txt\`" 'Footer' 'About'

\x1b[32mUpdates a whitelabel theme\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    theme-update themeid dracula 'desc' [theme-settings] "Footer Text" "About Page"
    
    Theme settings can be used from the list example above, e.g.
    node wmiocli.js -d env -u user -p pass theme-update themeid dracula7 'updated' "\`cat ~/dracula-theme.txt\`" 'Footer' 'About'    

\x1b[32mActivates a whitelabel theme\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    theme-activate [theme-uid]  

\x1b[32mDeactivates a whitelabel theme\x1b[0m
$ node wmiocli.js 
    -d tenant.int-aws-us.webmethods.io 
    -u user
    -p password 
    theme-deactivate [theme-uid]

      `;
}

function checkForErrors(inBody) {
    //Error Codes
    //Any error response

}

function init(inDomainName, inUsername, inPassword, inTimeout, inPrettyprint) {
    domainName = inDomainName;
    username = inUsername;
    password = inPassword;
    timeout = inTimeout;
    prettyprint = inPrettyprint;
    url = "https://" + domainName + "/apis/v1/rest/themes";
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

function list(themeUid) {
    debug("List themeUid[" + themeUid + "]")
    if (themeUid) url += "/" + themeUid;
    request.get(url, username, password, timeout, processResponse);
}

function create(themeName, themeDescription, theme, footerContent, aboutPageContent) {
    debug("Create Name [" + themeName + "] Desc [" + themeDescription + "]");
    debug("Theme [" + theme + "]");
    debug("Footer [" + footerContent + "]");
    debug("About Page [" + aboutPageContent + "]");
    themeObj = JSON.parse(theme);
    var footer;
    var about;

    //If footer is not specified get it from the theme
    if (footerContent !== undefined && footerContent !== null) footer = footerContent
    else footer = themeObj.footerContent;

    //If about is not specified get it from the theme
    if (aboutPageContent !== undefined && aboutPageContent !== null) about = aboutPageContent
    else about = themeObj.aboutPageContent;

    //Remove footer/about page from the theme
    themeObj.footerContent = undefined;
    themeObj.aboutPageContent = undefined;

    //Remove default favIcon - causes issues
    if (themeObj.favIconFileName == "default-favicon.svg") {
        themeObj.favIconFileName = undefined;
        themeObj.favIconImage = undefined;
    }

    theme = JSON.stringify(themeObj);

    var jsonStr = "{";
    jsonStr += '"name":' + '"' + themeName + '",';
    jsonStr += '"description":' + '"' + themeDescription + '",';
    jsonStr += '"theme":' + theme;
    jsonStr += ',';
    jsonStr += '"footerContent":' + '"' + footerContent + '",';
    jsonStr += '"aboutPageContent":' + '"' + aboutPageContent + '"';
    jsonStr += "}";
    data = JSON.parse(jsonStr);
    request.post(url, username, password, timeout, data, processResponse);
}

function update(themeUid, themeName, themeDescription, theme, footerContent, aboutPageContent) {
    debug("Update Theme UID [" + themeUid + "]");
    url += "/" + themeUid;

    themeObj = JSON.parse(theme);
    var footer;
    var about;

    //If footer is not specified get it from the theme
    if (footerContent !== undefined && footerContent !== null) footer = footerContent
    else footer = themeObj.footerContent;

    //If about is not specified get it from the theme
    if (aboutPageContent !== undefined && aboutPageContent !== null) about = aboutPageContent
    else about = themeObj.aboutPageContent;

    //Remove footer/about page from the theme
    themeObj.footerContent = undefined;
    themeObj.aboutPageContent = undefined;

    //Remove default favIcon - causes issues
    if (themeObj.favIconFileName == "default-favicon.svg") {
        themeObj.favIconFileName = undefined;
        themeObj.favIconImage = undefined;
    }

    theme = JSON.stringify(themeObj);

    var jsonStr = "{";
    jsonStr += '"name":' + '"' + themeName + '",';
    jsonStr += '"description":' + '"' + themeDescription + '",';
    jsonStr += '"theme":' + theme;
    jsonStr += ',';
    jsonStr += '"footerContent":' + '"' + footerContent + '",';
    jsonStr += '"aboutPageContent":' + '"' + aboutPageContent + '"';
    jsonStr += "}";
    data = JSON.parse(jsonStr);
    request.put(url, username, password, timeout, data, processResponse);
}

function del(themeUid) {
    debug("Delete Theme UID [" + themeUid + "]");
    url += "/" + themeUid;
    var data = {};
    request.httpDelete(url, username, password, timeout, data, processResponse);
}

function activate(themeUid) {
    debug("Activate Theme UID [" + themeUid + "]");
    url += "/" + themeUid + "/activate";
    var data = {};
    request.put(url, username, password, timeout, data, processResponse);
}

function deactivate(themeUid) {
    debug("Deactivate Theme UID [" + themeUid + "]");
    url += "/" + themeUid + "/deactivate";
    var data = {};
    request.put(url, username, password, timeout, data, processResponse);
}

//, update, del, default, activate, deactivate
module.exports = { help, init, list, create, update, del, activate, deactivate };
