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

  describe('Cadastro com sucesso em casos limítrofes', function () {
    afterEach(function () {
      cy.deleteUserApi(user.id)
    })

    it('Nome com 100 caracteres é aceito', function () {
      cy.intercept("POST", "/api/v1/users").as("criarUsuario")

      let valorNome = ""
      while (valorNome.length < 100) {
        valorNome += "a"
      }

      cy.get(criarUsuario.inputEmail).type(userFaker.email)
      cy.get(criarUsuario.inputNome).type(valorNome)

      criarUsuario.clicarBotaoSalvar()
      cy.wait("@criarUsuario").then(function (res) {
        user = res.response.body
        cy.contains("Usuário salvo com sucesso!").should("exist")
      })
    })

    it('Nome com 4 caracteres é aceito', function () {
      cy.intercept("POST", "/api/v1/users").as("criarUsuario")

      const valorNome = "abcd"

      cy.get(criarUsuario.inputEmail).type(userFaker.email)
      cy.get(criarUsuario.inputNome).type(valorNome)

      criarUsuario.clicarBotaoSalvar()
      cy.wait("@criarUsuario").then(function (res) {
        user = res.response.body
        cy.contains("Usuário salvo com sucesso!").should("exist")
      })
    })

    it('Email com 60 caracteres é aceito', function () {
      cy.intercept("POST", "/api/v1/users").as("criarUsuario")

      let valorEmail = "a@gmail.com."
      while (valorEmail.length < 60) {
        valorEmail += "a"
      }

      cy.get(criarUsuario.inputEmail).type(valorEmail)
      cy.get(criarUsuario.inputNome).type(userFaker.name)

      criarUsuario.clicarBotaoSalvar()
      cy.wait("@criarUsuario").then(function (res) {
        user = res.response.body
        cy.contains("Usuário salvo com sucesso!").should("exist")
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
      it('Campo de nome vazio não é aceito', function () {
        cy.get(criarUsuario.inputEmail).type(userFaker.email)
        criarUsuario.clicarBotaoSalvar()

        cy.contains("O campo nome é obrigatório.").should("exist")

        cy.contains("O campo e-mail é obrigatório.").should("not.exist")
        cy.contains("Usuário salvo com sucesso!").should("not.exist")
      })

      it('Nome com menos de 4 caracteres não é aceito', function () {
        cy.get(criarUsuario.inputEmail).type(userFaker.email)
        cy.get(criarUsuario.inputNome).type("abc")
        criarUsuario.clicarBotaoSalvar()

        cy.contains("Informe pelo menos 4 letras para o nome.").should("exist")

        cy.contains("O campo e-mail é obrigatório.").should("not.exist")
        cy.contains("Usuário salvo com sucesso!").should("not.exist")
      })

      it('Nome com 100 ou mais caracteres não é aceito', function () {
        let valorNome = ""
        while (valorNome.length < 101) {
          valorNome += "a"
        }

        cy.get(criarUsuario.inputEmail).type(userFaker.email)
        cy.get(criarUsuario.inputNome).type(valorNome)
        criarUsuario.clicarBotaoSalvar()

        cy.contains("Informe no máximo 100 caracteres para o nome").should("exist")

        cy.contains("O campo e-mail é obrigatório.").should("not.exist")
        cy.contains("Usuário salvo com sucesso!").should("not.exist")
      })

      it('Nome contendo números não é aceito', function () {
        cy.get(criarUsuario.inputEmail).type(userFaker.email)
        cy.get(criarUsuario.inputNome).type("NomeUsuario123456")
        criarUsuario.clicarBotaoSalvar()

        cy.contains("Formato do nome é inválido.").should("exist")

        cy.contains("O campo e-mail é obrigatório.").should("not.exist")
        cy.contains("Usuário salvo com sucesso!").should("not.exist")
      })

      it('Nome contendo símbolos não é aceito', function () {
        cy.get(criarUsuario.inputEmail).type(userFaker.email)
        cy.get(criarUsuario.inputNome).type("NomeUsuario$")
        criarUsuario.clicarBotaoSalvar()

        cy.contains("Formato do nome é inválido.").should("exist")

        cy.contains("O campo e-mail é obrigatório.").should("not.exist")
        cy.contains("Usuário salvo com sucesso!").should("not.exist")
      })
    })

    describe('Validação do campo de email', function () {

    })
  })

})