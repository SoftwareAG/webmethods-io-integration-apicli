/*
 * webMethods.io CLI
 * Copyright 2022 Software AG
 * Apache-2.0
 */
const { Command, Option } = require('commander');
const { exit } = require('process');
const readline = require('readline-sync');
var project = require('./projects.js');
var role = require('./roles.js');
var user = require('./users.js');
var wf = require('./workflow.js');
var theme = require('./themes.js');
var recipe = require('./recipe.js');
var flowservice = require('./flowservice.js');
var experimental = require('./experimental.js');
const { setLogLevel } = require('./debug.js');

dbg = require('./debug.js');
prettyprint = false;
proxy = undefined;
caCertFile = undefined;
ignoreTLS = false;

var compat = false;

var tenantDomain;
var tenantUser;
var tenantPw;


function readFromConsole(question,isPassword)
{
  var answer;
  if(isPassword !== undefined && isPassword!==null && isPassword==true)
  {
    answer = readline.question("\x1b[32m" + question + "\x1b[0m",{hideEchoBack: true});
  }
  else
  {
    answer = readline.question("\x1b[32m" + question + "\x1b[0m");
  }
  return answer;
}

function checkOptions(){

  if(program.opts().proxy !== undefined)
  {
    proxy = program.opts().proxy;
    debug("Using Proxy: " + proxy);
  }
  if(program.opts().caCert !== undefined)
  {
    caCertFile = program.opts().caCert;
    debug("Using CA Cert File: " + caCertFile);
  }

  ignoreTLS = program.opts().ignoreTLSErrors;



  if(program.opts().prettyprint == true)
  {
    prettyprint = true;
  }

  var levelInput = program.opts().loglevel
  if(program.opts().verbose == true)
  {
    levelInput = "DEBUG";
  }

  if(levelInput == undefined && !program.opts().verbose){
    levelInput = "OFF";
  }
  else
  {
    switch (levelInput)
    {
      case "OFF":
        dbg.setLogLevel(0);
        break;
      case "ERROR":
        dbg.setLogLevel(1);
        break;
      case "WARN":
        dbg.setLogLevel(2);
        break;
      case "INFO":
        dbg.setLogLevel(3);
        break;
      case "DEBUG":
        dbg.setLogLevel(4);
        break;    
      default:
        console.log("-level incorrectly set, should be one of: OFF, ERROR, WARN, INFO, DEBUG");
        process.exit(1);
    }
  }  

  if(program.opts().domain == undefined){
    tenantDomain = readFromConsole('Please type your tenant domain name: ');
  }
  else{
    tenantDomain = program.opts().domain
    if(tenantDomain.indexOf("http")==0){
      console.log("Please provide the tenant domain name only (without https:// prefix and any URL suffix\ne.g. 'tenant.int-aws-us.webmethods.io'");
      process.exit(1);
    }
  }

  if(program.opts().user == undefined){
    tenantUser = readFromConsole('Please type your tenant User ID: ');
  }
  else{
    tenantUser = program.opts().user
  }

  if(program.opts().password == undefined){
    tenantPw = readFromConsole('Please type your tenant User Password: ',true);
  }
  else{
    tenantPw = program.opts().password
  }

}

function debug(message){
  dbg.message("<MAIN> " + message,4);
}
const program = new Command();

program

//Program Info
  .version('2022.07.3')

//required options
  .option('-d, --domain <tenantDomain>', 'Tenant Doamin Name, e.g. "tenant.int-aws-us.webmethods.io"')
  .option('-u, --user <userid>', 'Tenant User ID')
  .option('-p, --password <password>', 'Tenant User Password')
  //.requiredOption('-p, --password <password>', 'Tenant User Password')
    
//options
  .addOption(new Option('-t, --timeout <delay>', 'timeout in seconds').default(60, 'one minute'))
  .option('--prettyprint','Pretty Print JSON output')
  .option('--verbose','Enables full debug mode (replaced by --loglevel DEBUG)')
  .option('--loglevel <level>','Change the logging level of DEBUG, INFO,WARN,ERROR,OFF (default being off)')

  .option('--proxy <proxyURL>','URL for proxy server if required')
  .option('--caCert <path-to-cert>','Path to a CACert PEM file if required')
  .option('--ignoreTLSErrors','Ignore TLS errors')

  
