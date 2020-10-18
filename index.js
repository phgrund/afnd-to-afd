const { parseAFNDFile, getNumericalSet, getAFDInfo, removeUnusedStatesPath, writeAFDFile } = require('./utils')

const language = ['0', '1']
const nullState = '2'

const path = 'entrada.txt'

const main = async () => {
  const AFND = await parseAFNDFile(path)

  const subsets = getNumericalSet(AFND)

  console.log(subsets)

  const AFD = getAFDInfo(AFND, subsets, language)

  console.log(AFD.initialState)

  AFD.states.forEach(state => {
    console.log(state.chars)
    // state.chars.forEach(char => console.log(char))
  })

  // removeUnusedStatesPath(AFD)

  writeAFDFile(AFD, 'saida.txt')
}

main()
