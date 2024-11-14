#!/bin/bash

USER=$1
PASS=$2
DEV_TENANT=$3
PROD_TENANT=$4

LOG_FILE=test-output.log
rm -rf $LOG_FILE
COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_CYAN='\033[0;36m'
COLOR_YELLOW='\033[0;33m'
COLOR_RESET='\033[0m'
# Initialize counters
pass_counter=0
fail_counter=0
running_counter=0
omitted_counter=0
total_tests=114
executed_counter=0



# Check if both username and password are provided
if [ "$#" -ne 4 ]; then
    echo "Usage: $0 <username> <password> <dev_tenant_prefix> <prod_tenant_prefix>"
    exit 1
fi

echo -e ${COLOR_CYAN}
echo "               _    ___  ___     _   _               _       _          ___  ______ _____   _____  _     _____   _____         _       "
echo "              | |   |  \\/  |    | | | |             | |     (_)        / _ \\ | ___ \\_   _| /  __ \\| |   |_   _| |_   _|       | |      "
echo " __      _____| |__ | .  . | ___| |_| |__   ___   __| |___   _  ___   / /_\\ \\| |_/ / | |   | /  \\/| |     | |     | | ___  ___| |_ ___ "
echo " \\ \\ /\\ / / _ \\ '_ \\| |\\/| |/ _ \\ __| '_ \\ / _ \\ / _\` / __| | |/ _ \\  |  _  ||  __/  | |   | |    | |     | |     | |/ _ \\/ __| __/ __|"
echo "  \\ V  V /  __/ |_) | |  | |  __/ |_| | | | (_) | (_| \\__ \\_| | (_) | | | | || |    _| |_  | \\__/\\| |_____| |_    | |  __/\\__ \\ |_\\__ \\ "
echo "   \\_/\\_/ \\___|_.__/\\_|  |_/\\___|\\__|_| |_|\\___/ \\__,_|___(_)_|\\___/  \\_| |_/\\_|    \\___/   \\____/\\_____/\\___/    \\_/\\___||___/\\__|___/"
echo -e ${COLOR_RESET}                                                                                                                                    
                                                                                                                                      


