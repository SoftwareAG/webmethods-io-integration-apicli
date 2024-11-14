# About
This is a Node CLI tool allowing you to utilize the webMethods.io Integration public APIs from a command line.
This requires you to provide your tenant domain name, along with a user and password that has the appropriate permissions to call the API.
The --help parameter provides further information on how to use this along with some examples of its usage.

This CLI tool has been tested against
* webMethods.io Integration v11.0.3

# License
This project is licensed under the Apache 2.0 License - see the LICENSE file for details
These tools are provided as-is and without warranty or support. They do not constitute part of the Software AG product suite. Users are free to use, fork and modify them, subject to the license agreement. While Software AG welcomes contributions, we cannot guarantee to include every contribution in the master project.

Contact us via the TECHcommunity (https://techcommunity.softwareag.com/) if you have any questions.
 
# Installation
```
git clone https://github.com/SoftwareAG/webmethods-io-integration-apicli.git
cd webmethods-io-integration-apicli
npm install
node wmiocli.js --help
```

# Usage

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ webMethods.io Integration API CLI tool                                       │
│ This tool provides command line access to the webMethods.io Integration APIs │
│ Intended to aid usage within DevOps Scenarios for asset deployment           │
└──────────────────────────────────────────────────────────────────────────────┘



Usage: wmiocli [options] [command]

Options:
  -V, --version                                                                                                                              output the version number
  -d, --domain <tenantDomain>                                                                                                                Tenant Doamin Name, e.g. "tenant.int-aws-us.webmethods.io"
  -u, --user <userid>                                                                                                                        Tenant User ID
  -p, --password <password>                                                                                                                  Tenant User Password
  -s, --start <position>                                                                                                                     Index of where to start the return of data (default 0)
  -l, --count <count>                                                                                                                        Count of items to return (default 1000)
  -t, --timeout <delay>                                                                                                                      timeout in seconds (default: one minute)
  --prettyprint                                                                                                                              Pretty Print JSON output
  --verbose                                                                                                                                  Enables full debug mode (replaced by --loglevel DEBUG)
  --loglevel <level>                                                                                                                         Change the logging level of DEBUG, INFO,WARN,ERROR,OFF (default being off)
  --proxy <proxyURL>                                                                                                                         URL for proxy server if required
  --caCert <path-to-cert>                                                                                                                    Path to a CACert PEM file if required
  --ignoreTLSErrors                                                                                                                          Ignore TLS errors
  --experimental                                                                                                                             Provide help information on experimental commands
  -h, --help                                                                                                                                 display help for command

Commands:
  project [project-name]                                                                                                                     Lists all projects or view an individual project, specified via project name or uid
  project-assets <project-name>                                                                                                              Lists project assets from given project name or uid
  project-assets-detailed <project-name>                                                                                                     Lists project assets (All Details) from given project name or uid
  project-create <project-name>                                                                                                              Create project with given name
  project-update <project-id> <project-name>                                                                                                 Update project with new name
  project-delete <project-id>                                                                                                                Delete project with given id
  project-publish <project-id> <publish-name> <target-tenant-domain-name> <target-user-id> <target-user-password> <assets-json>              Pubilsh project to another tenant with given id
  project-deploy <projectName> <version>                                                                                                     deploy published project with given version into tenant
  project-param <project-name> [param-uid]                                                                                                   Lists all project parameters from given project name, or specific parameter with given parameter uid
  project-param-create <project-name> <param-name> <param-value> <required> <is-password>                                                    Creates a project parameter with given values
  project-param-update <project-name> <param-uid> <param-name> <param-value> <required> <is-password>                                        Updates a project parameter matching the provided UID with given values
  project-param-delete <project-name> <param-uid>                                                                                            Deletes a project parameter mathcing the given paramater uid
  project-webhooks-list <project-id>                                                                                                         List webhooks in a project
  project-webhooks-regenerate <project-id> <workflow-uid>                                                                                    Regenerate a webhook in a project for a given workflow UID
  project-webhooks-auth <project-id> <workflow-uid> <auth-type>                                                                              Set authenatication type (none,login,token) for a webhook in a project for a given workflow UID
  project-triggers-list <project-id>                                                                                                         Provide a list of triggers within a project
  project-triggers-delete <project-id> <trigger-id>                                                                                          Delete a trigger within a project with the given IDs
  project-ref-data <project-id> [ref-data-name]                                                                                              lists/gets reference data in a project
  project-ref-data-add <project-id> <ref-data-name> <ref-data-description> <filename> [field-separator] [text-qualifier] [file-encoding]     Adds reference data
  project-ref-data-update <project-id> <ref-data-name> <ref-data-description> <filename> [field-separator] [text-qualifier] [file-encoding]  Updates reference data
  project-ref-data-delete <project-id> <ref-data-name>                                                                                       Updates reference data
  project-export <project-id>                                                                                                                Exports a project
  role [role-id]                                                                                                                             Lists all roles or views an individual role
  role-create <role-name> <role-description> <roles-list>                                                                                    Create roles and specify the permissions for that role. Roles-list should be provided as follows projectName,r,w,e;project name
                                                                                                                                             2,r;
  role-update <role-id> <role-name> <role-description> <roles-list>                                                                          Create roles and specify the permissions for that role. Roles-list should be provided as follows projectName,r,w,e;project name
                                                                                                                                             2,r;
  role-delete <roleId>                                                                                                                       Delete a roles with the given role id
  user                                                                                                                                       Lists all users
  user-role-assignment <user-id> <role-names>                                                                                                Assigns a user to roles
  workflow-export <project-id> <workflow-id> <filename>                                                                                      Export workflow with id <workflow-id> from project <project-id>
  workflow-import <project-id> <filename>                                                                                                    Import workflow into project <project-id> from file <filename>
  workflow-delete <project-id> <workflow-id>                                                                                                 Delete workflow <workflow-id> from project <project-id>
  workflow-execute <project-id> <workflow-id>                                                                                                Execute workflow <workflow-id> from project <project-id>
  workflow-status <project-id> <run-id>                                                                                                      Gets Execution status for workflow execution <run-id>
  workflow-create <project-id> <worfklow-name> <workflow-description>                                                                        Creates a blank workflow with the given name/description
  flowservice-export <project-id> <flow-name> <file-name>                                                                                    Export FlowService with name <flow-name> from project <project-id>
  flowservice-import <project-id> <filename>                                                                                                 Import FlowService from <filename> into project <project-id>
  flowservice-delete <project-id> <flow-name>                                                                                                Delete FlowService <flow-name> from project <project-id>
  flowservice-execute <project-id> <flow-name> [input-json]                                                                                  Execute FlowService <flow-name> from project <project-id> with data <input-json>
  theme [theme-uid]                                                                                                                          Lists themes or views an individual theme, specified via uid
  theme-create <theme-name> <theme-description> <theme-object> [footer-text] [about-page]                                                    Create theme with given data
  theme-update <theme-uid> <theme-name> <theme-description> <theme-object> [footer-text] [about-page]                                        Update theme with the given UID with given data
  theme-delete <theme-uid>                                                                                                                   Delete theme with the given UID
  theme-activate <theme-uid>                                                                                                                 Activate theme with the given UID
  theme-deactivate <theme-uid>                                                                                                               Deactivate theme with the given UID
  recipe [recipe-uid]                                                                                                                        List all Workflow recipes, or get a single recipe with a given recipe UID
  recipe-delete <recipe-uid>                                                                                                                 Delete Workflow recipe with a given recipe UID
  recipe-create <filename>                                                                                                                   Create Workflow Recipe from file <filename>
  monitor <from> <count> [start-date] [end-date] [projects-list] [workflows-list] [execution-status]                                         Get Monitor summary
  monitor-workflow-log <bill-uid>                                                                                                            Get Monitor summary
  idm-authtoken                                                                                                                              Get authtoken from IDM
  idm-user <username>                                                                                                                        Get User information direct from IDM
  idm-user-search <query> <includeRoles> <products>                                                                                          Searches user information from the IDM
  idm-user-count [query]                                                                                                                     Counts users matching a provided query
  idm-user-role-mappings <userid>                                                                                                            Finds role mappings for given user
  idm-roles                                                                                                                                  Lists all assignable roles for the current environment
  idm-user-create <first-name> <last-name> <email> <username>                                                                                Creates a new user in the IDM
  idm-user-delete <user-id>                                                                                                                  Deletes a user
  idm-user-unlock <user-id>                                                                                                                  Unlocks a user
  help [command]                                                                                                                             display help for command


Examples:

Help

Show the command line help:
$ node wmiocli.js --help


Projects

List projects in a tenant:
$ node wmiocli.js -d tenant.int-aws-us.webmethods.io -u user -p password project

View individual project using project ID (indentified from URL in webMethods.io when in a project, i.e. https://tenant.int-aws-us.webmethods.io/#/projects/fl65d3aa87fc1783ea5cf8c8/workflows):
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project fl65d3aa87fc1783ea5cf8c8

View individual project with given project name:
    $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project Default

View Project assets from project with given name:
    $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-assets Default

View Project assets (All Details) from project with given name:
    $ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-assets-detailed Default

Update Project name:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-update fl65d3aa87fc1783ea5cf8c8 "my New Name"

Delete Project:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-delete fl65d3aa87fc1783ea5cf8c8

Get Project Assets:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-assets fl65d3aa87fc1783ea5cf8c8

Publish Project to another tenant:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-publish fl65d3aa87fc1783ea5cf8c8 'My deployment' 'target.int-aws-us.webmethods.io'
    'targetuser' 'targetpassword'
    '{"output":{"workflows":["fla73a20e13dd6736cf9c355","fl3cfd145262bbc5d44acff3"],
    "flows":["mapLeads"],"rest_api":[],"soap_api":[],"listener":[],"messaging":[]}}'


