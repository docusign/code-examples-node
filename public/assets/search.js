const DS_SEARCH = (function () {
  const API_TYPES = {
    ESIGNATURE: "esignature",
    MONITOR: "monitor",
    CLICK: "click",
    ROOMS: "rooms",
    ADMIN: "admin",
    CONNECT: "connect",
    MAESTRO: "maestro",
    WEBFORMS: "webforms",
  }

  const processJSONData = function () {
    const json_raw = $("#api_json_data").text();
    const json = json_raw ? JSON.parse(json_raw) : false;

    return json;
  }

  const processCFR11Value = function () {
    const cfr11_data = $("#cfr11_data");
    return cfr11_data.text();
  }

  function checkIfExampleMatches(example, matches) {
    const name = example.ExampleName;
    const description = example.ExampleDescription;
    const pathNames = example.LinksToAPIMethod?.map((a) => a.PathName);

    for (let i = 0; i < matches.length; i++) {
      if (
        name === matches[i].value ||
        description === matches[i].value ||
        pathNames && pathNames.indexOf(matches[i].value) > -1
      ) {
        return true;
      }
    }

    return false;
  }

  function clearNonMatchingExamples(examples, matches) {
    for (let i = examples.length - 1; i >= 0; i--) {
      if (!checkIfExampleMatches(examples[i], matches)) {
        examples.splice(i, 1);
      }
    }
  }

  function clearResultsAfterMatching(api, matches) {
    const groups = api.Groups;

    for (let i = groups.length - 1; i >= 0; i--) {
      const group = groups[i];
      clearNonMatchingExamples(group.Examples, matches);

      if (group.Examples.length === 0) {
        groups.splice(i, 1);
      }
    }
  }

  const findCodeExamplesByKeywords = function(json, pattern) {
    const options = {
      isCaseSensitive: false,
      minMatchCharLength: pattern.length,
      threshold: -0.0,
      includeMatches: true,
      ignoreLocation: true,
      useExtendedSearch: true,
      keys: [
        "Groups.Examples.ExampleName",
        "Groups.Examples.ExampleDescription",
        "Groups.Examples.LinksToAPIMethod.PathName",
      ],
    };

    const clearJSON = JSON.stringify(json).replace(/<\/?[^>]+(>|$)/g, "");
    const fuse = new Fuse(JSON.parse(clearJSON), options);

    const searchResults = fuse.search(JSON.stringify(pattern));

    searchResults.forEach((searchResult) =>
      clearResultsAfterMatching(searchResult.item, searchResult.matches)
    );

    return searchResults;
  }

  const getExamplesByAPIType = function (apiType, codeExamples) {
    let codeExamplesByAPI = codeExamples.find(
      (x) => x.Name.toLowerCase() === apiType
    );

    if (codeExamplesByAPI != null) {
      return [codeExamplesByAPI];
    } else {
      return null;
    }
  };

  const getEnteredAPIType = function (inputValue) {
    const inputLength = inputValue.length;

    for (const key in API_TYPES) {
      if (Object.hasOwnProperty.call(API_TYPES, key)) {
        const apiType = API_TYPES[key];
        const comparedValue = apiType.substr(0, inputLength);

        if (inputValue === comparedValue) {
          return apiType;
        }
      }
    }

    return null;
  };

  function getLinkForApiType(apiName) {
    switch (apiName) {
      case API_TYPES.ADMIN:
        return "aeg";
      case API_TYPES.CLICK:
        return "ceg";
      case API_TYPES.ROOMS:
        return "reg";
      case API_TYPES.MONITOR:
        return "meg";
      case API_TYPES.ESIGNATURE:
        return "eg";
      case API_TYPES.CONNECT:
        return "cneg";
      case API_TYPES.MAESTRO:
        return "mseg";
      case API_TYPES.WEBFORMS:
        return "weg";
    }
  }

  const addCodeExampleToHomepage = function (codeExamples) {
    var cfrPart11 = processCFR11Value();

    codeExamples.forEach((element) => {
      let linkToCodeExample = getLinkForApiType(element.Name.toLowerCase());

      element.Groups.forEach((group) => {
        $("#filtered_code_examples").append("<h2>" + group.Name + "</h2>");

        group.Examples.forEach((example) => {
          if (
            !example.SkipForLanguages ||
            !example.SkipForLanguages.toLowerCase().includes("node")
          ) {
            if (element.Name.toLowerCase() !== API_TYPES.ESIGNATURE.toLowerCase() ||
              ((example.CFREnabled == "AllAccounts") ||
              ((cfrPart11 == "enabled") && (example.CFREnabled == "CFROnly")) ||
              ((cfrPart11 != "enabled") && (example.CFREnabled == "NonCFR")))) 
            {
              $("#filtered_code_examples").append(
                "<h4 id=" +
                  "example"
                    .concat(
                      "0".repeat(3 - example.ExampleNumber.toString().length)
                    )
                    .concat(example.ExampleNumber) +
                  ">" +
                  "<a href = " +
                  linkToCodeExample
                    .concat(
                      "0".repeat(3 - example.ExampleNumber.toString().length)
                    )
                    .concat(example.ExampleNumber) +
                  " >" +
                  example.ExampleName +
                  "</a ></h4 >"
              );

              $("#filtered_code_examples").append(
                "<p>" + example.ExampleDescription + "</p>"
              );

              $("#filtered_code_examples").append("<p>");
              const links = example.LinksToAPIMethod || [];
              if (links.length > 0) {
                if (links.length == 1) {
                  $("#filtered_code_examples").append(
                    processJSONData().SupportingTexts.APIMethodUsed
                  );
                } else {
                  $("#filtered_code_examples").append(
                    processJSONData().SupportingTexts.APIMethodUsedPlural
                  );
                }

                links.forEach((link, index) => {
                  $("#filtered_code_examples").append(`<a target='_blank' href='${link.Path}'>${link.PathName}</a>`);

                  if (index + 1 === links.length) {
                    $("#filtered_code_examples").append("<span></span>");
                  } else if (index + 1 === links.length - 1) {
                    $("#filtered_code_examples").append("<span> and </span>");
                  } else {
                    $("#filtered_code_examples").append("<span>, </span>");
                  }
                })

              }

              $("#filtered_code_examples").append("</p> ");
            }
          }
        });
      });
    });
  };

  const textCouldNotBeFound = function () {
    $("#filtered_code_examples").append(
      processJSONData().SupportingTexts.SearchFailed
    );
  };

  return {
    processJSONData,
    getEnteredAPIType,
    getExamplesByAPIType,
    findCodeExamplesByKeywords,
    textCouldNotBeFound,
    addCodeExampleToHomepage,
  };
})();

