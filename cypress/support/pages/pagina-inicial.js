export class PaginaInicial {
    buttonNextPage = "#paginacaoProximo"
    buttonPreviousPage = "#paginacaoVoltar"
    buttonPreviousPage = "#paginacaoVoltar"
    buttonNovoUsuario = "[href='/users/novo']"
    buttonHome = "[href='/']"

    divListaUsuarios = "#listaUsuarios"
    itensListaUsuarios = `${this.divListaUsuarios} > div`

    inputPesquisar = "[placeholder='E-mail ou nome']"
    itemPaginacaoAtual = "#paginacaoAtual"

    pesquisarUsuario(valorPesquisa) {
        return cy.get(this.inputPesquisar).type(valorPesquisa)
    }
}