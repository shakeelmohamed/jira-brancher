const assert = require("assert");
const rand = require("randomstring");
const utils = require("../lib/utils");

describe("utils", function() {
    describe("debug", function() {
        it("should print to stdout if debug enabled", function() {
            process.env.JB_DEBUG = true;
            // reset after running the test
            process.env.JB_DEBUG = false;
        });
        it("should be silent if debug disabled", function() {
            process.env.JB_DEBUG = false;
            // TODO: something like this...
            // process.stdout.on(function("data") { assert.ok(false); setTimeout(function(){ assert.ok(true); }, 100); });
        });
    });

    describe("parseJiraTicket", function() {
        it("should parse from http URL", function() {
            assert.strictEqual("ABC-123", utils.parseJiraTicket("http://jira.foo.com/browse/ABC-123"));
        });
        it("should parse from https URL", function() {
            assert.strictEqual("ABC-123", utils.parseJiraTicket("https://jira.foo.com/browse/ABC-123"));
        });
        it("should parse from ticket", function() {
            assert.strictEqual("ABC-123", utils.parseJiraTicket("ABC-123"));
        });
        it("should Error from invalid ticket", function() {
            let gotError = false;
            try {
                utils.parseJiraTicket("ABC123");
            } catch(err) {
                gotError = true;
            }
            assert.ok(gotError);
        });
    });

    describe("branchFromSummary", function() {
        it("should replace non-alphanum chars", function() {
            assert.strictEqual("hello-there", utils.branchFromSummary("hello^there"));
            assert.strictEqual("hello-there", utils.branchFromSummary("hello$there"));
            assert.strictEqual("hello-there", utils.branchFromSummary("hello<there"));
            assert.strictEqual("hello-there", utils.branchFromSummary("hello}there"));
            assert.strictEqual("hello-there", utils.branchFromSummary("hello&there"));
        });
        it("should replace duplicate dashes chars", function() {
            assert.strictEqual("fo-o", utils.branchFromSummary("fo--o"));
            assert.strictEqual("fo-o", utils.branchFromSummary("fo-$%^-o"));
        });
        it("should chomp leading dash", function() {
            assert.strictEqual("foo", utils.branchFromSummary("-foo"));
        });
        it("should chomp trailing dash", function() {
            assert.strictEqual("foo", utils.branchFromSummary("foo-"));
        });
    });

    describe("addTicketPrefix", function() {
        it("should add prefix", function() {
            const project = rand.generate({capitalization: "uppercase"});
            const branch = rand.generate(20);
            assert.strictEqual(project + "/" + branch, utils.addTicketPrefix(branch, project));
        });
    });

    describe("truncateBranch", function() {
        it("should not truncate a branch shorter than 64 chars", function() {
            const str = rand.generate(63);
            assert.strictEqual(str.length, utils.truncateBranch(str).length);
        });
        it("should truncate a branch longer than 64 chars", function() {
            const str = rand.generate(65);
            assert.strictEqual(65, str.length);
            assert.strictEqual(64, utils.truncateBranch(str).length);
        });
    });
});