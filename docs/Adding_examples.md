# Adding Examples

This page discusses how to add additional examples to this launcher.

All contributions must use the MIT License.

## Discuss
First, discuss your plans with the DevCenter Examples Manager 
(Larry Kluger). He'll assign you an example number.

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
`ds_configuration.js` file. 

While developing and testing, be careful not to let any of your
private information become stored in your repo.

Recommendation: use environment variables to configure
the example during development and test.

### Test
Test that your branch can be downloaded, configured and then
run successfully. 

## Make a pull request
Make a pull request to for your changes. Your initial pull 
request for a new example will probably not be 
approved--the examples manager will review your implementation 
and will often request changes.