const input = document.getElementById("code_example_search");
const log = document.getElementById("values");

input.addEventListener("input", updateValue);

function updateValue(esearchPattern) {
  document.getElementById("filtered_code_examples").innerHTML = "";

  const inputValue = esearchPattern.target.value.toLowerCase();
  const json = DS_SEARCH.processJSONData().APIs;

  if (inputValue === "") {
    DS_SEARCH.addCodeExampleToHomepage(json);
  } else {
    const apiType = DS_SEARCH.getEnteredAPIType(inputValue);

    if (apiType !== null) {
      const adminExamples = DS_SEARCH.getExamplesByAPIType(apiType, json);
      DS_SEARCH.addCodeExampleToHomepage(adminExamples);
    } else {
      const result = DS_SEARCH.findCodeExamplesByKeywords(json, inputValue);
      if (result.length < 1) {
        DS_SEARCH.textCouldNotBeFound();
      } else {
        result.forEach((x) => {
          const api = json.filter((api) => {
            return api.Name === x.item.Name;
          })[0];

          x.item.Groups.forEach((group, groupIndex) => {
            const unfilteredGroup = api.Groups.filter((apiGroup) => {
              return apiGroup.Name === group.Name;
            })[0];

            group.Examples.forEach((example, index) => {
              const clearedExamples = unfilteredGroup.Examples.filter((apiExample) => {
                return apiExample.ExampleNumber === example.ExampleNumber;
              })
              x.item.Groups[groupIndex].Examples[index] = clearedExamples[0];
            });
          });

          DS_SEARCH.addCodeExampleToHomepage([x.item]);
        });
      }
    }
  }
}