Deploy published Project in the tenant with the given name and deploy version:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-deploy projectName 1


List Project Workflow Parameters or gets an individual where name is specified
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-param projectName [param-name]

Create Project Workflow Parameter
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-param-create projectName param-name param-value required isPassword

    e.g. node wmiocli.js -d env -u user -p pass project-param-create project name dave false false

Update Project Workflow Parameter
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-param-update projectName param-uid param-name param-value required isPassword

Delete Project Workflow Parameter matching the provided parameter id
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-param-delete projectName param-uid

Project webhooks List
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-webhooks-list [project-uid]

Regenerate webhook token
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-webhooks-regenerate project-uid webhook-uid

Change webhook Auth
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-webhooks-auth project-uid webhook-uid auth-type<none,login,token>

    e.g.
    node wmiocli.js -d env -u user -p pass project-webhooks-auth flf1111 flf2222 login

List triggers in project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-triggers-list project-uid

Delete trigger in project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-triggers-delete project-uid trigger-uid

List Reference Data List:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    referencedata project_name
    e.g.
    project-ref-data project-uid

List Reference Data Get Item:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-ref-data project-uid ref-data-name <json/csv>

    e.g.
    project-ref-data project-uid ref-data-name
    project-ref-data project-uid ref-data-name json
    project-ref-data project-uid ref-data-name csv

