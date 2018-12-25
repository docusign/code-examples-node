## Utilities

The updateSource.js file can be invoked via

````
npm run-script update-sources
````

It uses the github settings in the ds_configuration file 
to download/update the `public/source` directory.

It deletes the current content of the directory and then
reloads it from the multiple GitHub repos listed in the
ds_configuration file.
