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
  })

})