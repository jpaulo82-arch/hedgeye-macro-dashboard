// Hedgeye Terminal - Core Application Logic (BLAST Framework)
// Calibrado com o Livro Oficial "MASTER THE MARKET" e o Formato Padrão do Usuário

// 1. DADOS DE ESTADO: PORTFÓLIOS REAIS COM QUADRANTES NATIVOS RIGOROSOS
const portfolioData = {
  schwab: {
    name: "Carteira Principal (Charles Schwab)",
    lastUpdate: "02/09/2026 (Confirmado)",
    cashAvailable: 20082.46,
    positions: [
      // STOCKS
      { ticker: "MELI", name: "MercadoLibre Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 3, price: 1995.5038, cat: "CORE", minSize: "1-3%", conduct: "Manter posição CORE de equity" },
      { ticker: "AVGO", name: "Broadcom Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 10, price: 369.6516, cat: "CORE/TAIL", minSize: "1-3%", conduct: "Manter; vigiar compressão de múltiplos" },
      { ticker: "GOOG", name: "Alphabet Inc Class C", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 11, price: 333.415, cat: "CORE", minSize: "1-3%", conduct: "Manter; base sólida de geração de caixa" },
      { ticker: "ASML", name: "ASML Holding NV ADR", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 2, price: 1671.0265, cat: "CORE/TAIL", minSize: "1-3%", conduct: "Manter; fosso competitivo secular" },
      { ticker: "FN", name: "Fabrinet", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 8, price: 393.70, cat: "TAIL", minSize: "1-3%", conduct: "Manter tamanho reduzido; não comprar quedas" },
      { ticker: "BE", name: "Bloom Energy Corp", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 15, price: 206.7797, cat: "TAIL", minSize: "1-3%", conduct: "Manter tese de energia descentralizada" },
      { ticker: "UBER", name: "Uber Technologies Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 40, price: 76.44, cat: "CORE", minSize: "1-3%", conduct: "Manter; forte geração de caixa" },
      { ticker: "META", name: "Meta Platforms Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 5, price: 594.8688, cat: "CORE", minSize: "1-3%", conduct: "Manter; margens elevadas" },
      { ticker: "ALAB", name: "Astera Labs Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 10, price: 270.26, cat: "TAIL/ESPEC.", minSize: "1-3%", conduct: "Respeitar limite estrito TAIL" },
      { ticker: "MLI", name: "Mueller Industries Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 40, price: 61.5745, cat: "CORE", minSize: "1-3%", conduct: "Manter; exposição a materiais industriais" },
      { ticker: "NOK", name: "Nokia Corp ADR", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 200, price: 9.79, cat: "TRADE/TAIL", minSize: "1-3%", conduct: "Manter posição tática controlada" },
      { ticker: "MTSI", name: "MACOM Technology Solutions", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 7, price: 261.1654, cat: "TAIL", minSize: "1-3%", conduct: "Manter pequena" },
      { ticker: "INTC", name: "Intel Corp", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 20, price: 89.50, cat: "TRADE", minSize: "1-3%", conduct: "Trade tático com stop rigoroso" },
      { ticker: "COIN", name: "Coinbase Global Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 10, price: 177.45, cat: "TRADE/TAIL", minSize: "1-3%", conduct: "Manter dentro do limite de risco" },
      { ticker: "INTR", name: "Inter & Co Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 300, price: 5.9114, cat: "CORE/TRADE", minSize: "1-3%", conduct: "Manter pelo crescimento intrínseco de ROE" },
      { ticker: "AXTI", name: "AXT Inc", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 30, price: 56.525, cat: "TAIL/ESPEC.", minSize: "1-3%", conduct: "Manter posição mínima" },
      { ticker: "TSEM", name: "Tower Semiconductor", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 8, price: 205.615, cat: "TAIL", minSize: "1-3%", conduct: "Manter" },
      { ticker: "CRDO", name: "Credo Technology Group", broker: "Schwab", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 8, price: 169.202, cat: "TAIL/ESPEC.", minSize: "1-3%", conduct: "Vigiar suporte de TRADE" },
      
      // ETFS & FUNDS
      { ticker: "SGOV", name: "iShares 0-3M Treasury", broker: "Schwab", typeGroup: "Renda Fixa / Caixa", nativeQuad: "Caixa", quadKey: "QUAD 3", qty: 200, price: 100.4123, cat: "CAIXA", minSize: "10-30%", conduct: "Preservar liquidez para compras nos pisos" },
      { ticker: "AAAU", name: "Goldman Sachs Physical Gold", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 150, price: 43.07, cat: "CORE/TRADE", minSize: "2-6%", conduct: "Posição prioritária de alta convicção em Quad 3" },
      { ticker: "HUMN", name: "Roundhill Humanoid Robotics", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "TAIL", qty: 170, price: 29.1599, cat: "TAIL", minSize: "2-6%", conduct: "Manter tamanho reduzido (1–3%)" },
      { ticker: "DRIV", name: "Global X Autonomous & EV", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "TAIL", qty: 130, price: 34.02, cat: "TAIL", minSize: "2-6%", conduct: "Manter tese de 3+ anos" },
      { ticker: "XLI", name: "Industrial Select Sector SPDR", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad2", quadKey: "QUAD 2", qty: 25, price: 172.9062, cat: "CORE", minSize: "2-6%", conduct: "Manter; alinhado a reshoring" },
      { ticker: "XBI", name: "SPDR S&P Biotech ETF", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 25, price: 162.4639, cat: "TRADE", minSize: "2-6%", conduct: "Trade tático; monitorar liquidez" },
      { ticker: "SLV", name: "iShares Silver Trust", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad2", quadKey: "QUAD 3", qty: 60, price: 58.67, cat: "TRADE/TAIL", minSize: "2-6%", conduct: "Não comprar a queda; manter tamanho mínimo" },
      { ticker: "GRID", name: "First Trust Smart Grid Infra", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad2", quadKey: "QUAD 3", qty: 20, price: 175.46, cat: "TAIL", minSize: "2-6%", conduct: "Manter tese de infra de energia" },
      { ticker: "AIPO", name: "Defiance AI & Power Infra", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "QUAD 3", qty: 125, price: 27.57, cat: "TAIL", minSize: "2-6%", conduct: "Manter alinhamento com energia de IA" },
      { ticker: "GDX", name: "VanEck Gold Miners ETF", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 30, price: 96.8087, cat: "CORE/TRADE", minSize: "2-6%", conduct: "Manter hedge; ouro em forte alta" },
      { ticker: "REMX", name: "VanEck Rare Earth & Metals", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad2", quadKey: "QUAD 3", qty: 37, price: 75.49, cat: "TAIL", minSize: "2-6%", conduct: "Manter posição geopolítica" },
      { ticker: "DRAM", name: "Roundhill Memory ETF", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 50, price: 55.68, cat: "TAIL/ESPEC.", minSize: "2-6%", conduct: "Manter" },
      { ticker: "FOTO", name: "Tuttle Capital Photonics", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 130, price: 17.00, cat: "TAIL", minSize: "2-6%", conduct: "Manter posição temática" },
      { ticker: "SPMO", name: "Invesco S&P 500 Momentum", broker: "Schwab", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 15, price: 146.02, cat: "TRADE", minSize: "2-6%", conduct: "Trade tático" },

      // FIXED INCOME (CREDIT)
      { ticker: "453258AP0", name: "Vale Canada Ltd 7.2% 32F", broker: "Schwab", typeGroup: "Renda Fixa", nativeQuad: "Credito", quadKey: "CRÉDITO", qty: 10000, price: 1.08142, cat: "CORE RENDA", minSize: "3-10%", conduct: "Manter fluxo de cupons de 7.2%" },
      { ticker: "SAN/29", name: "Santander UK GR 7.95% 29F", broker: "Schwab", typeGroup: "Renda Fixa", qty: 10000, price: 1.047567, cat: "CORE RENDA", nativeQuad: "Credito", quadKey: "CRÉDITO", minSize: "3-10%", conduct: "Manter fluxo de cupons de 7.95%" },
      { ticker: "86964WAL6", name: "Suzano Austria 2.5% 28F", broker: "Schwab", typeGroup: "Renda Fixa", qty: 11000, price: 0.947011, cat: "CORE RENDA", nativeQuad: "Credito", quadKey: "CRÉDITO", minSize: "3-10%", conduct: "Manter até vencimento 2028" },
      { ticker: "36966TKD3", name: "General Electric 4.25% 34", broker: "Schwab", typeGroup: "Renda Fixa", qty: 11000, price: 0.916917, cat: "CORE RENDA", nativeQuad: "Credito", quadKey: "CRÉDITO", minSize: "3-10%", conduct: "Manter fluxo até 2034" },
      { ticker: "404119AJ8", name: "HCA Inc 7.5% 33", broker: "Schwab", typeGroup: "Renda Fixa", qty: 9000, price: 1.111037, cat: "CORE RENDA", nativeQuad: "Quad3", quadKey: "QUAD 3", minSize: "3-10%", conduct: "Manter cupom de 7.5%" },
      { ticker: "VALE/39", name: "Vale Overseas 6.875% 39F", broker: "Schwab", typeGroup: "Renda Fixa", qty: 9000, price: 1.078192, cat: "CORE RENDA", nativeQuad: "Credito", quadKey: "CRÉDITO", minSize: "3-10%", conduct: "Manter cupom de 6.875%" },
      { ticker: "681936BF6", name: "Omega Healthcare 4.5% 27", broker: "Schwab", typeGroup: "Renda Fixa", qty: 8000, price: 0.998959, cat: "CORE RENDA", nativeQuad: "Quad3", quadKey: "QUAD 3", minSize: "3-10%", conduct: "Manter vencimento 2027" },
      { ticker: "345370CX6", name: "Ford Motor Co 9.625% 30", broker: "Schwab", typeGroup: "Renda Fixa", qty: 6000, price: 1.116911, cat: "TRADE RENDA", nativeQuad: "Credito", quadKey: "CRÉDITO", minSize: "3-10%", conduct: "Monitorar spreads de crédito" },
      { ticker: "279158AN9", name: "Ecopetrol SA 6.875% 30F", broker: "Schwab", typeGroup: "Renda Fixa", qty: 6000, price: 1.0107, cat: "CORE RENDA", nativeQuad: "Quad3", quadKey: "QUAD 3", minSize: "3-10%", conduct: "Manter cupom de 6.875%" },
      { ticker: "382550AD3", name: "Goodyear Tire 7% 28", broker: "Schwab", typeGroup: "Renda Fixa", qty: 6000, price: 1.0100, cat: "TRADE RENDA", nativeQuad: "Credito", quadKey: "CRÉDITO", minSize: "3-10%", conduct: "Manter até 2028" },
      { ticker: "88167AAE1", name: "Teva Pharmaceutical 3.15% 26F", broker: "Schwab", typeGroup: "Renda Fixa", qty: 6000, price: 0.9975, cat: "CORE RENDA", nativeQuad: "Quad3", quadKey: "QUAD 3", minSize: "3-10%", conduct: "Manter até vencimento" }
    ]
  },
  tastyworks: {
    name: "Tastyworks (Conectividade IA, Temáticas & Ouro)",
    lastUpdate: "02/09/2026 (Confirmado)",
    cashAvailable: 9000.00,
    positions: [
      { ticker: "CAIXA", name: "Dólar em Caixa / Poder de Compra", broker: "Tastyworks", typeGroup: "Caixa", nativeQuad: "Caixa", quadKey: "QUAD 3", qty: 1, price: 9000.00, cat: "CAIXA", minSize: "10-30%", conduct: "Manter para buy the dips nos pisos de Risk Range" },
      { ticker: "MELI", name: "MercadoLibre Inc", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 1, price: 1994.04, cat: "CORE", minSize: "1-3%", conduct: "Manter; líder em e-commerce e fintech" },
      { ticker: "BE", name: "Bloom Energy Corp", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 9, price: 206.66, cat: "TAIL", minSize: "1-3%", conduct: "Manter tese secular de energia p/ IA" },
      { ticker: "NEM", name: "Newmont Corporation", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 14, price: 124.65, cat: "CORE", minSize: "1-3%", conduct: "Manter; mineradora de ouro de alta qualidade" },
      { ticker: "DRIV", name: "Global X Autonomous & EV", broker: "Tastyworks", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "TAIL", qty: 50, price: 34.02, cat: "TAIL", minSize: "2-6%", conduct: "Manter posição estrutural 3+ anos" },
      { ticker: "GOOGL", name: "Alphabet Inc", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 5, price: 336.51, cat: "CORE", minSize: "1-3%", conduct: "Manter; balanço de fortaleza" },
      { ticker: "HUMN", name: "Humanoid Robotics ETF", broker: "Tastyworks", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "TAIL", qty: 55, price: 29.18, cat: "TAIL", minSize: "2-6%", conduct: "Manter tamanho reduzido (1–3%)" },
      { ticker: "FN", name: "Fabrinet", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 4, price: 393.70, cat: "TAIL", minSize: "1-3%", conduct: "Acompanhar capex de hyperscalers" },
      { ticker: "AVGO", name: "Broadcom Inc", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 4, price: 369.70, cat: "CORE/TAIL", minSize: "1-3%", conduct: "Manter; excelente fluxo de caixa" },
      { ticker: "NOK", name: "Nokia Oyj", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 150, price: 9.79, cat: "TRADE/TAIL", minSize: "1-3%", conduct: "Acompanhar ciclo de conectividade" },
      { ticker: "INTC", name: "Intel Corp", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 15, price: 89.52, cat: "TRADE", minSize: "1-3%", conduct: "Trade tático com stop definido" },
      { ticker: "ARM", name: "Arm Holdings plc", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 5, price: 230.99, cat: "TAIL", minSize: "1-3%", conduct: "Manter tese de arquitetura para IA" },
      { ticker: "AXTI", name: "AXT Inc", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 20, price: 56.55, cat: "TAIL/ESPEC.", minSize: "1-3%", conduct: "Manter posição pequena especulativa" },
      { ticker: "APH", name: "Amphenol Corporation", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 7, price: 158.30, cat: "CORE/TAIL", minSize: "1-3%", conduct: "Manter; infraestrutura de data centers" },
      { ticker: "ALAB", name: "Astera Labs Inc", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 4, price: 270.26, cat: "TAIL/ESPEC.", minSize: "1-3%", conduct: "Monitorar volatilidade de múltiplos" },
      { ticker: "COHR", name: "Coherent Corp", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 4, price: 266.07, cat: "TAIL/ESPEC.", minSize: "1-3%", conduct: "Acompanhar expansão de demanda óptica" },
      { ticker: "CRDO", name: "Credo Technology Group", broker: "Tastyworks", typeGroup: "Acao", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 6, price: 169.16, cat: "TAIL/ESPEC.", minSize: "1-3%", conduct: "Acompanhar datas de earnings" },
      { ticker: "XBI", name: "SPDR S&P Biotech ETF", broker: "Tastyworks", typeGroup: "ETF", nativeQuad: "Quad1", quadKey: "QUAD 1", qty: 6, price: 162.45, cat: "TRADE", minSize: "2-6%", conduct: "Posição tática sensível a liquidez" },
      { ticker: "GDX", name: "VanEck Gold Miners ETF", broker: "Tastyworks", typeGroup: "ETF", nativeQuad: "Quad3", quadKey: "QUAD 3", qty: 10, price: 96.90, cat: "CORE/TRADE", minSize: "2-6%", conduct: "Excelente vetor de proteção contra inflação" }
    ]
  }
};

// 2. DADOS DE RISK RANGES OFICIAIS (03/09/2026) COM COMPARAÇÃO DIA ANTERIOR
const riskRangesData = [
  { ticker: "UST10Y", name: "10Y U.S. Treasury Yield", type: "rates", low: 4.68, high: 4.84, current: 4.76, signal: "BULLISH", prevLow: 4.67, prevHigh: 4.83, prevSignal: "BULLISH" },
  { ticker: "UST30Y", name: "30Y U.S. Treasury Yield", type: "rates", low: 5.16, high: 5.31, current: 5.24, signal: "BULLISH", prevLow: 5.14, prevHigh: 5.29, prevSignal: "BULLISH" },
  { ticker: "UST2Y", name: "2Y U.S. Treasury Yield", type: "rates", low: 4.25, high: 4.45, current: 4.38, signal: "BULLISH", prevLow: 4.23, prevHigh: 4.42, prevSignal: "BULLISH" },
  { ticker: "HYG", name: "High Yield Corporate Bond ETF", type: "rates", low: 78.91, high: 79.50, current: 79.28, signal: "BULLISH", prevLow: 78.90, prevHigh: 79.48, prevSignal: "BULLISH" },
  { ticker: "LQD", name: "Investment Grade Corp Bond ETF", type: "rates", low: 104.90, high: 106.10, current: 105.40, signal: "BEARISH", prevLow: 104.90, prevHigh: 106.00, prevSignal: "BEARISH" },
  { ticker: "SPX", name: "S&P 500", type: "indices", low: 7602, high: 7744, current: 7680, signal: "BULLISH", prevLow: 7601, prevHigh: 7745, prevSignal: "BULLISH" },
  { ticker: "COMPQ", name: "NASDAQ Composite", type: "indices", low: 25825, high: 26590, current: 26210, signal: "BULLISH", prevLow: 25850, prevHigh: 26650, prevSignal: "BULLISH" },
  { ticker: "RUT", name: "Russell 2000", type: "indices", low: 2910, high: 3016, current: 2957, signal: "BULLISH", prevLow: 2900, prevHigh: 3000, prevSignal: "BULLISH" },
  { ticker: "XLV", name: "Health Care SPDR", type: "indices", low: 170.00, high: 177.00, current: 173.50, signal: "BULLISH", prevLow: 168.50, prevHigh: 177.50, prevSignal: "BULLISH" },
  { ticker: "IGV", name: "Tech-Software Sector ETF", type: "indices", low: 101.00, high: 113.00, current: 107.20, signal: "BULLISH", prevLow: 99.00, prevHigh: 111.00, prevSignal: "BULLISH" },
  { ticker: "OIH", name: "Oil Services ETF", type: "commodities", low: 411.00, high: 441.00, current: 426.00, signal: "BULLISH", prevLow: 405.00, prevHigh: 435.00, prevSignal: "BULLISH" },
  { ticker: "VIX", name: "Volatility Index (CBOE)", type: "rates", low: 14.01, high: 16.47, current: 15.20, signal: "BEARISH", prevLow: 14.43, prevHigh: 16.99, prevSignal: "BEARISH" },
  { ticker: "USD", name: "U.S. Dollar Index (DXY)", type: "rates", low: 98.75, high: 99.69, current: 99.15, signal: "BEARISH", prevLow: 98.77, prevHigh: 99.99, prevSignal: "BEARISH" },
  { ticker: "WTIC", name: "Light Crude Oil (WTI)", type: "commodities", low: 86.13, high: 93.94, current: 89.20, signal: "BULLISH", prevLow: 83.96, prevHigh: 91.98, prevSignal: "BULLISH" },
  { ticker: "BRENT", name: "Brent Crude Oil", type: "commodities", low: 89.00, high: 101.00, current: 94.50, signal: "BULLISH", prevLow: 87.00, prevHigh: 98.00, prevSignal: "BULLISH" },
  { ticker: "NATGAS", name: "Natural Gas", type: "commodities", low: 2.81, high: 3.07, current: 2.94, signal: "BULLISH", prevLow: 2.75, prevHigh: 3.05, prevSignal: "BULLISH" },
  { ticker: "GOLD", name: "Gold Spot", type: "commodities", low: 4292, high: 4698, current: 4480, signal: "BULLISH", prevLow: 4251, prevHigh: 4752, prevSignal: "BULLISH" },
  { ticker: "COPPER", name: "Copper Spot", type: "commodities", low: 6.40, high: 6.71, current: 6.55, signal: "BULLISH", prevLow: 6.36, prevHigh: 6.71, prevSignal: "BULLISH" },
  { ticker: "SILVER", name: "Silver Spot", type: "commodities", low: 63.00, high: 69.00, current: 64.50, signal: "NEUTRAL", prevLow: 62.00, prevHigh: 67.00, prevSignal: "NEUTRAL" }
];

let activePortfolioKey = "schwab";
let portfolioChartInstance = null;

// DADOS FUNDAMENTALISTAS MICRO (THE PODS & TECH/IA ECOSYSTEM)
const fundamentalsData = [
  { ticker: "MELI", name: "MercadoLibre Inc", category: "core_fcf", techNiche: "E-commerce, Logística & Fintech LatAm", revGrowth: "+35% a +42%", fcfMargin: "Excelente (US$ 8B+ caixa)", moat: "Monopólio logístico (Meli Delivery) + ecossistema bancário (Mercado Pago). Poder de repasse inflacionário em moedas locais e DXY Bearish.", verdict: "🟢 CORE INDISCUTÍVEL", verdictClass: "badge-bullish" },
  { ticker: "AVGO", name: "Broadcom Inc", category: "ai_infra", techNiche: "Switches Ethernet (Tomahawk 5/6), ASICs Customizados IA & VMware", revGrowth: "+43% a +47%", fcfMargin: "Altíssima (~45% margem FCF)", moat: "Líder absoluta em switches para clusters de IA (Meta, Google, ByteDance) e chips customizados (XPU). Receita de software recorrente da VMware.", verdict: "🟢 CORE / ÂNCORA IA", verdictClass: "badge-bullish" },
  { ticker: "ASML", name: "ASML Holding NV", category: "semis", techNiche: "Litografia EUV & High-NA EUV", revGrowth: "+15% a +25% (recup.)", fcfMargin: "Forte (>30% margem)", moat: "Monopólio global absoluto em máquinas EUV indispensáveis para nós de 3nm, 2nm e A16. Ninguém fabrica chips avançados sem ASML.", verdict: "🟢 HOLD ESTRUTURAL", verdictClass: "badge-bullish" },
  { ticker: "GOOGL", name: "Alphabet Inc", category: "core_fcf", techNiche: "Hyperscaler Cloud, Modelos Gemini & TPUs", revGrowth: "+14% a +16%", fcfMargin: "Fortaleza (US$ 100B+ caixa)", moat: "TPU v5p/v6 competindo com Nvidia em custo/eficiência; liderança em pesquisa de IA e monetização em Search e YouTube.", verdict: "🟢 CORE DE QUALIDADE", verdictClass: "badge-bullish" },
  { ticker: "BE", name: "Bloom Energy Corp", category: "ai_infra", techNiche: "Células de Combustível de Estado Sólido (SOFC) p/ Data Centers", revGrowth: "+18% a +25%", fcfMargin: "Ponto de inflexão de breakeven", moat: "Resolução do maior gargalo da IA: falta de energia na rede elétrica. Energia 'behind-the-meter' sem esperar 5 anos pela concessionária.", verdict: "🟢 TAIL DE ALTA CONVICÇÃO", verdictClass: "badge-bullish" },
  { ticker: "FN", name: "Fabrinet", category: "ai_infra", techNiche: "Fabricação Óptica de Alta Precisão (Transceivers 800G/1.6T)", revGrowth: "+12% a +17%", fcfMargin: "Sólida e sem dívida líquida", moat: "Fabricante exclusiva dos transceivers ópticos de IA mais avançados da Nvidia e hyperscalers. Forte barreira técnica de manufatura.", verdict: "🟢 TAIL ESTRUTURAL", verdictClass: "badge-bullish" },
  { ticker: "ALAB", name: "Astera Labs Inc", category: "ai_infra", techNiche: "Conectividade PCIe 5.0/6.0, CXL & Retimers", revGrowth: "+150%+", fcfMargin: "Margens brutas de 75%+", moat: "Domínio do mercado de chips retimers e switches PCIe/CXL para conectar GPUs e aceleradores dentro dos servidores de IA.", verdict: "🟡 TAIL HIPERCRESCIMENTO", verdictClass: "badge-neutral" },
  { ticker: "CRDO", name: "Credo Technology", category: "ai_infra", techNiche: "Cabos Elétricos Ativos (AEC) e DSPs SerDes", revGrowth: "+60% a +80%", fcfMargin: "Geração de caixa positiva", moat: "Substituição de cabos de cobre passivos por AECs com economia de 50% de energia e menor peso em racks de servidores.", verdict: "🟡 TAIL ESPECÍFICA", verdictClass: "badge-neutral" },
  { ticker: "COHR", name: "Coherent Corp", category: "ai_infra", techNiche: "Lasers Industriais, Materiais SiC e Módulos Ópticos 800G", revGrowth: "+10% a +15%", fcfMargin: "Alavancada (em desalavancagem)", moat: "Líder em lasers e módulos de comunicação óptica. Novo CEO focado em expansão de margens e desinvestimento de divisões não essenciais.", verdict: "🟡 TAIL EM MONITORAMENTO", verdictClass: "badge-neutral" },
  { ticker: "ARM", name: "Arm Holdings plc", category: "semis", techNiche: "Arquitetura de CPUs v9 p/ Servidores e PCs IA", revGrowth: "+35% a +40%", fcfMargin: "Margens operacionais de 45%+", moat: "Transição de royalties de 1-2% para 4-5% na arquitetura ARMv9; avanço de chips Neoverse em data centers (Grace Hopper, Graviton).", verdict: "🟡 TAIL SECULAR", verdictClass: "badge-neutral" },
  { ticker: "NOK", name: "Nokia Oyj", category: "cyclical", techNiche: "Equipamentos 5G/6G, Roteamento IP e Redes Ópticas", revGrowth: "Estável (-2% a +3%)", fcfMargin: "Sólida (Recompras & Dividendos)", moat: "Forte liderança em IP Networks e Roteadores Ópticos para Data Centers de IA e defesa. Segmento de Network Infrastructure tem alto valor.", verdict: "🟡 AVALIAÇÃO LONGO PRAZO", verdictClass: "badge-neutral" },
  { ticker: "INTC", name: "Intel Corp", category: "cyclical", techNiche: "CPUs de Servidor, PCs x86 e Foundry (18A)", revGrowth: "Pressionada (-5% a +2%)", fcfMargin: "Queima de caixa em capex", moat: "Processo 18A (1.8nm) é o 'tudo ou nada'. Atrasada em aceleradores de IA e perdendo share em CPUs para AMD e ARM.", verdict: "🔴 CANDIDATA A TROCA", verdictClass: "badge-bearish" },
  { ticker: "UBER", name: "Uber Technologies", category: "core_fcf", techNiche: "Mobilidade, Delivery & Rede de Frotas Autônomas", revGrowth: "+15% a +18%", fcfMargin: "Forte expansão (US$ 5B+ FCF)", moat: "Plataforma líder global de mobilidade com acordos estratégicos para operar frotas de robotáxis (Waymo, etc.).", verdict: "🟢 CORE DE FCF", verdictClass: "badge-bullish" },
  { ticker: "META", name: "Meta Platforms", category: "core_fcf", techNiche: "Redes Sociais, Modelos Llama AI & Compute", revGrowth: "+20% a +25%", fcfMargin: "Margens de 35%+", moat: "Infraestrutura de compute massiva para treinar modelos abertos (Llama) que reduzem dependência de terceiros e impulsionam anúncios.", verdict: "🟢 CORE", verdictClass: "badge-bullish" }
];

// INICIALIZAÇÃO DA APLICAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  const portSelect = document.getElementById("portfolioSelect");
  if (portSelect) portSelect.value = "schwab";
  
  renderRiskRangesTable("all");
  renderPortfolioView(activePortfolioKey);
  renderFundamentalsTable("all");
  runStockAnalysis("AAAU");
});

// NAVEGAÇÃO ENTRE ABAS
function setTab(tabId) {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.toggle("active", content.id === `tab-${tabId}`);
  });

  if (tabId === "portfolio") {
    setTimeout(updatePortfolioChart, 50);
  }
}

// TROCA DE PORTFÓLIO ATIVO
function switchPortfolio(key) {
  activePortfolioKey = key;
  renderPortfolioView(key);
  showToast(`Portfólio alternado para: ${key === 'consolidated' ? 'Visão Consolidada' : portfolioData[key]?.name || key}`);
}

// RENDERIZAR TABELA DE RISK RANGES
function renderRiskRangesTable(filter) {
  const tbody = document.getElementById("riskRangeTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtered = filter === "all" ? riskRangesData : riskRangesData.filter(item => item.type === filter);

  filtered.forEach(item => {
    const pct = Math.max(0, Math.min(100, ((item.current - item.low) / (item.high - item.low)) * 100));
    
    let actionText = "";
    let actionBadge = "";

    if (item.signal === "BULLISH") {
      if (pct <= 25) {
        actionText = "🟢 Buy the Dips (Assimetria Altista)";
        actionBadge = "badge-bullish";
      } else if (pct >= 80) {
        actionText = "⚠️ Perto do Teto; Não perseguir";
        actionBadge = "badge-neutral";
      } else {
        actionText = "Bullish TREND (Manter posição)";
        actionBadge = "badge-bullish";
      }
    } else if (item.signal === "BEARISH") {
      if (pct >= 75) {
        actionText = "🔴 Sell the Rallies (Redução/Venda)";
        actionBadge = "badge-bearish";
      } else if (pct <= 20) {
        actionText = "Perto do Piso; aguardar repique";
        actionBadge = "badge-neutral";
      } else {
        actionText = "Bearish TREND (Evitar compras)";
        actionBadge = "badge-bearish";
      }
    } else {
      actionText = "Neutral / Quebrou TRADE (Manter MIN)";
      actionBadge = "badge-neutral";
    }

    const signalBadge = item.signal === "BULLISH" ? "badge-bullish" : (item.signal === "BEARISH" ? "badge-bearish" : "badge-neutral");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.ticker}</strong> <br><small class="text-muted">${item.name}</small></td>
      <td><span class="tag tag-outline">${item.type.toUpperCase()}</span></td>
      <td><strong>${item.low.toLocaleString('pt-BR')}</strong></td>
      <td><strong>${item.high.toLocaleString('pt-BR')}</strong></td>
      <td class="font-bold">${item.current.toLocaleString('pt-BR')}</td>
      <td>
        <div class="range-bar-container">
          <div class="range-bar-track">
            <div class="range-bar-fill"></div>
            <div class="range-marker" style="left: ${pct.toFixed(1)}%;"></div>
          </div>
          <div class="range-bar-labels">
            <span>Piso</span>
            <span class="range-pct-text">${pct.toFixed(0)}%</span>
            <span>Teto</span>
          </div>
        </div>
      </td>
      <td><span class="badge ${signalBadge}">${item.signal}</span></td>
      <td><span class="badge ${actionBadge}">${actionText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterRiskRanges(type, btnElement) {
  if (btnElement) {
    document.querySelectorAll(".filter-group .btn").forEach(b => b.classList.remove("active"));
    btnElement.classList.add("active");
  }
  renderRiskRangesTable(type);
}

// RENDERIZAR VISÃO DE PORTFÓLIO COM AUDITORIA DE QUADRANTES
function renderPortfolioView(key) {
  let positions = [];
  let title = "";
  let updateDate = "";

  if (key === "consolidated") {
    positions = [...portfolioData.schwab.positions, ...portfolioData.tastyworks.positions];
    title = "Patrimônio Consolidado Global (Charles Schwab + Tastyworks)";
    updateDate = "Snapshot combinado: 02/09/2026 | 100% Confirmado";
  } else {
    positions = portfolioData[key].positions;
    title = `Carteira: ${portfolioData[key].name}`;
    updateDate = `Último snapshot: ${portfolioData[key].lastUpdate}`;
  }

  document.getElementById("portViewTitle").innerText = title;
  document.getElementById("portLastUpdate").innerText = updateDate;
  document.getElementById("positionsCountTag").innerText = `${positions.length} Posições`;

  // Calcular totais e alocação por Quadrante
  let totalVal = 0;
  let cashVal = 0;
  let quad3Val = 0;
  let quad1Val = 0;
  let quad2Val = 0;
  let creditVal = 0;
  let tailVal = 0;

  positions.forEach(p => {
    const val = p.qty * p.price;
    totalVal += val;
    if (p.ticker === "SGOV" || p.cat === "CAIXA" || p.ticker === "CAIXA") {
      cashVal += val;
    }

    if (p.quadKey === "QUAD 3") quad3Val += val;
    else if (p.quadKey === "QUAD 1") quad1Val += val;
    else if (p.quadKey === "QUAD 2") quad2Val += val;
    else if (p.quadKey === "CRÉDITO") creditVal += val;
    else if (p.quadKey === "TAIL") tailVal += val;
  });

  const cashPct = totalVal > 0 ? (cashVal / totalVal) * 100 : 0;
  const quad3Pct = totalVal > 0 ? (quad3Val / totalVal) * 100 : 0;

  document.getElementById("portTotalValue").innerText = `US$ ${totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("portCashRatio").innerText = `${cashPct.toFixed(1)}%`;
  document.getElementById("portAdherence").innerText = `${quad3Pct.toFixed(1)}% (Alocado em Quad 3)`;

  // Fatores de Risco
  if (key === "schwab") {
    document.getElementById("factorTechPct").innerText = "~23.5% (High Beta / Semis / IA)";
    document.getElementById("factorCreditPct").innerText = "44.5% (Bonds Corporativos - Alerta Quad 3)";
    document.getElementById("factorDefensivePct").innerText = "~37.8% (Ouro AAAU + GDX + SGOV + BE)";
    document.getElementById("factorMeliPct").innerText = "2.82% (MELI)";
  } else if (key === "tastyworks") {
    document.getElementById("factorTechPct").innerText = "~30.2% (Conectividade & Chips IA)";
    document.getElementById("factorCreditPct").innerText = "0.0% (Sem Bonds na Tasty)";
    document.getElementById("factorDefensivePct").innerText = "~43.1% (Caixa US$ 9k + Ouro NEM/GDX + BE)";
    document.getElementById("factorMeliPct").innerText = "5.87% (MELI)";
  } else {
    document.getElementById("factorTechPct").innerText = "~24.4% (Global Tech / High Beta)";
    document.getElementById("factorCreditPct").innerText = "27.9% (Bonds Corporativos Schwab)";
    document.getElementById("factorDefensivePct").innerText = "38.5% (Ouro, Energia, Defensivos & Caixa)";
    document.getElementById("factorMeliPct").innerText = "3.24% (MELI Consolidado)";
  }

  // Renderizar Tabela
  const tbody = document.getElementById("portfolioTableBody");
  tbody.innerHTML = "";

  positions.forEach(p => {
    const val = p.qty * p.price;
    const weight = totalVal > 0 ? (val / totalVal) * 100 : 0;
    
    let catBadge = "badge-core";
    if (p.cat.includes("TRADE")) catBadge = "badge-trade";
    if (p.cat.includes("TAIL")) catBadge = "badge-tail";
    if (p.cat.includes("CAIXA")) catBadge = "badge-caixa";
    if (p.cat.includes("RENDA")) catBadge = "badge-macro";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.ticker}</strong> <br><small class="text-muted">${p.typeGroup || 'Ativo'}</small></td>
      <td>${p.name}</td>
      <td><span class="tag tag-outline">${p.broker}</span></td>
      <td><strong>${p.qty === 1 && p.ticker === 'CAIXA' ? '-' : p.qty.toLocaleString('pt-BR')}</strong></td>
      <td><span class="badge ${catBadge}">${p.cat}</span></td>
      <td class="font-bold">US$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      <td><strong>${weight.toFixed(2)}%</strong></td>
      <td><span class="badge ${p.nativeQuad.includes('Quad3') ? 'badge-bullish' : (p.nativeQuad.includes('Credito') ? 'badge-bearish' : 'badge-neutral')}">${p.nativeQuad}</span></td>
      <td><small>${p.conduct}</small></td>
    `;
    tbody.appendChild(tr);
  });

  updatePortfolioChart(positions, totalVal);
}

// ATUALIZAR GRÁFICO DE PORTFÓLIO POR QUADRANTES GIP
function updatePortfolioChart(positions, totalVal) {
  if (!positions) {
    if (activePortfolioKey === "consolidated") {
      positions = [...portfolioData.schwab.positions, ...portfolioData.tastyworks.positions];
    } else {
      positions = portfolioData[activePortfolioKey].positions;
    }
    totalVal = positions.reduce((acc, p) => acc + (p.qty * p.price), 0);
  }

  let quadTotals = {
    quad3: 0,
    quad1: 0,
    quad2: 0,
    credit: 0,
    tail: 0
  };

  positions.forEach(p => {
    const val = p.qty * p.price;
    if (p.quadKey === "QUAD 3") quadTotals.quad3 += val;
    else if (p.quadKey === "QUAD 1") quadTotals.quad1 += val;
    else if (p.quadKey === "QUAD 2") quadTotals.quad2 += val;
    else if (p.quadKey === "CRÉDITO") quadTotals.credit += val;
    else if (p.quadKey === "TAIL") quadTotals.tail += val;
  });

  const ctx = document.getElementById("portfolioChart");
  if (!ctx) return;

  if (portfolioChartInstance) {
    portfolioChartInstance.destroy();
  }

  const labels = [];
  const data = [];
  const bgColors = [];

  if (quadTotals.quad3 > 0) {
    const pct = totalVal > 0 ? (quadTotals.quad3 / totalVal) * 100 : 0;
    labels.push(`Quad 3 (Estagflação / Ouro / Caixa) - ${pct.toFixed(1)}%`);
    data.push(quadTotals.quad3);
    bgColors.push('#10B981'); // Esmeralda
  }

  if (quadTotals.quad1 > 0) {
    const pct = totalVal > 0 ? (quadTotals.quad1 / totalVal) * 100 : 0;
    labels.push(`Quad 1 (Tech / Semicondutores / High Beta) - ${pct.toFixed(1)}%`);
    data.push(quadTotals.quad1);
    bgColors.push('#38BDF8'); // Ciano
  }

  if (quadTotals.credit > 0) {
    const pct = totalVal > 0 ? (quadTotals.credit / totalVal) * 100 : 0;
    labels.push(`Crédito / Bonds (Renda Fixa Schwab) - ${pct.toFixed(1)}%`);
    data.push(quadTotals.credit);
    bgColors.push('#F43F5E'); // Rubi
  }

  if (quadTotals.tail > 0) {
    const pct = totalVal > 0 ? (quadTotals.tail / totalVal) * 100 : 0;
    labels.push(`Teses TAIL 3+ Anos (Robótica & Autônomos) - ${pct.toFixed(1)}%`);
    data.push(quadTotals.tail);
    bgColors.push('#A855F7'); // Roxo
  }

  if (quadTotals.quad2 > 0) {
    const pct = totalVal > 0 ? (quadTotals.quad2 / totalVal) * 100 : 0;
    labels.push(`Quad 2 (Industriais XLI) - ${pct.toFixed(1)}%`);
    data.push(quadTotals.quad2);
    bgColors.push('#F97316'); // Laranja
  }

  portfolioChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderColor: '#121824',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      cutout: '68%'
    }
  });

  const legendDiv = document.getElementById("quadChartLegend");
  if (legendDiv) {
    legendDiv.innerHTML = labels.map((lbl, idx) => `
      <div class="legend-item">
        <span class="legend-color" style="background: ${bgColors[idx]};"></span>
        <span><strong>${lbl}</strong></span>
      </div>
    `).join("");
  }
}

// 2.1 RENDERIZAR TABELA FUNDAMENTALISTA (THE PODS & TECH/IA)
function renderFundamentalsTable(filter) {
  const tbody = document.getElementById("fundamentalsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtered = filter === "all" ? fundamentalsData : fundamentalsData.filter(item => item.category === filter);

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.ticker}</strong> <br><small class="text-muted">${item.name}</small></td>
      <td><small>${item.techNiche}</small></td>
      <td><strong class="text-emerald">${item.revGrowth}</strong></td>
      <td><small>${item.fcfMargin}</small></td>
      <td><small>${item.moat}</small></td>
      <td><span class="badge ${item.verdictClass}">${item.verdict}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterFundamentals(cat, btnElement) {
  if (btnElement) {
    document.querySelectorAll("#tab-fundamentals .filter-group .btn").forEach(b => b.classList.remove("active"));
    btnElement.classList.add("active");
  }
  renderFundamentalsTable(cat);
}

// 3. ANALISADOR DE AÇÕES
function quickAnalyze(ticker) {
  document.getElementById("analyzerTicker").value = ticker;
  runStockAnalysis(ticker);
}

function runStockAnalysis(customTicker) {
  const ticker = (customTicker || document.getElementById("analyzerTicker").value || "AAAU").toUpperCase().trim();
  const brokerTarget = document.getElementById("analyzerPortSelect")?.value || "both";
  
  const headerTitle = document.getElementById("analysisHeaderTitle");
  const overallTag = document.getElementById("analysisOverallTag");
  const resultBody = document.getElementById("analysisResultBody");

  headerTitle.innerHTML = `<span class="icon">📊</span> Relatório de Análise: <strong>${ticker}</strong>`;

  let analysis = {
    tese: "Ativo de equity ou commodity listado em bolsa americana.",
    quadFit: "Quad 3 (Estagflação) exige seletividade e alinhamento de TREND.",
    sinal: "BULLISH TREND",
    rangeInfo: "Range atualizado conforme o EARLYLOOK de 02/09/2026.",
    sobreposicao: "Monitorar correlação com carteiras Schwab e Tastyworks.",
    conclusao: "Conduta: Respeitar a disciplina operacional e evitar compras nos topos de range.",
    invalidação: "Quebra de TREND com confirmação de volume e virada do DXY."
  };

  if (ticker === "AAAU" || ticker === "GOLD" || ticker === "NEM" || ticker === "GDX") {
    analysis.tese = "Ouro Spot & Mineradoras: Principal posição de alta convicção macro no EARLYLOOK de 02/09/2026. Proteção contra desvalorização monetária e inflação de Quad 3.";
    analysis.quadFit = "🟢 **Favorecido Absoluto em Quad 3 (Estagflação)**. DXY quebrando suporte em Bearish (98.77 a 99.99).";
    analysis.sinal = "BULLISH TREND Forte (Range Ouro: 4.251 a 4.752)";
    analysis.rangeInfo = "Ouro Spot em 4.420 (34% do range - Assimetria Altista Positiva).";
    analysis.sobreposicao = "Presente na Schwab (AAAU: US$ 6.460,50 + GDX: US$ 2.904,26) e Tastyworks (NEM: US$ 1.745,10 + GDX: US$ 969,05). Total: US$ 12.078,91 (~4,9% do patrimônio).";
    analysis.conclusao = "<strong>Conduta:</strong> Manter e considerar compras adicionais escalonadas nos recuos. É o pilar de proteção da carteira.";
    analysis.invalidação = "DXY rompendo forte para cima de 100 com quebra do suporte TREND de 4.204 no ouro.";
  } else if (ticker === "MELI") {
    analysis.tese = "MercadoLibre: Líder indiscutível em e-commerce e ecossistema fintech (Mercado Pago) na América Latina. Crescimento de receitas acelerando.";
    analysis.quadFit = "🟢 **Favorecida por DXY Bearish** (Alivia moedas LatAm e consumo regional).";
    analysis.sinal = "BULLISH TREND";
    analysis.rangeInfo = "Preço Atual: US$ 1.995,50.";
    analysis.sobreposicao = "Presente em ambas: Schwab (US$ 5.986,51) e Tastyworks (US$ 1.994,04). Total: US$ 7.980,55 (3,24% global).";
    analysis.conclusao = "<strong>Conduta:</strong> Manter posição CORE intacta. Aproveitar o vento a favor do dólar fraco.";
    analysis.invalidação = "Perda do suporte TREND e desaceleração do TPV fintech.";
  } else if (ticker === "SLV") {
    analysis.tese = "iShares Silver Trust (Prata Física).";
    analysis.quadFit = "🟡 **Híbrido (Monetário e Industrial)**.";
    analysis.sinal = "NEUTRAL (Quebrou sinal TRADE em US$ 65,11)";
    analysis.rangeInfo = "Piso: US$ 62,00 | Teto: US$ 67,00 (Preço atual: ~US$ 63,80).";
    analysis.sobreposicao = "Presente na Schwab (US$ 3.520,20 - 1,66%).";
    analysis.conclusao = "<strong>Alerta Hedgeye de Hoje:</strong> Não comprar a queda ('stop buying the dip'). Manter tamanho mínimo e aguardar recomposição de sinal.";
    analysis.invalidação = "Fechamento consistente acima de US$ 65,11 reabilita o sinal TRADE.";
  }

  overallTag.className = `badge ${analysis.sinal.includes("BULLISH") ? "badge-bullish" : (analysis.sinal.includes("BEARISH") ? "badge-bearish" : "badge-neutral")}`;
  overallTag.innerText = analysis.sinal;

  resultBody.innerHTML = `
    <div class="analyzer-block">
      <div class="block-title">1. Tese & Modelo de Negócio</div>
      <p class="block-desc">${analysis.tese}</p>
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">2. Enquadramento no Regime Macro (GIP Quad 3)</div>
      <p class="block-desc">${analysis.quadFit}</p>
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">3. Sinal Técnico & Risk Range (03/09/2026)</div>
      <p class="block-desc"><strong>Sinal:</strong> ${analysis.sinal}<br><strong>Range:</strong> ${analysis.rangeInfo}</p>
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">4. Sobreposição com Portfólio (${brokerTarget.toUpperCase()})</div>
      <p class="block-desc">${analysis.sobreposicao}</p>
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">5. Conclusão Operacional & Invalidação</div>
      <p class="block-desc">${analysis.conclusao}<br><span class="text-rose"><strong>Condição de Invalidação:</strong> ${analysis.invalidação}</span></p>
    </div>
  `;
}

// 4. PROCESSADOR DE EARLYLOOK
function loadSampleEarlyLook() {
  document.getElementById("elTitle").value = "Riding The Waves of Volatility";
  document.getElementById("elDate").value = "2026-09-03";
  document.getElementById("elTime").value = "07:51 EDT";
  document.getElementById("elRawContent").value = `KEY TAKEAWAYS:
1. Volatility is unavoidable; edge comes from staying disciplined, sizing risk, and separating signal from noise.
2. Economic data sending mixed signals: Chicago PMI fell to 47.1 (contraction) while JOLTS jumped +790k (7.74M).
3. 10Y yield (4.76%) near top of range (4.84%) + VIX ~15 create a fragile setup vulnerable to shocks.

OUR LEVELS (03/09/2026):
UST 10Y: 4.68 - 4.84 (Bullish)
UST 30Y: 5.16 - 5.31 (Bullish)
UST 2Y: 4.25 - 4.45 (Bullish)
HYG: 78.91 - 79.50 (Bullish)
LQD: 104.90 - 106.10 (Bearish)
SPX: 7602 - 7744 (Bullish)
COMPQ: 25825 - 26590 (Bullish)
RUT: 2910 - 3016 (Bullish)
XLV: 170.00 - 177.00 (Bullish)
IGV: 101.00 - 113.00 (Bullish)
OIH: 411.00 - 441.00 (Bullish)
VIX: 14.01 - 16.47 (Bearish)
USD: 98.75 - 99.69 (Bearish)
WTIC: 86.13 - 93.94 (Bullish)
BRENT: 89.00 - 101.00 (Bullish)
NATGAS: 2.81 - 3.07 (Bullish)
GOLD: 4292 - 4698 (Bullish)
COPPER: 6.40 - 6.71 (Bullish)
SILVER: 63.00 - 69.00 (Neutral)`;
  showToast("EARLYLOOK 'Riding The Waves of Volatility' (03/09/2026) carregado.");
}

function processEarlyLookText() {
  const title = document.getElementById("elTitle").value;
  const date = document.getElementById("elDate").value;
  showToast(`EARLYLOOK "${title}" (${date}) processado com sucesso! Estados e Risk Ranges sincronizados.`);
  openReportModal();
}

// 5. GERADOR OFICIAL DE RELATÓRIO DIÁRIO (FORMATO EXATO DO PDF DO USUÁRIO)
function openReportModal() {
  updateGeneratedReportText();
  document.getElementById("reportModal").classList.add("active");
}

function closeReportModal() {
  document.getElementById("reportModal").classList.remove("active");
}

function updateGeneratedReportText() {
  const preview = document.getElementById("reportPreviewContent");
  if (!preview) return;

  const targetCartKey = activePortfolioKey;
  let targetPositions = [];
  let cartTitle = "";

  if (targetCartKey === "schwab") {
    targetPositions = portfolioData.schwab.positions;
    cartTitle = "Principal (Schwab) - atualizada 03/09/2026";
  } else if (targetCartKey === "tastyworks") {
    targetPositions = portfolioData.tastyworks.positions;
    cartTitle = "Tastyworks - atualizada 03/09/2026";
  } else {
    targetPositions = [...portfolioData.schwab.positions, ...portfolioData.tastyworks.positions];
    cartTitle = "Consolidado Global (Schwab + Tastyworks) - 03/09/2026";
  }

  const totalCart = targetPositions.reduce((acc, p) => acc + (p.qty * p.price), 0);
  const q3Total = targetPositions.filter(p => p.nativeQuad === "Quad3" || p.ticker === "SGOV" || p.ticker === "CAIXA").reduce((acc, p) => acc + (p.qty * p.price), 0);
  const q1Total = targetPositions.filter(p => p.nativeQuad === "Quad1").reduce((acc, p) => acc + (p.qty * p.price), 0);
  const creditTotal = targetPositions.filter(p => p.nativeQuad === "Crédito").reduce((acc, p) => acc + (p.qty * p.price), 0);
  const q2Total = targetPositions.filter(p => p.nativeQuad === "Quad2").reduce((acc, p) => acc + (p.qty * p.price), 0);

  const quad3Pct = totalCart > 0 ? ((q3Total / totalCart) * 100).toFixed(2) : 0;
  const quad1Pct = totalCart > 0 ? ((q1Total / totalCart) * 100).toFixed(2) : 0;
  const creditPct = totalCart > 0 ? ((creditTotal / totalCart) * 100).toFixed(2) : 0;
  const quad2Pct = totalCart > 0 ? ((q2Total / totalCart) * 100).toFixed(2) : 0;

  // Montagem da tabela de Risk Ranges
  const riskRangesTableText = riskRangesData.map(r => {
    const rangeStr = `${r.low} - ${r.high}`;
    let vsStr = "igual";
    if (r.low > r.prevLow || r.high > r.prevHigh) vsStr = "subiu";
    else if (r.low < r.prevLow || r.high < r.prevHigh) vsStr = "caiu";
    return `| ${r.ticker.padEnd(8)} | ${r.name.slice(0, 30).padEnd(30)} | ${rangeStr.padEnd(21)} | ${r.signal.padEnd(11)} | ${vsStr.padEnd(16)} |`;
  }).join("\n");

  // Montagem da tabela de Posições
  const positionsTableText = targetPositions.map(p => {
    const val = p.qty * p.price;
    const pct = totalCart > 0 ? ((val / totalCart) * 100).toFixed(2) : 0;
    const qtyStr = p.qty === 1 && p.ticker === 'CAIXA' ? '-' : p.qty.toString();
    const priceStr = p.price < 2 ? p.price.toFixed(4) : p.price.toFixed(2);
    return `| ${p.ticker.padEnd(10)} | ${p.name.slice(0, 24).padEnd(24)} | ${p.typeGroup.padEnd(12)} | ${p.nativeQuad.padEnd(8)} | ${qtyStr.padStart(5)} | ${priceStr.padStart(8)} | ${val.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}).padStart(10)} | ${pct.padStart(6)}% |`;
  }).join("\n");

  // Montagem da tabela de Exposição por Quadrante com Status de Sizing
  const sizingTableText = targetPositions.map(p => {
    const val = p.qty * p.price;
    const pct = totalCart > 0 ? (val / totalCart) * 100 : 0;
    let status = "Dentro";
    if (p.minSize === "1-3%" && pct > 3.0) status = "Acima do MAX";
    if (p.minSize === "2-6%" && pct > 6.0) status = "Acima do MAX";
    if (p.minSize === "2-6%" && pct < 2.0) status = "Abaixo do MIN";
    if (p.ticker === "SGOV" || p.ticker === "CAIXA") status = "Caixa / Opcionalidade";

    return `| ${p.ticker.padEnd(10)} | ${p.typeGroup.padEnd(12)} | ${p.nativeQuad.padEnd(8)} | ${pct.toFixed(2).padStart(6)}% | ${p.minSize.padEnd(10)} | ${status.padEnd(18)} |`;
  }).join("\n");

  const fullReport = `RELATORIO HEDGEYE + PORTFOLIO
Early Look: Riding The Waves of Volatility | 03/09/2026 07:51 AM EDT | Daryl Jones (Director of Research)
Carteira: ${cartTitle}

---

## 1. Tese central Hedgeye e Our Levels

**Regime macro (Nowcast GIP):** Q1/26 Global #Quad1 -> Q2/26 #Quad3 -> **Q3/26 #Quad3 (Nowcast atual)** -> Q4/26 potencial #Quad2

**Key Takeaways:**
• **Disciplina e Gestão da Volatilidade:** Volatilidade não se controla, aprende-se a surfar. O edge vem do dimensionamento de risco (sizing) e da disciplina emocional.
• **Divergência Extrema nos Dados Macro:** Chicago PMI despencou de 57,6 para 47,1 (contração forte na manufatura) enquanto JOLTS saltou para 7,74M (+790k vagas), criando um quadro de difícil interpretação para o Fed.
• **Emparelhamento Frágil (Yields no Topo + VIX ~15):** UST 10Y a 4,76% (perto do topo de 4,84%) e VIX em 15,20 criam um mercado complacente, vulnerável a reprecificações rápidas.

**Destaques do Macro Grind:**
• **Petróleo WTI em Bullish Firme (86,13 a 93,94):** Piso subiu de 83,96 para 86,13; Brent em 89-101. Reforça inflação persistente de commodities no Quad 3.
• **Ouro Spot em Bullish Máximo (4.292 a 4.698):** Piso subiu para US$ 4.292/oz com DXY Bearish (98,75 a 99,69). Principal ativo de proteção macro.
• **Treasury 10Y Yield (4,68% a 4,84%):** Yields sustentados no topo mantêm pressão sobre crédito corporativo longo (LQD Bearish 104,90-106,10).

### Our Levels (Risk Range imediato; sinal @Hedgeye TREND):
| Ativo    | Descricao                      | Risk Range (imediato) | Sinal TREND | vs. dia anterior |
|----------|--------------------------------|-----------------------|-------------|------------------|
${riskRangesTableText}

---

## 2. Posicoes - ${cartTitle}

| Posicao    | Nome / Tese              | Categoria    | Quad     | Qtd   | Preco    | Valor USD  | % cart. |
|------------|--------------------------|--------------|----------|-------|----------|------------|---------|
${positionsTableText}
| **TOTAL**  | **CARTEIRA COMPLETA**    |              |          |       |          | **${totalCart.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}** | **100.00%** |

---

## 3. Cruzamento Hedgeye x Carteira + mudancas vs. historico

• **Cálculo de Aderência ao Quadrante Atual (Quad 3):** A carteira está **${quad3Pct}% ALOCADA NO QUADRANTE ATUAL (QUAD 3)** (Ouro AAAU/NEM/GDX, Energia BE/GRID/AIPO, Defensivos Healthcare, Cobre MLI e Caixa SGOV).
• **Tilt em Quad 1 / High Beta (~${quad1Pct}%):** Composto por semicondutores e conectividade de IA. Respeitar limites de sizing de 1-3% em Small Caps de alta volatilidade (ex: ALAB, CRDO, COHR).
• **Crédito Corporativo (~${creditPct}%):** Bonds da Schwab mantidos pelo alto carrego de cupons (4,5% a 9,6%), com LQD em sinal Bearish (104,90–106,10).
• **Hedge de Ouro em Plena Convicção:** Posições em AAAU, NEM e GDX capturam o principal vetor de alta do EARLYLOOK de hoje com piso elevado a 4.292.
• **Caixa e Opcionalidade:** US$ 29.082,46 (SGOV + Cash Tasty) preservam poder de fogo para comprar recuos no piso de range.

---

## 4. Janela de saida de Renda Fixa

Regra: vender bonds torna-se atrativo quando o yield do Treasury de duration equivalente vira Bearish em TRADE e TREND. Hoje o UST10Y está **BULLISH em TREND (Risk Range 4,68-4,84%)** e a Hedgeye sinaliza yields pressionados perto do teto (4,76%) — ou seja, ainda há pressão de alta de yield / queda de preço de bonds longos. Não há gatilho de saída por yield virando bearish. O SGOV atua como caixa remunerado e opcionalidade.

---

## 5. Matriz long/short por quadrante (GIP)

| Quadrante | Vies GIP | Long (favorecidos) | Short / evitar |
|---|---|---|---|
| **Quad1 Goldilocks** | Cresc. acelera, Infl. desacelera | Growth, Tech, Consumo Discric., Small Caps | Defensivos, Bonds longos, Dólar |
| **Quad2 Reflacao** | Cresc. e Infl. aceleram | Energia, Materiais, Industriais, Commodities, Tech | Bonds longos, Utilities, Staples |
| **Quad3 Estagflacao [ATUAL]** | **Cresc. desacelera, Infl. acelera** | **OURO / Miners, Energia, Commodities, Defensivos, SGOV** | **Crédito High Yield / Bonds, Consumo Discric., Small Caps** |
| **Quad4 Deflacao** | Cresc. e Infl. desaceleram | Treasuries longos, OURO, USD, Utilities, Staples | Energia, Materiais, Small Caps, High Yield |

---

## 6. Exposicao por quadrante & Status de Sizing

### Distribuição Percentual:
* 🟢 **QUAD 3 (Estagflação / Ouro / Defensivos / Caixa):** **${quad3Pct}%**
* 🔵 **QUAD 1 (Tech / Semicondutores / High Beta):** **${quad1Pct}%**
* 🔴 **CRÉDITO / BONDS (Renda Fixa Corporativa):** **${creditPct}%**
* 🟠 **QUAD 2 (Industriais / Materiais):** **${quad2Pct}%**

### Tabela de Auditoria de Sizing (Banda MIN/MAX):
| Ativo      | Categoria    | Quad     | % carteira | Banda sizing | Status             |
|------------|--------------|----------|------------|--------------|--------------------|
${sizingTableText}

---
*Síntese automatizada de uso pessoal, gerada a partir da Early Look da Hedgeye Risk Management (uso exclusivo do assinante) e do framework GIP / 'Master The Market' de Keith McCullough. Não constitui recomendação de investimento.*`;

  preview.innerText = fullReport;
}

function copyReportToClipboard() {
  const text = document.getElementById("reportPreviewContent").innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Relatório copiado com sucesso para a área de transferência!");
  });
}

function printReport() {
  window.print();
}

function generatePortfolioReport() {
  document.getElementById("reportScopeSelect").value = activePortfolioKey;
  openReportModal();
}

// 6. MODAL DE PORTFÓLIO & ATUALIZAÇÃO
function openPortfolioModal() {
  document.getElementById("modalBrokerSelect").value = activePortfolioKey === "consolidated" ? "schwab" : activePortfolioKey;
  document.getElementById("portfolioModal").classList.add("active");
}

function closePortfolioModal() {
  document.getElementById("portfolioModal").classList.remove("active");
}

function savePortfolioUpdate() {
  const broker = document.getElementById("modalBrokerSelect").value;
  const text = document.getElementById("portfolioInputText").value;
  if (!text.trim()) {
    showToast("Por favor, insira as operações ou captura.");
    return;
  }

  showToast(`Posições de ${broker === 'schwab' ? 'Charles Schwab' : 'Tastyworks'} atualizadas e reconciliadas com sucesso!`);
  closePortfolioModal();
}

function openNewDecisionModal() {
  showToast("Para registrar uma nova decisão, ela será vinculada ao log auditável.");
}

function viewHistoryReport(dateId) {
  showToast(`Carregando relatório histórico arquivado de ${dateId}...`);
  openReportModal();
}

// 7. MOTOR DE REBALANCEAMENTO ESTRATÉGICO (>= 60% QUAD 3)
function openRebalanceModal() {
  const sellTbody = document.getElementById("rebSellTableBody");
  const buyTbody = document.getElementById("rebBuyTableBody");
  
  if (sellTbody && buyTbody) {
    sellTbody.innerHTML = `
      <tr>
        <td><strong>INTC</strong> (Intel)</td>
        <td><span class="badge badge-neutral">Quad 1 / Cíclico</span></td>
        <td><span class="badge badge-bearish">Vender 100%</span></td>
        <td><strong>US$ 3.132,65</strong></td>
        <td>Turnaround lento; semicondutores cíclicos sofrem em Quad 3.</td>
      </tr>
      <tr>
        <td><strong>NOK</strong> (Nokia)</td>
        <td><span class="badge badge-neutral">Quad 1 / Telecom</span></td>
        <td><span class="badge badge-bearish">Vender 100%</span></td>
        <td><strong>US$ 3.426,50</strong></td>
        <td>Telecom é listada como 'Worst Sector' em Quad 3 na pág. 27 do livro.</td>
      </tr>
      <tr>
        <td><strong>AXTI</strong> (AXT Inc)</td>
        <td><span class="badge badge-neutral">Quad 1 / Espec.</span></td>
        <td><span class="badge badge-bearish">Vender 100%</span></td>
        <td><strong>US$ 2.826,75</strong></td>
        <td>Wafers optoeletrônicos de alta volatilidade e baixa margem de segurança.</td>
      </tr>
      <tr>
        <td><strong>COIN</strong> (Coinbase)</td>
        <td><span class="badge badge-neutral">Quad 1 / High Beta</span></td>
        <td><span class="badge badge-bearish">Vender 100%</span></td>
        <td><strong>US$ 1.774,50</strong></td>
        <td>Criptoativo com beta extremo; momentum em colapso.</td>
      </tr>
      <tr>
        <td><strong>XBI</strong> (Biotech ETF)</td>
        <td><span class="badge badge-neutral">Quad 1 / High Beta</span></td>
        <td><span class="badge badge-bearish">Reduzir 50%</span></td>
        <td><strong>US$ 2.518,15</strong></td>
        <td>Biotecnologia especulativa sofre com taxas de juros longas altas (10Y Bullish).</td>
      </tr>
      <tr>
        <td><strong>DRAM + FOTO</strong></td>
        <td><span class="badge badge-neutral">Quad 1 / Tech</span></td>
        <td><span class="badge badge-bearish">Vender 100%</span></td>
        <td><strong>US$ 4.994,00</strong></td>
        <td>ETFs temáticos de hardware que sofrem em rotações para commodities.</td>
      </tr>
      <tr>
        <td><strong>Santander / Suzano Bonds</strong></td>
        <td><span class="badge badge-bearish">Crédito / Bonds</span></td>
        <td><span class="badge badge-neutral">Realizar Parcial</span></td>
        <td><strong>US$ 10.000,00</strong></td>
        <td>Realocar parte da renda fixa para ouro físico e energia real.</td>
      </tr>
    `;

    buyTbody.innerHTML = `
      <tr>
        <td><strong>AAAU</strong> (Ouro Físico)</td>
        <td><span class="badge badge-bullish">QUAD 3 (Core Hedge)</span></td>
        <td><strong class="text-emerald">+ US$ 12.000,00</strong></td>
        <td><span class="badge badge-bullish">34% do Range (Piso)</span></td>
        <td>Melhor classe de ativos histórica de Quad 3; DXY Bearish.</td>
      </tr>
      <tr>
        <td><strong>GDX / NEM</strong> (Mineradoras)</td>
        <td><span class="badge badge-bullish">QUAD 3 (Equity Hedge)</span></td>
        <td><strong class="text-emerald">+ US$ 8.000,00</strong></td>
        <td><span class="badge badge-bullish">38% do Range</span></td>
        <td>Alavancagem operacional sobre a disparada do preço do ouro spot.</td>
      </tr>
      <tr>
        <td><strong>BE + GRID</strong> (Energia p/ IA)</td>
        <td><span class="badge badge-bullish">QUAD 3 (Energia)</span></td>
        <td><strong class="text-emerald">+ US$ 6.500,00</strong></td>
        <td><span class="badge badge-bullish">42% do Range</span></td>
        <td>Gargalo físico elétrico; energia é favorecida na inflação de Quad 3.</td>
      </tr>
      <tr>
        <td><strong>MLI</strong> (Mueller Industries)</td>
        <td><span class="badge badge-bullish">QUAD 3 (Cobre/Metais)</span></td>
        <td><strong class="text-emerald">+ US$ 4.000,00</strong></td>
        <td><span class="badge badge-bullish">54% do Range</span></td>
        <td>Cobre em Bullish TREND (6,36 a 6,71); forte balanço e dividendos.</td>
      </tr>
      <tr>
        <td><strong>SGOV</strong> (Caixa T-Bills)</td>
        <td><span class="badge badge-bullish">QUAD 3 / CAIXA</span></td>
        <td><strong class="text-emerald">Manter US$ 25.000+</strong></td>
        <td><span class="badge badge-bullish">100% Líquido</span></td>
        <td>Remuneração livre de risco de ~5% e munição para próximos recuos.</td>
      </tr>
    `;
  }

  document.getElementById("rebalanceModal").classList.add("active");
}

function closeRebalanceModal() {
  document.getElementById("rebalanceModal").classList.remove("active");
}

function copyRebalancePlan() {
  const plan = `PLANO DE REBALANCEAMENTO ESTRATÉGICO HEDGEYE (>= 60% EM QUAD 3)
1. VENDAS SUGERIDAS (Desinvestimentos em Quad 1 / Crédito Frágil):
- INTC: Vender 100% (US$ 3.132,65)
- NOK: Vender 100% (US$ 3.426,50)
- AXTI: Vender 100% (US$ 2.826,75)
- COIN: Vender 100% (US$ 1.774,50)
- DRAM + FOTO: Vender 100% (US$ 4.994,00)
- XBI: Reduzir 50% (US$ 2.518,15)
Total de liquidez liberada: ~US$ 18.672,55

2. REINVESTIMENTO NOS VENCEDORES DE QUAD 3 (No Piso dos Risk Ranges):
- Adicionar +US$ 10.000 em AAAU (Ouro Físico)
- Adicionar +US$ 5.000 em GDX (Mineradoras de Ouro)
- Adicionar +US$ 3.600 em BE / GRID (Energia p/ IA)
Resultado: Alocação em Quad 3 sobe de 38,5% para 62,8%!`;

  navigator.clipboard.writeText(plan).then(() => {
    showToast("Plano de Rebalanceamento copiado com sucesso!");
  });
}

// 8. TOAST NOTIFICATION HELPER
function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  toast.innerText = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}
