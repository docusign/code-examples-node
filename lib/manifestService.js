const fetch = require("node-fetch").default;

const getManifest = async (manifestUrl) => {
  return await loadManifest(manifestUrl);
}

const loadManifest = async (manifestUrl) => {
  const response = await fetch(manifestUrl);
  const manifest = await response.json();

  if (!manifest) {
    throw new Error("Manifest is not valid!");
  }

  return manifest;
}

const getExampleByNumber = (manifest, number, apiName) => {
  if (!manifest || !manifest.APIs) {
    return undefined;
  }

  const api = manifest.APIs.filter(a => a.Name === apiName)[0];
  const exampleList = api.Groups.flatMap(g => g.Examples);
  const example = exampleList.filter(e => e.ExampleNumber === number)[0];

  return example;
}

module.exports = { getManifest, getExampleByNumber };