# Adding Examples

How to add additional examples to this launcher.

### Copy files

````
(In project root)
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

