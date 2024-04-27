describe('template spec', () => {
  beforeEach(function () {
    cy.viewport("macbook-13")
    cy.visit('/')
  })

  it('passes', () => {
    cy.intercept("GET", "api/v1/users", {

    }).as("getUsers")

    cy.wait("@getUsers").then((resposta) => {
      cy.log(resposta)
    })
  })
})