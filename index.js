const inquirer = require("inquirer")
const chalk = require("chalk")
const figlet = require('figlet');

const fs = require("fs")

const config = {
    font: 'ANSI Shadow',
    horizontalLayout: 'fitted',
    verticalLayout: 'fitted',
};

let loggedUser;

figlet.text("PreziosaBank APP", config, function (err, data) {
    if (err) {
        console.log('Algo deu errado...');
        console.dir(err);
        return;
    }
    console.log(data);

    home();
});

// Opções iniciais
function home() {
    inquirer.prompt([{
        type: 'list',
        name: 'homeAction',
        message: 'Olá, como posso ajudar?',
        choices: [
            'Gostaria de acessar minha conta.',
            'Gostaria de criar uma conta.',
            'Sair.'
        ],
    },
    ]).then((answer) => {
        const homeAction = answer['homeAction']

        if (homeAction === 'Gostaria de acessar minha conta.') {
            login()
        } else if (homeAction === 'Gostaria de criar uma conta.') {
            createAccount()
        } else if (homeAction === 'Sair.') {
            console.log(chalk.bgBlue.black('Obrigado por usar o PreziosaBank APP!'))
            process.exit()
        }
    }).catch(err => console.log(err))
}

// Formulário para acessar a conta
function login() {
    inquirer.prompt([
        {
            name: 'accountUser',
            message: 'Qual o usuário da conta?'
        },
        {
            name: 'accountPassword',
            message: 'Qual a senha da conta?'
        }
    ]).then((answer) => {
        const accountUser = answer['accountUser']
        const accountPassword = answer['accountPassword']

        if (!accountUser || !accountPassword) {
            console.log(chalk.bgRed.black("Credenciais inválidas 1!"))
            return login()
        }

        if (!checkAccount(accountUser)) {
            console.log(chalk.bgRed.black("Credenciais inválidas 2!"))
            return login()
        }

        if (checkAccount(accountUser)) {
            const accountData = getAccount(accountUser)

            if (accountPassword != accountData.password) {
                console.log(
                    chalk.bgRed.black(
                        'Credenciais inválidas 3!'
                    ),
                )
                return login()
            }
        }

        loggedUser = accountUser;
        operation()
    }).catch(err => console.log(err))
}

// Verifica se conta existe
function checkAccount(accountUser) {
    if (!fs.existsSync(`accounts/${accountUser}.json`)) {
        return false
    }

    return true
}

