01 /*
02  * webMethods.io CLI
03  * Copyright 2021 Software AG
04  * Apache-2.0
05  */

var debug = false;
function enableDebug(){
    debug = true;
 }

function message(inMessage)
{
    if(debug==true){
        console.log("<WMIOCLI>." + inMessage);
    }
}

module.exports = { enableDebug, message };