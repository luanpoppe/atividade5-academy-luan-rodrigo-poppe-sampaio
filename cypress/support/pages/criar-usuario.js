export class CriarUsuario {
    inputNome = "#name"
    inputEmail = "#email"
    buttonSalvar = "button[type='submit']"

    // divErroNome
    // divErroEmail

    buttonHome = "[href='/']"
    buttonVoltar = "[href='/users']"

    clicarBotaoSalvar() {
        cy.get(this.buttonSalvar).click()
    }
}