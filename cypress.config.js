const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://rarocrud-frontend-88984f6e4454.herokuapp.com/",
    env: {
      apiUrl: "https://rarocrud-80bf38b38f1f.herokuapp.com/api/v1/"
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