//Additional help
  .addHelpText('before', `
\x1b[34m┌──────────────────────────────────────────────────────────────────────────────┐
│\x1b[36m webMethods.io Integration API CLI tool\x1b[0m\x1b[34m                                       │
│\x1b[0m This tool provides command line access to the webMethods.io Integration APIs\x1b[34m │
│\x1b[0m Intended to aid usage within DevOps Scenarios for asset deployment          \x1b[34m │
└──────────────────────────────────────────────────────────────────────────────┘\x1b[0m


  `)

  .addHelpText('after', `

Examples:

\x1b[4mHelp\x1b[0m

\x1b[32mShow the command line help:\x1b[0m
$ node wmiocli.js --help

`
    + project.help()
    + wf.help()
    + flowservice.help()
    + role.help()
    + recipe.help() 
    + theme.help()
)   

  .showSuggestionAfterError()
;

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * PROJECT
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
program.command('project [project-name]')
.description('Lists all projects or view an individual project, specified via project name or uid')
.action((projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.list(projectName);
  if(resp)console.log(resp);
});  

program.command('project-assets <project-name>')
.description('Lists project assets from given project name or uid')
.action((projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.listAssets(projectName);
  if(resp)console.log(resp);
});  

program.command('project-assets-detailed <project-name>')
.description('Lists project assets (All Details) from given project name or uid')
.action((projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.listAssetsDetailed(projectName);
  if(resp)console.log(resp);
});  

program.command('project-create <project-name>')
.description('Create project with given name')
.action((projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.create(projectName);
});

program.command('project-update <project-id> <project-name>')
.description('Update project with new name')
.action((projectId, projectName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.update(projectId, projectName);
});

program.command('project-delete <project-id>')
.description('Delete project with given id')
.action((projectId) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.del(projectId);
});

program.command('project-publish <project-id> <publish-name> <target-tenant-domain-name> <target-user-id> <target-user-password> <assets-json>')
.description('Pubilsh project to another tenant with given id')
.action((projectId,publishName,targetTenantDomainName,targetUserId,targetUserPassword,assetsJson) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.pub(projectId,publishName,targetTenantDomainName,targetUserId,targetUserPassword,assetsJson);
        
});

program.command('project-deploy <projectName> <version>')
.description('deploy published project with given version into tenant')
.action((projectName, version) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.deploy(projectName,version);
});

program.command('project-param <project-name> [param-uid]')
.description('Lists all project parameters from given project name, or specific parameter with given parameter uid')
.action((projectName,paramName) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.listParam(projectName,paramName);
  if(resp)console.log(resp);
});  

program.command('project-param-create <project-name> <param-name> <param-value> <required> <is-password>')
.description('Creates a project parameter with given values')
.action((projectName,paramName,paramValue,required,isPassword) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  boolReq = false;
  boolIsPass = false;
  if(required.toUpperCase()=="TRUE")boolReq = true;
  if(isPassword.toUpperCase()=="TRUE")boolIsPass = true;
  var resp = project.createParam(projectName,paramName,paramValue,boolReq,boolIsPass);
  if(resp)console.log(resp);
});  

program.command('project-param-update <project-name> <param-uid> <param-name> <param-value> <required> <is-password>')
.description('Updates a project parameter matching the provided UID with given values')
.action((projectName,paramUid,paramName,paramValue,required,isPassword) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  boolReq = false;
  boolIsPass = false;
  if(required.toUpperCase()=="TRUE")boolReq = true;
  if(isPassword.toUpperCase()=="TRUE")boolIsPass = true;
  var resp = project.updateParam(projectName,paramUid,paramName,paramValue,boolReq,boolIsPass);
  if(resp)console.log(resp);
});

program.command('project-param-delete <project-name> <param-uid>')
.description('Deletes a project parameter mathcing the given paramater uid')
.action((projectName,paramUid) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = project.deleteParam(projectName,paramUid);
  if(resp)console.log(resp);
}); 


program.command('project-webhooks-list <project-id>')
.description('List webhooks in a project')
.action((projectId) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.listWebhooks(projectId);
});

program.command('project-webhooks-regenerate <project-id> <workflow-uid>')
.description('Regenerate a webhook in a project for a given workflow UID')
.action((projectId,workflowUid) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.regenWebhook(projectId,workflowUid);
});

program.command('project-webhooks-auth <project-id> <workflow-uid> <auth-type>')
.description('Set authenatication type (none,login,token) for a webhook in a project for a given workflow UID')
.action((projectId,workflowUid,authType) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.setWebhookAuth(projectId,workflowUid,authType);
});

program.command('project-triggers-list <project-id>')
.description('Provide a list of triggers within a project')
.action((projectId) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.listTriggers(projectId);
});

program.command('project-triggers-delete <project-id> <trigger-id>')
.description('Delete a trigger within a project with the given IDs')
.action((projectId,triggerId) => {
  checkOptions();
  project.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  project.deleteTrigger(projectId,triggerId);
});


