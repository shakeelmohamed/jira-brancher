var dotenv = require("dotenv");
var Base64 = require("js-base64").Base64;
var request = require("request");
var url = require("url");
var fs = require("fs");
var os = require("os");
var path = require("path");
var readlineSync = require("readline-sync");

var configPath = path.join(process.env.HOME, ".jirabrancher");
dotenv.config({path: `${configPath}`});

var DEBUG = false;

function log(msg) {
    if (DEBUG) {
        console.log(msg);
    }
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

// Persist settings to $HOME/.jirabrancher
log(`Writing settings to config file (${configPath})`);
var configFileContents = [`JIRA_HOST=${jiraHost}`, `JIRA_USER=${username}`, `JIRA_BASICAUTH=${Base64.encode(basicAuthToken)}`, ""].join(os.EOL);
fs.writeFileSync(configPath, configFileContents);

// Parse JIRA ticket or ticket URL
var jiraTicket = readlineSync.question(
    "Enter your JIRA ticket or ticket URL: "
).trim();
if (jiraTicket.indexOf("http") === 0) {
    // parse URL
    var parsed = url.parse(jiraTicket);
    log(parsed.pathname);
    jiraTicket = parsed.pathname.replace("/browse/", "");
} else if (jiraTicket.indexOf("-") < 1) {
    throw new Error(`Invalid JIRA ticket "${jiraTicket}"`)
}
// else assume valid ticket
log(`Looking up ${jiraTicket}...`);


// GET https://jira.domain.com/rest/api/2/issue/<jiraTicket
request.get({
        url: `https://${basicAuthToken}@${jiraHost}/rest/api/2/issue/${jiraTicket}`,
        json: true
    }, function(err, resp, body) {
        if (err) {
            log(err);
        }
        else if (resp.status >= 300) {
            console.log(`Got unexpected status code: ${resp.status}`)
        }
        else {
            // Use body.fields.summary as the branch name
            if (body && body.fields && body.fields.summary) {
                // Replace non-alphanumeric chars with dashes
                var branch = body.fields.summary.replace(/[^A-z0-9]/g, "-");
                // Add JIRA ticket prefix, then remove multiple dashes
                branch = (jiraTicket + "/" + branch).replace(/-{2,}/g, "-");

                // Chomp the trailing dash if it's there
                if (branch.slice(-1) === "-") {
                    branch = branch.substring(0, branch.length-1);
                }
                
                // truncate the branch name to 64 chars
                branch = branch.substring(0, 64);
                console.log("Use the following branch name:");
                console.log(branch);
            }
            else if (body && body.errorMessages) {
                console.log(body.errorMessages);
            }
            else {
                throw new Error("No idea");
            }
        }
    }
);