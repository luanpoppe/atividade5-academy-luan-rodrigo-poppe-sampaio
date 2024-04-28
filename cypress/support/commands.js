// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { faker } from '@faker-js/faker';

const apiUrl = Cypress.env("apiUrl")

Cypress.Commands.add("createUserApi", function () {
    cy.log("Entrou no commands")

    return cy.request("POST", `${apiUrl}/users`, {
        name: faker.person.firstName(),
        email: faker.internet.email({ firstName: this.name })
    }).its("body")
})

Cypress.Commands.add("deleteUserApi", function (userId) {
    return cy.request("DELETE", `${apiUrl}/users/${userId}`)
})