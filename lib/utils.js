var url = require("url");

module.exports.debug = function(msg) {
    if (process.env.JB_DEBUG === true) {
        console.log(msg);
    }
};

module.exports.parseJiraTicket = function(jiraTicket) {
    if (jiraTicket.indexOf("http") === 0) {
        // parse URL
        let parsed = url.parse(jiraTicket);
        module.exports.debug(parsed.pathname);
        jiraTicket = parsed.pathname.replace("/browse/", "");
        return jiraTicket;
    } else if (jiraTicket.indexOf("-") < 1) {
        throw new Error(`Invalid JIRA ticket "${jiraTicket}"`);
    } else {
        // Assume it's valid if it contains a dash
        return jiraTicket;
    }
};

module.exports.branchFromSummary = function(summary) {
    // Replace non-alphanumeric chars with dashes
    let ret = summary.replace(/[^A-Za-z0-9]/g, "-");

    // Remove duplicate dashes
    ret = ret.replace(/-+/g, "-");

    // Chomp the leading dash if it's there
    if (ret.charAt(0) === "-" && ret.length > 1) {
        ret = ret.substring(1, ret.length);
    }

    // Chomp the trailing dash if it's there
    if (ret.slice(-1) === "-") {
        ret = ret.substring(0, ret.length-1);
    }

    return ret;
};

module.exports.addTicketPrefix = function(branch, ticket) {
    return ticket + "/" + branch;
};

module.exports.truncateBranch = function(branch) {
    return branch.substring(0, 64);
};