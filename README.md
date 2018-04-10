# JIRA Brancher

Install:

`npm i -g jira-brancher`

Usage:

`jirabrancher`

The CLI will guide you through configuring your JIRA host, user & password.

JIRA Brancher will store 3 values in `$HOME/.jirabrancher`:

* `JIRA_HOST` - the hostname of your JIRA server
* `JIRA_USER` - the username for your JIRA account
* `JIRA_BASICAUTH` - the HTTP Basic auth token used to connect to your JIRA server