
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
   * 'execute', 'learnMany' ou null. Caso null por padrão será iniciada como 'learn'
   * @param {Array<String>} intentTag Parâmetro obrigatório - o intentTag espera os nomes das tags na qual deve procurar
   * no intents.json, as opções dependem exclusivamente dos nomes dados a cada tag. Determinará quantos arquivos
   * de aprendizado serão criados
   * @param {Number} [numberIterations] Parâmetro opcional - este parâmetro determina o número de iterações que
   * o Sonny será treinado, como padrão será definido para 20000, caso nenhum valor do tipo número inteiro seja
   * definido
   * @returns {Object} Object
   */
  constructor(option, intentTag, numberIterations) {
    this.Error = null
    this.intentTag = null
    this.numberIterations = numberIterations == undefined ? 20000 : parseInt(numberIterations)
    this.option = option == undefined || option == null ? 'learn' : option;
    numberIterations = this.numberIterations

    if (typeof option != 'string')
      this.Error = new Error('O parâmetro option deve ser uma String');
    if (!Array.isArray(intentTag)) {
      this.Error = new Error('O parâmetro intentTag deve ser um Array ou não pode estar vazio');
    } else {
      this.intentTag = intentTag
    }
    if (typeof numberIterations != 'number')
      this.Error = new Error('O parâmetro numberIterations deve ser um número');



    Sonny.prototype.checkError = (Error) => {
      return console.log(Error)
    }

    /**
     * @param {String} task A task sempre deve ser igual ao valor da variável option
     * @returns
     */
    Sonny.ExecuteTask = (task) => {
      return console.log('executando tarefa', task)
    }

    return {
      boot: () => {
        if (this.Error) {
          return Sonny.prototype.checkError(this.Error)
        } else {
          Sonny.ExecuteTask(this.option)
        }
      },
    };
  }
}
let sonny = new Sonny('Oi', ['thcau', 'oi'])
sonny.boot()