
const fs = require('fs')
const readline = require('readline')
const brain = require('brain.js')
const net = new brain.recurrent.LSTM()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * @author Pedro Mattos
 * 
 * Esta classe cria treina um novo Sonny de acordo com as tags passadas da intent
 * @example
 *    new Sonny('execute', ['greetings', 'negative_intents'], 130000)
 *    new Sonny(null, ['greetings'])
 *    new Sonny(null, ['greetings'], 130000)
 */

class Sonny {
  /**
   * @param {String} option Parâmetro obrigatório - este parãmetro espera ser uma das opções: 'learn',
   * 'execute', ou null. Caso null por padrão será iniciada como 'learn'
   * @param {Array<String>} intentTag Parâmetro obrigatório - o intentTag espera os nomes das tags na qual deve procurar
   * no intents.json, as opções dependem exclusivamente dos nomes dados a cada tag. Determinará quantos arquivos
   * de aprendizado serão criados
   * @param {Number} [numberIterations] Parâmetro opcional - este parâmetro determina o número de iterações que
   * o Sonny será treinado, como padrão será definido para 20000, caso nenhum valor do tipo número inteiro seja
   * definido
   * @param {String} [intentsDir] Parâmetro opcional - recebe o diretório onde Sonny deverá procurar se há intents
   * que foram treinadas ou criar novas intents de aprendizado
   * @returns {Object} Object
   */
  constructor(option, intentTag, numberIterations, intentsDir) {
    this.intentsDir = intentsDir == undefined ? './learnedIntents/' : intentsDir
    this.Error = null
    this.intentTag = null
    this.numberIterations = numberIterations == undefined ? 20000 : parseInt(numberIterations)
    this.option = option == undefined || option == null ? 'learn' : option;
    numberIterations = this.numberIterations
    option = this.option

    if (typeof option != 'string')
      this.Error = new Error('O parâmetro option deve ser uma String');
    else if (option != 'learn')
      this.Error = new Error('Opção inválida para o parâmetro option. opções disponíveis: "learn", "execute"');
    if (!Array.isArray(intentTag)) {
      this.Error = new Error('O parâmetro intentTag deve ser um Array ou não pode estar vazio');
    } else {
      this.intentTag = intentTag
    }
    if (typeof numberIterations != 'number')
      this.Error = new Error('O parâmetro numberIterations deve ser um número');



      // Retorna mensagem de erro caso exista
    Sonny.prototype.checkError = (Error) => {
      return console.log(Error)
    }

    /**
     * @param {String} task A task sempre deve ser igual ao valor da variável option
     * @returns
     */
    Sonny.ExecuteTask = (task) => {

      // Lista as intents novas a serem adicionadas através do nome da tag
      let listOfIntents = Sonny.prototype.fileTypeAndExistChecker(this.intentTag).newIntentsToLearn
      // Lista intents já existentes no diretório de intents aprendidas
      let existingIntents = Sonny.prototype.fileTypeAndExistChecker(this.intentTag).existingIntents

      // Bloqueia a execução enquanto houver uma intentTag com o mesmo nome de uma learned já existente
      Promise.resolve(Sonny.prototype.BlankFile(existingIntents)).then(() => {
        console.log('terminou')
      })
      // return console.log('executando tarefa', task)
    }

    /**
     * 
     * @param {String} intentsDir Recebe o diretório de onde se encontram as intents aprendidas por Sonny
     * @returns {Array<String>} Retorna todos os arquivos dentro do diretório de intents aprendidas
     */
    Sonny.FindLocalFiles = (intentsDir) => {
      return fs.readdirSync(intentsDir)
    }

    /**
     * 
     * @param {Array<String>} nameIntents Recebe uma lista com todos os nomes das tags que devem ser lidas e irão gerar
     * um novo arquivo de intent aprendida
     */
    Sonny.prototype.fileTypeAndExistChecker = (nameIntents) => {
      let possibleExistingIntents = Sonny.FindLocalFiles(this.intentsDir)
      let newIntentsAvailable = []
      let blockedIntents = []
      newIntentsAvailable = nameIntents.filter(intent => {
        for (let i = 0; i < possibleExistingIntents.length; i++) {
          if (possibleExistingIntents[i].split('.')[1] == 'json') {
            if (possibleExistingIntents[i].split('.')[0] != intent) {
              return intent
            } else {
              blockedIntents.push(intent)
            }
          }
        }
      });
      return {newIntentsToLearn: newIntentsAvailable, existingIntents: blockedIntents}
    }

    Sonny.prototype.BlankFile = async (file) => {
      if (file.length > 0) {
        for (let i = 0; i < file.length; i++) {
          fs.readFile(this.intentsDir + file[i] + '.json', (err, data) => {
            if (err) return console.log(err)
            if (data.toString() === '') {
              console.log('Sonny será treinado agora!', file[i])
            } else {
              throw new Error(`As seguintes intents já foram aprendidas por Sonny '${file[i]}', 
              caso queira treiná-las novamente execute-as na função 'new Sonny(option, intentTag).reTeach()'`)
            }
          })
        }
      } else {
        return;
      }
    }

    return {
      // Treina o Sonny com intentTag validas
      train: () => {
        if (this.Error) {
          return Sonny.prototype.checkError(this.Error)
        } else {
          Sonny.ExecuteTask(this.option)
        }
      },
      // Treina Sonny com intentTag já existentes apagando as antigas
      reTeach: (intentTag) => {
        if (this.Error) {
          return Sonny.prototype.checkError(this.Error)
        } else {
          Sonny.ExecuteTask(this.option, intentTag)
        }
      },
    };
  }
}

// ambiente de teste
let arrayIntents = ['saudacoes', 'negativas', 'testeArquivo']

let sonny = new Sonny(null, arrayIntents)
sonny.train()