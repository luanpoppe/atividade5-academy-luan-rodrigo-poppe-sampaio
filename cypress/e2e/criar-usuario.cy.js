const { CriarUsuario } = require("../support/pages/criar-usuario")
import { faker } from '@faker-js/faker';

describe('Testes de criar usuário', function () {
  const criarUsuario = new CriarUsuario()
  const apiUrl = Cypress.env("apiUrl")
  const userFaker = { name: "teste" + faker.person.firstName(), email: faker.internet.email().toLowerCase() }
  let user

  beforeEach(function () {
    cy.viewport("macbook-13")
    cy.visit('/users/novo')
  })

  describe('Cadastro com sucesso:', function () {
    beforeEach(function () {
      cy.get(criarUsuario.inputNome).type(userFaker.name)
      cy.get(criarUsuario.inputEmail).type(userFaker.email)

      cy.intercept("POST", "/api/v1/users").as("criarUsuario")

      criarUsuario.clicarBotaoSalvar()

    })

    afterEach(function () {
      cy.deleteUserApi(user.id)
    })

    it('Mensagem de sucesso deve aparecer na tela após cadastro', function () {
      cy.wait("@criarUsuario").then(function (res) {
        user = res.response.body
      })
      cy.contains("Usuário salvo com sucesso!").should("exist")
    })

    it('Usuário cadastrado existe com valores corretos ao buscar na API', function () {
      cy.wait("@criarUsuario").then(function (res) {
        user = res.response.body

        cy.request(apiUrl + "/users/" + user.id).then(function (resposta) {
          expect(resposta.body).to.deep.include({
            name: userFaker.name,
            email: userFaker.email,
            id: user.id,
          })
        })
      })
    })

    it('Campos de email e nome devem ter seus valores resetados após cadastro com sucesso', function () {
      cy.wait("@criarUsuario").then(function (res) {
        user = res.response.body
      })

      cy.get(criarUsuario.inputNome).should("have.value", "")
      cy.get(criarUsuario.inputEmail).should("have.value", "")
    })

    it('Botão de salvar deve ficar desabilitado durante a requisição', function () {
      cy.get(criarUsuario.buttonSalvar).should("be.disabled")

      cy.wait("@criarUsuario").then(function (res) {
        user = res.response.body
      })
    })
  })

  describe("Tentativa de cadastro sem sucesso", function () {
    it('Campo de nome e de email vazios', function () {
      criarUsuario.clicarBotaoSalvar()

      cy.contains("O campo nome é obrigatório.").should("exist")
      cy.contains("O campo e-mail é obrigatório.").should("exist")
      cy.contains("Usuário salvo com sucesso!").should("not.exist")
    })

    describe.only('Validação do campo de nome', function () {
      it('Campo de nome vazio', function () {
        cy.get(criarUsuario.inputEmail).type(userFaker.email)
        criarUsuario.clicarBotaoSalvar()

        cy.contains("O campo nome é obrigatório.").should("exist")

        cy.contains("O campo e-mail é obrigatório.").should("not.exist")
        cy.contains("Usuário salvo com sucesso!").should("not.exist")
      })

      it('Nome com menos de 4 caracteres', function () {
        cy.get(criarUsuario.inputEmail).type(userFaker.email)
        cy.get(criarUsuario.inputNome).type("abc")
        criarUsuario.clicarBotaoSalvar()

        cy.contains("Informe pelo menos 4 letras para o nome.").should("exist")

        cy.contains("O campo e-mail é obrigatório.").should("not.exist")
        cy.contains("Usuário salvo com sucesso!").should("not.exist")
      })
    })

    describe('Validação do campo de email', function () {
    })
  })

})