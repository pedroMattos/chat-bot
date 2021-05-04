
const fs = require('fs')
const brain = require('brain.js')
const net = new brain.recurrent.LSTM( {hiddenLayers: [10,10]} )


/**
 * @author Pedro Mattos
 * 
 * Esta classe cria treina um novo Sonny de acordo com as tags passadas da intent
 * @example
 *    new Sonny('update', ['greetings', 'negative_intents'], 130000)
 *    new Sonny(null, ['greetings'])
 *    new Sonny(null, ['greetings'], 130000)
 */

class Sonny {
  /**
   * @param {String} option Parâmetro obrigatório - este parãmetro espera ser uma das opções: 'learn',
   * 'update', ou null. Caso null por padrão será iniciada como 'learn'
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
    // else if (option != 'learn')
    //   this.Error = new Error('Opção inválida para o parâmetro option. opções disponíveis: "learn", "execute"');
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
     * 
     * @param {String} dir Parâmetro recebe o diretório onde serão gravadas as intents aprendidas por Sonny
     * @param {Array<String>} intentTags Recebe as intents já filtradas para nomear os arquivos aprendidos
     * por Sonny
     */
    Sonny.prototype.trainMany = (dir, intentTags) => {
      fs.readFile('testeIntents.json', (err, data) => {
        let jsonFile = JSON.parse(data.toString())
        for (let i = 0; i < jsonFile.intents.length; i++) {
          let inouts = []
          let trained = null
          if (intentTags.indexOf(jsonFile.intents[i].tag) > -1) {
            trained = jsonFile.intents[i].tag
            for (let j = 0; j < jsonFile.intents[i].input.length; j++) {
              inouts.push({
                input: jsonFile.intents[i].input[j],
                output: jsonFile.intents[i].output[j]
              })
            }
            net.train(inouts, {
              log: true,
              iterations: this.numberIterations
            });

            fs.writeFileSync(dir + trained + '.json', JSON.stringify(net.toJSON()), (err, result) => {
              if (err) return console.log(err)
            })
            console.log('Treinamento finalizado para', trained)
            intentTags.unshift()
          } else {
            console.log('Uma ou mais intents não encontradas')
          }
        }
      })
    }

    /**
     * @param {String} task A task sempre deve ser igual ao valor da variável option
     * @returns
     */
    Sonny.ExecuteTask = (task, arrayOfIntents) => {

      // Lista as intents novas a serem adicionadas através do nome da tag
      let listOfIntents = Sonny.prototype.fileTypeAndExistChecker(this.intentTag).newIntentsToLearn
      // Lista intents já existentes no diretório de intents aprendidas
      let existingIntents = Sonny.prototype.fileTypeAndExistChecker(this.intentTag).existingIntents

      Promise.resolve(Sonny.prototype.BlankFile(existingIntents)).then(() => {
        switch (task) {
          case 'learn':
            Sonny.prototype.trainMany(this.intentsDir, listOfIntents)
            break;
          case 'update':
            Sonny.prototype.RemoveExistingIntents(arrayOfIntents)
            break;
          default:
            return console.log('Saindo...')
        }
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
      let possibleExistingIntentsWithouExtension = []
      let newIntentsAvailable = []
      let blockedIntents = []
      possibleExistingIntents.forEach((el) => { possibleExistingIntentsWithouExtension.push(el.split('.')[0]) })
      for (let i = 0; i < nameIntents.length; i++) {
        if (possibleExistingIntentsWithouExtension.indexOf(nameIntents[i]) > -1) {
          blockedIntents.push(nameIntents[i])
        } else {
          newIntentsAvailable.push(nameIntents[i])
        }
      }
      return {newIntentsToLearn: newIntentsAvailable, existingIntents: blockedIntents}
    }


    /**
     * 
     * @param {Array<String>} arrayOfIntents Recebe um array com as intents a serem atualizadas
     */
    Sonny.prototype.RemoveExistingIntents = (arrayOfIntents) => {
      console.log('Atualizando intents... por favor aguarde isso pode demorar vários minutos')
      let reboot = new Sonny(null, arrayOfIntents, this.numberIterations, this.intentsDir)
      for (let i = 0; i < arrayOfIntents.length; i++) {
        fs.unlinkSync(this.intentsDir + arrayOfIntents[i] + '.json')
        reboot.train()
      }
    }

    Sonny.prototype.BlankFile = async (file) => {
      let arrayOfIntents = []
      let learned = 0
      if (file.length > 0) {
        for (let i = 0; i < file.length; i++) {
          let fileBuffer = fs.readFileSync(this.intentsDir + file[i] + '.json')
          if (fileBuffer.toString() === '') {
            arrayOfIntents.push(file[i])
          } else {
            learned ++
          }
        }
        // if (learned > 0) {
        //     throw new Error(`Uma ou mais Intents selecionadas já foram aprendidas por Sonny '${file}', 
        //     caso queira treiná-las novamente execute-as na função 'new Sonny(option, intentTag).reTeach()'`)
        // }
      } else {
        return;
      }
    }

    // Retorno principal da Class Sonny
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
      updateIntents: () => {
        if (this.Error) {
          return Sonny.prototype.checkError(this.Error)
        } else {
          Sonny.ExecuteTask(this.option, this.intentTag)
        }
      },
    };
  }
}

// ambiente de teste
let arrayIntents = ['cardapio_opcoes', 'greetings']

let sonny = new Sonny('learn', arrayIntents)
sonny.train()
// sonny.updateIntents()

module.exports = {Sonny}
