const { parseAFNDFile, getNumericalSet, getAFDInfo, writeAFDFile } = require('./utils')

const language = ['0', '1']

const path = 'entrada.txt'

const main = async () => {
  const AFND = await parseAFNDFile(path)

  const subsets = getNumericalSet(AFND)

  const AFD = getAFDInfo(AFND, subsets, language)

  AFD.states.forEach(state => {
    state.chars.forEach(char => console.log(char))
  })

  writeAFDFile(AFD, path)
}

main()
