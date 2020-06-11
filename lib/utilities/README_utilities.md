## Utilities

The updateSource.js file can be invoked via

````
npm run-script update-sources
````

It uses the github settings in the `config/appsettings.json` file 
to download/update the `public/source` directory.

It deletes the current content of the directory and then
reloads it from the multiple GitHub repos listed in the
`config/appsettings.json` file.
