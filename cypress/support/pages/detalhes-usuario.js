export class DetalhesUsuario {
    inputId = "input[name='id']"
    inputName = "input[name='name']"
    inputEmail = "input[name='email']"

    getButtonSalvar = () => cy.contains("Editar")
    getButtonEditar = () => cy.contains("Salvar")


    buttonVoltar = "[href='/users']"
    buttonHome = "[href='/']"
}