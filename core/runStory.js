const checkIfThereAreErrorsBeforeRunning = (
  handlerFunctions,
  authorizerFunctions,
  inputValidatorFunctions
) => {
  let collectErrors = [];

  if (!handlerFunctions.includes("run")) {
    collectErrors.push({
      issue: "MissingFunction",
      file: "handler.js",
      missing: "run",
    });
  }

  if (!authorizerFunctions.includes("authorizeUser")) {
    collectErrors.push({
      issue: "MissingFunction",
      file: "authorizer.js",
      missing: "authorizeUser",
    });
  }

  if (!authorizerFunctions.includes("resolveUserFromHttpRequest")) {
    collectErrors.push({
      issue: "MissingFunction",
      file: "authorizer.js",
      missing: "resolveUserFromHttpRequest",
    });
  }

  if (!inputValidatorFunctions.includes("getInputFromHttpRequest")) {
    collectErrors.push({
      issue: "MissingFunction",
      file: "inputValidator.js",
      missing: "getInputFromHttpRequest",
    });
  }

  if (!inputValidatorFunctions.includes("validateInput")) {
    collectErrors.push({
      issue: "MissingFunction",
      file: "inputValidator.js",
      missing: "validateInput",
    });
  }

  return collectErrors;
};

module.exports = async (
  storyName = "blogs/canCreateBlog",
  inputPayload,
  user = {},
  source = "cmd"
) => {
  return new Promise(async function (resolve, reject) {
    try {
      // Check if the story has handler function
      const handlerPath = `../stories/${storyName}/handler.js`;
      const authorizerPath = `../stories/${storyName}/authorizer.js`;
      const inputValidatorPath = `../stories/${storyName}/inputValidator.js`;
      const handlerFunctions = Object.keys(require(handlerPath)());
      const authorizerFunctions = Object.keys(require(authorizerPath)());
      const inputValidatorFunctions = Object.keys(
        require(inputValidatorPath)()
      );

      let collectErrors = checkIfThereAreErrorsBeforeRunning(
        handlerFunctions,
        authorizerFunctions,
        inputValidatorFunctions
      );

      if (!collectErrors.length) {
        const executionContext = {};
        let isUserAuthorized = require(authorizerPath)()["authorizeUser"](user);

        if (isUserAuthorized) {
          let inputIsValid = await require(inputValidatorPath)()[
            "validateInput"
          ](inputPayload);

          if (inputIsValid) {
            resolve(require(handlerPath)()["run"]());
          }
        }
      } else {
        throw {
          errorCode: "MissingFunctionsOrFiles",
          message: "Missing Functions or Files",
          collectErrors,
        };
      }
    } catch (error) {
      resolve(error);
    }
  });
};

// API:

// authorize -> getInputFromHttpRequest -> validateInput -> handler -> sendResponse

// CMD:

// authorize -> validateInput -> handler