/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * ROLES
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
program.command('role [role-id]')
.description('Lists all roles or views an individual role')
.action((roleId) => {
  checkOptions();
  role.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  var resp = role.list(roleId);
  if(resp)console.log(resp);
});  

program.command('role-create <role-name> <role-description> <roles-list>')
.description('Create roles and specify the permissions for that role. Roles-list should be provided as follows projectName,r,w,e;project name 2,r;')
.action((roleName,roleDescription,rolesList) => {
  checkOptions();
  role.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  role.insert(roleName,roleDescription, rolesList);
});  

program.command('role-update <role-id> <role-name> <role-description> <roles-list>')
.description('Create roles and specify the permissions for that role. Roles-list should be provided as follows projectName,r,w,e;project name 2,r;')
.action((roleId, roleName,roleDescription,rolesList) => {
  checkOptions();
  role.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  role.update(roleId, roleName,roleDescription, rolesList);
});

program.command('role-delete <roleId>')
.description('Delete a roles with the given role id')
.action((roleId) => {
  checkOptions();
  role.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  role.del(roleId);
});  

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * USERS
 * ------------------------------------------------------------------------------------------------------------------------------------
 */

/**
 * Needs user-id adding.
 */
program.command('user')
.description('Lists all users')
.action(() => {
  checkOptions();
  user.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  user.list(undefined);
});

program.command('user-role-assignment <user-id> <role-names>')
.description('Assigns a user to roles')
.action((userId,roleNames) => {
  checkOptions();
  debug("userId: " + userId);
  debug("Roles: " + roleNames);
  user.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint);
  user.assignRoles(userId,roleNames);
});

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * WORKFLOW IMPORT/EXPORT/DELETE/EXECUTE/STATUS/CREATE
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
program.command('workflow-export <project-id> <workflow-id> <filename>')
.description('Export workflow with id <workflow-id> from project <project-id>')
.action((projectId, workflowId, filename) => {
  checkOptions();
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  wf.exportwf(workflowId,filename);
});

program.command('workflow-import <project-id> <filename>')
.description('Import workflow into project <project-id> from file <filename>')
.action((projectId, filename) => {
  checkOptions();
  debug("Importing Workflow");
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  wf.importwf(filename);
});

program.command('workflow-delete <project-id> <workflow-id>')
.description('Delete workflow <workflow-id> from project <project-id>')
.action((projectId, workflowId) => {
  checkOptions();
  debug("Deleting Workflow [" + workflowId + "]");
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  wf.deletewf(workflowId);
});

program.command('workflow-execute <project-id> <workflow-id>')
 .description('Execute workflow <workflow-id> from project <project-id>')
.action((projectId, workflowId) => {
  checkOptions();
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  wf.runwf(workflowId)
});

program.command('workflow-status <project-id> <run-id>')
.description('Gets Execution status for workflow execution <run-id>')
.action((projectId, runId) => {
  checkOptions();
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,projectId);
  wf.statuswf(runId);
});

program.command('workflow-create <project-id> <worfklow-name> <workflow-description>')
.description('Creates a blank workflow with the given name/description')
.action((projectId, workflowName,workflowDescription) => {
  checkOptions();
  wf.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,projectId);
  wf.createwf(workflowName,workflowDescription);
});

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * FLOW SERVICE IMPORT/EXPORT/DELETE/EXECUTE
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
program.command('flowservice-export <project-id> <flow-name> <file-name>')
.description('Export FlowService with name <flow-name> from project <project-id>')
.action((projectId, flowName,filename) => {
  checkOptions();
  flowservice.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  flowservice.exportFlowService(flowName,filename);
});

program.command('flowservice-import <project-id> <filename>')
.description('Import FlowService from <filename> into project <project-id>')
.action((projectId, filename) => {
  checkOptions();
  flowservice.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  flowservice.importFlowService(filename);
});

program.command('flowservice-delete <project-id> <flow-name>')
.description('Delete FlowService <flow-name> from project <project-id>')
.action((projectId, flowName) => {
  checkOptions();
  flowservice.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  flowservice.deleteFlowService(flowName);
});

program.command('flowservice-execute <project-id> <flow-name> [input-json]')
 .description('Execute FlowService <flow-name> from project <project-id> with data <input-json>')
.action((projectId, flowName,inputJson) => {
  checkOptions();
  flowservice.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint,projectId);
  flowservice.runFlowService(flowName,inputJson);
});

