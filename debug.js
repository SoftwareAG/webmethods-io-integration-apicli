/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */


const white = "\x1b[37m";
const Dim = "\x1b[2m";
const Reset = "\x1b[0m";
const Green = "\x1b[32m";
const Red = "\x1b[31m";
const Cyan = "\x1b[36m";
const Yellow = "\x1b[33m"


const lvl_permanent = -1;
const lvl_off = 0;
const lvl_error = 1;
const lvl_warning = 2;
const lvl_info = 3;
const lvl_debug = 4;


var defaultLevel = 0;
activeLevel = 0;

const prefix ="<WMIOCLI>";

function enableDebug(){
    // console.log(Yellow + "ENABLED DEBUG" + Reset );
    setLogLevel(lvl_debug);
}

function setLogLevel(inLevel){

    activeLevel = inLevel;
    // console.log(Yellow + "SETTING ACTIVE LEVEL TO: " + inLevel );
    // console.log(Yellow + "SETTING: " + activeLevel );
}

function message(inMessage,level)
{

    // console.log(Green + "DEBUG Level:" + level + Reset );
    var message = inMessage;
    if(level==undefined)level = 4;
    if(level==lvl_permanent)console.log(message);
    else
    {
        // console.log(Green + "Using Level:" + level + Reset );
        // console.log(Green + "Defau Level:" + defaultLevel + Reset );


        if(level>activeLevel)return;
        switch (level)
        {
            case lvl_off:
                //Nothing to do
                break;

            case lvl_debug:
                message = Dim + "DEBUG:" + prefix +":"+ inMessage + Reset; 
                console.log(message);
                break;

            case lvl_info:
                message = white + "INFO:" + prefix +":"+ inMessage + Reset;
                console.log(message);
                break;

            case lvl_warning:
                message = Yellow + "WARN:" + prefix +":"+ inMessage + Reset; 
                console.log(message);
                break;

            case lvl_error:
                message = Red + "ERROR:" + prefix + inMessage + Reset;
                console.log(message); 
                break;
        }
        
    }


    
    
}


module.exports = { enableDebug, message, setLogLevel };
