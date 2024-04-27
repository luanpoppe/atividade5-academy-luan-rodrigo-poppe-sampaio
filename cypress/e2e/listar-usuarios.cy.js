import { PaginaInicial } from "../support/pages/pagina-inicial"

describe('template spec', () => {
  const paginaInicial = new PaginaInicial()
  beforeEach(function () {
    cy.viewport("macbook-13")
    cy.visit('/')
  })

  describe('Recebendo resposta com 06 usuários', function () {
    beforeEach(function () {
      cy.intercept("GET", "api/v1/users", {
        fixture: "get-usuarios/get-6-usuarios.json"
      }).as("getUsers")

      cy.wait("@getUsers")
    })

    it('Total de páginas deve ser um', () => {
      cy.get(paginaInicial.itemPaginacaoAtual).should("have.text", "1 de 1")
    })

    it('Botões de avançar e voltar página devem estar desabilitados', function () {
      cy.get(paginaInicial.buttonNextPage).should("be.disabled")
      cy.get(paginaInicial.buttonPreviousPage).should("be.disabled")
    })

    it('Total de usuários mostrados na página deve ser até 06', function () {
      cy.get(`${paginaInicial.divListaUsuarios} > div`).should("have.length", 6)
    })

    it('Todos os usuários devem mostrar as informações pré-definidas', function () {
      cy.get(paginaInicial.itensListaUsuarios).then(function (resposta) {
        for (let item of resposta) {
          cy.wrap(item).should("contain", "Nome")
          cy.wrap(item).should("contain", "E-mail")
          cy.wrap(item).find("#userDataDetalhe").should("have.text", "Ver detalhes")
          cy.wrap(item).find("[data-test='userDataDelete']").should("exist")
        }
      })
    })

  })

  describe('Recebendo resposta com 18 usuários', function () {
    beforeEach(function () {
      cy.intercept("GET", "api/v1/users", {
        fixture: "get-usuarios/get-18-usuarios.json"
      }).as("getUsers")

      cy.wait("@getUsers")
    })

    it('Total de páginas deve ser 03', () => {
      cy.get(paginaInicial.itemPaginacaoAtual).should("have.text", "1 de 3")
    })

    it('Botão de avançar página deve estar habilitado, e o de voltar deve estar desabilitado', function () {
      cy.get(paginaInicial.buttonNextPage).should("be.enabled")
      cy.get(paginaInicial.buttonPreviousPage).should("be.disabled")
    })

    it('Total de usuários mostrados na página deve ser até 06', function () {
      cy.get(paginaInicial.itensListaUsuarios).should("have.length", 6)
    })
  })

  describe('Recebendo resposta com 03 usuários', function () {
    beforeEach(function () {
      cy.intercept("GET", "api/v1/users", {
        fixture: "get-usuarios/get-3-usuarios.json"
      }).as("getUsers")

      cy.wait("@getUsers")
    })

    it('Total de páginas deve ser 01', () => {
      cy.get(paginaInicial.itemPaginacaoAtual).should("have.text", "1 de 1")
    })

    it('Botão de avançar página deve estar habilitado, e o de voltar deve estar desabilitado', function () {
      cy.get(paginaInicial.buttonNextPage).should("be.disabled")
      cy.get(paginaInicial.buttonPreviousPage).should("be.disabled")
    })

    it('Total de usuários mostrados na página deve ser 03', function () {
      cy.get(paginaInicial.itensListaUsuarios).should("have.length", 3)
    })
  })

})