right_space_pad() {
    local string="$1"
    local length="$2"

    # Calculate the number of spaces to pad
    local pad_length=$(( length - ${#string} ))

    # If the string is already longer than the specified length, just return the string
    if [ "$pad_length" -le 0 ]; then
        echo "$string"
        return
    fi

    # Generate the padding with spaces
    local padding=$(printf "%-${pad_length}s" "")

    # Concatenate the string with the padding
    echo -n "$string$padding"
}

display_counters() {
    echo 
    echo -e " ${COLOR_GREEN}Pass count     : $pass_counter"
    echo -e " ${COLOR_YELLOW}Omitted count  : $omitted_counter ${COLOR_RESET}"  
    echo -e " ${COLOR_RED}Fail count     : $fail_counter ${COLOR_RESET}"
    
    echo " Total Executed : [$executed_counter/$running_counter]"

    if [ "$running_counter" -ne 0 ]; then
      percentage=$(( 100 * executed_counter / running_counter ))
      echo " Test Coverage  : ${percentage}%"
    else
      echo " Test Coverage  : 0%"
    fi    
}

# Function to run the shell command and assert the result

result=""

run_test_return_value() {
    # Receive the command and expected value as arguments
    local command=$1
    local test=$2
    local expected_value=$3
    local resultFilter=$4
    local desc=$5

    ((running_counter++))
    ((executed_counter++))
    echo -n "["
    if [ "${running_counter}" -lt 100 ]; then
       echo -n "0"
    fi 

    if [ "${running_counter}" -lt 10 ]; then
       echo -n "0"
    fi 
    echo -n "$running_counter/$total_tests] "
    (right_space_pad "$desc" 50)

    echo "----------------------------------------------------------------------------------------" >> "$LOG_FILE"
    echo "[$running_counter/$total_tests] $desc" >> "$LOG_FILE"
    
    # Run the shell command and capture its output into a variable
    start_time=$(date +%s%3N)
    command_result=$(eval "$command")  # Execute command
    result=$(echo "$command_result" >> "$LOG_FILE" 2>&1)  # Log the command result

    #echo "result: $result"
    end_time=$(date +%s%3N)
    time_taken=$((end_time - start_time))
    if [ "${time_taken}" -gt 2000 ]; then
      time_taken=`echo ${COLOR_RED}${time_taken}${COLOR_RESET}`
    fi

    #result=$(echo "$command_result" | eval "$test")
    resultlength==$(expr length "$result")
    final_result=$(echo "$command_result" | eval "$test")
    result=$(echo "$command_result" | eval "$resultFilter")
    
    # Check if the result matches the expected value
    if [ "$final_result" -eq "$expected_value" ]; then
        # Increment the pass counter
        ((pass_counter++))
        echo -e "${COLOR_GREEN}PASSED${COLOR_RESET} (Time: $time_taken ms)"
	#return $result
    else
        # Increment the fail counter
        ((fail_counter++))
        echo -e "${COLOR_RED}FAILED${COLOR_RESET} (Time: $time_taken ms)"
        echo
        echo "Failure Reason: $command_result"
        echo "Test Failure  : $final_result"
        echo "Matched value : $result"
        echo -e "${COLOR_RED}------------- TEST ABORTED DUE TO FAILURE -------------${COLOR_RESET}"
        cleanup_function
        display_counters
        exit 1
    fi
}

omitted_test() {
    local command=$1
    local test=$2
    local expected_value=$3
    local desc=$4

    ((running_counter++))
    echo -n "["
    if [ "${running_counter}" -lt 100 ]; then
       echo -n "0"
    fi 

    if [ "${running_counter}" -lt 10 ]; then
       echo -n "0"
    fi
    echo -n "$running_counter/$total_tests] "
    (right_space_pad "$desc" 50)

    echo "----------------------------------------------------------------------------------------" >> "$LOG_FILE"
    echo "[$running_counter/$total_tests] $desc" >> "$LOG_FILE"

    ((omitted_counter++))
    echo -e "${COLOR_YELLOW}OMITTED${COLOR_RESET}"
}

run_test() {

    # Receive the command and expected value as arguments
    local command=$1
    local test=$2
    local expected_value=$3
    local desc=$4

    ((running_counter++))
    ((executed_counter++))
    echo -n "["
    if [ "${running_counter}" -lt 100 ]; then
       echo -n "0"
    fi 

    if [ "${running_counter}" -lt 10 ]; then
       echo -n "0"
    fi
    echo -n "$running_counter/$total_tests] "
    (right_space_pad "$desc" 50)

    echo "----------------------------------------------------------------------------------------" >> "$LOG_FILE"
    echo "[$running_counter/$total_tests] $desc" >> "$LOG_FILE"

    # Run the shell command and capture its output into a variable
    start_time=$(date +%s%3N) 
    command_result=$(eval "$command")  # Execute command
    result=$(echo "$command_result" >> "$LOG_FILE" 2>&1)  # Log the command result
    end_time=$(date +%s%3N)
    time_taken=$((end_time - start_time))
    echo "Time Taken: $time_taken ms" >> "$LOG_FILE"
    if [ "${time_taken}" -gt 2000 ]; then
      time_taken=`echo ${COLOR_RED}${time_taken}${COLOR_RESET}`
    fi

    final_result=$(echo "$command_result" | eval "$test")

    # Check if the result matches the expected value
    if [ "$final_result" -eq "$expected_value" ]; then
        # Increment the pass counter
        ((pass_counter++))
        echo -e "${COLOR_GREEN}PASSED${COLOR_RESET} (Time: $time_taken ms)"
    else
        # Increment the fail counter
        ((fail_counter++))
        echo -e "${COLOR_RED}FAILED${COLOR_RESET} (Time: $time_taken ms)"
        echo "Failure Reason: $command_result"
        echo "Test Failure  : $final_result"
	    echo -e "${COLOR_RED}------------- TEST ABORTED DUE TO FAILURE -------------${COLOR_RESET}"
	    cleanup_function
        display_counters
        exit 1
    fi
}

cleanup_function() {
 echo 
 echo " Performing Cleanup Activities"
 node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u "${USER}" -p "${PASS}" project-delete $projectUid
}

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Projects\n${COLOR_RESET}"
# Project Functions
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project" "grep -c CLITestProject" "1" "Project List"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project fl425e0505dec7b426384550" "grep -c CLITestProject" "1" "Get Single Project"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-assets fl425e0505dec7b426384550" "grep -c HelloFlow" "1" "cat" "Get Project Assets" 
projectAssetsJson=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-assets-detailed fl425e0505dec7b426384550" "grep -c HelloFlow" "1" "Get Detailed Project Assets"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-create created" "grep uid | wc -l" "1"  "jq -r .output.uid" "Create Project"
projectUid=`echo $result`

#Export Project
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-export $projectUid project.zip" "grep 'success' | wc -l" "1" "Export Project"

#Import project
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' project-import project.zip newnameproject" "grep 'IMPORT_SUCCESS' | wc -l" "1" "Import Project"
rm project.zip

#Delete Imported Project
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' project-delete $projectUid" "grep 'Project deleted successfully' | wc -l" "1" "Delete Imported Project"

#Project Params
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-param-create created paramname paramvalue false false" "grep -c uid" "1" "Create Proj Param" 
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-param created" "grep uid | wc -l" "1" "jq -r .output[0].uid" "Get Created Project Param"
projectParamId=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-param-update created $projectParamId paramname paramvaluechanged false false" "grep paramvaluechange | wc -l" "1" "Update Project Param"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-param-delete created $projectParamId" "grep 'deleted successfully' | wc -l" "1" "Delete Project Param"

#Update Project
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-update $projectUid changed" "grep 'changed' | wc -l" "1" "Update Project Name"

#---------------------------------------------------------------------------------------------------

#Triggers
printf "\n${COLOR_CYAN}* Triggers${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-export CLITestProject fl8c6e1a24c22ffd6d912494 wf.zip" "grep 'success' | wc -l" "1" "Export workflow"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-import $projectUid wf.zip" "grep uid | wc -l" "1" "jq -r .output.uid" "Import Workflow"
workflowUid=`echo $result`
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-triggers-list $projectUid" "grep 'clock trigger' | wc -l" "1" "jq -r .output.objects[0].trigger.uid" "List triggers in project"
triggerUid=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-triggers-delete $projectUid $triggerUid" "grep 'This trigger is used in below workflows' | wc -l" "1" "Delete Trigger"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-delete $projectUid ${workflowUid}" "grep 'deleted successfully' | wc -l" "1" "Workflow Delete"

#Delete Project
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-delete $projectUid" "grep 'Project deleted successfully' | wc -l" "1" "Delete Project"

# ---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Publish/Deploy${COLOR_RESET}\n"
#Deploy & Publish

run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-publish fl425e0505dec7b426384550 CITest ${PROD_TENANT} ${USER} '${PASS}' '${projectAssetsJson}'" 'grep CITest | wc -l' '1' 'Project Publish'
run_test_return_value "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' experimental-project-deployments fl425e0505dec7b426384550" "grep data_location | wc -l" "1" "jq -r .output[-1].version" "Experimental - List Project Deployments"
lastVersion=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' project-deploy CLITestProject ${lastVersion}" "grep DEPLOY_SUCCESS | wc -l" "1" "Project Deploy"

#Now cleanup after deploy
run_test_return_value "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' experimental-project-search CLITestProject" "grep CLITestProject | wc -l" "1" "jq -r .output.projects[0].uid" "Cleanup - Experimental Project Search"
prodProjId=`echo $result`
run_test_return_value "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' experimental-project-workflows ${prodProjId}" "grep workflows | wc -l" "1" "jq -r .workflows[0].uid" "Cleanup - Project Assets Workflow"
workflowId=`echo $result`
run_test_return_value "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' project-assets fl425e0505dec7b426384550" "grep output | wc -l" "1" "jq -r .output.flows[-1]" "Cleanup - Project Assets FlowService"
flowserviceId=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' workflow-delete CLITestProject ${workflowId}" "grep 'deleted successfully' | wc -l" "1" "Cleanup - Workflow Delete in Prod"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' flowservice-delete CLITestProject ${flowserviceId}" "grep 'deleted successfully' | wc -l" "1" "Cleanup - FlowService Delete in Prod"
run_test_return_value "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' experimental-project-workflows ${prodProjId}" "grep workflows | wc -l" "1" "jq -r .workflows[0].uid" "Cleanup - Project Assets Workflow"
workflowId=`echo $result`
run_test_return_value "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' project-assets ${prodProjId}" "grep output | wc -l" "1" "jq -r .output.flows[-1]" "Cleanup - Project Assets FlowService"
flowserviceId=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' workflow-delete CLITestProject ${workflowId}" "grep 'deleted successfully' | wc -l" "1" "Cleanup - Workflow Delete in Prod"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' flowservice-delete CLITestProject ${flowserviceId}" "grep 'deleted successfully' | wc -l" "1" "Cleanup - Workflow Delete in Prod"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' project-delete CLITestProject" "grep 'Project deleted successfully' | wc -l" "1" "Cleanup - Delete Project from prod"

#---------------------------------------------------------------------------------------------------

#webooks
printf "\n${COLOR_CYAN}* Webhooks${COLOR_RESET}\n"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-webhooks-list CLITestProject" "grep webhook_auth | wc -l" "1" "jq -r .output.objects[0].uid" "List Project webhooks"
webhookUid=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-webhooks-regenerate CLITestProject $webhookUid" "grep webhook_url | wc -l" "1" "Regenerate a webhook"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-webhooks-auth CLITestProject $webhookUid none" "grep webhook_token | wc -l" "1" "Change webhook Auth Type"

#---------------------------------------------------------------------------------------------------

#Reference Data
printf "\n${COLOR_CYAN}* Reference Data${COLOR_RESET}\n"

run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-create created" "grep uid | wc -l" "1"  "jq -r .output.uid" "Create Project"
projectUid=`echo $result`

run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-ref-data CLITestProject refDataTest" "grep 'columnDelimiter' | wc -l" "1" "List reference data"
echo "char,alphabet,ascii" > refdata.csv
echo "0,-1,48" >> refdata.csv
echo "1,-1,49" >> refdata.csv
echo "2,-1,50" >> refdata.csv
echo "3,-1,51" >> refdata.csv
echo "4,-1,52" >> refdata.csv
echo "5,-1,53" >> refdata.csv
echo "6,-1,54" >> refdata.csv
echo "7,-1,55" >> refdata.csv
echo "8,-1,56" >> refdata.csv
echo "9,-1,57" >> refdata.csv


run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-ref-data-add CLITestProject refDataTestNew refdatatestnew refdata.csv" "grep 'created successfully' | wc -l" "1" "Add reference data"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-ref-data-update CLITestProject refDataTestNew refdatatestnew refdata.csv" "grep 'updated successfully' | wc -l" "1" "Update reference data"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-ref-data-delete CLITestProject refDataTestNew" "grep 'deleted successfully' | wc -l" "1" "Delete reference data"
rm refdata.csv

run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' project-delete $projectUid" "grep 'Project deleted successfully' | wc -l" "1" "Delete Project"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Roles${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' role" "grep count | wc -l" "1" "List defined roles"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' role Admin" "grep permissions | wc -l" "1" "Get single role"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' role-create testrole desc 'Default,r,w,e;'" "grep access_list | wc -l" "1" "jq -r .output.uid" "Role Create"
roleId=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' role-update ${roleId} testrole desc 'Default,r;'" "grep access_list | wc -l" "1" "Role Update"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Users${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' user" "grep automation | wc -l" "1" "Get User list"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' user-role-assignment apiuser testrole" "grep  access_list | wc -l" "1" "User role assignment"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' user-role-assignment apiuser Developer" "grep  permissions | wc -l" "1" "User role assignment revert"

run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' role-delete ${roleId}" "grep 'Tenant role deleted' | wc -l" "1" "Role Delete"

#---------------------------------------------------------------------------------------------------

#Workflows

printf "\n${COLOR_CYAN}* Worlkflows${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-export CLITestProject fl835fe9b99489cc5c3dbdc8 wf.zip" "grep 'success' | wc -l" "1" "Export workflow"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-import CLITestProject wf.zip" "grep uid | wc -l" "1" "jq -r .output.uid" "Import Workflow"
workflowUid=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-delete CLITestProject $workflowUid" "grep 'Object deleted successfully' | wc -l" "1" "Delete workflow"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-execute CLITestProject fl8c6e1a24c22ffd6d912494" "grep 'Workflow enqueue successfully.' | wc -l" "1" "jq -r .output.run_id" "Execute Workflow"
vbid=`echo $result`
sleep 5
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-status CLITestProject $vbid" "grep status | wc -l" "1" "Workflow Execution Status"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-create Default testcliwf 'test cli wf'" "grep output | wc -l" "1" "jq -r .output.uid" "Workflow Create"
workflowUid=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' workflow-delete Default $workflowUid" "grep 'Object deleted successfully' | wc -l" "1" "Delete workflow"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* FlowService${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' flowservice-export CLITestProject ExportDeleteImportTest fs.zip" "grep success | wc -l" "1" "Export FlowService"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' flowservice-delete CLITestProject ExportDeleteImportTest" "grep 'deleted successfully' | wc -l" "1" "Delete FlowService"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' flowservice-import CLITestProject fs.zip" "grep 'serviceFullName' | wc -l" "1" "Import FlowService"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' flowservice-execute CLITestProject HelloFlow" "grep 'Hello Flow' | wc -l" "1" "Execute FlowService"
rm fs.zip

#---------------------------------------------------------------------------------------------------



printf "\n${COLOR_CYAN}* Theme${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' theme ${themeId}" "grep 'settings' | wc -l" "1" "List Themes"


node --no-deprecation wmiocli.js -d "${DEV_TENANT}" -u "${USER}" -p "${PASS}" theme > theme.json
themeId=`jq -r '.output[] | select(.name == "ThemeRed") | .uid' theme.json`
themeText=`jq -r '.output[] | select(.name == "ThemeRed")' theme.json`


#run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' theme ${themeId}" "grep 'settings' | wc -l" "1" "Get Individual Theme"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' theme ${themeId}" "grep 'settings' | wc -l" "1" "Get Individual Theme"


#run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}'  theme-create TestTheme 'Test Theme3' '$themeText'" "grep primaryColor | wc -l" "1" "jq -r .output.uid" "Theme create"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}'  theme-create TestTheme 'Test Theme3' '$themeText'" "grep primaryColor | wc -l" "1" "Theme create"
node --no-deprecation wmiocli.js -d "${DEV_TENANT}" -u "${USER}" -p "${PASS}" theme > theme.json
themeId=`jq -r '.output[] | select(.name == "TestTheme") | .uid' theme.json`
rm theme.json

run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}'  theme-update ${themeId} TestTheme 'Test Theme3' '$themeText'" "grep primaryColor | wc -l" "1" "Theme Update"

run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' theme-activate ${themeId}" "grep '\"active\":true' | wc -l" "1" "Theme activate"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' theme-deactivate ${themeId}" "grep '\"active\":false' | wc -l" "1" "Theme deactivate"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' theme-delete ${themeId}" "grep 'deleted successfully' | wc -l" "1" "Theme delete"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Recipes${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' recipe" "grep 'recipes' | wc -l" "1" "List Recipes"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' recipe-create wf.zip" "grep output | wc -l" "1" "jq -r .output.uid" "Recipe Create"
recipeId=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' recipe-delete ${recipeId}" "grep 'deleted successfully' | wc -l" "1" "Recipe Delete"
rm wf.zip

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Monitor${COLOR_RESET}\n"
TODAY=$(date +'%Y-%m-%d')
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' monitor 1 1 ${TODAY} ${TODAY}" "grep 'success' | wc -l" "1" "jq -r .output.graph.logs[0].uid" "Workflow Monitor"
monitorId=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' monitor-workflow-log ${monitorId}" "grep duration | wc -l" "1" "Workflow Monitor Item"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Cloud IDM${COLOR_RESET}\n"
run_test_return_value "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' idm-user-create jack jones noreply@webMethods.io jackjones" "grep 'response' | wc -l" "1" "jq -r .response" "Create IDM User"
userId=`echo $result`
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' idm-user jackjones " "grep firstName | wc -l" "1" "Get IDM User"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' idm-user-search auto false webmethodsioint " "grep automation | wc -l" "1" "Search IDM User"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' idm-user-count auto " "grep response | wc -l" "1" "Count IDM Users"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}' idm-roles " "grep Administrator | wc -l" "1" "Get Environment available roles"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}'  idm-user-role-mappings f3a4e564-5d68-4295-84b4-2b552845d0f7 " "grep Administrator | wc -l" "1" "Get user roles"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}'  idm-user-unlock ${userId}" "grep unlocked | wc -l" "1" "Unlock User"
run_test "node --no-deprecation wmiocli.js -d ${PROD_TENANT} -u ${USER} -p '${PASS}'  idm-user-delete ${userId}" "grep deleted | wc -l" "1" "Delete User"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Experimental - Messaging${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-create queue testqueue fl425e0505dec7b426384550" "grep '\"queueName\":\"testqueue\"' | wc -l" "1" "Experimental - Create message queue"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-delete queue testqueue fl425e0505dec7b426384550" "grep '\"queueName\":\"testqueue\"' | wc -l" "1" "Experimental - Delete message queue"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-stats CLITestQueue fl1f48d9bb44098e5cedc1f4" "grep connectionRate | wc -l" "1" "Experimental - Messaging stats"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-subscriber fl1f48d9bb44098e5cedc1f4" "grep CLITestQueueSubscriber | wc -l" "1" "Experimental - Messaging Subscriber List"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-subscriber-state CLITestQueueSubscriber enabled fl1f48d9bb44098e5cedc1f4" "grep 'Successfully enabled the subscriber' | wc -l" "1" "Experimental - Messaging Enable Subsciber"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-subscriber-state CLITestQueueSubscriber suspended fl1f48d9bb44098e5cedc1f4" "grep 'Successfully suspended the subscriber' | wc -l" "1" "Experimental - Messaging Suspend Subsciber"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-subscriber-state CLITestQueueSubscriber disabled fl1f48d9bb44098e5cedc1f4" "grep 'Successfully disabled the subscriber' | wc -l" "1" "Experimental - Messaging Disable Subsciber"
run_test_return_value "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-subscriber fl1f48d9bb44098e5cedc1f4 CLITestQueueSubscriber" "grep CLI | wc -l" "1" "cat" "Experimental - Messaging Subscriber Detail"
subscriberJson=`echo $result | jq --arg new_name "CreatedSubscriber" '.name = $new_name'`
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-subscriber-create fl1f48d9bb44098e5cedc1f4 '$subscriberJson'" "grep CreatedSubscriber | wc -l" "1" "Experimental - Messaging Subscriber Create"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-messaging-subscriber-delete fl1f48d9bb44098e5cedc1f4 CreatedSubscriber" "grep CreatedSubscriber | wc -l" "1" "Experimental - Messaging Subscriber Delete"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Experimental - User${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-user" "grep automation | wc -l" "1" "Experimental - User"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-user-list" "grep output | wc -l" "1" "Experimental - Int User List Full"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-user-list automation" "grep Automation | wc -l" "1" "Experimental - Int User List Search"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Experimental - Stages${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-stages" "grep isSAGCloudEnvironmentEnabled | wc -l" "1" "Experimental - Get Stage Info"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Experimental - Project${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-project-workflows fl425e0505dec7b426384550" "grep Hello | wc -l" "1" "Experimental - Get Project Workflow"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-project-flowservices fl425e0505dec7b426384550" "grep ExportDeleteImportTest | wc -l" "1" "Experimental - Get Project FlowServices"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-project-connector-accounts fl425e0505dec7b426384550" "grep output | wc -l" "1" "Experimental - Get Connector Accounts"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-project-connector-account-wf-config fl425e0505dec7b426384550" "grep webhook | wc -l" "1" "Experimental - Get Connector Account WF Config"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-project-search CLITestProject" "grep fl425e0505dec7b426384550 | wc -l" "1" "Experimental - Project Search"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-project-deployments fl425e0505dec7b426384550" "grep output | wc -l" "1" "Experimental - Project Deployments"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-workflow fl425e0505dec7b426384550 fl835fe9b99489cc5c3dbdc8" "grep 'Hello Workflow' | wc -l" "1" "Experimental - Workflow Detail"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-workflow-enabled fl425e0505dec7b426384550 fl835fe9b99489cc5c3dbdc8 false" "grep output | wc -l" "1" "Experimental - Workflow Disable"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-workflow-enabled fl425e0505dec7b426384550 fl835fe9b99489cc5c3dbdc8 true" "grep output | wc -l" "1" "Experimental - Workflow Enable"


#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Experimental - Workflow Monitor${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-workflow-monitor success ${TODAY}T00:00:00.000Z ${TODAY}T23:59:59.999Z fl425e0505dec7b426384550 fl8c6e1a24c22ffd6d912494" "grep count_transaction | wc -l" "1" "Experimental - Workflow Monitor"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-workflow-execution-analysis ${vbid} json" "grep bill_uid | wc -l" "1" "Experimental - Workflow Execution Analysis"

#---------------------------------------------------------------------------------------------------

printf "\n${COLOR_CYAN}* Experimental - FlowServices${COLOR_RESET}\n"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-flowservice-scheduler fl425e0505dec7b426384550 HelloFlow pause" "grep Success | wc -l" "1" "Experimental - Set Flow Service Scheduler status"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-flowservice-http fl425e0505dec7b426384550 HelloFlow false" "grep Successful | wc -l" "1" "Experimental - Set Flowservice Disable http "
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-flowservice-http fl425e0505dec7b426384550 HelloFlow true" "grep Successful | wc -l" "1" "Experimental - Set Flowservice Enable http"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-flowservice-resume fl425e0505dec7b426384550 HelloFlow true" "grep Successful | wc -l" "1" "Experimental - Flowservice Enable Resume"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-flowservice-resume fl425e0505dec7b426384550 HelloFlow false" "grep Successful | wc -l" "1" "Experimental - FlowService Disable Resume"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-flowservice-restart fl425e0505dec7b426384550 HelloFlow true" "grep Successful | wc -l" "1" "Experimental - Flowservice Enable Restart"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-flowservice-restart fl425e0505dec7b426384550 HelloFlow false" "grep Successful | wc -l" "1" "Experimental - FlowService Disable Restart"
run_test "node --no-deprecation wmiocli.js -d ${DEV_TENANT} -u ${USER} -p '${PASS}' experimental-flowservice-details fl425e0505dec7b426384550" "grep Success | wc -l" "1" "Experimental - Get Flow Service details"



# ---------------------------------------------------------------------------------------
echo 
echo -e "${COLOR_CYAN}------------- TESTS COMPLETED -------------${COLOR_RESET}"
display_counters