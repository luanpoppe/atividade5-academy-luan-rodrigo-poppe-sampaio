const { PaginaInicial } = require("../support/pages/pagina-inicial")

describe('Testes de pesquisa de usuários', function () {
  const paginaInicial = new PaginaInicial()
  const baseUrl = "https://rarocrud-frontend-88984f6e4454.herokuapp.com"
  const apiUrl = Cypress.env("apiUrl")

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

  it('Não é realizada uma requisição de pesquisa se não for digitado algo no campo de pesquisa', function () {
    cy.get("@getPesquisa").should("not.exist")
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

  it('Botão de resetar pesquisa realiza uma requisição a todos os usuários', function () {
    cy.intercept("GET", "/api/v1/users").as("getTodosUsuarios")

    paginaInicial.pesquisarUsuario("aa")
    cy.get("@getTodosUsuarios").should("not.exist")
    cy.get('.sc-iGgWBj.cvYpuE').eq(1).click()

    cy.wait("@getTodosUsuarios").should("exist")

  })

  it('Apagar o valor do campo de pesquisa realiza uma requisição a todos os usuários', function () {
    cy.intercept("GET", "/api/v1/users").as("getTodosUsuarios")

    paginaInicial.pesquisarUsuario("aa")
    cy.get("@getTodosUsuarios").should("not.exist")
    paginaInicial.pesquisarUsuario("{backspace}{backspace}")

    cy.wait("@getTodosUsuarios").should("exist")

  })

  it('Pesquisar por usuário que não existe mostra tela correspondente', function () {
    const nomeASerPesquisado = "usuarioNaoExistenteComCertezaNaoExisteEsseUser@gmail.com"

    // Garantindo que o usuário que irei pesquisar não existe, e caso exista, deleto ele antes de realizar a pesquisa
    cy.request(apiUrl + "/users").then(function (resposta) {
      const usersThatMatch = resposta.body.filter((usuario) => usuario.email == nomeASerPesquisado)
      const botaoCriarNovoUsuario = ".sc-koXPp.csBRDe " + ".sc-bmzYkS.dmSxaj"

      if (usersThatMatch.length > 0) {
        cy.deleteUserApi(usersThatMatch[0].id)
      }

      paginaInicial.pesquisarUsuario(nomeASerPesquisado)
      cy.wait("@getPesquisa")

      cy.get("h3").should('have.text', "Ops! Não existe nenhum usuário para ser exibido.")
      cy.get(botaoCriarNovoUsuario + " p").should('have.text', "Cadastre um novo usuário")

      cy.get(paginaInicial.itensListaUsuarios).should("not.exist")

      cy.get(botaoCriarNovoUsuario).click()
      cy.url().should("equal", baseUrl + "/users/novo")
    })
  })

  describe('Testes com criação de usuários', function () {
    let user

    beforeEach(function () {
      cy.createUserApi().then(function (body) {
        user = body
      })
    })

    afterEach(function () {
      cy.deleteUserApi(user.id)
    })

    it('Pesquisar por nome traz resultado esperado', function () {
      // Se o resultado da pesquisa trouxer 6 ou menos usuários, todos aparecerão na página, e assim busco nos elementos da página. Este será o cenário mais comum.
      // Se por acaso o resultado trouxer mais de 6 usuários, o usuário criado por estar em outra página que não a primeira, tornando inviável buscar página a página.
      // Nesse segundo cenário, a solução que encontrei foi checar que o body da resposta da API traz o usuário criado na sua lista de usuários pesquisados.
      paginaInicial.pesquisarUsuario(user.name)
      cy.wait("@getPesquisa").then(function (res) {
        cy.get(paginaInicial.itensListaUsuarios).should("have.length.above", 0)

        const usuariosPesquisados = res.response.body

        if (usuariosPesquisados.length <= 6) {
          cy.get(paginaInicial.itensListaUsuarios).should("contain.text", user.name)

          // Garantindo que mesmo que o email seja muito grande e não apareça todo na tela, a parte que aparece é uma "sub-parte" do email criado
          cy.get('[data-test="userDataEmail"]').invoke("text").then((texto) => {
            const emailsSeparados = texto.split("E-mail: ").toString().split("...").toString().split(",")
            const isEmailInPage = emailsSeparados.some((item) => user.name.includes(item))

            expect(isEmailInPage).to.equal(true)
          })
        }
        else {
          const isUserCreatedInResponse = usuariosPesquisados.some((usuario) => usuario.name == user.name)
          expect(isUserCreatedInResponse).to.equal(true)
          cy.get(paginaInicial.buttonNextPage).should("be.enabled")
        }
      })
    })

    it('Pesquisar por email traz resultado esperado', function () {
      paginaInicial.pesquisarUsuario(user.email)
      cy.wait("@getPesquisa")

      cy.get(paginaInicial.itensListaUsuarios).should("have.length", 1)
      cy.get(paginaInicial.itensListaUsuarios).should("contain.text", user.name)

      // Garantindo que mesmo que o email seja muito grande e não apareça todo na tela, a parte que aparece é uma "sub-parte" do email criado
      cy.get('[data-test="userDataEmail"]').invoke("text").then((texto) => {
        const emailsSeparados = texto.split("E-mail: ").toString().split("...").toString().split(",").filter((item) => item != "")
        const isEmailInPage = emailsSeparados.some((item) => user.email.includes(item))

        expect(isEmailInPage).to.equal(true)
      })
    })

    it('Botão de ver detalhes leva à página correta do usuário', function () {
      paginaInicial.pesquisarUsuario(user.email)
      cy.wait("@getPesquisa")

      cy.get(paginaInicial.itensListaUsuarios).should("have.length", 1)
      cy.get("#userDataDetalhe").click()

      cy.url().should("equal", `${baseUrl}/users/${user.id}`)
      cy.get("[name='id']").should('have.value', user.id)
      cy.get("[name='name']").should('have.value', user.name)
      cy.get("[name='email']").should('have.value', user.email)
    })
  })

})