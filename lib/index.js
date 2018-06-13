var dotenv = require("dotenv");
var Base64 = require("js-base64").Base64;
var request = require("request");
var fs = require("fs");
var os = require("os");
var path = require("path");
var readlineSync = require("readline-sync");

const utils = require("./utils");

var configPath = path.join(process.env.HOME, ".jirabrancher");
dotenv.config({path: configPath});

process.env.JB_DEBUG = false;

let jiraTicket = null;
const args = process.argv.slice(2);
if (args.length === 1 && args[0].trim().length > 0) {
    jiraTicket = args[0].trim();
}
else if (args.length === 0) {
    // Parse JIRA ticket or ticket URL
    jiraTicket = readlineSync.question(
        "Enter your JIRA ticket or ticket URL: "
    ).trim();
    jiraTicket = utils.parseJiraTicket(jiraTicket);
}
else {
    throw new Error("Too many args specified");
}

// Gather JIRA host
var jiraHost = process.env.JIRA_HOST;
if (!jiraHost) {
    jiraHost = readlineSync.question("Enter your JIRA host (e.g.: jira.domain.com): ");
}

// Gather credentials
var username = process.env.JIRA_USER;
var password = null;
var basicAuthToken = process.env.JIRA_BASICAUTH;
if (!basicAuthToken) {
    if (!username) {
        username = readlineSync.question("Enter your JIRA username: ");
    }
    password = readlineSync.question("Enter your JIRA password: ",
        {hideEchoBack: true}
    );
    basicAuthToken = Base64.encode(`${username}:${password}`);
}
basicAuthToken = Base64.decode(basicAuthToken);

// Persist settings to $HOME/.jirabrancher file
utils.debug(`Writing settings to config file (${configPath})`);
var configFileContents = [`JIRA_HOST=${jiraHost}`, `JIRA_USER=${username}`, `JIRA_BASICAUTH=${Base64.encode(basicAuthToken)}`, ""].join(os.EOL);
fs.writeFileSync(configPath, configFileContents);

// If no Error above, continue assuming valid ticket
utils.debug(`Looking up ${jiraTicket}...`);

// GET https://jira.domain.com/rest/api/2/issue/<jiraTicket>
request.get({
    url: `https://${basicAuthToken}@${jiraHost}/rest/api/2/issue/${jiraTicket}`,
    json: true
}, function(err, resp, body) {
    if (err) {
        utils.debug(err);
    }
    else if (resp.status >= 300) {
        console.log(`Got unexpected status code: ${resp.status}`);
    }
    else {
        // Use body.fields.summary as the branch name
        if (body && body.fields && body.fields.summary) {
            let branch = utils.branchFromSummary(body.fields.summary);
            branch = utils.addTicketPrefix(branch, jiraTicket);
            branch = utils.truncateBranch(branch);

            console.log("Use the following branch name:");
            console.log(branch);
            // TODO: copy to clipboard
        }
        else if (body && body.errorMessages) {
            console.log(body.errorMessages);
        }
        else {
            // TODO: automatically wipe that line
            throw new Error(`Error: HTTP ${resp.statusCode}, you probably need to delete the JIRA_BASICAUTH line from ${configPath}`);
        }
    }
});