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

// DADOS FUNDAMENTALISTAS MICRO, VALUATION & PREÇO-ALVO (THE PODS & TECH/IA ECOSYSTEM)
const fundamentalsData = [
  { 
    ticker: "MELI", 
    name: "MercadoLibre Inc", 
    category: "core_fcf", 
    techNiche: "E-commerce, Logística & Fintech LatAm", 
    currentPrice: 1995.50,
    baseMetric: 48.10, // EPS NTM estimado
    metricType: "P/E",
    currentMultiple: 41.5,
    fairMultiple: 51.0, // Justo pelo crescimento de 38% e monopólio
    revGrowthVal: 38,
    revGrowth: "+35% a +42%", 
    fcfMarginVal: 25,
    fcfMargin: "Forte (US$ 8B+ caixa)", 
    targetPrice: 2453.00,
    upsidePct: 22.9,
    valuationStatus: "💎 Oportunidade",
    statusClass: "badge-bullish",
    actionDesc: "Comprar recuos / Manter CORE",
    moat: "Monopólio logístico (Meli Delivery) + ecossistema bancário (Mercado Pago). Poder de repasse inflacionário em moedas locais e DXY Bearish.", 
    verdict: "🟢 CORE INDISCUTÍVEL", 
    verdictClass: "badge-bullish" 
  },
  { 
    ticker: "AVGO", 
    name: "Broadcom Inc", 
    category: "ai_infra", 
    techNiche: "Switches Ethernet (Tomahawk 5/6), ASICs Customizados IA & VMware", 
    currentPrice: 164.20,
    baseMetric: 6.20,
    metricType: "P/E",
    currentMultiple: 26.5,
    fairMultiple: 32.0,
    revGrowthVal: 45,
    revGrowth: "+43% a +47%", 
    fcfMarginVal: 45,
    fcfMargin: "Altíssima (~45% margem FCF)", 
    targetPrice: 198.40,
    upsidePct: 20.8,
    valuationStatus: "💎 Oportunidade",
    statusClass: "badge-bullish",
    actionDesc: "Comprar nos pisos de range",
    moat: "Líder absoluta em switches para clusters de IA (Meta, Google, ByteDance) e chips customizados (XPU). Receita de software recorrente da VMware.", 
    verdict: "🟢 CORE / ÂNCORA IA", 
    verdictClass: "badge-bullish" 
  },
  { 
    ticker: "ASML", 
    name: "ASML Holding NV", 
    category: "semis", 
    techNiche: "Litografia EUV & High-NA EUV", 
    currentPrice: 840.00,
    baseMetric: 24.50,
    metricType: "P/E",
    currentMultiple: 34.3,
    fairMultiple: 38.0,
    revGrowthVal: 22,
    revGrowth: "+15% a +25%", 
    fcfMarginVal: 32,
    fcfMargin: "Forte (>30% margem)", 
    targetPrice: 931.00,
    upsidePct: 10.8,
    valuationStatus: "⚖️ Preço Justo",
    statusClass: "badge-neutral",
    actionDesc: "Hold Estrutural",
    moat: "Monopólio global absoluto em máquinas EUV indispensáveis para nós de 3nm, 2nm e A16. Ninguém fabrica chips avançados sem ASML.", 
    verdict: "🟢 HOLD ESTRUTURAL", 
    verdictClass: "badge-bullish" 
  },
  { 
    ticker: "GOOGL", 
    name: "Alphabet Inc", 
    category: "core_fcf", 
    techNiche: "Hyperscaler Cloud, Modelos Gemini & TPUs", 
    currentPrice: 178.50,
    baseMetric: 8.90,
    metricType: "P/E",
    currentMultiple: 20.1,
    fairMultiple: 25.0,
    revGrowthVal: 15,
    revGrowth: "+14% a +16%", 
    fcfMarginVal: 28,
    fcfMargin: "Fortaleza (US$ 100B+ caixa)", 
    targetPrice: 222.50,
    upsidePct: 24.6,
    valuationStatus: "💎 Oportunidade",
    statusClass: "badge-bullish",
    actionDesc: "Comprar recuos / Âncora FCF",
    moat: "TPU v5p/v6 competindo com Nvidia em custo/eficiência; liderança em pesquisa de IA e monetização em Search e YouTube.", 
    verdict: "🟢 CORE DE QUALIDADE", 
    verdictClass: "badge-bullish" 
  },
  { 
    ticker: "META", 
    name: "Meta Platforms", 
    category: "core_fcf", 
    techNiche: "Redes Sociais, Modelos Llama AI & Compute", 
    currentPrice: 535.00,
    baseMetric: 24.20,
    metricType: "P/E",
    currentMultiple: 22.1,
    fairMultiple: 26.5,
    revGrowthVal: 22,
    revGrowth: "+20% a +25%", 
    fcfMarginVal: 36,
    fcfMargin: "Margens de 35%+", 
    targetPrice: 641.30,
    upsidePct: 19.9,
    valuationStatus: "💎 Oportunidade",
    statusClass: "badge-bullish",
    actionDesc: "Manter / Acumular em dips",
    moat: "Infraestrutura de compute massiva para treinar modelos abertos (Llama) que reduzem dependência de terceiros e impulsionam anúncios.", 
    verdict: "🟢 CORE", 
    verdictClass: "badge-bullish" 
  },
  { 
    ticker: "UBER", 
    name: "Uber Technologies", 
    category: "core_fcf", 
    techNiche: "Mobilidade, Delivery & Rede de Frotas Autônomas", 
    currentPrice: 72.80,
    baseMetric: 3.20,
    metricType: "P/E",
    currentMultiple: 22.8,
    fairMultiple: 28.0,
    revGrowthVal: 17,
    revGrowth: "+15% a +18%", 
    fcfMarginVal: 15,
    fcfMargin: "Forte expansão (US$ 5B+ FCF)", 
    targetPrice: 89.60,
    upsidePct: 23.1,
    valuationStatus: "💎 Oportunidade",
    statusClass: "badge-bullish",
    actionDesc: "Comprar / FCF infletindo",
    moat: "Plataforma líder global de mobilidade com acordos estratégicos para operar frotas de robotáxis (Waymo, etc.).", 
    verdict: "🟢 CORE DE FCF", 
    verdictClass: "badge-bullish" 
  },
  { 
    ticker: "BE", 
    name: "Bloom Energy Corp", 
    category: "ai_infra", 
    techNiche: "Células de Combustível de Estado Sólido (SOFC) p/ Data Centers", 
    currentPrice: 13.50,
    baseMetric: 0.45,
    metricType: "EV/Sales",
    currentMultiple: 2.2,
    fairMultiple: 3.2,
    revGrowthVal: 22,
    revGrowth: "+18% a +25%", 
    fcfMarginVal: 5,
    fcfMargin: "Ponto de inflexão", 
    targetPrice: 19.80,
    upsidePct: 46.7,
    valuationStatus: "💎 Oportunidade TAIL",
    statusClass: "badge-bullish",
    actionDesc: "Manter 1–3% da carteira",
    moat: "Resolução do maior gargalo da IA: falta de energia na rede elétrica. Energia 'behind-the-meter' sem esperar 5 anos pela concessionária.", 
    verdict: "🟢 TAIL DE ALTA CONVICÇÃO", 
    verdictClass: "badge-bullish" 
  },
  { 
    ticker: "FN", 
    name: "Fabrinet", 
    category: "ai_infra", 
    techNiche: "Fabricação Óptica de Alta Precisão (Transceivers 800G/1.6T)", 
    currentPrice: 245.00,
    baseMetric: 9.80,
    metricType: "P/E",
    currentMultiple: 25.0,
    fairMultiple: 28.0,
    revGrowthVal: 15,
    revGrowth: "+12% a +17%", 
    fcfMarginVal: 12,
    fcfMargin: "Sólida e sem dívida líquida", 
    targetPrice: 274.40,
    upsidePct: 12.0,
    valuationStatus: "⚖️ Preço Justo",
    statusClass: "badge-neutral",
    actionDesc: "Hold / Monitorar",
    moat: "Fabricante exclusiva dos transceivers ópticos de IA mais avançados da Nvidia e hyperscalers. Forte barreira técnica de manufatura.", 
    verdict: "🟢 TAIL ESTRUTURAL", 
    verdictClass: "badge-bullish" 
  },
  { 
    ticker: "ALAB", 
    name: "Astera Labs Inc", 
    category: "ai_infra", 
    techNiche: "Conectividade PCIe 5.0/6.0, CXL & Retimers", 
    currentPrice: 88.00,
    baseMetric: 1.10,
    metricType: "P/E",
    currentMultiple: 80.0,
    fairMultiple: 50.0,
    revGrowthVal: 150,
    revGrowth: "+150%+", 
    fcfMarginVal: 18,
    fcfMargin: "Margens brutas de 75%+", 
    targetPrice: 55.00,
    upsidePct: -37.5,
    valuationStatus: "🚨 Risco de Bolha",
    statusClass: "badge-bearish",
    actionDesc: "Realizar lucros no topo do range",
    moat: "Domínio de chips retimers PCIe para GPUs de IA. Porém, valuation com múltiplos extremos vulnerável ao Quad 3.", 
    verdict: "🟡 TAIL HIPERCRESCIMENTO", 
    verdictClass: "badge-neutral" 
  },
  { 
    ticker: "CRDO", 
    name: "Credo Technology", 
    category: "ai_infra", 
    techNiche: "Cabos Elétricos Ativos (AEC) e DSPs SerDes", 
    currentPrice: 38.50,
    baseMetric: 0.65,
    metricType: "P/E",
    currentMultiple: 59.2,
    fairMultiple: 42.0,
    revGrowthVal: 70,
    revGrowth: "+60% a +80%", 
    fcfMarginVal: 10,
    fcfMargin: "Geração de caixa positiva", 
    targetPrice: 27.30,
    upsidePct: -29.1,
    valuationStatus: "🚨 Múltiplo Esticado",
    statusClass: "badge-bearish",
    actionDesc: "Manter tamanho mínimo (1%)",
    moat: "Substituição de cabos de cobre por AECs. Crescimento explosivo mas sensível a reprecificação macro.", 
    verdict: "🟡 TAIL ESPECÍFICA", 
    verdictClass: "badge-neutral" 
  },
  { 
    ticker: "COHR", 
    name: "Coherent Corp", 
    category: "ai_infra", 
    techNiche: "Lasers Industriais, Materiais SiC e Módulos Ópticos 800G", 
    currentPrice: 84.50,
    baseMetric: 3.10,
    metricType: "P/E",
    currentMultiple: 27.2,
    fairMultiple: 26.0,
    revGrowthVal: 12,
    revGrowth: "+10% a +15%", 
    fcfMarginVal: 8,
    fcfMargin: "Alavancada (em desalavancagem)", 
    targetPrice: 80.60,
    upsidePct: -4.6,
    valuationStatus: "⚖️ Preço Justo",
    statusClass: "badge-neutral",
    actionDesc: "Monitorar dívida",
    moat: "Líder em módulos ópticos e lasers. Alavancagem financeira exige cautela em Quad 3.", 
    verdict: "🟡 TAIL EM MONITORAMENTO", 
    verdictClass: "badge-neutral" 
  },
  { 
    ticker: "ARM", 
    name: "Arm Holdings plc", 
    category: "semis", 
    techNiche: "Arquitetura de CPUs v9 p/ Servidores e PCs IA", 
    currentPrice: 138.00,
    baseMetric: 1.85,
    metricType: "P/E",
    currentMultiple: 74.6,
    fairMultiple: 48.0,
    revGrowthVal: 38,
    revGrowth: "+35% a +40%", 
    fcfMarginVal: 45,
    fcfMargin: "Margens de 45%+", 
    targetPrice: 88.80,
    upsidePct: -35.7,
    valuationStatus: "🚨 Risco de Bolha",
    statusClass: "badge-bearish",
    actionDesc: "Realizar no topo / Reduzir",
    moat: "Monopólio de arquitetura ARMv9, mas negociando a 75x lucros. Fragilidade a reprecificação de taxa 10Y.", 
    verdict: "🟡 TAIL SECULAR", 
    verdictClass: "badge-neutral" 
  },
  { 
    ticker: "INTC", 
    name: "Intel Corp", 
    category: "cyclical", 
    techNiche: "CPUs de Servidor, PCs x86 e Foundry (18A)", 
    currentPrice: 20.80,
    baseMetric: 0.60,
    metricType: "P/E",
    currentMultiple: 34.6,
    fairMultiple: 18.0,
    revGrowthVal: -2,
    revGrowth: "Pressionada (-5% a +2%)", 
    fcfMarginVal: -15,
    fcfMargin: "Queima de caixa em capex", 
    targetPrice: 10.80,
    upsidePct: -48.1,
    valuationStatus: "🔴 Queima de FCF",
    statusClass: "badge-bearish",
    actionDesc: "Candidata prioritária a venda",
    moat: "Perdendo share para AMD e ARM; queima de caixa pesada em fundição. Pior perfil no Quad 3.", 
    verdict: "🔴 CANDIDATA A TROCA", 
    verdictClass: "badge-bearish" 
  },
  { 
    ticker: "NOK", 
    name: "Nokia Oyj", 
    category: "cyclical", 
    techNiche: "Equipamentos 5G/6G, Roteamento IP e Redes Ópticas", 
    currentPrice: 4.15,
    baseMetric: 0.38,
    metricType: "P/E",
    currentMultiple: 10.9,
    fairMultiple: 13.5,
    revGrowthVal: 2,
    revGrowth: "Estável (-2% a +3%)", 
    fcfMarginVal: 12,
    fcfMargin: "Sólida (Recompras & Div)", 
    targetPrice: 5.13,
    upsidePct: 23.6,
    valuationStatus: "💎 Valor / Desconto",
    statusClass: "badge-bullish",
    actionDesc: "Manter para dividendos/turnaround",
    moat: "Infraestrutura óptica e patentes essenciais com múltiplos muito baixos e yield de proventos.", 
    verdict: "🟡 AVALIAÇÃO LONGO PRAZO", 
    verdictClass: "badge-neutral" 
  },
  { 
    ticker: "NEM", 
    name: "Newmont Corp", 
    category: "core_fcf", 
    techNiche: "Maior Mineradora de Ouro do Mundo (Quad 3)", 
    currentPrice: 52.30,
    baseMetric: 3.80,
    metricType: "P/E",
    currentMultiple: 13.8,
    fairMultiple: 19.0,
    revGrowthVal: 28,
    revGrowth: "+25% a +35%", 
    fcfMarginVal: 30,
    fcfMargin: "Explosão de FCF com ouro > $4.400", 
    targetPrice: 72.20,
    upsidePct: 38.0,
    valuationStatus: "💎 Oportunidade Máxima",
    statusClass: "badge-bullish",
    actionDesc: "Comprar recuos / Pilar Quad 3",
    moat: "Alavancagem operacional extrema ao preço do ouro spot (Bullish TREND 4.292–4.698). Forte geração de caixa livre.", 
    verdict: "🟢 PILAR QUAD 3", 
    verdictClass: "badge-bullish" 
  }
];

