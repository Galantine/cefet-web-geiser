// importação de dependência(s)
const express = require('express')
const fs = require('fs')
// variáveis globais deste módulo
const PORT = 3000
const db = {}
const app = express()
const CAMINHO_JOGADORES = 'server/data/jogadores.json'
const CAMINHO_JOGOS = 'server/data/jogosPorJogador.json'
// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código
app.use(express.static('client/'))
// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => {
    console.log('teste')
})

// EXERCÍCIO 2
// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set('view engine', 'hbs')
app.set('views', 'server/views')

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))
fs.readFile(CAMINHO_JOGADORES, (err, data) => {
    if (err) {
        throw err
    }
    Object.assign(db, JSON.parse(data))
})

fs.readFile(CAMINHO_JOGOS, (err, data) => {
    if (err) {
        throw err
    }
    let teste = JSON.parse(data)
    Object.assign(db, teste)
})

// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)
app.get('/', (req, res) => {
    res.render('index.hbs', db)
})

// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código
app.get('/jogador/:steamid', (req, res) => {
    let jogador = Object.assign({},db.players.find(element => element.steamid == req.params.steamid))
    jogador.totalJogos = db[req.params.steamid].games.length
    jogador.totalNaoJogados  = db[req.params.steamid].games.filter(game => game.playtime_forever == 0).length

    const cincoJogos = db[req.params.steamid].games.sort((a, b) => (a.playtime_forever > b.playtime_forever) ? -1 : 1).slice(0, 5).map( item => {
        let dump = Object.assign({}, item)
        dump.playtime_forever = Math.floor(item.playtime_forever/60)
        return dump
    })
    
    const player = {jogador: jogador, jogoMaisJogado: {id:req.params.steamid, j:cincoJogos[0]}, jogos: cincoJogos}
    res.render('jogador.hbs', player)
})