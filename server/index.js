require('dotenv-safe').config()
const {MercadoBitcoin, MercadoBitcoinTrade} = require('./api')

const infoApi = new MercadoBitcoin({currency: 'BTC'})

const tradeApi = new MercadoBitcoin({
    currency: 'BTC',
    key: process.env.KEY,
    secret: process.env.SECRET,
    pin: process.env.PIN,
})

async function getQuantity(coin, price , isBuy) {
  
   coin = isBuy ? 'brl' : coin.toLowerCase()

   const data = await tradeApi.getAccountInfo()

   const balance = parseFloat(data.balance[coin].available).toFixed(8)
   if(!isBuy) return balance

   if(balance < 100) return false
   console.log(`Saldo disponivel de ${coin}: ${balance}`)

   price = parseFloat(price)
   let qty = parseFloat((balance/price).toFixed(8));
   return qty - 0.00000001

}

setInterval(async() => {
 
    const response = await infoApi.ticker()
    console.log(response)
    if(response.ticker.sell > 339000)
   return console.log('Tá caro, aguardar')
   else 
   return console.log('Tá barato, comprar')
 try{
     const qty = await getQuantity('BRL',response.ticker.sell, true )
     if (!qty) return console.log('Saldo insuficiente para comprar')
    const data = await tradeApi.placeBuyOrder(qty, response.ticker.sell)
    console.log(`Ordem inserida no livro`, data)
    const buyPrice = parseFloat(response.ticker.sell)
    const profitability = parseFloat(process.env.PROFITABILITY)
    const sellQty = await getQuantity('BTC', 1, false)
    const data2 = await tradeApi.placeSellOrder(sellQty, buyPrice * profitability )
    console.log(`Ordem inserida no livro ${data2}`)
 } catch(error){
     console.error(error)
 }
  
}, process.env.CRAWLER_INTERVAL)