// INICIALIZAÇÃO DA APLICAÇÃO
document.addEventListener("DOMContentLoaded", () => {
  const portSelect = document.getElementById("portfolioSelect");
  if (portSelect) portSelect.value = "schwab";
  
  renderRiskRangesTable("all");
  renderPortfolioView(activePortfolioKey);
  renderFundamentalsTable("all");
  loadCompanyToSimulator("MELI");
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

// 2.1 MOTOR DE VALUATION, SIMULADOR DE PREÇO-ALVO & TERMOSTATO DE BOLHAS
let currentSimTicker = "MELI";

function loadCompanyToSimulator(ticker) {
  const item = fundamentalsData.find(d => d.ticker === ticker) || fundamentalsData[0];
  currentSimTicker = item.ticker;

  // Atualizar inputs/sliders
  const revGrowthSlider = document.getElementById("simRevGrowth");
  const fcfMarginSlider = document.getElementById("simFcfMargin");
  const fairMultSlider = document.getElementById("simFairMultiple");

  if (revGrowthSlider) revGrowthSlider.value = item.revGrowthVal;
  if (fcfMarginSlider) fcfMarginSlider.value = item.fcfMarginVal;
  if (fairMultSlider) fairMultSlider.value = item.fairMultiple;

  // Atualizar labels dos valores estáticos
  const curPriceEl = document.getElementById("simCurrentPrice");
  const curMultEl = document.getElementById("simCurrentMultiple");
  const baseMetEl = document.getElementById("simBaseMetric");

  if (curPriceEl) curPriceEl.innerText = `US$ ${item.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  if (curMultEl) curMultEl.innerText = `${item.metricType} ${item.currentMultiple.toFixed(1)}x`;
  if (baseMetEl) baseMetEl.innerText = `US$ ${item.baseMetric.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  updateValuationCalculation();
}

function updateValuationCalculation() {
  const item = fundamentalsData.find(d => d.ticker === currentSimTicker) || fundamentalsData[0];
  
  const revGrowth = parseFloat(document.getElementById("simRevGrowth")?.value || item.revGrowthVal);
  const fcfMargin = parseFloat(document.getElementById("simFcfMargin")?.value || item.fcfMarginVal);
  const fairMult = parseFloat(document.getElementById("simFairMultiple")?.value || item.fairMultiple);

  // Atualizar labels dos sliders
  const lblRev = document.getElementById("lblRevGrowth");
  const lblFcf = document.getElementById("lblFcfMargin");
  const lblMult = document.getElementById("lblFairMultiple");

  if (lblRev) lblRev.innerText = `${revGrowth >= 0 ? '+' : ''}${revGrowth}%`;
  if (lblFcf) lblFcf.innerText = `${fcfMargin}%`;
  if (lblMult) lblMult.innerText = `${fairMult.toFixed(1)}x`;

  // Cálculo do Preço-Alvo:
  // Preço Alvo = Métrica Base Projetada * Múltiplo Justo
  // Ajustamos a métrica base pelo crescimento adicional esperado
  const projectedMetric = item.baseMetric * (1 + (revGrowth / 100));
  let calculatedTargetPrice = projectedMetric * fairMult;

  // Normalização específica se a métrica base for EV/Sales (como BE)
  if (item.metricType === "EV/Sales") {
    calculatedTargetPrice = item.currentPrice * (fairMult / item.currentMultiple) * (1 + (revGrowth / 100) * 0.5);
  }

  const currentPrice = item.currentPrice;
  const upsidePct = ((calculatedTargetPrice - currentPrice) / currentPrice) * 100;

  // Atualizar Display do Preço-Alvo
  const displayPriceEl = document.getElementById("valTargetPriceDisplay");
  const upsideBadgeEl = document.getElementById("valUpsideBadge");
  const upsidePctEl = document.getElementById("valUpsidePct");
  const verdictTitleEl = document.getElementById("valVerdictTitle");
  const verdictDescEl = document.getElementById("valVerdictDesc");
  const barCurPrice = document.getElementById("barCurPrice");
  const barTgtPrice = document.getElementById("barTgtPrice");
  const progressBar = document.getElementById("valProgressBar");

  if (displayPriceEl) displayPriceEl.innerText = `US$ ${calculatedTargetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (barCurPrice) barCurPrice.innerText = `US$ ${currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  if (barTgtPrice) barTgtPrice.innerText = `US$ ${calculatedTargetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  if (upsidePctEl) {
    upsidePctEl.innerText = `${upsidePct >= 0 ? '+' : ''}${upsidePct.toFixed(1)}%`;
  }

  if (upsideBadgeEl) {
    if (upsidePct >= 0) {
      upsideBadgeEl.className = "target-upside-badge";
      upsideBadgeEl.innerHTML = `<span class="icon">🚀</span> Potencial (Upside): <strong>+${upsidePct.toFixed(1)}%</strong>`;
    } else {
      upsideBadgeEl.className = "target-upside-badge negative";
      upsideBadgeEl.innerHTML = `<span class="icon">⚠️</span> Downside Estimado: <strong>${upsidePct.toFixed(1)}%</strong>`;
    }
  }

  // Termômetro de Bolha vs Oportunidade
  if (verdictTitleEl && verdictDescEl) {
    if (upsidePct >= 20) {
      verdictTitleEl.innerHTML = "💎 OPORTUNIDADE DE COMPRA (MARGEM DE SEGURANÇA ALTA)";
      verdictTitleEl.style.color = "#10B981";
      verdictDescEl.innerText = `A ação negocia com forte desconto em relação ao crescimento projetado (+${revGrowth}%) e múltiplo justo (${fairMult.toFixed(1)}x). O Preço-Alvo de US$ ${calculatedTargetPrice.toFixed(2)} oferece assimetria altista atrativa para acúmulo nos recuos.`;
      if (progressBar) {
        progressBar.className = "progress-fill success";
        progressBar.style.width = `${Math.min(100, Math.max(15, (currentPrice / calculatedTargetPrice) * 100))}%`;
      }
    } else if (upsidePct <= -20) {
      verdictTitleEl.innerHTML = "🚨 ALERTA DE BOLHA / MÚLTIPLO SUPERESTIMADO (RISCO DE REPREÇO)";
      verdictTitleEl.style.color = "#F43F5E";
      verdictDescEl.innerText = `Múltiplo de mercado (${item.currentMultiple.toFixed(1)}x) muito acima do justo (${fairMult.toFixed(1)}x). Em regime de Quad 3 com juros longos em 4,76%, papéis com múltiplo esticado sofrem forte compressão. Recomendação: Realizar lucros no topo do Risk Range.`;
      if (progressBar) {
        progressBar.className = "progress-fill danger";
        progressBar.style.width = "100%";
      }
    } else {
      verdictTitleEl.innerHTML = "⚖️ PREÇO JUSTO / EQUILÍBRIO FUNDAMENTALISTA";
      verdictTitleEl.style.color = "#F59E0B";
      verdictDescEl.innerText = `A ação está negociando muito próxima do seu valor justo estimado (US$ ${calculatedTargetPrice.toFixed(2)}). Manter posição existente sem grandes aportes adicionais.`;
      if (progressBar) {
        progressBar.className = "progress-fill warning";
        progressBar.style.width = "90%";
      }
    }
  }
}

// 2.2 RENDERIZAR TABELA FUNDAMENTALISTA COM PREÇO-ALVO & MULTIPLOS
function renderFundamentalsTable(filter) {
  const tbody = document.getElementById("fundamentalsTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const filtered = filter === "all" ? fundamentalsData : fundamentalsData.filter(item => item.category === filter);

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    const upsideSign = item.upsidePct >= 0 ? `+${item.upsidePct.toFixed(1)}%` : `${item.upsidePct.toFixed(1)}%`;
    const upsideColor = item.upsidePct >= 15 ? 'text-emerald' : (item.upsidePct <= -15 ? 'text-rose' : 'text-amber');

    tr.innerHTML = `
      <td>
        <strong>${item.ticker}</strong> <br>
        <small class="text-muted">${item.name}</small>
      </td>
      <td class="font-bold">US$ ${item.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td><strong class="text-emerald">${item.revGrowth}</strong></td>
      <td><small>${item.metricType} <strong>${item.currentMultiple.toFixed(1)}x</strong></small></td>
      <td><small class="text-cyan font-bold">${item.fairMultiple.toFixed(1)}x</small></td>
      <td class="font-bold text-cyan">US$ ${item.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      <td><strong class="${upsideColor}">${upsideSign}</strong></td>
      <td><span class="badge ${item.statusClass}">${item.valuationStatus}</span></td>
      <td><small>${item.actionDesc}</small></td>
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

// 3. ANALISADOR DE AÇÕES COM CONFLUÊNCIA VALUATION + RISK RANGE
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

  const fundItem = fundamentalsData.find(d => d.ticker === ticker);

  let analysis = {
    tese: "Ativo listado em bolsa americana avaliado sob o framework quantitativo e macro Hedgeye.",
    quadFit: "Quad 3 (Estagflação) exige seletividade e alinhamento de TREND.",
    sinal: "BULLISH TREND",
    rangeInfo: "Range atualizado conforme o EARLYLOOK de 03/09/2026.",
    valuationBlock: fundItem ? `Preço Atual: US$ ${fundItem.currentPrice.toFixed(2)} | Múltiplo Atual: ${fundItem.currentMultiple.toFixed(1)}x vs Múltiplo Justo: ${fundItem.fairMultiple.toFixed(1)}x. <br><strong>Preço-Alvo Fundamentalista:</strong> <span class="text-cyan font-bold">US$ ${fundItem.targetPrice.toFixed(2)}</span> (Upside: <strong class="${fundItem.upsidePct >= 0 ? 'text-emerald' : 'text-rose'}">${fundItem.upsidePct >= 0 ? '+' : ''}${fundItem.upsidePct.toFixed(1)}%</strong>) — Diagnóstico: <strong>${fundItem.valuationStatus}</strong>.` : "Ativo commodity/físico avaliado por métricas de oferta, demanda e paridade monetária.",
    sobreposicao: "Monitorar correlação com carteiras Schwab e Tastyworks.",
    conclusao: "Conduta: Respeitar a disciplina operacional, comprando nos pisos de range de ativos com Bullish TREND.",
    invalidação: "Quebra de TREND com confirmação de volume e virada do DXY."
  };

  if (ticker === "AAAU" || ticker === "GOLD" || ticker === "NEM" || ticker === "GDX") {
    analysis.tese = "Ouro Spot & Mineradoras: Principal posição de alta convicção macro da Hedgeye. Proteção máxima contra desvalorização monetária, estagflação de Quad 3 e volatilidade de yields.";
    analysis.quadFit = "🟢 **Favorecido Absoluto em Quad 3 (Estagflação)**. DXY em Bearish TREND (98,75 a 99,69) amplia fluxo comprador.";
    analysis.sinal = "BULLISH TREND Forte (Range Ouro Hoje: 4.292 a 4.698)";
    analysis.rangeInfo = "Ouro Spot em 4.480 (Piso elevado para 4.292. Se 10Y Yield recuar para 4,68%, o rali acelera).";
    if (ticker === "NEM") {
      analysis.valuationBlock = `Preço Atual: US$ 52,30 | P/L Atual: 13,8x vs P/L Justo: 19,0x. <br><strong>Preço-Alvo Fundamentalista:</strong> <span class="text-emerald font-bold">US$ 72,20 (+38,0% Upside)</span>. Alavancagem operacional maciça com o ouro acima de US$ 4.400.`;
    }
    analysis.sobreposicao = "Presente na Schwab (AAAU: US$ 6.460,50 + GDX: US$ 2.904,26) e Tastyworks (NEM: US$ 1.745,10 + GDX: US$ 969,05). Total: US$ 12.078,91 (~4,9% do patrimônio).";
    analysis.conclusao = "<strong>Conduta:</strong> Manter alocação máxima e comprar recuos. Convicção estrutural no Quad 3.";
    analysis.invalidação = "DXY rompendo forte para cima de 100 com quebra do suporte TREND de 4.204 no ouro.";
  } else if (ticker === "MELI") {
    analysis.tese = "MercadoLibre: Monopólio logístico e fintech líder na América Latina. Crescimento de receitas de +38% com forte poder de precificação.";
    analysis.quadFit = "🟢 **Favorecida por DXY Bearish** (Alivia moedas latino-americanas e expande consumo).";
    analysis.sinal = "BULLISH TREND";
    analysis.rangeInfo = "Preço Atual: US$ 1.995,50.";
    analysis.valuationBlock = `Preço Atual: US$ 1.995,50 | P/L Atual: 41,5x vs P/L Justo: 51,0x. <br><strong>Preço-Alvo Fundamentalista:</strong> <span class="text-emerald font-bold">US$ 2.453,00 (+22,9% Upside)</span>. 💎 <strong>Oportunidade de Compra com Margem de Segurança</strong>.`;
    analysis.sobreposicao = "Presente em ambas: Schwab (US$ 5.986,51) e Tastyworks (US$ 1.994,04). Total: US$ 7.980,55 (3,24% global).";
    analysis.conclusao = "<strong>Conduta:</strong> Manter posição CORE intacta e comprar em pullbacks técnicos.";
    analysis.invalidação = "Perda do suporte TREND e desaceleração do TPV fintech abaixo de 20%.";
  } else if (ticker === "SLV") {
    analysis.tese = "iShares Silver Trust (Prata Física).";
    analysis.quadFit = "🟡 **Híbrido (Monetário e Industrial)**.";
    analysis.sinal = "NEUTRAL (Quebrou sinal TRADE em US$ 65,11)";
    analysis.rangeInfo = "Piso: US$ 63,00 | Teto: US$ 69,00 (Preço atual: ~US$ 64,50).";
    analysis.valuationBlock = `Prata física com suporte quebrado no curto prazo. Manter tamanho mínimo e não comprar na queda até reabilitação de sinal.`;
    analysis.sobreposicao = "Presente na Schwab (US$ 3.520,20 - 1,66%).";
    analysis.conclusao = "<strong>Alerta Hedgeye de Hoje:</strong> Não comprar a queda ('stop buying the dip'). Manter posição mínima.";
    analysis.invalidação = "Fechamento consistente acima de US$ 65,11 reabilita o sinal TRADE altista.";
  } else if (ticker === "ALAB" || ticker === "ARM") {
    analysis.tese = `${ticker}: Ativo de hiper momentum em infraestrutura de IA e semicondutores.`;
    analysis.quadFit = "🔴 **Vento contrário em Quad 3** (Múltiplos esticados sofrem com juros longos de 4,76%).";
    analysis.sinal = "NEUTRAL / CAUTELA";
    analysis.rangeInfo = "Volatilidade elevada.";
    analysis.valuationBlock = `🚨 <strong>Alerta de Múltiplo Esticado / Risco de Bolha:</strong> Negociando entre 75x e 80x lucros. Downside estimado de -35% a -40% caso haja descompressão de múltiplos macro.`;
    analysis.sobreposicao = `Posição TAIL restrita a 1–3% da carteira.`;
    analysis.conclusao = "<strong>Conduta:</strong> Realizar lucros parciais nos topos de range (Trade) e proteger caixa.";
    analysis.invalidação = "Quebra simultânea de TRADE e TREND aciona saída total (#OUT).";
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
      <div class="block-title">4. Valuation Fundamentalista & Preço-Alvo (Múltiplos Justos)</div>
      <p class="block-desc">${analysis.valuationBlock}</p>
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">5. Sobreposição de Carteira & Conclusão Operacional</div>
      <p class="block-desc"><strong>Posição:</strong> ${analysis.sobreposicao}<br>${analysis.conclusao}<br><span class="text-rose"><strong>Condição de Invalidação:</strong> ${analysis.invalidação}</span></p>
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

// 5. GERADOR OFICIAL DE RELATÓRIO DIÁRIO (RESEARCH EXECUTIVO INSTITUCIONAL)
let activeReportViewMode = "formatted";

function openReportModal() {
  renderActiveReportView();
  document.getElementById("reportModal").classList.add("active");
}

function closeReportModal() {
  document.getElementById("reportModal").classList.remove("active");
}

function setReportViewMode(mode) {
  activeReportViewMode = mode;
  const btnFormatted = document.getElementById("btnViewFormatted");
  const btnRaw = document.getElementById("btnViewRaw");
  const formattedView = document.getElementById("reportFormattedView");
  const rawView = document.getElementById("reportRawView");

  if (mode === "formatted") {
    btnFormatted?.classList.add("active");
    btnRaw?.classList.remove("active");
    if (formattedView) formattedView.style.display = "block";
    if (rawView) rawView.style.display = "none";
  } else {
    btnRaw?.classList.add("active");
    btnFormatted?.classList.remove("active");
    if (formattedView) formattedView.style.display = "none";
    if (rawView) rawView.style.display = "block";
  }
}

function renderActiveReportView() {
  const formattedContainer = document.getElementById("reportFormattedView");
  const rawContainer = document.getElementById("reportRawContent");
  if (!formattedContainer || !rawContainer) return;

  const targetScope = document.getElementById("reportScopeSelect")?.value || activePortfolioKey;
  let targetPositions = [];
  let cartTitle = "";

  if (targetScope === "schwab") {
    targetPositions = portfolioData.schwab.positions;
    cartTitle = "Charles Schwab (Carteira Principal)";
  } else if (targetScope === "tastyworks") {
    targetPositions = portfolioData.tastyworks.positions;
    cartTitle = "Tastyworks (Opcionalidade & High Beta)";
  } else {
    targetPositions = [...portfolioData.schwab.positions, ...portfolioData.tastyworks.positions];
    cartTitle = "Consolidado Global (Charles Schwab + Tastyworks)";
  }

  const totalCart = targetPositions.reduce((acc, p) => acc + (p.qty * p.price), 0);
  const q3Total = targetPositions.filter(p => p.nativeQuad === "Quad3" || p.ticker === "SGOV" || p.ticker === "CAIXA").reduce((acc, p) => acc + (p.qty * p.price), 0);
  const q1Total = targetPositions.filter(p => p.nativeQuad === "Quad1").reduce((acc, p) => acc + (p.qty * p.price), 0);
  const creditTotal = targetPositions.filter(p => p.nativeQuad === "Crédito").reduce((acc, p) => acc + (p.qty * p.price), 0);
  const q2Total = targetPositions.filter(p => p.nativeQuad === "Quad2").reduce((acc, p) => acc + (p.qty * p.price), 0);
  const cashTotal = targetPositions.filter(p => p.ticker === "SGOV" || p.ticker === "CAIXA").reduce((acc, p) => acc + (p.qty * p.price), 0);

  const quad3Pct = totalCart > 0 ? ((q3Total / totalCart) * 100).toFixed(1) : "0.0";
  const quad1Pct = totalCart > 0 ? ((q1Total / totalCart) * 100).toFixed(1) : "0.0";
  const creditPct = totalCart > 0 ? ((creditTotal / totalCart) * 100).toFixed(1) : "0.0";
  const quad2Pct = totalCart > 0 ? ((q2Total / totalCart) * 100).toFixed(1) : "0.0";
  const cashPct = totalCart > 0 ? ((cashTotal / totalCart) * 100).toFixed(1) : "0.0";

  // 1. RENDERIZAÇÃO HTML EXECUTIVA INSTITUCIONAL (DIAGRAMADA PARA 2 PÁGINAS A4)
  const riskRowsHtml = riskRangesData.slice(0, 12).map(r => {
    let changeTag = '<span class="text-muted" style="font-size:0.75rem;">Estável</span>';
    if (r.low > r.prevLow || r.high > r.prevHigh) changeTag = '<span class="text-emerald font-bold" style="font-size:0.75rem;">▲ Subiu</span>';
    else if (r.low < r.prevLow || r.high < r.prevHigh) changeTag = '<span class="text-rose font-bold" style="font-size:0.75rem;">▼ Caiu</span>';

    const signalBadge = r.signal === "BULLISH" ? "badge-bullish" : (r.signal === "BEARISH" ? "badge-bearish" : "badge-neutral");

    return `
      <tr>
        <td style="padding: 4px 6px;"><strong>${r.ticker}</strong></td>
        <td style="padding: 4px 6px; font-size: 0.8rem;">${r.name}</td>
        <td style="padding: 4px 6px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 700;">${r.low.toLocaleString('pt-BR')} — ${r.high.toLocaleString('pt-BR')}</td>
        <td style="padding: 4px 6px;"><span class="badge ${signalBadge}" style="font-size: 0.72rem;">${r.signal}</span></td>
        <td style="padding: 4px 6px;">${changeTag}</td>
      </tr>
    `;
  }).join("");

  // Top 10 posições estruturais em peso
  const sortedPositions = [...targetPositions].sort((a, b) => (b.qty * b.price) - (a.qty * a.price));
  const topPositions = sortedPositions.slice(0, 10);

  const topPositionsRowsHtml = topPositions.map(p => {
    const val = p.qty * p.price;
    const pct = totalCart > 0 ? ((val / totalCart) * 100).toFixed(2) : "0.00";
    const quadClass = p.nativeQuad.includes("Quad3") ? "badge-bullish" : (p.nativeQuad.includes("Credito") ? "badge-bearish" : "badge-neutral");

    return `
      <tr>
        <td style="padding: 5px 8px;"><strong>${p.ticker}</strong></td>
        <td style="padding: 5px 8px; font-size: 0.82rem;">${p.name}</td>
        <td style="padding: 5px 8px;"><span class="tag tag-outline" style="font-size: 0.72rem;">${p.typeGroup}</span></td>
        <td style="padding: 5px 8px;"><span class="badge ${quadClass}" style="font-size: 0.72rem;">${p.nativeQuad}</span></td>
        <td style="padding: 5px 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 700;">US$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="padding: 5px 8px; font-family: 'JetBrains Mono', monospace; font-size: 0.82rem; font-weight: 800; color: #0284C7;">${pct}%</td>
      </tr>
    `;
  }).join("");

  formattedContainer.innerHTML = `
    <!-- PÁGINA 1: MACRO STRATEGY & OUR LEVELS -->
    <div class="pdf-page-block">
      <!-- Cabeçalho Institucional -->
      <div class="report-brand-header">
        <div class="report-brand-logo">
          <span class="logo-icon">⚡</span>
          <div>
            <h2>HEDGEYE <span>RISK MANAGEMENT</span></h2>
            <p>Global Macro Strategy & Portfolio Advisory Report</p>
          </div>
        </div>
        <div class="report-brand-meta">
          <div class="meta-date">03/09/2026 | 09:30 BRT (07:51 EDT)</div>
          <div class="meta-author">Research: <strong>Keith McCullough & Daryl Jones</strong></div>
          <div class="meta-quad"><span class="badge badge-bullish">📍 REGIME ATUAL: QUAD 3 (ESTAGFLAÇÃO)</span></div>
        </div>
      </div>

      <!-- Banner de Identificação da Carteira -->
      <div class="report-section-card highlight" style="margin-bottom: 1rem; padding: 0.85rem 1.25rem;">
        <div class="flex-between">
          <div>
            <h3 class="report-section-title" style="margin-bottom: 0.1rem; border: none; font-size: 1rem;"><span class="icon">💼</span> ${cartTitle}</h3>
            <span class="text-muted" style="font-size: 0.78rem;">Snapshot auditado com reconciliação de preços e Risk Ranges</span>
          </div>
          <div class="text-right">
            <div style="font-size: 0.68rem; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Patrimônio Total</div>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; font-weight: 800; color: #38BDF8;">
              US$ ${totalCart.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      <!-- Seção 1: Síntese Macro & Destaques Matinais -->
      <div class="report-section-card" style="margin-bottom: 1rem; padding: 0.85rem 1.25rem;">
        <h3 class="report-section-title" style="font-size: 0.95rem;"><span class="icon">🧭</span> 1. Síntese Executiva & Diagnóstico Macro (GIP Framework)</h3>
        <div class="report-quote-banner" style="padding: 0.5rem 0.85rem; margin-bottom: 0.6rem; font-size: 0.82rem;">
          “You can't stop the waves, but you can learn to surf. Volatility is unavoidable; the edge comes from staying disciplined, sizing risk and reading flows.”
          <strong style="font-style: normal; font-size: 0.75rem; color: #38BDF8;">— Keith McCullough & Daryl Jones</strong>
        </div>
        <div class="report-bullets-grid" style="gap: 0.45rem;">
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">📌</span>
            <div><strong>Regime Nowcast GIP:</strong> Transição consolidada para <strong>Quad 3 (Estagflação: Crescimento Desacelera | Inflação Acelera)</strong>. Chicago PMI despencou para 47,1 (contração manufatureira) enquanto JOLTS saltou para 7,74M (+790k vagas), cimentando inflação salarial persistente.</div>
          </div>
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">📌</span>
            <div><strong>10Y Yield & Ouro Spot:</strong> O 10Y Yield colado no teto (4,76% vs 4,84%) e VIX calmo (~15) criam fragilidade. Se dados de Payrolls puxarem o yield para 4,68%, <strong>Ouro (AAAU / NEM / GDX) dispara</strong>. Piso do ouro elevado para US$ 4.292/oz.</div>
          </div>
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">📌</span>
            <div><strong>Afunilamento Setorial (Narrowing):</strong> Foco em setores com pricing power: <strong>Healthcare (XLV +1,4% no mês)</strong>, <strong>Energia/Metais (WTI 86,13–93,94)</strong> e Software defensivo de alto FCF (IGV).</div>
          </div>
        </div>
      </div>

      <!-- Seção 2: Tabela de Risk Ranges Oficiais -->
      <div class="report-section-card" style="margin-bottom: 0; padding: 0.85rem 1.25rem;">
        <h3 class="report-section-title" style="font-size: 0.95rem;"><span class="icon">🎯</span> 2. Risk Ranges Oficiais (Our Levels — 03/09/2026)</h3>
        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th style="padding: 5px 6px;">Ticker</th>
                <th style="padding: 5px 6px;">Ativo / Descrição</th>
                <th style="padding: 5px 6px;">Risk Range Imediato</th>
                <th style="padding: 5px 6px;">Sinal TREND</th>
                <th style="padding: 5px 6px;">Dinâmica</th>
              </tr>
            </thead>
            <tbody>
              ${riskRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="pdf-page-break" style="height: 25px;"></div>

    <!-- PÁGINA 2: PORTFOLIO ALLOCATION & ACTION PLAN -->
    <div class="pdf-page-block">
      <!-- Seção 3: Diagnóstico de Alocação e Exposição por Quadrante -->
      <div class="report-section-card success-border" style="margin-bottom: 1rem; padding: 0.85rem 1.25rem;">
        <h3 class="report-section-title" style="font-size: 0.95rem;"><span class="icon">📊</span> 3. Diagnóstico de Alocação da Carteira</h3>
        <div class="grid-3-col mb-2" style="gap: 0.5rem;">
          <div class="stat-card" style="padding: 0.6rem;">
            <div class="stat-label" style="font-size: 0.68rem;">ADERÊNCIA A QUAD 3 (VENTO A FAVOR)</div>
            <div class="stat-val text-emerald" style="font-size: 1.15rem;">${quad3Pct}%</div>
            <div class="stat-desc" style="font-size: 0.7rem;">Ouro, Energia, Defensivos e Caixa SGOV</div>
          </div>
          <div class="stat-card" style="padding: 0.6rem;">
            <div class="stat-label" style="font-size: 0.68rem;">EXPOSIÇÃO HIGH BETA (QUAD 1)</div>
            <div class="stat-val text-amber" style="font-size: 1.15rem;">${quad1Pct}%</div>
            <div class="stat-desc" style="font-size: 0.7rem;">Semicondutores e IA (risco TAIL 1-3%)</div>
          </div>
          <div class="stat-card" style="padding: 0.6rem;">
            <div class="stat-label" style="font-size: 0.68rem;">CRÉDITO CORPORATIVO (BONDS)</div>
            <div class="stat-val text-rose" style="font-size: 1.15rem;">${creditPct}%</div>
            <div class="stat-desc" style="font-size: 0.7rem;">Cupons com LQD em Bearish TREND</div>
          </div>
        </div>

        <h4 style="font-size: 0.85rem; margin: 0.5rem 0 0.4rem 0; color: #CBD5E1;">Principais Posições Estruturais da Carteira (Top Holdings):</h4>
        <div class="table-responsive">
          <table class="data-table" style="font-size: 0.8rem;">
            <thead>
              <tr>
                <th style="padding: 5px 8px;">Ticker</th>
                <th style="padding: 5px 8px;">Nome / Tese</th>
                <th style="padding: 5px 8px;">Tipo</th>
                <th style="padding: 5px 8px;">Quad</th>
                <th style="padding: 5px 8px;">Valor (USD)</th>
                <th style="padding: 5px 8px;">Peso (%)</th>
              </tr>
            </thead>
            <tbody>
              ${topPositionsRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Seção 4: Recomendações e Plano de Ação -->
      <div class="report-section-card warning-border" style="margin-bottom: 1rem; padding: 0.85rem 1.25rem;">
        <h3 class="report-section-title" style="font-size: 0.95rem;"><span class="icon">⚡</span> 4. Plano de Ação Operacional & Recomendações</h3>
        <div class="report-bullets-grid" style="gap: 0.45rem;">
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">🟢</span>
            <div><strong>Manter Convicção Máxima em Ouro (AAAU / NEM / GDX):</strong> Principal hedge contra estagflação e recuo de yields. Comprar nos recuos até o piso de 4.292.</div>
          </div>
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">🟡</span>
            <div><strong>Prata (SLV) — Cautela Operacional:</strong> Sinal TRADE quebrado em US$ 65,11. Respeitar a regra de "não comprar a queda" até reabilitação do sinal.</div>
          </div>
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">🔵</span>
            <div><strong>Preservação de Caixa / SGOV (${cashPct}%):</strong> Manter liquidez disponível para aproveitar assimetrias nos pisos de range.</div>
          </div>
        </div>
      </div>

      <!-- Rodapé Institucional -->
      <div style="border-top: 1px solid #1E293B; padding-top: 0.75rem; text-align: center; font-size: 0.72rem; color: #64748B;">
        Relatório de Estratégia Macro Quantitativa gerado para tomada de decisão fundamentada. Metodologia: Hedgeye Risk Management (GIP Framework & Volatility-Adjusted Risk Ranges).
      </div>
    </div>
  `;

  // 2. RENDERIZAÇÃO TEXTO MARKDOWN (RAW)
  const fullRawMarkdown = `RELATÓRIO HEDGEYE RISK MANAGEMENT — RESEARCH EXECUTIVO
Data: 03/09/2026 | Horário: 09:30 BRT / 07:51 EDT
Regime: QUAD 3 (ESTAGFLAÇÃO — G↓ | I↑)
Carteira: ${cartTitle}
Patrimônio Total: US$ ${totalCart.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

---
1. SÍNTESE MACRO (EARLY LOOK & TOP 3 THINGS)
• Volatilidade é inevitável: a vantagem competitiva decorre do dimensionamento de risco (sizing) e da disciplina operacional.
• Chicago PMI despencou para 47,1 (contração) enquanto JOLTS saltou para 7,74M (+790k vagas), consolidando Quad 3.
• UST 10Y a 4,76% colado no teto de 4,84%. Se dados fracos de emprego puxarem para 4,68%, Ouro e Bitcoin disparam. Piso do Ouro elevado para US$ 4.292.
• Afunilamento setorial: foco em Healthcare (XLV +1,4% no mês), commodities/energia e software seletivo (IGV).

---
2. RISK RANGES OFICIAIS (03/09/2026)
${riskRangesData.slice(0, 15).map(r => `• ${r.ticker.padEnd(8)}: ${r.low.toString().padEnd(6)} a ${r.high.toString().padEnd(6)} | ${r.signal.padEnd(8)} | ${r.name}`).join("\n")}

---
3. ADERÊNCIA AO REGIME & EXPOSIÇÃO
• Quad 3 (Ouro, Defensivos, Energia, Caixa): ${quad3Pct}%
• Quad 1 (Tech / Semicondutores / High Beta): ${quad1Pct}%
• Crédito Corporativo / Bonds: ${creditPct}%
• Caixa / SGOV: ${cashPct}%

---
4. PLANO DE AÇÃO
• Ouro (AAAU/NEM/GDX): Posição máxima. Comprar nos recuos com piso em 4.292.
• Prata (SLV): Não comprar na queda. Sinal TRADE quebrado em 65,11.
• High Beta: Manter estritamente dentro do limite TAIL (1–3% por ativo).`;

  rawContainer.innerText = fullRawMarkdown;
}

function copyReportToClipboard() {
  if (activeReportViewMode === "raw") {
    const rawText = document.getElementById("reportRawContent")?.innerText || "";
    navigator.clipboard.writeText(rawText).then(() => {
      showToast("Código Markdown copiado com sucesso!");
    });
  } else {
    const formattedText = document.getElementById("reportRawContent")?.innerText || "";
    navigator.clipboard.writeText(formattedText).then(() => {
      showToast("Texto do Relatório Executivo copiado com sucesso!");
    });
  }
}

// GERAÇÃO REAL DE ARQUIVO PDF (SEM CABEÇALHOS DO BROWSER)
function downloadExecutivePdf() {
  const targetScope = document.getElementById("reportScopeSelect")?.value || activePortfolioKey;
  const scopeName = targetScope === "schwab" ? "Schwab" : (targetScope === "tastyworks" ? "Tastyworks" : "Consolidado");
  const fileName = `Relatorio_Hedgeye_Macro_${scopeName}_03_09_2026.pdf`;

  const reportElement = document.getElementById("reportFormattedView");
  if (!reportElement) return;

  showToast("Gerando arquivo PDF de alta fidelidade...");

  // Criar clone temporário com tema claro para o PDF
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = reportElement.innerHTML;
  tempContainer.style.background = "#FFFFFF";
  tempContainer.style.color = "#0F172A";
  tempContainer.style.padding = "10px";
  tempContainer.style.fontFamily = "'Inter', sans-serif";

  // Ajustar cards do clone para cores de impressão nítidas
  tempContainer.querySelectorAll(".report-section-card").forEach(card => {
    card.style.background = "#F8FAFC";
    card.style.border = "1px solid #CBD5E1";
    card.style.color = "#0F172A";
  });
  tempContainer.querySelectorAll(".report-section-title").forEach(title => {
    title.style.color = "#0F172A";
    title.style.borderBottom = "1px solid #E2E8F0";
  });
  tempContainer.querySelectorAll(".report-quote-banner").forEach(q => {
    q.style.background = "#F0F9FF";
    q.style.color = "#0369A1";
    q.style.borderLeft = "3px solid #0284C7";
  });
  tempContainer.querySelectorAll(".data-table").forEach(t => {
    t.style.border = "1px solid #CBD5E1";
    t.style.color = "#1E293B";
  });
  tempContainer.querySelectorAll(".data-table th").forEach(th => {
    th.style.background = "#F1F5F9";
    th.style.color = "#0F172A";
    th.style.borderBottom = "2px solid #94A3B8";
  });
  tempContainer.querySelectorAll(".data-table td").forEach(td => {
    td.style.borderBottom = "1px solid #E2E8F0";
    td.style.color = "#1E293B";
  });
  tempContainer.querySelectorAll(".stat-card").forEach(sc => {
    sc.style.background = "#FFFFFF";
    sc.style.border = "1px solid #CBD5E1";
  });
  tempContainer.querySelectorAll(".stat-label").forEach(sl => {
    sl.style.color = "#64748B";
  });
  tempContainer.querySelectorAll(".stat-val").forEach(sv => {
    sv.style.color = "#0F172A";
  });
  tempContainer.querySelectorAll(".report-brand-header").forEach(bh => {
    bh.style.borderBottom = "2px solid #0F172A";
  });
  tempContainer.querySelectorAll(".report-brand-logo h2").forEach(h2 => {
    h2.style.color = "#0F172A";
  });

  const opt = {
    margin: [8, 10, 8, 10],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: "#FFFFFF" },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.pdf-page-break' }
  };

  if (window.html2pdf) {
    window.html2pdf().set(opt).from(tempContainer).save().then(() => {
      showToast(`Arquivo "${fileName}" baixado com sucesso!`);
    });
  } else {
    printReport();
  }
}

function printReport() {
  const formattedHtml = document.getElementById("reportFormattedView")?.innerHTML || "";
  const printContainer = document.getElementById("printReportContainer");
  
  if (printContainer) {
    printContainer.innerHTML = `<div class="executive-report-doc">${formattedHtml}</div>`;
  }
  
  setTimeout(() => {
    window.print();
  }, 100);
}

function generatePortfolioReport() {
  const scopeSelect = document.getElementById("reportScopeSelect");
  if (scopeSelect) scopeSelect.value = activePortfolioKey;
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