/**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * THEMES
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
 program.command('theme [theme-uid]')
 .description('Lists themes or views an individual theme, specified via uid')
 .action((themeUid) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.list(themeUid);
 });  
 
 
 program.command('theme-create <theme-name> <theme-description> <theme-object> [footer-text] [about-page]')
 .description('Create theme with given data')
 .action((themeName,themeDescription,themeObject,footerText,aboutPage) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.create(themeName,themeDescription,themeObject,footerText,aboutPage);
 });

 program.command('theme-update <theme-uid> <theme-name> <theme-description> <theme-object> [footer-text] [about-page]')
 .description('Update theme with the given UID with given data')
 .action((themeUid, themeName,themeDescription,themeObject,footerText,aboutPage) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.update(themeUid, themeName,themeDescription,themeObject,footerText,aboutPage);
 });

 program.command('theme-delete <theme-uid>')
 .description('Delete theme with the given UID')
 .action((themeUid) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.del(themeUid);
 });

 program.command('theme-activate <theme-uid>')
 .description('Activate theme with the given UID')
 .action((themeUid) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.activate(themeUid);
 });

 program.command('theme-deactivate <theme-uid>')
 .description('Deactivate theme with the given UID')
 .action((themeUid) => {
   checkOptions();
   theme.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   theme.deactivate(themeUid);
 });

 /**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * Recipes
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
 
 program.command('recipe [recipe-uid]')
 .description('List all Workflow recipes, or get a single recipe with a given recipe UID')
 .action((recipeUid) => {
   checkOptions();
   recipe.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   recipe.list(recipeUid);
 });

 program.command('recipe-delete <recipe-uid>')
 .description('Delete Workflow recipe with a given recipe UID')
 .action((recipeUid) => {
   checkOptions();
   recipe.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
   recipe.del(recipeUid);
 });

 program.command('recipe-create <filename>')
.description('Create Workfllow Receipt from file <filename>')
.action((filename) => {
  checkOptions();
  debug("Importing Workflow");
  recipe.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
  recipe.create(filename);
});

 /**
 * ------------------------------------------------------------------------------------------------------------------------------------
 * experimental non-public APIs
 * ------------------------------------------------------------------------------------------------------------------------------------
 */
  program.command('experimental-user',{hidden: true})
   .addHelpCommand("HELP")
   .description('Get User information')
   .action(() => {
      checkOptions();
      experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
      experimental.user();
  });

  program.command('experimental-stages',{hidden: true})
  .description('Get Stage information')
  .action(() => {
     checkOptions();
     experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
     experimental.stages();
  });

  program.command('experimental-project-workflows <project-id>',{hidden: true})
  .description('Get information about project workflows')
  .action((projectId) => {
      checkOptions();
      experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
      experimental.projectWorkflows(projectId);
  });

  program.command('experimental-project-flowservices <project-id>',{hidden: true})
  .description('Get information about project FlowServices')
  .action((projectId) => {
    checkOptions();
    experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
    experimental.projectFlowservices(projectId);
  });

  program.command('experimental-project-connector-accounts <project-id>',{hidden: true})
  .description('Get Information about project connector accounts')
  .action((projectId) => {
    checkOptions();
    experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
    experimental.connectorAccounts(projectId);
  });

  program.command('experimental-project-connector-account-wf-config <project-id>',{hidden: true})
  .description('Get configuration information about project connector accounts')
  .action((projectId) => {
    checkOptions();
    experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
    experimental.getProjectAccountConfig(projectId);
  });

  program.command('experimental-project-search <project-name>',{hidden: true})
  .description('Search project info by name')
  .action((projectName) => {
    checkOptions();
    experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
    experimental.searchProject(projectName);
  });

  program.command('experimental-project-deployments <project-id>',{hidden: true})
  .description('List all project deployments')
  .action((projectId) => {
    checkOptions();
    experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
    experimental.projectDeployments(projectId);
  });

  program.command('experimental-workflow-monitor [execution-status] [start-date] [end-date] [project-id] [workflow-id] ',{hidden: true})
  .description('List Workflow Monitor')
  .action((executionStatus,startDate,endDate,projectId,workflowId) => {
    checkOptions();
    experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
    experimental.getMonitorInfo(executionStatus,startDate,endDate,projectId,workflowId);
  });

  program.command('experimental-workflow-resubmit [restart-or-resume] [start-date] [end-date] [project-id] [workflow-id]',{hidden: true})
  .description('Resubmit workflows from monitor')
  .action((restartOrResume,startDate,endDate,projectId,workflowId) => {
    checkOptions();
    experimental.init(tenantDomain,tenantUser,tenantPw,program.opts().timeout,program.opts().prettyprint)
    experimental.workflowResubmit(restartOrResume, startDate, endDate, projectId,workflowId);
  });
  
  
  
program.parse();



