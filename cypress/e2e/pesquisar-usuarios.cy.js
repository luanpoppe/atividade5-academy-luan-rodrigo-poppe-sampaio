const { PaginaInicial } = require("../support/pages/pagina-inicial")

describe('descricao_do_describe', function () {
  const paginaInicial = new PaginaInicial()

  beforeEach(function () {
    cy.visit("/")
    cy.intercept("GET", "/api/v1/search?value=*").as("getPesquisa")
  })

  it('Barra de pesquisa existe e está habilitada', function () {
    cy.get(paginaInicial.inputPesquisar).should("exist")
    cy.get(paginaInicial.inputPesquisar).should("be.enabled")
  })

  it('Ao digitar algo no campo de busca, uma pesquisa é feita', function () {
    paginaInicial.pesquisarUsuario("aa")

    cy.wait("@getPesquisa").should("exist")
  })
})