const { readFile, writeFile } = require('fs').promises

/**
 * Lê um arquivo .txt e transforma em um Autômato Finito Não Determinístico
 * Formato do Arquivo:
 * Linha 0: a sequência de estados separados por espaço. EX: A B C D E F
 * Linha 1: estado inicial
 * Linha 2: estados finais separados por espaço ( se houver mais de um estado final)
 * Linha 3 em diante: estado atual, espaço, caractere lido, espaço, próximo estado
 *
 * @param  {string} path Caminho do arquivo a ser lido
 * @return {object}      Objeto do Autômato Finito Não Determinístico
 */
const parseAFNDFile = async path => {
  const file = await readFile(path, 'utf-8')

  if (!file || typeof file !== 'string') throw new Error('Arquivo inválido')

  const lines = file.split('\n')

  if (lines.length < 4) throw new Error('Formato do arquivo inválido')

  // Cria um AFND vazio
  const AFND = {
    states: {},
    initialState: null,
    finalStates: []
  }

  // Adiciona os estados ao objeto do AFND
  lines.shift().split(' ').forEach(state => AFND.states[state] = [])

  // Adiciona a referência do estado inicial
  // AFND.initialState = AFND.states[lines.shift()]
  AFND.initialState = lines.shift()

  // Adiciona referências do(s) estado(s) final(is)
  // lines.shift().split(' ').forEach(state => AFND.finalStates.push(AFND.states[state]))
  lines.shift().split(' ').forEach(state => AFND.finalStates.push(state))

  lines.forEach(line => {
    const [currentState, char, nextState] = line.split(' ')

    if (!currentState || !char || !nextState) return

    AFND.states[currentState].push({ char, nextState })
  })

  return AFND
}

/**
 * Pega uma Array de Strings e retorna ela ordenada por tamanho e ordem alfabética
 * @param {Array<string>} arr Array qualquer de string
 * @return {Array<string>}    Array ordenada
 */
const sortSubsets = arr => {
  return arr.slice().sort((a, b) => {
    const compare = a.length - b.length

    return compare === 0
      ? a.localeCompare(b)
      : compare
  })
}

/**
 * Retorna os subconjunto dos estados
 * @param {object} AFND    Objeto do Autômato Finito Não Determinístico
 * @return {Array<string>} Array contendo os subconjuntos
 */
const getNumericalSet = (AFND) => {
  const arr = []

  /**
   * Função recursiva para retornar os subconjuntos de cada caractere de uma string conjunto
   * @param {string} str String a ser convertida em subconjuntos
   * @param {string} acc String acumuladora, passar uma string vazia como padrão
   */
  const subsets = (str, acc) => {
    if (!str) {
      acc && arr.push(acc)
    } else {
      subsets(str.substring(1), acc + str.charAt(0))
      subsets(str.substring(1), acc)
    }
  }

  subsets(Object.keys(AFND.states).join(''), '')

  return sortSubsets(arr)
}

/**
 * Lẽ o conjunto de estados e retorna os possíveis caminhos testando um caractere do alfabeto
 * @param {object}        AFND     Objeto do AFND
 * @param {Array<string>} states   Array contendo o(s) estado(s) de partida
 * @param {Array<string>} language Array contendo o(s) caractere(s) da linguagem
 * @return {object}                Objeto contendo os caminhos dados para a linguagem e se é um estado final
 */
const getAFDStates = (AFND, states, language) => {
  const possiblePaths = language.map(() => new Set())

  states.forEach(state => {
    AFND.states[state].forEach(_state => {
      language.forEach((char, index) => {
        if (_state.char === char) {
          possiblePaths[index].add(_state.nextState)
        }
      })
    })
  })

  const obj = {
    chars: [],
    isFinalState: states.some(state => AFND.finalStates.includes(state))
  }

  language.forEach((char, index) => {
    obj.chars.push({
      [char]: [...possiblePaths[index]]
    })
  })

  return obj
}

/**
 * Letras do alfabeto
 */
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
/**
 * Retorna A - Z baseado no índice. Caso o índice esteja fora do alfabeto, retornará Q{n}, n começando de 0
 * @param {number} index Índice da letra do alfabeto (iniciando de 0)
 * @return {string}      Letra do Alfabeto ou Q{n}
 */
const getStateChar = index => {
  return index >= alphabet.length
    ? 'Q' + (index - alphabet.length)
    : alphabet.charAt(index)
}

/**
 * Transforma as informações do AFND em informações para o AFD
 * @param {object} AFND            Objeto do AFND
 * @param {Array<string>} subsets  Array contendo os subconjuntos
 * @param {Array<string>} language Array contendo o(s) caractere(s) da linguagem
 * @return {object}                Objeto com dados finais para montar o AFD
 */
const getAFDInfo = (AFND, subsets, language) => {
  const { initialState } = AFND

  const finalStates = new Set()

  const states = subsets.map((subset, index) => {
    const state = getAFDStates(AFND, subset.split(''), language)

    state.char = getStateChar(index)

    state.isFinalState && finalStates.add(state.char)

    return state
  })

  return {
    initialState,
    finalStates: [...finalStates],
    states
  }
}

const writeAFDFile = async (AFD, path) => {
  const lines = []

  const states = AFD.states.map(state => state.char).join(' ')
  const { initialState } = AFD
  const finalStates = AFD.finalStates.join(' ')

  lines.push(states)
  lines.push(initialState)
  lines.push(finalStates)

  AFD.states.forEach(state => {
    state.chars.forEach(char => {
      for(const [key, value] of Object.entries(char)) {
        value.forEach(val => {
          lines.push(`${state.char} ${key} ${val}`)
        })
      }
    })
  })

  await writeFile(path, lines.join('\n'))
}

module.exports = {
  parseAFNDFile,
  getNumericalSet,
  getAFDInfo,
  writeAFDFile
}
