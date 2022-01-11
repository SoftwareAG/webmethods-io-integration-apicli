/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */

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
