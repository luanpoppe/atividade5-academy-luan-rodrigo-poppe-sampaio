const { PaginaInicial } = require("../support/pages/pagina-inicial")

describe('Testes de pesquisa de usuários', function () {
  const paginaInicial = new PaginaInicial()

  beforeEach(function () {
    cy.viewport("macbook-13")
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

  it('Botão de resetar valor pesquisado só aparece após pesquisar algo', function () {
    cy.get('.sc-iGgWBj.cvYpuE').eq(1).should("be.empty")
    paginaInicial.pesquisarUsuario("aa")

    cy.get('.sc-iGgWBj.cvYpuE').eq(1).should("not.be.empty")
  })

  it('Botão de resetar valor pesquisado funciona corretamente', function () {
    paginaInicial.pesquisarUsuario("aa")
    cy.get(paginaInicial.inputPesquisar).should("have.value", "aa")
    cy.get('.sc-iGgWBj.cvYpuE').eq(1).click()
    cy.get(paginaInicial.inputPesquisar).should("not.have.value")
  })

  describe.only('Testes com criação de usuários', function () {
    let user

    beforeEach(function () {
      cy.createUserApi().then(function (resposta) {
        user = resposta.body
      })
    })

    afterEach(function () {
      cy.deleteUserApi(user.id)
    })

    it('Pesquisar por nome traz resultado esperado', function () {
      cy.log('user.name', user.name)
      paginaInicial.pesquisarUsuario(user.name).pause()

      cy.wait("@getPesquisa")
    })
  })

})