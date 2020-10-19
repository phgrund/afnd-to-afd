const { parseAFNDFile, getNumericalSet, getAFDInfo, removeUnusedStatesPath, writeAFDFile } = require('./utils')

const path = 'entrada.txt'

const main = async () => {
  const AFND = await parseAFNDFile(path)

  const subsets = getNumericalSet(AFND)

  const AFD = getAFDInfo(AFND, subsets)

  removeUnusedStatesPath(AFD)

  console.log(AFD.states)

  writeAFDFile(AFD, 'saida.txt')
}

main()
