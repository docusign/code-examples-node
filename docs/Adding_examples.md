# Proposing and Adding Examples

This page discusses how to add additional examples to this launcher.

All contributions must use the MIT License.

## Discuss
First, discuss your plans with the DevCenter Examples Manager 
(Larry Kluger) via apihelp@docusign.com. He'll assign you an example number.

A new example can be added to any of the `code-examples` series of 
launchers.

After your new example has been accepted, the DevCenter team will
arrange to have it ported to the other SDK examples.

### New examples should be not too big, and not too small
Each example should cover a DocuSign feature "appropriately."

For example, if a feature offers two options then consider
having your example demonstrate both options.

### Self-contained
Examples should be self-contained within the scope of the
launcher. 

For example, if your example operates on a template,
then either use the template created by example number 8, 
or modify the template created by example 8 (eg add a field),
or programmatically create a new template.

If you plan to change example 8, first discuss with the
Examples Manager via apihelp@docusign.com. 

Do not require a user to create or modify a template by
using the Admin tool.

## Steps

### Clone and branch
Clone the repository to your own github.com organization.

Then create a new branch for your new example. 
The branch name should include your assigned example 
number and a short form of your new example's name.

Example branch name: eg020_composite_template_set_values

### Copy files

````
(In the project's root)
cp lib/examples/eg001.js lib/examples/egXXX.js 
cp views/pages/examples/eg001.ejs views/pages/examples/egXXX.ejs 
````

### In index.js:

Add requires statement near top:
````
    , egXXX = require('./lib/examples/egXXX')
````

Around line 90, add
````
  .get('/egXXX', egXXX.getController)
  .post('/egXXX', egXXX.createController)
````

### In views/pages/index.ejs
Add information and a link to the new example

### Update the controller file

* Do a mass replace to change `eg001` to your new example number. 

The `get` controller won't need many changes. But you can check 
additional prerequisites here. For example, if the example needs
a template, check the session.templateId and complain to the
user if a different example (to create the template) needs to be
run first.

The `create` controller and supporting methods are the heart of your example.

If you want to use a generic response view after creating an envelope,
see lib/examples/eg002.js and its use of the example_done.ejs view.

### Configuration information
If additional configuration settings are needed, update the
`config/appsettings.json` file. 

While developing and testing, be careful not to let any of your
private information become stored in your repo.

Recommendation: use environment variables to configure
the example during development and test.

### Test
Test that your branch can be downloaded, configured and then
run successfully. 

### Add an automated test
Add an automated test for your example. 

See the `test` directory for examples.

### Running the tests

````
DS_TEST_ACCESS_TOKEN=1234567...  # Tokens are very long
DS_TEST_ACCOUNT_ID=1234567...
export DS_TEST_ACCESS_TOKEN
export DS_TEST_ACCOUNT_ID
npm test
````

## Make a pull request
Make a pull request for your new example. Your initial pull 
request for a new example will probably not be 
approved--the examples manager will review your implementation 
and will often request changes.