// Seleciona uma determinada conta com base no nome do usuário
function getAccount(accountUser) {
    const accountJSON = fs.readFileSync(`accounts/${accountUser}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

// --------------------------------------------------| CRIAR CONTA - PARTE 1 |--------------------------------------------------
// Operação - Registrar conta, saudações pré registro de conta
function createAccount() {
    console.log(chalk.bgGreen.black('Seja bem-vindo(a) ao PreziosaBank!'))
    console.log(chalk.green('Vamos configurar sua conta.'))

    buildAccount()
}

// --------------------------------------------------| CRIAR CONTA - PARTE 2 |--------------------------------------------------
// Operação - Registrar conta, questionário
function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountUser',
            message: 'Por favor, digite o seu nome:',
        },
    ]).then(answer => {
        const accountUser = answer['accountUser']

        console.info(accountUser)

        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }

        // Verifica se a conta já existe
        if (checkAccount(accountUser)) {
            return existingAccountError()
        }

        // Pergunta a senha para cadastrar nova conta
        inquirer.prompt([
            {
                name: 'accountPassword',
                message: 'Por favor, digite a senha:',
            },
        ]).then(answer => {
            const accountPassword = answer['accountPassword']

            const accountData = {
                password: accountPassword,
                balance: 0
            };

            fs.writeFileSync(
                `accounts/${accountUser}.json`,
                JSON.stringify(accountData, null, 2),
                function (err) {
                    console.log(err)
                },
            )

            console.log(chalk.green('Parabéns, a sua conta foi criada!'))
            loggedUser = accountUser;
            operation()
        }).catch(err => console.log(err))
    })
}

// --------------------------------------------------| ERRO DE CONTA INEXISTENTE |--------------------------------------------------
function existingAccountError() {
    console.log(chalk.bgYellow.black('Você já possui uma conta registrada em nosso banco.'))

    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'Como deseja prosseguir?',
        choices: [
            'Gostaria de acessar minha conta.',
            'Gostaria de criar uma outra conta, utilizando outro nome.',
            'Sair.'
        ],
    },
    ]).then((answer) => {
        const action = answer['action']

        if (action === 'Gostaria de acessar minha conta.') {
            return login()
        } else if (action === 'Gostaria de criar uma outra conta, utilizando outro nome.') {
            return buildAccount()
        } else if (action === 'Sair.') {
            console.log(chalk.bgBlue.black('Obrigado por usar o PreziosaBank APP!'))
            process.exit()
        }
    }).catch(err => console.log(err))
}

// --------------------------------------------------| OPERAÇÕES |--------------------------------------------------
// Operações gerais da conta
function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        messsage: 'O que você deseja fazer?',
        choices: [
            'Consultar Saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ],
    },
    ]).then((answer) => {
        const action = answer['action']

        if (action === 'Depositar') {
            deposit()
        } else if (action === 'Consultar Saldo') {
            getAccountBalance(false)
        } else if (action === 'Sacar') {
            withdraw()
        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o PreziosaBank APP!'))
            process.exit()
        }
    }).catch(err => console.log(err))
}

// --------------------------------------------------| DEPÓSITO - PARTE 1 |--------------------------------------------------
// Operação - Depósito, questionário
function deposit() {
    if (!checkAccount(loggedUser)) {
        console.log(chalk.bgRed.black("Ocorreu um erro, volte mais tarde!"))
        return operation()
    }

    inquirer.prompt([
        {
            name: 'amount',
            message: 'Quanto você deseja depositar?',
        },
    ]).then((answer) => {
        const amount = answer['amount']

        addAmount(loggedUser, amount)
    }).catch(err => console.log(err))
}

// --------------------------------------------------| DEPÓSITO - PARTE 2 |--------------------------------------------------
// Operação - Depósito, incrementa a quantia na conta
function addAmount(accountUser, amount) {
    const accountData = getAccount(accountUser)

    if (!amount || amount <= 0) {
        console.log(chalk.bgRed.black('Por favor, informe um valor válido!'))
        return OperationNewTry(deposit)
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
    fs.writeFileSync(
        `accounts/${accountUser}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        },
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
    getAccountBalance(true)
    operation()
}

// --------------------------------------------------| VER SALDO |--------------------------------------------------
// Operação - Extrato, verifica saldo atual da conta
function getAccountBalance(afterOp) {
    if (!checkAccount(loggedUser)) {
        console.log(chalk.bgRed.black("Ocorreu um erro, volte mais tarde!"))
        return operation()
    }

    const accountData = getAccount(loggedUser)

    if (afterOp) {
        console.log(
            chalk.blue(
                `Seu novo saldo é de R$${accountData.balance}`
            ),
        )
    } else {
        console.log(
            chalk.bgBlue.black(
                `Seu saldo é de R$${accountData.balance}`
            ),
        )
        operation()
    }
}

// --------------------------------------------------| SAQUE - PARTE 1 |--------------------------------------------------
// Operação - Saque, questionário
function withdraw() {
    if (!checkAccount(loggedUser)) {
        console.log(chalk.bgRed.black("Ocorreu um erro, volte mais tarde!"))
        return operation()
    }

    inquirer.prompt([
        {
            name: 'amount',
            message: 'Quanto você deseja sacar?'
        }
    ]).then((answer) => {
        const amount = answer['amount']

        removeAmount(loggedUser, amount)
    }).catch(err => console.log(err))
}

// --------------------------------------------------| SAQUE - PARTE 2 |--------------------------------------------------
// Operação - Saque, remove certa quantia do saldo do usuário
function removeAmount(loggedUser, amount) {
    const accountData = getAccount(loggedUser)

    if (!amount || amount <= 0) {
        console.log(chalk.bgRed.black('Por favor, informe um valor válido!'))
        return OperationNewTry(withdraw)
    }

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return OperationNewTry(withdraw)
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${loggedUser}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`))
    getAccountBalance(true)
    operation()
}

// ----------------------------------| Chamar função da operação em caso de nova tentativa |----------------------------------
function OperationNewTry(f) {
    inquirer.prompt([{
        type: 'list',
        name: 'nextOperation',
        message: 'O que deseja fazer?',
        choices: [
            'Gostaria de tentar novamente.',
            'Gostaria de voltar para operações.'
        ],
    },
    ]).then((answer) => {
        const nextOperation = answer['nextOperation']

        if (nextOperation === 'Gostaria de tentar novamente.') {
            f()
        } else if (nextOperation === 'Gostaria de voltar para operações.') {
            operation()
        }
    }).catch(err => console.log(err))
}




