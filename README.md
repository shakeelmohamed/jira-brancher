# JIRA Brancher

[![https://nodei.co/npm/jira-brancher.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/jira-brancher.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/jira-brancher)

Install:

`npm i -g jira-brancher`

Usage:

`jirabrancher`

The CLI will guide you through configuring your JIRA host, user & password.

JIRA Brancher will store 3 values in `$HOME/.jirabrancher`:

* `JIRA_HOST` - the hostname of your JIRA server
* `JIRA_USER` - the username for your JIRA account
* `JIRA_BASICAUTH` - the HTTP Basic auth token used to connect to your JIRA server

On subsequent runs, you'll just need to provide a JIRA ticket number:

```shell
$ jirabrancher
Enter your JIRA ticket or ticket URL: YUM-1
Use the following branch name:
YUM-1/Create-A-Delicious-Recipe
```

Or, as a CLI argument.

```shell
$ jirabrancher YUM-1
Use the following branch name:
YUM-1/Create-A-Delicious-Recipe
```