Add Reference Data:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-ref-data-add project-uid name description filepath <field separator> <text_qualifier> <file_encoding>

    e.g.
    project-ref-data-add flf1111 reflookup description test.csv

Update Reference Data:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    project-ref-data-add project-uid name description filepath <field separator> <text_qualifier> <file_encoding>

    e.g.
    project-ref-data-update flf1111 reflookup description test.csv

Workflow

Export Workflow from a given project (identified from URL in webMethods.io when in workflow canvas,
i.e. https://tenant.int-aws-us.webmethods.io/#/projects/fl65d3aa87fc1783ea5cf8c8/workflows/fl52232a2dfafbd6536963d7/edit):
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-export fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7 export.zip

Import Workflow from a given file into a project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-import fl65d3aa87fc1783ea5cf8c8 export.zip

Create a blank workflow
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-create fl65d3aa87fc1783ea5cf8c8 "name" "description"

Delete Workflow from a given project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-delete fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7

Execute a Workflow from a given project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-execute fl65d3aa87fc1783ea5cf8c8 fl52232a2dfafbd6536963d7

Get Workflow execution status from a given project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    workflow-status fl65d3aa87fc1783ea5cf8c8 vbid3d247cd26aa5e19354e1fc6951766a3d19c049bee11d


FlowService

Export FlowService from a given project (identified from URL in webMethods.io when in FlowEditor
i.e. https://tenant.int-aws-us.webmethods.io/#/projects/fl65d3aa87fc1783ea5cf8c8/flow-editor/myFlowService):
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    flowservice-export fl65d3aa87fc1783ea5cf8c8 myFlowService export.zip

Import Flowservice from a given file into a project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    flowservice-import fl65d3aa87fc1783ea5cf8c8 export.zip

Delete FlowService from a given project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    flowservice-delete fl65d3aa87fc1783ea5cf8c8 myFlowService

Execute a FlowService from a given project
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    flowservice-execute fl65d3aa87fc1783ea5cf8c8 myFlowService


Roles

Get roles list or individual role
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    role [role-name]

Creates a role
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    role-create 'rolename' 'role description' 'project 1 name,r,w,e;project 2 name,r;'

Updates a role with a provided Id
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    role-update 'roleId' 'rolename' 'role description' 'project 1 name,r,w,e;project 2 name,r;'

Delete a role with a provided Id
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    role-delete 'roleId'


Recipes

Get recipe list or individual recipe
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    recipe [recipe-Uid]

Creates a Workflow recipe from a workflow export
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    recipe-create export-flf111111.zip

Deletes a Workflow recipe with the provided UID
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    recipe-delete fl1771d591cfb4f31e558daf



Themes

Lists whitelabel themes
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    theme [theme-uid]

    The theme settings returned can be use as a way to create the theme.
    You can use jq to retrieve the theme settings by piping the output to jq, e.g.

    node wmiocli.js -d env -u user -p pass theme fl40018d9a1a273bb8aa92bf | jq -c .output.settings.theme > ~/dracula-theme.txt

Deletes a whitelabel theme
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    theme-delete [theme-uid]

Creates a new whitelabel theme
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    theme-create dracula 'desc' [theme-settings] "Footer Text" "About Page"

    Theme settings can be used from the list example above, e.g.
    node wmiocli.js -d env -u user -p pass theme-create dracula7 'updated' "`cat ~/dracula-theme.txt`" 'Footer' 'About'

Updates a whitelabel theme
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    theme-update themeid dracula 'desc' [theme-settings] "Footer Text" "About Page"

    Theme settings can be used from the list example above, e.g.
    node wmiocli.js -d env -u user -p pass theme-update themeid dracula7 'updated' "`cat ~/dracula-theme.txt`" 'Footer' 'About'

Activates a whitelabel theme
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    theme-activate [theme-uid]

Deactivates a whitelabel theme
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    theme-deactivate [theme-uid]


Monitor

Retrieve Monitor Summary:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    monitor from count startDate endDate projectsList workflowsList executionStatus
    e.g.
    monitor 1 10 2023-01-01 2023-01-10 myProject workflow1,workflow2 failed,timeout,stopped
    monitor 11 10 2023-01-01 2023-01-10 myProject workflow1,workflow2 failed,timeout,stopped
    monitor


View an Execution Log:
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    monitor-workflow-log billUid


webMethods Cloud IDM

Provides an IDM authtoken for subsequent calls
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-authtoken

Gets an IDM users details
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-user <username>

Finds users that match the search criteria
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-user-search <query> <include roles - true|false> <product>
    where product is one of: apigateway, apiportal, webmethodsioint, b2b,
    cumulocity, cloudcontainer, devportal, mft, metering, wmapps
    e.g.
    idm-user-search Dave true webmethodsioint

Counts users that match the search criteria
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-user-count <query>
    where query can be a partial username, e.g.
    idm-user-count dave

Lists environment available roles
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-roles

Gets user role mappings for the given userid
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-user-role-mappings <userid>
    where userid is the unique ID returned from the idm-user call

Creates a user
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-user-create <first-name> <last-name> <email> <username>

Deletes a user
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-user-delete <userid>
    where userid is the unique ID returned from the idm-user call

Unlocks a user
$ node wmiocli.js
    -d tenant.int-aws-us.webmethods.io
    -u user
    -p password
    idm-user-unlock <userid>
    where userid is the unique ID returned from the idm-user call

```
