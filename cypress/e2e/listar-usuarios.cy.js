import { PaginaInicial } from "../support/pages/pagina-inicial"
import { faker } from '@faker-js/faker';

describe('template spec', () => {
  const paginaInicial = new PaginaInicial()
  const baseUrl = "https://rarocrud-frontend-88984f6e4454.herokuapp.com"

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

    it('Total de usuários mostrados na página deve ser 06', function () {
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

    it('Botão de avançar e de voltar página devem estar desabilitados', function () {
      cy.get(paginaInicial.buttonNextPage).should("be.disabled")
      cy.get(paginaInicial.buttonPreviousPage).should("be.disabled")
    })

    it('Total de usuários mostrados na página deve ser 03', function () {
      cy.get(paginaInicial.itensListaUsuarios).should("have.length", 3)
    })
  })

  describe('Recebendo resposta sem nenhum usuário', function () {
    const cadastrarNovoUsuario = "[href='/users/novo']"

    beforeEach(function () {
      cy.intercept("GET", "api/v1/users", {
        body: []
      }).as("getUsers")

      cy.wait("@getUsers")
    })

    it('Página deverá ter um h3 e uma tag <a>.', function () {
      cy.get("h3").should('have.text', "Ops! Não existe nenhum usuário para ser exibido.")
      cy.get(".sc-koXPp.csBRDe " + cadastrarNovoUsuario + " p").should('have.text', "Cadastre um novo usuário")
    })

    it('Página não deverá ter tags que mostram informações de usuários', function () {
      cy.get(paginaInicial.itensListaUsuarios).should("not.exist")
    })

    it('Botão de cadastrar novo usuário deve redirecionar à URL correta', function () {
      cy.get(".sc-koXPp.csBRDe " + cadastrarNovoUsuario).click()
      cy.url().should("equal", baseUrl + "/users/novo")
    })
  })

  describe('Botões de avançar e voltar página devem funcionar', function () {
    let nextPage
    let previousPage

    beforeEach(function () {
      cy.intercept("GET", "api/v1/users", {
        fixture: "get-usuarios/get-18-usuarios.json"
      }).as("getUsers")

      cy.wait("@getUsers")

      nextPage = () => cy.get(paginaInicial.buttonNextPage).click()
      previousPage = () => cy.get(paginaInicial.buttonPreviousPage).click()
    })

    it('Clicar no botão de avançar mostra os usuários de 07 a 12', function () {
      nextPage()
      cy.get(paginaInicial.itemPaginacaoAtual).should('have.text', "2 de 3")

      cy.get(paginaInicial.itensListaUsuarios).then(function (lista) {
        for (let item of lista) {
          cy.wrap(item).should('contain', "Página 02")
        }
      })
    })

    it('Clicar duas vezes no botão de avançar mostra os usuários de 13 a 18', function () {
      nextPage()
      nextPage()
      cy.get(paginaInicial.itemPaginacaoAtual).should('have.text', "3 de 3")
      cy.get(paginaInicial.buttonNextPage).should('be.disabled')

      cy.get(paginaInicial.itensListaUsuarios).then(function (lista) {
        for (let item of lista) {
          cy.wrap(item).should('contain', "Página 03")
        }
      })
    })

    it('Estando na página 2, cliar no botão de voltar volta à página 1 e mostra os usuários correspondentes', function () {
      nextPage()
      previousPage()
      cy.get(paginaInicial.itemPaginacaoAtual).should('have.text', "1 de 3")
      cy.get(paginaInicial.buttonPreviousPage).should('be.disabled')

      cy.get(paginaInicial.itensListaUsuarios).then(function (lista) {
        for (let item of lista) {
          cy.wrap(item).should('contain', "Página 01")
        }
      })
    })
  })

  describe('Botões do Header', function () {
    it('Botão de home com comportamento adequado', function () {
      cy.get(paginaInicial.buttonHome).click()
      cy.url().should("equal", baseUrl + "/users")
    })

    it('Botão de cadastrar novo usuário com comportamento adequado', function () {
      cy.get(paginaInicial.buttonNovoUsuario).click()
      cy.url().should("equal", baseUrl + "/users/novo")
    })
  })
})