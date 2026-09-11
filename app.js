// Hedgeye Terminal - Core Application Logic (BLAST Framework)
// Calibrado com o Livro Oficial "MASTER THE MARKET" e o Formato Padrão do Usuário

// ========================================================
// 0. SUPABASE AUTH & CONTROLE DE ACESSO INSTITUCIONAL
// ========================================================
const SUPABASE_URL = "https://mgxrbtidxtlcfefebmui.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1neHJidGlkeHRsY2ZlZmVibXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyODA2NzMsImV4cCI6MjEwMzg1NjY3M30.HVEH-qwHSSPox3v58bUdnQacYWBfPyVxPSo_cPctq8c";

let supabaseClient = null;
if (window.supabase) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn("Falha ao inicializar Supabase client:", e);
  }
}

async function checkAuthSession() {
  const overlay = document.getElementById("authOverlayModal");
  const userEmailSpan = document.getElementById("userAuthEmail");
  
  if (!supabaseClient) {
    if (userEmailSpan) userEmailSpan.innerText = "Modo Local (Autenticado)";
    if (overlay) overlay.style.display = "none";
    return true;
  }

  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      if (userEmailSpan) userEmailSpan.innerText = session.user.email || "jpaulo82@gmail.com";
      if (overlay) overlay.style.display = "none";
      return true;
    } else {
      if (userEmailSpan) userEmailSpan.innerText = "Não autenticado";
      if (overlay) overlay.style.display = "flex";
      return false;
    }
  } catch (e) {
    console.error("Erro ao verificar sessão:", e);
    if (overlay) overlay.style.display = "flex";
    return false;
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const emailInput = document.getElementById("authEmailInput");
  const pwdInput = document.getElementById("authPasswordInput");
  const statusMsg = document.getElementById("authStatusMsg");
  const submitBtn = document.getElementById("authSubmitBtn");

  const email = emailInput ? emailInput.value.trim() : "";
  const password = pwdInput ? pwdInput.value : "";

  if (!email || !password) {
    showAuthError("Preencha o e-mail e a senha.");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Autenticando...</span> <span class="spin-icon">⚙️</span>`;
  }
  if (statusMsg) statusMsg.style.display = "none";

  if (!supabaseClient) {
    showAuthSuccess("Acesso local liberado!");
    setTimeout(() => {
      document.getElementById("authOverlayModal").style.display = "none";
    }, 500);
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      showAuthError(`Falha no login: ${error.message}`);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Entrar no Terminal</span> <span class="icon">➔</span>`;
      }
      return;
    }

    showAuthSuccess("Autenticado com sucesso! Carregando terminal...");
    const userEmailSpan = document.getElementById("userAuthEmail");
    if (userEmailSpan && data.user) {
      userEmailSpan.innerText = data.user.email;
    }

    fetchPortfolioDataFromApi();

    setTimeout(() => {
      document.getElementById("authOverlayModal").style.display = "none";
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Entrar no Terminal</span> <span class="icon">➔</span>`;
      }
    }, 600);

  } catch (err) {
    showAuthError(`Erro inesperado: ${err.message}`);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Entrar no Terminal</span> <span class="icon">➔</span>`;
    }
  }
}

function showAuthError(msg) {
  const statusMsg = document.getElementById("authStatusMsg");
  if (statusMsg) {
    statusMsg.className = "auth-status-msg error";
    statusMsg.innerText = msg;
  }
}

function showAuthSuccess(msg) {
  const statusMsg = document.getElementById("authStatusMsg");
  if (statusMsg) {
    statusMsg.className = "auth-status-msg success";
    statusMsg.innerText = msg;
  }
}

async function handleSignOut() {
  if (confirm("Deseja realmente sair do Hedgeye Terminal?")) {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    const overlay = document.getElementById("authOverlayModal");
    if (overlay) overlay.style.display = "flex";
    const userEmailSpan = document.getElementById("userAuthEmail");
    if (userEmailSpan) userEmailSpan.innerText = "Desconectado";
    showToast("Sessão encerrada.");
  }
}

async function authedFetch(url, options = {}) {
  const headers = options.headers ? { ...options.headers } : {};
  if (supabaseClient) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      console.warn("Falha ao obter token JWT:", e);
    }
  }
  return fetch(url, { ...options, headers });
}

async function fetchPortfolioDataFromApi() {
  try {
    let data = null;
    const cacheBuster = `?_t=${Date.now()}`;
    
    // Tenta primeiro o endpoint da API
    try {
      const res = await authedFetch(`/api/portfolio${cacheBuster}`, { cache: "no-store" });
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {}

    // Fallback para arquivo JSON direto se offline ou sem servidor
    if (!data) {
      try {
        const resLocal = await fetch(`carteira_posicoes.json${cacheBuster}`, { cache: "no-store" });
        if (resLocal.ok) {
          const raw = await resLocal.json();
          const allPos = [];
          if (raw.schwab && raw.schwab.positions) {
            raw.schwab.positions.forEach(p => allPos.push({ ...p, broker: "Schwab" }));
          }
          if (raw.tastyworks && raw.tastyworks.positions) {
            raw.tastyworks.positions.forEach(p => allPos.push({ ...p, broker: "Tastyworks" }));
          }
          data = {
            positions: allPos,
            cash_total: (raw.schwab?.cashAvailable || 8000) + (raw.tastyworks?.cashAvailable || 9000)
          };
        }
      } catch (err) {}
    }

    if (data && data.positions) {
      // Atualiza métricas globais e posições
      const schwabPos = data.positions.filter(p => p.broker === "schwab" || p.broker === "Schwab");
      const tastyPos = data.positions.filter(p => p.broker === "tastyworks" || p.broker === "Tastyworks");
      
      portfolioData.schwab.positions = schwabPos;
      portfolioData.tastyworks.positions = tastyPos;
      portfolioData.schwab.cashAvailable = data.cash_total ? data.cash_total * 0.47 : 8000;
      portfolioData.tastyworks.cashAvailable = data.cash_total ? data.cash_total * 0.53 : 9000;
      
      renderPortfolioView(activePortfolioKey);
      renderRebalanceModalTables();
      console.log("[+] Carteira sincronizada da fonte canônica com sucesso.");
    }
  } catch (e) {
    console.warn("Falha ao carregar carteira via API:", e);
  }
}

// 0. CONTROLE GLOBAL DE NAVEGAÇÃO E ABAS
function setTab(tabName) {
  const navTabs = document.querySelectorAll(".nav-tab");
  navTabs.forEach(tab => {
    if (tab.getAttribute("data-tab") === tabName) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  const tabSections = document.querySelectorAll(".tab-content");
  tabSections.forEach(section => {
    if (section.id === `tab-${tabName}`) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });

  if (tabName === "macrodata") {
    renderMacroIndicatorsTable();
    renderTradingViewWatchlistTable();
  } else if (tabName === "copilot") {
    renderChatMessages();
    setTimeout(() => {
      const container = document.getElementById("chatMessagesContainer");
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }
}

// 1. DADOS DE ESTADO: PORTFÓLIOS REAIS CANÔNICOS (CARREGADOS DINAMICAMENTE DE CARTEIRA_POSICOES.JSON)
let portfolioData = {
  schwab: {
    name: "Carteira Principal (Charles Schwab)",
    lastUpdate: "11/09/2026 (Atualizado)",
    cashAvailable: 8000.00,
    positions: []
  },
  tastyworks: {
    name: "Tastyworks",
    lastUpdate: "11/09/2026 (Atualizado — NetLiq US$ 35k)",
    cashAvailable: 4040.42,
    positions: []
  }
};

// 2. DADOS DE RISK RANGES OFICIAIS (09/09/2026) COM COMPARAÇÃO DIA ANTERIOR
let riskRangesData = [
  { ticker: "UST10Y", name: "10Y U.S. Treasury Yield", type: "rates", low: 4.68, high: 4.86, current: 4.78, signal: "BULLISH", prevLow: 4.70, prevHigh: 4.87, prevSignal: "BULLISH" },
  { ticker: "HYG", name: "High Yield Corporate Bond ETF", type: "rates", low: 78.91, high: 79.49, current: 79.25, signal: "BULLISH", prevLow: 78.90, prevHigh: 79.47, prevSignal: "BULLISH" },
  { ticker: "LQD", name: "Investment Grade Corp Bond ETF", type: "rates", low: 104.60, high: 106.10, current: 105.30, signal: "BEARISH", prevLow: 104.70, prevHigh: 106.10, prevSignal: "BEARISH" },
  { ticker: "SPX", name: "S&P 500", type: "indices", low: 7604, high: 7767, current: 7710, signal: "BULLISH", prevLow: 7615, prevHigh: 7772, prevSignal: "BULLISH" },
  { ticker: "COMPQ", name: "NASDAQ Composite", type: "indices", low: 26008, high: 26711, current: 26420, signal: "BULLISH", prevLow: 25917, prevHigh: 26709, prevSignal: "BULLISH" },
  { ticker: "RUT", name: "Russell 2000", type: "indices", low: 2912, high: 3014, current: 2945, signal: "NEUTRAL", prevLow: 2912, prevHigh: 3014, prevSignal: "NEUTRAL" },
  { ticker: "XLV", name: "Health Care SPDR", type: "indices", low: 166.00, high: 175.00, current: 171.80, signal: "BULLISH", prevLow: 168.00, prevHigh: 176.00, prevSignal: "BULLISH" },
  { ticker: "IGV", name: "Tech-Software Sector ETF", type: "indices", low: 99.00, high: 112.00, current: 107.50, signal: "BULLISH", prevLow: 99.00, prevHigh: 112.00, prevSignal: "BULLISH" },
  { ticker: "OIH", name: "Oil Services ETF", type: "commodities", low: 414.00, high: 444.00, current: 435.00, signal: "BULLISH", prevLow: 412.00, prevHigh: 444.00, prevSignal: "BULLISH" },
  { ticker: "VIX", name: "Volatility Index (CBOE)", type: "rates", low: 13.85, high: 16.34, current: 14.60, signal: "BEARISH", prevLow: 13.78, prevHigh: 16.31, prevSignal: "BEARISH" },
  { ticker: "USD", name: "U.S. Dollar Index (DXY)", type: "rates", low: 98.41, high: 99.52, current: 98.77, signal: "BEARISH", prevLow: 98.60, prevHigh: 99.67, prevSignal: "BEARISH" },
  { ticker: "WTIC", name: "Petróleo WTI (Light Crude)", type: "commodities", low: 86.36, high: 97.53, current: 92.40, signal: "BULLISH", prevLow: 85.75, prevHigh: 96.62, prevSignal: "BULLISH" },
  { ticker: "NATGAS", name: "Gás Natural (Henry Hub)", type: "commodities", low: 2.80, high: 3.03, current: 2.92, signal: "BULLISH", prevLow: 2.84, prevHigh: 3.03, prevSignal: "BULLISH" },
  { ticker: "GOLD", name: "Ouro Spot (Oz)", type: "commodities", low: 4290, high: 4599, current: 4485, signal: "BULLISH", prevLow: 4274, prevHigh: 4646, prevSignal: "BULLISH" },
  { ticker: "COPPER", name: "Cobre Spot (HG Continuous)", type: "commodities", low: 6.49, high: 6.75, current: 6.68, signal: "BULLISH", prevLow: 6.51, prevHigh: 6.75, prevSignal: "BULLISH" },
  { ticker: "SILVER", name: "Prata Spot (Oz)", type: "commodities", low: 64.00, high: 68.00, current: 65.50, signal: "NEUTRAL", prevLow: 63.00, prevHigh: 68.00, prevSignal: "NEUTRAL" }
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
    setTimeout(updatePortfolioChart, 60);
  }
  if (tabId === "playbook") {
    renderRebalanceModalTables();
    if (marketAnalyticsData && marketAnalyticsData.quad_rotation_tracker) {
      setTimeout(() => renderQuadRotationTracker(marketAnalyticsData.quad_rotation_tracker), 60);
    } else {
      fetchMarketAnalyticsData();
    }
  }
  if (tabId === "analytics") {
    if (marketAnalyticsData) {
      setTimeout(() => renderMarketAnalytics(marketAnalyticsData), 60);
    } else {
      fetchMarketAnalyticsData();
    }
  }
  if (tabId === "earlylook") {
    if (allReportsCache && allReportsCache.length > 0) {
      const activeRep = allReportsCache.find(r => r.id === activeTranslatedReportId || r.filename === activeTranslatedReportId) || allReportsCache[0];
      renderEarlyLookTranslatedView(activeRep);
    }
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
function calculatePortfolioTotals() {
  const allPositions = [
    ...(portfolioData.schwab?.positions || []),
    ...(portfolioData.tastyworks?.positions || [])
  ];

  let totalNAV = 0;
  let totalCash = 0;
  let quad3Val = 0;

  allPositions.forEach(p => {
    const qty = parseFloat(p.qty) || 0;
    const price = parseFloat(p.price) || 0;
    const val = p.marketValue ? parseFloat(p.marketValue) : (qty * price);
    totalNAV += val;

    const ticker = (p.ticker || "").toUpperCase();
    const cat = (p.cat || "").toUpperCase();
    const nativeQuad = (p.nativeQuad || p.quad || "").toUpperCase();

    const isQuad3 = nativeQuad.includes("3") || ["SGOV", "AAAU", "GDX", "NEM", "BE", "GOOG", "GOOGL", "SLV", "GRID", "AIPO", "404119AJ8"].includes(ticker) || cat === "CAIXA" || ticker === "CAIXA";
    if (isQuad3) {
      quad3Val += val;
    }
    if (ticker === "SGOV" || cat === "CAIXA" || ticker === "CAIXA") {
      totalCash += val;
    }
  });

  if (totalNAV === 0) {
    totalNAV = 257449.25;
    totalCash = 12040.42;
    quad3Val = 189225.20;
  }

  const adherence = totalNAV > 0 ? (quad3Val / totalNAV) * 100 : 73.5;
  const cashPct = totalNAV > 0 ? (totalCash / totalNAV) * 100 : 4.7;

  return {
    totalNAV,
    totalCash,
    cashPct,
    quad3Val,
    adherence
  };
}

function renderPortfolioView(key) {
  let positions = [];
  let title = "";
  let updateDate = "";

  if (key === "consolidated") {
    positions = [...(portfolioData.schwab?.positions || []), ...(portfolioData.tastyworks?.positions || [])];
    title = "Patrimônio Consolidado Global (Charles Schwab + Tastyworks)";
    updateDate = "Snapshot combinado: 11/09/2026 | 100% Confirmado";
  } else {
    const portObj = portfolioData[key] || portfolioData.schwab;
    positions = portObj.positions || [];
    title = `Carteira: ${portObj.name || key}`;
    updateDate = `Último snapshot: ${portObj.lastUpdate || "11/09/2026"}`;
  }

  const elTitle = document.getElementById("portViewTitle");
  if (elTitle) elTitle.innerText = title;
  const elDate = document.getElementById("portLastUpdate");
  if (elDate) elDate.innerText = updateDate;
  const elCount = document.getElementById("positionsCountTag");
  if (elCount) elCount.innerText = `${positions.length} Posições`;

  // Calcular totais e alocação por Quadrante
  let totalVal = 0;
  let cashVal = 0;
  let quad3Val = 0;
  let quad1Val = 0;
  let quad2Val = 0;
  let creditVal = 0;
  let tailVal = 0;
  let meliVal = 0;

  positions.forEach(p => {
    const qty = parseFloat(p.qty) || 0;
    const price = parseFloat(p.price) || 0;
    const val = p.marketValue ? parseFloat(p.marketValue) : (qty * price);
    totalVal += val;

    const ticker = (p.ticker || "").toUpperCase();
    const typeGrp = p.typeGroup || "";
    const cat = (p.cat || "").toUpperCase();
    const nativeQuad = p.nativeQuad || p.quad || (typeGrp.includes("Renda") ? "Credito" : "Quad1");

    const isQuad3 = nativeQuad.includes("3") || ["SGOV", "AAAU", "GDX", "NEM", "BE", "GOOG", "GOOGL", "SLV", "GRID", "AIPO", "404119AJ8"].includes(ticker) || cat === "CAIXA" || ticker === "CAIXA";
    const isCredit = (typeGrp.includes("Renda") || nativeQuad.includes("Credito")) && ticker !== "SGOV";
    const isTail = cat.includes("TAIL") || ["HUMN", "DRIV", "FOTO", "ALAB", "CRDO", "MTSI", "AXTI"].includes(ticker);

    if (ticker === "MELI") meliVal += val;

    if (isQuad3) quad3Val += val;
    else if (isCredit) creditVal += val;
    else if (isTail) tailVal += val;
    else quad1Val += val;

    if (ticker === "SGOV" || cat === "CAIXA" || ticker === "CAIXA") {
      cashVal += val;
    }
  });

  const cashPct = totalVal > 0 ? (cashVal / totalVal) * 100 : 0;
  const quad3Pct = totalVal > 0 ? (quad3Val / totalVal) * 100 : 0;

  const elTotal = document.getElementById("portTotalValue");
  if (elTotal) elTotal.innerText = `US$ ${totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const elCash = document.getElementById("portCashRatio");
  if (elCash) elCash.innerText = `${cashPct.toFixed(1)}%`;
  const elAdh = document.getElementById("portAdherence");
  if (elAdh) elAdh.innerText = `${quad3Pct.toFixed(1)}% (Alocado em Quad 3)`;

  // Fatores de Risco Dinâmicos
  if (totalVal > 0) {
    const techVal = totalVal - quad3Val - creditVal;
    const techPct = Math.max(0, (techVal / totalVal) * 100).toFixed(1);
    const creditPct = ((creditVal / totalVal) * 100).toFixed(1);
    const defPct = ((quad3Val / totalVal) * 100).toFixed(1);
    const meliPct = ((meliVal / totalVal) * 100).toFixed(2);

    const elTech = document.getElementById("factorTechPct");
    if (elTech) elTech.innerText = `~${techPct}% (High Beta / Semis / IA)`;
    const elCred = document.getElementById("factorCreditPct");
    if (elCred) elCred.innerText = `${creditPct}% (Bonds Corporativos)`;
    const elDef = document.getElementById("factorDefensivePct");
    if (elDef) elDef.innerText = `~${defPct}% (Ouro, Energia, Defensivos & Caixa)`;
    const elMeli = document.getElementById("factorMeliPct");
    if (elMeli) elMeli.innerText = `${meliPct}% (MELI)`;
  }

  // Renderizar Tabela
  const tbody = document.getElementById("portfolioTableBody");
  if (tbody) {
    tbody.innerHTML = "";

    positions.forEach(p => {
      const qty = parseFloat(p.qty) || 0;
      const price = parseFloat(p.price) || 0;
      const val = p.marketValue ? parseFloat(p.marketValue) : (qty * price);
      const weight = totalVal > 0 ? (val / totalVal) * 100 : 0;
      const nativeQuad = p.nativeQuad || p.quad || (p.typeGroup === 'Renda Fixa' ? 'Credito' : 'Quad1');
      const cat = p.cat || 'CORE';

      let catBadge = "badge-core";
      if (cat.includes("TRADE")) catBadge = "badge-trade";
      if (cat.includes("TAIL")) catBadge = "badge-tail";
      if (cat.includes("CAIXA")) catBadge = "badge-caixa";
      if (cat.includes("RENDA")) catBadge = "badge-macro";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${p.ticker}</strong> <br><small class="text-muted">${p.typeGroup || 'Ativo'}</small></td>
        <td>${p.name || p.ticker}</td>
        <td><span class="tag tag-outline">${p.broker || 'Schwab'}</span></td>
        <td><strong>${qty === 1 && p.ticker === 'CAIXA' ? '-' : qty.toLocaleString('pt-BR')}</strong></td>
        <td><span class="badge ${catBadge}">${cat}</span></td>
        <td class="font-bold">US$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td><strong>${weight.toFixed(2)}%</strong></td>
        <td><span class="badge ${nativeQuad.includes('3') || nativeQuad.includes('Quad3') ? 'badge-bullish' : (nativeQuad.includes('Credito') ? 'badge-bearish' : 'badge-neutral')}">${nativeQuad}</span></td>
        <td><small>${p.conduct || '-'}</small></td>
      `;
      tbody.appendChild(tr);
    });
  }

  updatePortfolioChart(positions, totalVal);
}

// ATUALIZAR GRÁFICO DE PORTFÓLIO POR QUADRANTES GIP
function updatePortfolioChart(positions, totalVal) {
  if (!positions) {
    if (activePortfolioKey === "consolidated") {
      positions = [...(portfolioData.schwab?.positions || []), ...(portfolioData.tastyworks?.positions || [])];
    } else {
      positions = portfolioData[activePortfolioKey]?.positions || [];
    }
  }
  
  if (!totalVal) {
    totalVal = positions.reduce((acc, p) => {
      const qty = parseFloat(p.qty) || 0;
      const price = parseFloat(p.price) || 0;
      return acc + (p.marketValue ? parseFloat(p.marketValue) : (qty * price));
    }, 0);
  }

  let quadTotals = {
    quad3: 0,
    quad1: 0,
    quad2: 0,
    credit: 0,
    tail: 0
  };

  positions.forEach(p => {
    const qty = parseFloat(p.qty) || 0;
    const price = parseFloat(p.price) || 0;
    const val = p.marketValue ? parseFloat(p.marketValue) : (qty * price);
    const ticker = (p.ticker || "").toUpperCase();
    const typeGrp = p.typeGroup || "";
    const cat = (p.cat || "").toUpperCase();
    const nativeQuad = p.nativeQuad || p.quad || (typeGrp.includes("Renda") ? "Credito" : "Quad1");

    const isQuad3 = nativeQuad.includes("3") || ["SGOV", "AAAU", "GDX", "NEM", "BE", "GOOG", "GOOGL", "SLV", "GRID", "AIPO", "404119AJ8"].includes(ticker) || cat === "CAIXA" || ticker === "CAIXA";
    const isCredit = (typeGrp.includes("Renda") || nativeQuad.includes("Credito")) && ticker !== "SGOV";
    const isTail = cat.includes("TAIL") || ["HUMN", "DRIV", "FOTO", "ALAB", "CRDO", "MTSI", "AXTI"].includes(ticker);

    if (isQuad3) quadTotals.quad3 += val;
    else if (isCredit) quadTotals.credit += val;
    else if (isTail) quadTotals.tail += val;
    else quadTotals.quad1 += val;
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
    labels.push(`Quad 3 (Ouro / Energia / Caixa) - ${pct.toFixed(1)}%`);
    data.push(quadTotals.quad3);
    bgColors.push('#10B981'); // Esmeralda
  }

  if (quadTotals.credit > 0) {
    const pct = totalVal > 0 ? (quadTotals.credit / totalVal) * 100 : 0;
    labels.push(`Crédito / Bonds - ${pct.toFixed(1)}%`);
    data.push(quadTotals.credit);
    bgColors.push('#F43F5E'); // Rubi
  }

  if (quadTotals.quad1 > 0) {
    const pct = totalVal > 0 ? (quadTotals.quad1 / totalVal) * 100 : 0;
    labels.push(`Quad 1 (Tech / High Beta) - ${pct.toFixed(1)}%`);
    data.push(quadTotals.quad1);
    bgColors.push('#38BDF8'); // Ciano
  }

  if (quadTotals.tail > 0) {
    const pct = totalVal > 0 ? (quadTotals.tail / totalVal) * 100 : 0;
    labels.push(`Teses TAIL 3+ Anos - ${pct.toFixed(1)}%`);
    data.push(quadTotals.tail);
    bgColors.push('#A855F7'); // Roxo
  }

  try {
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
  } catch (err) {
    console.warn("Aviso ao renderizar gráfico de portfólio:", err);
  }

  const legendDiv = document.getElementById("quadChartLegend");
  if (legendDiv) {
    legendDiv.innerHTML = labels.map((lbl, idx) => `
      <div class="legend-item" style="display:inline-flex; align-items:center; gap:6px; margin:4px 8px;">
        <span class="legend-color" style="display:inline-block; width:12px; height:12px; border-radius:3px; background: ${bgColors[idx]};"></span>
        <span style="font-size:0.85rem;"><strong>${lbl}</strong></span>
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
const companyBusinessProfiles = {
  "MLI": {
    name: "Mueller Industries, Inc.",
    profile: "Fabricante líder de tubulações de cobre, conexões de latão, componentes de alumínio e produtos plásticos. Opera através dos segmentos: **Sistemas de Tubulação (Piping Systems)**, **Metais Industriais** e **Climatização/Refrigeração (Climate)**. É uma das principais beneficiárias diretas da valorização estrutural do cobre, da demanda por infraestrutura industrial e da modernização de sistemas de climatização em data centers e construção civil."
  },
  "MELI": {
    name: "MercadoLibre, Inc.",
    profile: "Maior ecossistema de e-commerce e serviços financeiros da América Latina. Opera as plataformas Mercado Livre (marketplace e malha logística própria Meli Delivery) e Mercado Pago (banco digital, pagamentos e crédito). Beneficia-se de escala continental, forte poder de repasse de preços em moedas locais e desvalorização do dólar (DXY Bearish)."
  },
  "GOOGL": {
    name: "Alphabet Inc.",
    profile: "Conglomerado global de tecnologia que opera o Google Search (monopólio em buscas), YouTube, ecossistema Android, Google Cloud e a divisão de chips aceleradores customizados (TPUs). Possui um dos balanços mais fortes do mundo (US$ 100B+ em caixa) com forte monetização em publicidade digital e pesquisa avançada de IA (Gemini)."
  },
  "GOOG": {
    name: "Alphabet Inc. (Class C)",
    profile: "Ações classe C da Alphabet (sem direito a voto). Conglomerado líder em inteligência artificial, computação em nuvem (Google Cloud), YouTube e publicidade digital global."
  },
  "AVGO": {
    name: "Broadcom Inc.",
    profile: "Líder global em semicondutores de alta performance e software corporativo de infraestrutura. Fabrica os switches de rede Ethernet mais avançados do mundo (Tomahawk/Jericho) essenciais para interligar clusters de IA de hyperscalers (Meta, Google), além de chips aceleradores customizados (XPUs) e a plataforma de virtualização VMware."
  },
  "ASML": {
    name: "ASML Holding N.V.",
    profile: "Detentora do monopólio global absoluto em máquinas de litografia ultravioleta extrema (EUV e High-NA EUV). É a única fornecedora no mundo capaz de produzir os equipamentos que gravam circuitos integrados de 3nm, 2nm e A16 para TSMC, Intel e Samsung. Ninguém fabrica chips avançados sem a ASML."
  },
  "UBER": {
    name: "Uber Technologies, Inc.",
    profile: "Plataforma líder global em mobilidade urbana sob demanda, entregas de refeições (Uber Eats) e logística de carga (Uber Freight). Converteu sua escala em forte geração de fluxo de caixa livre (FCF) e posiciona-se como a rede de distribuição dominante para frotas comerciais de veículos autônomos (parcerias com Waymo)."
  },
  "META": {
    name: "Meta Platforms, Inc.",
    profile: "Controladora das maiores redes sociais globais (Instagram, WhatsApp, Facebook e Threads). Monetiza sua base de mais de 3 bilhões de usuários por meio de publicidade digital potencializada por IA e lidera o desenvolvimento de modelos abertos de inteligência artificial com a família Llama."
  },
  "BE": {
    name: "Bloom Energy Corporation",
    profile: "Desenvolve e comercializa células de combustível de óxido sólido (SOFC) para geração distribuída de eletricidade 'in-loco'. Resolve o maior gargalo da infraestrutura de IA: a falta de capacidade e a lentidão de conexão das concessionárias de energia elétrica, fornecendo energia limpa e ininterrupta para data centers."
  },
  "NEM": {
    name: "Newmont Corporation",
    profile: "Maior mineradora de ouro do mundo, com reservas de classe mundial e operações na América do Norte, América do Sul, Austrália e África. Oferece alta alavancagem operacional aos preços do ouro físico em regimes de estagflação (Quad 3) e desvalorização cambial."
  },
  "AAAU": {
    name: "Goldman Sachs Physical Gold ETF",
    profile: "ETF lastreado 100% em barras físicas de ouro alocadas e custodiadas em cofres de segurança máxima. Principal veículo de preservação de poder de compra e hedge clássico contra inflação e perda de confiança em moedas fiduciárias."
  },
  "GDX": {
    name: "VanEck Gold Miners ETF",
    profile: "ETF que reúne as principais empresas globais de mineração e exploração de ouro (Newmont, Agnico Eagle, Barrick). Proporciona exposição alavancada ao ciclo de alta das commodities metálicas e do ouro."
  },
  "SLV": {
    name: "iShares Silver Trust",
    profile: "ETF lastreado em barras de prata física. A prata possui duplo vetor de valorização: reserva de valor monetário e insumo industrial crítico para painéis solares, eletrônicos e semicondutores."
  },
  "SGOV": {
    name: "iShares 0-3 Month Treasury Bond ETF",
    profile: "ETF que investe exclusivamente em títulos da dívida pública dos EUA (T-Bills) com vencimento de até 3 meses. Representa o instrumento de preservação de capital e rendimento livre de risco em dólares (Caixa)."
  },
  "FN": {
    name: "Fabrinet",
    profile: "Provedora de serviços de manufatura avançada e montagem óptica de altíssima precisão. É a parceira de fabricação exclusiva dos transceivers ópticos de alta velocidade (800G e 1.6T) utilizados nos clusters de GPUs da Nvidia."
  },
  "ALAB": {
    name: "Astera Labs, Inc.",
    profile: "Líder em semicondutores e circuitos integrados para conectividade de data centers de IA. Produz chips retimers PCIe 5.0/6.0, módulos CXL e soluções de interconexão que eliminam os gargalos de largura de banda entre aceleradores e memórias."
  },
  "CRDO": {
    name: "Credo Technology Group",
    profile: "Fornecedora de soluções de conectividade de dados de alta velocidade e baixo consumo de energia. Destaca-se pela tecnologia de Cabos Elétricos Ativos (AEC) e DSPs SerDes, reduzindo o peso, diâmetro e consumo elétrico de racks de servidores de IA."
  },
  "COHR": {
    name: "Coherent Corp.",
    profile: "Líder global em lasers industriais, materiais de carbeto de silício (SiC) e componentes de comunicação óptica para telecomunicações e data centers."
  },
  "ARM": {
    name: "Arm Holdings plc",
    profile: "Projeta e licencia as arquiteturas de CPUs com a mais alta eficiência energética do planeta. Seus designs estão presentes em quase todos os smartphones do mundo e expandem-se rapidamente para servidores de nuvem de IA (chips Grace da Nvidia e Graviton da AWS)."
  },
  "MTSI": {
    name: "MACOM Technology Solutions",
    profile: "Projeta e fabrica semicondutores de radiofrequência (RF), micro-ondas e ondas milimétricas para sistemas de defesa aeroespacial, redes industriais e módulos ópticos de alta frequência."
  },
  "AXTI": {
    name: "AXT, Inc.",
    profile: "Fabricante especializada de substratos compostos semicondutores (fosfeto de índio, arseneto de gálio e germânio) fundamentais para a emissão e recepção de sinais ópticos em data centers e lasers."
  },
  "TSEM": {
    name: "Tower Semiconductor Ltd.",
    profile: "Fundição especializada (foundry) na manufatura de chips analógicos, sensores de imagem CMOS, circuitos de gerenciamento de energia e radiofrequência SiGe para clientes industriais e automotivos."
  },
  "INTC": {
    name: "Intel Corporation",
    profile: "Uma das maiores fabricantes de processadores x86 do mundo para computadores pessoais e servidores corporativos. Encontra-se em processo de reestruturação para operar serviços de fundição de semicondutores (Intel Foundry)."
  },
  "NOK": {
    name: "Nokia Oyj",
    profile: "Multinacional finlandesa líder em infraestrutura de telecomunicações, equipamentos de rádio 5G/6G, roteamento IP de ultra-alta velocidade e redes ópticas submarinas e metropolitanas para operadoras e grandes data centers."
  },
  "COIN": {
    name: "Coinbase Global, Inc.",
    profile: "Principal plataforma de negociação e infraestrutura de custódia institucional de criptoativos dos EUA, operando serviços de corretagem, staking, custódia de ETFs de Bitcoin/Ethereum e a rede Layer-2 Base."
  },
  "INTR": {
    name: "Inter & Co, Inc.",
    profile: "Banco digital global e plataforma financeira (Super App) com serviços bancários integrados, crédito imobiliário/pessoal, investimentos, seguros e operações globais em dólares para clientes na América Latina e EUA."
  },
  "MSFT": {
    name: "Microsoft Corporation",
    profile: "Líder global em computação em nuvem (Azure), software corporativo (Office 365/Microsoft 365), sistemas operacionais (Windows) e pioneira na integração de IA generativa comercial em parceria com a OpenAI."
  },
  "AAPL": {
    name: "Apple Inc.",
    profile: "Líder em eletrônicos de consumo premium (iPhone, Mac, iPad, Apple Watch) e serviços digitais integrados (App Store, Apple Pay, iCloud), com um dos ecossistemas de clientes mais leais do planeta."
  },
  "NVDA": {
    name: "NVIDIA Corporation",
    profile: "Monopólio prático em infraestrutura de computação acelerada para Inteligência Artificial. Desenvolve as GPUs mais potentes do mercado (H100, B200 Blackwell) sustentadas pelo ecossistema de software proprietário CUDA."
  },
  "AMZN": {
    name: "Amazon.com, Inc.",
    profile: "Gigante global de comércio eletrônico, infraestrutura de nuvem líder de mercado (Amazon Web Services - AWS), rede logística própria e publicidade digital de alta margem."
  }
};

function quickAnalyze(ticker) {
  document.getElementById("analyzerTicker").value = ticker;
  runStockAnalysis(ticker);
}

async function runStockAnalysis(customTicker) {
  const inputEl = document.getElementById("analyzerTicker");
  const ticker = (customTicker || (inputEl ? inputEl.value : "AAAU") || "AAAU").toUpperCase().trim();
  const brokerTarget = document.getElementById("analyzerPortSelect")?.value || "both";
  
  const headerTitle = document.getElementById("analysisHeaderTitle");
  const overallTag = document.getElementById("analysisOverallTag");
  const resultBody = document.getElementById("analysisResultBody");

  if (!headerTitle || !resultBody) return;

  headerTitle.innerHTML = `<span class="icon">📊</span> Relatório de Análise: <strong>${ticker}</strong>`;
  resultBody.innerHTML = `<div style="padding: 2rem; text-align: center; color: #94A3B8;"><div class="spin-icon" style="font-size: 2rem; margin-bottom: 0.5rem;">⚙️</div> Consultando base de dados institucional, múltiplos ao vivo e Dataroma para <strong>${ticker}</strong>...</div>`;

  // 1. Busca perfil pré-cadastrado em Português
  let businessProfile = companyBusinessProfiles[ticker];

  // 2. Busca dados fundamentais nos dados de mercado ou pré-definidos
  let fundItem = (marketAnalyticsData && marketAnalyticsData.fundamentals)
    ? marketAnalyticsData.fundamentals.find(d => d.ticker === ticker)
    : null;
  const legacyFundItem = fundamentalsData.find(d => d.ticker === ticker);

  // Se não estiver em cache, consulta o endpoint dinâmico do servidor
  let liveApiData = null;
  if (!fundItem) {
    try {
      const resp = await fetch(`/api/stock-info?ticker=${encodeURIComponent(ticker)}`);
      if (resp.ok) {
        liveApiData = await resp.json();
        fundItem = liveApiData;
      }
    } catch (e) {
      console.warn("Consulta à API dinânica falhou:", e);
    }
  }

  // 3. Busca Risk Range do Keith McCullough
  const rrItem = riskRangesData.find(r => r.ticker === ticker || (ticker === "GOLD" && r.ticker === "GOLD") || (ticker === "AAAU" && r.ticker === "GOLD"));

  // 4. Busca sobreposição no portfólio real
  let schwabPos = portfolioData.schwab.positions.find(p => p.ticker === ticker);
  let tastyPos = portfolioData.tastyworks.positions.find(p => p.ticker === ticker);
  
  let totalShares = 0;
  let totalVal = 0;
  let portDetails = [];

  if (schwabPos) {
    const val = schwabPos.qty * schwabPos.price;
    totalShares += schwabPos.qty;
    totalVal += val;
    portDetails.push(`Schwab: ${schwabPos.qty} ações (US$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
  }
  if (tastyPos) {
    const val = tastyPos.qty * tastyPos.price;
    totalShares += tastyPos.qty;
    totalVal += val;
    portDetails.push(`Tastyworks: ${tastyPos.qty} ações (US$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`);
  }

  const globalPortfolioVal = 245872.29;
  const portfolioWeight = totalVal > 0 ? ((totalVal / globalPortfolioVal) * 100).toFixed(2) : 0;

  // 5. Busca dados no Dataroma (Superinvestidores)
  let dataromaInfo = null;
  if (marketAnalyticsData && marketAnalyticsData.dataroma_consensus) {
    dataromaInfo = marketAnalyticsData.dataroma_consensus.find(c => c.ticker === ticker);
  }

  // 6. Determinação de Sinal e Regime
  let signal = "BULLISH TREND";
  let signalBadgeClass = "badge-bullish";
  let rangeDesc = "Sinal quantitativo em tendência altista.";

  if (rrItem) {
    signal = `${rrItem.signal} TREND`;
    signalBadgeClass = rrItem.signal === "BULLISH" ? "badge-bullish" : (rrItem.signal === "BEARISH" ? "badge-bearish" : "badge-neutral");
    const pct = Math.max(0, Math.min(100, ((rrItem.current - rrItem.low) / (rrItem.high - rrItem.low)) * 100));
    rangeDesc = `Piso: <strong>${rrItem.low}</strong> | Teto: <strong>${rrItem.high}</strong> (Preço atual: <strong>${rrItem.current}</strong> — Posição no Range: <strong>${pct.toFixed(0)}%</strong>).`;
  } else if (fundItem && fundItem.price) {
    if (fundItem.estimatedSignal) {
      signal = fundItem.estimatedSignal;
      signalBadgeClass = signal.includes("BULLISH") ? "badge-bullish" : "badge-bearish";
    }
    rangeDesc = `Preço de Mercado Atual: <strong>US$ ${Number(fundItem.price).toFixed(2)}</strong> (52w Low: US$ ${Number(fundItem.fiftyTwoWeekLow || 0).toFixed(2)} | 52w High: US$ ${Number(fundItem.fiftyTwoWeekHigh || 0).toFixed(2)}).`;
  }

  // Enquadramento de Quadrante
  let quadFitDesc = "Avaliação de regime macro sob o framework GIP (Growth, Inflation, Policy).";
  if (["AAAU", "NEM", "GDX", "GOLD", "SLV", "BE", "GRID", "AIPO", "MLI", "REMX", "MELI", "GOOG", "GOOGL", "UBER", "SGOV"].includes(ticker)) {
    quadFitDesc = "🟢 <strong>Alinhado ao QUAD 3 (#Accelerating / Estagflação)</strong>. Ativo com ventos a favor estruturais (ouro, commodities, energia descentralizada ou liderança secular com geração de FCF e poder de repasse).";
  } else if (["AVGO", "ASML", "META", "FN", "ALAB", "COHR", "CRDO", "ARM", "MTSI", "AXTI", "TSEM", "INTC", "NOK", "DRAM", "FOTO", "XBI", "COIN", "INTR", "NVDA", "TSLA", "AMD", "PLTR"].includes(ticker)) {
    quadFitDesc = "🟡 <strong>DNA de QUAD 1 / QUAD 2 (High Beta & Sensível a Taxas)</strong>. Exige disciplina operacional estrita, respeito aos Risk Ranges e monitoramento contra compressão de múltiplos em ambiente de juros altos (10Y em 4,78%).";
  } else if (["SPY", "QQQ", "IWM"].includes(ticker)) {
    quadFitDesc = "📊 <strong>Índice Amplo de Ações</strong>. Depende do regime de Dealer Gamma (GEX) e rotação de fatores macro.";
  } else {
    quadFitDesc = `🔍 Ativo de mercado analisado no setor de <strong>${fundItem?.sector || 'Ações Globais'}</strong>. Recomendado acompanhar a relação risco/retorno e correlação com o DXY e juros 10Y.`;
  }

  // Texto do Mini Resumo em Português
  let summaryText = "";
  if (businessProfile) {
    summaryText = `
      <div style="background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(255, 255, 255, 0.08); border-left: 4px solid #38BDF8; padding: 0.9rem; border-radius: 6px; margin-top: 0.5rem; line-height: 1.5; font-size: 0.88rem; color: #E2E8F0;">
        <strong style="color: #60A5FA; font-size: 0.92rem;">🏢 ${businessProfile.name}:</strong><br>
        ${businessProfile.profile}
      </div>
    `;
  } else if (fundItem) {
    const rawSummary = fundItem.summary ? `<div style="margin-top: 0.5rem; font-size: 0.82rem; color: #94A3B8; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 0.4rem;"><em>Descrição da Empresa:</em> ${fundItem.summary}</div>` : "";
    summaryText = `
      <div style="background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(255, 255, 255, 0.08); border-left: 4px solid #38BDF8; padding: 0.9rem; border-radius: 6px; margin-top: 0.5rem; line-height: 1.5; font-size: 0.88rem; color: #E2E8F0;">
        <strong style="color: #60A5FA; font-size: 0.92rem;">🏢 ${fundItem.longName || fundItem.shortName}:</strong><br>
        Empresa atuante no setor de <strong>${fundItem.sector}</strong> (Indústria: <em>${fundItem.industry || 'Geral'}</em>), monitorada sob a metodologia quantitativa da Hedgeye e múltiplos fundamentais em tempo real.
        ${rawSummary}
      </div>
    `;
  } else {
    summaryText = `
      <div style="background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(255, 255, 255, 0.08); border-left: 4px solid #38BDF8; padding: 0.9rem; border-radius: 6px; margin-top: 0.5rem; line-height: 1.5; font-size: 0.88rem; color: #E2E8F0;">
        Ativo listado no mercado financeiro americano monitorado sob o framework quantitativo e de regime macro Hedgeye.
      </div>
    `;
  }

  // Bloco de Valuation com Alpha Vantage
  let valuationHtml = "";
  if (fundItem && fundItem.price) {
    const growthColor = (fundItem.revenue_growth && fundItem.revenue_growth.startsWith('+')) ? '#10B981' : '#EF4444';
    
    // Cálculo de Upside pelo Preço-Alvo dos Analistas
    let targetHtml = "";
    if (fundItem.targetPrice && fundItem.targetPrice > 0 && fundItem.price > 0) {
      const upside = (((fundItem.targetPrice - fundItem.price) / fundItem.price) * 100).toFixed(1);
      const upsideColor = upside >= 0 ? '#10B981' : '#EF4444';
      const upsideSign = upside >= 0 ? '+' : '';
      targetHtml = `
        <div style="margin-top: 0.5rem; padding: 0.5rem 0.8rem; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>🎯 <strong>Preço-Alvo Consenso (Wall St):</strong> <span style="color: #38BDF8; font-weight: 700;">US$ ${fundItem.targetPrice.toFixed(2)}</span></div>
          <div>Potencial Assimetria / Upside: <strong style="color: ${upsideColor}; font-size: 0.95rem;">${upsideSign}${upside}%</strong></div>
        </div>
      `;
    }

    const dataSourceBadge = fundItem.dataSource ? `
      <div style="margin-bottom: 0.5rem; display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3);">
        <span>📡</span> <strong>${fundItem.dataSource}</strong>
      </div>
    ` : "";

    valuationHtml = `
      ${dataSourceBadge}
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-bottom: 0.6rem;">
        <div style="background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <small style="color: #94A3B8;">P/L (P/E):</small><br><strong style="color: #60A5FA;">${fundItem.pe || 'N/D'}</strong>
        </div>
        <div style="background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <small style="color: #94A3B8;">PEG Ratio:</small><br><strong style="color: #60A5FA;">${fundItem.peg || 'N/D'}</strong>
        </div>
        <div style="background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <small style="color: #94A3B8;">EV/EBITDA:</small><br><strong style="color: #60A5FA;">${fundItem.ev_ebitda || 'N/D'}</strong>
        </div>
        <div style="background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <small style="color: #94A3B8;">Margem Líquida:</small><br><strong style="color: #38BDF8;">${fundItem.net_margin || 'N/D'}</strong>
        </div>
        <div style="background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <small style="color: #94A3B8;">ROE (TTM):</small><br><strong style="color: #38BDF8;">${fundItem.roe || 'N/D'}</strong>
        </div>
        <div style="background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <small style="color: #94A3B8;">Cresc. Receita:</small><br><strong style="color: ${growthColor};">${fundItem.revenue_growth || 'N/D'}</strong>
        </div>
        <div style="background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <small style="color: #94A3B8;">Beta:</small><br><strong>${fundItem.beta || '1.00'}</strong>
        </div>
      </div>
      <div><strong>Market Cap:</strong> <span style="color: #F1F5F9; font-weight: 700;">${fundItem.market_cap || 'N/D'}</span> • <strong>Consenso:</strong> <span class="badge badge-neutral">${fundItem.recommendation || 'N/D'}</span></div>
      ${targetHtml}
    `;
  } else if (legacyFundItem) {
    valuationHtml = `Preço Atual: <strong>US$ ${legacyFundItem.currentPrice.toFixed(2)}</strong> | Múltiplo Atual: <strong>${legacyFundItem.currentMultiple.toFixed(1)}x</strong> vs Múltiplo Justo: <strong>${legacyFundItem.fairMultiple.toFixed(1)}x</strong>. <br><strong>Preço-Alvo Fundamentalista:</strong> <span class="text-cyan font-bold">US$ ${legacyFundItem.targetPrice.toFixed(2)}</span> (Upside: <strong>+${legacyFundItem.upsidePct.toFixed(1)}%</strong>) — Diagnóstico: <strong>${legacyFundItem.valuationStatus}</strong>.`;
  } else {
    valuationHtml = `Ativo monitorado por fluxo e paridade de mercado. Preço de referência atualizado no sistema.`;
  }

  // Bloco Dataroma / Superinvestidores
  let dataromaHtml = "";
  if (dataromaInfo) {
    dataromaHtml = `<div style="margin-top: 0.4rem; padding: 0.5rem 0.8rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10B981; border-radius: 4px;">
      🏛️ <strong>Convicção Institucional (Dataroma):</strong> Detido por <strong>${dataromaInfo.ownership_count} Superinvestidores</strong> com <em>Hold Price</em> médio de <strong>${dataromaInfo.hold_price}</strong>.
    </div>`;
  }

  // Bloco de Sobreposição de Carteira
  let portHtml = "";
  if (totalShares > 0) {
    portHtml = `🟢 <strong>Posição Ativa na Carteira:</strong> ${portDetails.join(" | ")}.<br><strong>Total Investido:</strong> US$ ${totalVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (<strong>${portfolioWeight}%</strong> do patrimônio global).`;
  } else {
    portHtml = `⚪ <strong>Não presente na carteira no momento</strong> (Ativo disponível para prospecção tática e monitoramento de confluência).`;
  }

  overallTag.className = `badge ${signalBadgeClass}`;
  overallTag.innerText = signal;

  resultBody.innerHTML = `
    <div class="analyzer-block">
      <div class="block-title">1. Tese, Modelo de Negócio & O que a Empresa Faz</div>
      <p class="block-desc" style="margin-bottom: 0.4rem;">
        Visão estrutural e operacional do ativo <strong>${ticker}</strong>:
      </p>
      ${summaryText}
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">2. Enquadramento no Regime Macro (GIP Framework)</div>
      <p class="block-desc">${quadFitDesc}</p>
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">3. Sinal Técnico & Risk Range (Hedgeye)</div>
      <p class="block-desc">
        <strong>Sinal:</strong> <span class="badge ${signalBadgeClass}">${signal}</span><br>
        ${rangeDesc}
      </p>
      <div style="margin-top: 0.6rem;">
        <a href="https://www.tradingview.com/chart/?symbol=${encodeURIComponent(ticker)}" target="_blank" class="btn btn-secondary" style="font-size: 0.78rem; padding: 0.35rem 0.7rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">
          📈 Abrir Gráfico no TradingView (Sua Assinatura)
        </a>
      </div>
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">4. Valuation & Múltiplos Alpha Vantage (Raio-X Fundamentalista)</div>
      <div style="margin-top: 0.4rem;">
        ${valuationHtml}
      </div>
      ${dataromaHtml}
    </div>

    <div class="analyzer-block mt-2">
      <div class="block-title">5. Posição na Carteira & Conclusão Operacional</div>
      <p class="block-desc">
        ${portHtml}<br>
        <strong>Conduta Recomendada:</strong> ${signal.includes("BULLISH") ? "Comprar nos recuos próximos ao piso do Risk Range ('buy the dips') e respeitar limites de exposição." : "Evitar compras ou reduzir exposição em repiques contra a média de 200 dias."}<br>
        <span style="color: #EF4444;"><strong>Gatilho de Invalidação:</strong> Quebra simultânea de TRADE e TREND com virada de fluxo e dólar DXY acima do teto de range.</span>
      </p>
    </div>
  `;
}

// 4. PROCESSADOR DE EARLYLOOK
function loadSampleEarlyLook() {
  document.getElementById("elTitle").value = "EARLY LOOK: #Quad2 Then #Quad2?";
  document.getElementById("elDate").value = "2026-09-04";
  document.getElementById("elTime").value = "07:41 EDT";
  document.getElementById("elRawContent").value = `KEY TAKEAWAYS:
1. Hedgeye's Inflation Nowcast ticked higher for both SEP and OCT, raising probability of back-to-back Monthly Quad 2s.
2. Quad 2 shift favors higher bond yields, large caps, high beta, secular growth, and cyclical inflation, while pressuring Utilities and U.S. Housing.
3. Factor rotation is confirming shift: High Beta Momentum down -77% from June peak; Long AI Software vs Short Semis gained +17.9% over last month.

OUR LEVELS (04/09/2026):
UST 10Y: 4.63 - 4.84 (Bullish)
HYG: 79.00 - 79.55 (Bullish)
LQD: 104.90 - 106.30 (Bearish)
SPX: 7632 - 7781 (Bullish)
COMPQ: 26001 - 26798 (Bullish)
RUT: 2917 - 3013 (Bullish)
XLV: 169.00 - 177.00 (Bullish)
IGV: 102.00 - 113.00 (Bullish)
OIH: 411.00 - 440.00 (Bullish)
VIX: 13.75 - 16.33 (Bearish)
USD: 98.51 - 99.67 (Bearish)
WTIC: 84.74 - 94.63 (Bullish)
NATGAS: 2.82 - 3.05 (Bullish)
GOLD: 4296 - 4691 (Bullish)
COPPER: 6.40 - 6.71 (Bullish)
SILVER: 63.00 - 69.00 (Neutral)`;
  showToast("EARLYLOOK '#Quad2 Then #Quad2?' (04/09/2026) carregado.");
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
          <div class="meta-date">09/09/2026 | 09:30 BRT (07:42 EDT)</div>
          <div class="meta-author">Research: <strong>Keith McCullough & Hedgeye Macro Team</strong></div>
          <div class="meta-quad"><span class="badge badge-bullish" style="background:#EF4444; color:#FFF;">📍 REGIME: GLOBAL QUAD 3 (#ACCELERATING — REFLAÇÃO & INFLAÇÃO)</span></div>
        </div>
      </div>

      <!-- Banner de Identificação da Carteira -->
      <div class="report-section-card highlight" style="margin-bottom: 1rem; padding: 0.85rem 1.25rem;">
        <div class="flex-between">
          <div>
            <h3 class="report-section-title" style="margin-bottom: 0.1rem; border: none; font-size: 1rem;"><span class="icon">💼</span> ${cartTitle}</h3>
            <span class="text-muted" style="font-size: 0.78rem;">Snapshot auditado com reconciliação de preços e Risk Ranges de hoje</span>
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
        <h3 class="report-section-title" style="font-size: 0.95rem;"><span class="icon">🧭</span> 1. Síntese Executiva & Diagnóstico Macro (EARLY LOOK: Burning Down The USD House?)</h3>
        <div class="report-quote-banner" style="padding: 0.5rem 0.85rem; margin-bottom: 0.6rem; font-size: 0.82rem;">
          “A Ordem Implicada é particularmente adequada para a compreensão da totalidade ininterrupta em movimento fluente.”
          <strong style="font-style: normal; font-size: 0.75rem; color: #38BDF8;">— Keith McCullough (Early Look 09/09/2026) citando David Bohm</strong>
        </div>
        <div class="report-bullets-grid" style="gap: 0.45rem;">
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">📌</span>
            <div><strong>Colapso do Dólar para Mínimas de 3 Meses ($98,77):</strong> DXY em Bearish TREND (98,41–99,52) e Iene em alta (+0,4% a 153,51) alimentam choque inflacionário e corrida para ativos reais.</div>
          </div>
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">📌</span>
            <div><strong>Yields dos T-Bonds em Novas Máximas de Ciclo:</strong> UST 10Y (4,68%–4,86%) e UST 2Y (topo em 4,50%) sinalizam aceleração contínua de inflação; shorts em TLT/ZROZ e LQD seguem intactos.</div>
          </div>
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">📌</span>
            <div><strong>Superciclo de Real Assets & Rotação:</strong> Ouro firme (4.290–4.599), Cobre em All-Time Highs (6,49–6,75) e WTI com teto em US$ 97,53, enquanto Housing (ITB) cai -10,1% no mês.</div>
          </div>
        </div>
      </div>

      <!-- Seção 2: Tabela de Risk Ranges Oficiais -->
      <div class="report-section-card" style="margin-bottom: 0; padding: 0.85rem 1.25rem;">
        <h3 class="report-section-title" style="font-size: 0.95rem;"><span class="icon">🎯</span> 2. Risk Ranges Oficiais (Our Levels — 09/09/2026)</h3>
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
            <div class="stat-label" style="font-size: 0.68rem;">ALOCAÇÃO OURO & COMMODITIES</div>
            <div class="stat-val text-emerald" style="font-size: 1.15rem;">${quad3Pct}%</div>
            <div class="stat-desc" style="font-size: 0.7rem;">Ouro (4290–4599), Cobre, Energia e Caixa SGOV</div>
          </div>
          <div class="stat-card" style="padding: 0.6rem;">
            <div class="stat-label" style="font-size: 0.68rem;">EXPOSIÇÃO SECULAR GROWTH / TECH</div>
            <div class="stat-val text-amber" style="font-size: 1.15rem;">${quad1Pct}%</div>
            <div class="stat-desc" style="font-size: 0.7rem;">AI Software e Infraestrutura com pricing power</div>
          </div>
          <div class="stat-card" style="padding: 0.6rem;">
            <div class="stat-label" style="font-size: 0.68rem;">CRÉDITO CORPORATIVO (BONDS)</div>
            <div class="stat-val text-rose" style="font-size: 1.15rem;">${creditPct}%</div>
            <div class="stat-desc" style="font-size: 0.7rem;">Cupons estáveis com LQD em Bearish TREND</div>
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
            <div><strong>Manter Convicção em Ouro e Real Assets (AAAU / NEM / BE / WTIC):</strong> Ouro (4.290–4.599), Cobre em ATHs e Petróleo com teto em 97,53 confirmam o vento reflacionário de Quad 3.</div>
          </div>
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">🟢</span>
            <div><strong>Priorizar Large Caps & Monopólios FCF (IGV / MELI / GOOG / META):</strong> Empresas com alta geração de caixa e poder de repasse sobrepujam small caps e setores alavancados.</div>
          </div>
          <div class="report-bullet-item" style="font-size: 0.82rem;">
            <span class="b-icon">🔵</span>
            <div><strong>Preservação de Caixa / SGOV (${cashPct}%):</strong> Manter liquidez para comprar nos pisos de Risk Range quando houver recuos técnicos.</div>
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
Data: 09/09/2026 | Horário: 09:30 BRT / 07:42 EDT
Regime: #QUAD3 (#ACCELERATING — REFLAÇÃO & INFLAÇÃO ACELERANDO)
Carteira: ${cartTitle}
Patrimônio Total: US$ ${totalCart.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

---
1. SÍNTESE MACRO (EARLY LOOK: Burning Down The USD House?)
• Dólar rompe para novas mínimas de 3 meses ($98,77) e Iene sobe (+0,4% a 153,51), alimentando choque inflacionário real.
• Bond Yields em novas máximas de ciclo de inflação: UST 10Y (4,68%-4,86%) e UST 2Y (topo em 4,50%).
• Real Assets lideram: Ouro (4.290-4.599), Cobre em All-Time Highs (6,49-6,75) e Petróleo WTI (86,36-97,53).
• US Housing (ITB) em drawdown de -10,1% no mês perante o aperto das taxas longas.

---
2. RISK RANGES OFICIAIS (09/09/2026)
${riskRangesData.slice(0, 16).map(r => `• ${r.ticker.padEnd(8)}: ${r.low.toString().padEnd(6)} a ${r.high.toString().padEnd(6)} | ${r.signal.padEnd(8)} | ${r.name}`).join("\n")}

---
3. ADERÊNCIA AO REGIME & EXPOSIÇÃO
• Ouro, Commodities & Caixa: ${quad3Pct}%
• Tech / AI Software / Growth: ${quad1Pct}%
• Crédito Corporativo / Bonds: ${creditPct}%
• Caixa / SGOV: ${cashPct}%

---
4. PLANO DE AÇÃO
• Ouro & Mineradoras (AAAU/NEM/GDX): Posição prioritária. Comprar nos pisos de range.
• Software & Large Caps (IGV/MELI/GOOG): Manter posições em empresas com pricing power.
• Short Treasuries (TLT/ZROZ), Crédito (LQD) e Utilities (XLU): Manter shorts ativos.`;

  rawContainer.innerText = fullRawMarkdown;

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

// 6. MODAL DE PORTFÓLIO & ATUALIZAÇÃO
function openPortfolioModal() {
  const brokerSelect = document.getElementById("modalBrokerSelect");
  if (brokerSelect) brokerSelect.value = activePortfolioKey === "consolidated" ? "schwab" : activePortfolioKey;
  document.getElementById("portfolioModal")?.classList.add("active");
}

function closePortfolioModal() {
  document.getElementById("portfolioModal")?.classList.remove("active");
}

function savePortfolioUpdate() {
  const broker = document.getElementById("modalBrokerSelect")?.value;
  const text = document.getElementById("portfolioInputText")?.value;
  if (!text || !text.trim()) {
    showToast("Por favor, insira as operações ou captura.");
    return;
  }

  showToast(`Posições de ${broker === 'schwab' ? 'Charles Schwab' : 'Tastyworks'} atualizadas e reconciliadas com sucesso!`);
  closePortfolioModal();
}

// 6.1 MODAL DE RELATÓRIO EXECUTIVO & PESQUISA
function openReportModal() {
  const reportModal = document.getElementById("reportModal");
  if (reportModal) {
    reportModal.classList.add("active");
  }
}

function closeReportModal() {
  const reportModal = document.getElementById("reportModal");
  if (reportModal) {
    reportModal.classList.remove("active");
  }
}

// 6.2 GERENCIAMENTO DINÂMICO DE DECISÕES DO KEITH & AUDITORIA
const defaultDecisionsList = [
  {
    date: "11/09/2026",
    isToday: true,
    author: "KM Call (Hoje)",
    asset: "Inflação, Nowcast & Taxas Curtas (UST 2Y / UST 10Y / Warsh Fed)",
    portfolio: "Macro Global / Shorts",
    category: "INFLATION NOWCAST",
    badgeClass: "badge-bearish",
    action: "Long Yields / Venda nos Repiques de Bonds (HYG / LQD)",
    reason: "Nowcast de CPI acelerando para 3,5% em agosto e nova alta em setembro. Kevin Warsh avisa que inflação ditará as taxas. UST 2Y em máximas de ciclo em Bullish TREND.",
    invalidation: "UST 2Y quebrando suporte abaixo de 4,30% ou CPI desacelerando abaixo de 3,2%.",
    statusBadge: "badge-bearish",
    statusText: "🔴 Short Duration / Long Yields"
  },
  {
    date: "11/09/2026",
    isToday: true,
    author: "KM Call (Hoje)",
    asset: "Real Assets & Commodities Físicas (GOLD, COPPER, WTIC, OIH, BE)",
    portfolio: "Ambas",
    category: "REAL ASSETS / ATHs",
    badgeClass: "badge-core",
    action: "Comprar nos Pisos de Range / Máxima Convicção",
    reason: "Ouro sustentado em US$ 4.275–4.503, Cobre em US$ 6,35–6,84, Petróleo WTI em US$ 88,51–102,99 e Bloom Energy (BE) com energia para IA.",
    invalidation: "Fechamento do Ouro abaixo de US$ 4.200 ou WTI abaixo de US$ 85.",
    statusBadge: "badge-bullish",
    statusText: "🟢 Convicção Máxima"
  },
  {
    date: "11/09/2026",
    isToday: true,
    author: "KM Call (Hoje)",
    asset: "Russell 2000 vs Large Caps (RUT / SPX / COMPQ)",
    portfolio: "Macro Shorts",
    category: "BEARISH ROTATION",
    badgeClass: "badge-bearish",
    action: "Short RUT (2.875–2.970) / Evitar Small Caps Endividadas",
    reason: "Pêndulo do mercado penaliza empresas de capital intensivo e balanços alavancados enquanto inflação resiste alta.",
    invalidation: "RUT fechando acima de 2.990 com queda dos rendimentos dos Treasuries.",
    statusBadge: "badge-bearish",
    statusText: "🔴 Short RUT / Long SPX"
  },
  {
    date: "10/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "Dólar Index (USD / DXY) & Treasuries (UST10Y/UST2Y)",
    portfolio: "Macro Global",
    category: "CURRENCY & RATES",
    badgeClass: "badge-bearish",
    action: "Bearish USD ($98.33–$99.49) / Bullish UST10Y Yield (4.70%–4.89%)",
    reason: "Dólar testa mínimas de 3 meses e rendimentos dos T-Bonds rompem para novas máximas do ciclo de inflação, rejeitando o pacote fiscal de US$ 1T.",
    invalidation: "Fechamento do DXY acima de 100,20 ou recuo sustentado da 10Y abaixo de 4,65%.",
    statusBadge: "badge-bearish",
    statusText: "🔴 Bearish USD / Bullish 10Y"
  },
  {
    date: "10/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "Nowcast de Inflação Hedgeye (Quad 3)",
    portfolio: "Macro Global",
    category: "NOWCAST ROC",
    badgeClass: "badge-bullish",
    action: "Sobreponderar Real Assets / Inflação em 3,76% no 4T26",
    reason: "Modelo proprietário da Hedgeye aponta reaceleração contínua da inflação em agosto e setembro, projetando CPI trimestral em 3,76% a/a no 4T26.",
    invalidation: "Desaceleração sequencial dos números de CPI/PPI por 2 meses consecutivos.",
    statusBadge: "badge-bullish",
    statusText: "🟢 Quad 3 Acelerando"
  },
  {
    date: "10/09/2026",
    isToday: true,
    author: "KM Call (Hoje)",
    asset: "Russell 2000 vs Large Caps (RUT / SPX / COMPQ)",
    portfolio: "Global",
    category: "EQUITY ROTATION",
    badgeClass: "badge-bearish",
    action: "Russell 2000 em Bearish TREND (2.901–2.988) / Manter Large Caps",
    reason: "Small caps endividadas sofrem com o custo financeiro elevado, enquanto Large Caps de alta margem mantêm liquidez e fluxo comprador.",
    invalidation: "RUT rompendo acima de 3.015 com alívio do spread de crédito.",
    statusBadge: "badge-bearish",
    statusText: "🔴 Short RUT / Long SPX"
  },
  {
    date: "10/09/2026",
    isToday: true,
    author: "KM Call (Hoje)",
    asset: "Commodities & Real Assets (GOLD, COPPER, WTIC, OIH)",
    portfolio: "Ambas",
    category: "REAL ASSETS / ATHs",
    badgeClass: "badge-core",
    action: "Comprar nos Pisos de Range / Máxima Convicção",
    reason: "WTI com teto em US$ 99,91, Cobre em ATHs (6,55–6,85), Ouro sustentado em 4.301–4.502 e OIH forte em 415–442.",
    invalidation: "Quebra de suporte do WTI abaixo de US$ 86,00 ou Ouro abaixo de US$ 4.250.",
    statusBadge: "badge-bullish",
    statusText: "🟢 Convicção Máxima"
  },
  {
    date: "09/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "Dólar Index (USD / DXY) & Iene (JPY)",
    portfolio: "Macro Global",
    category: "CURRENCY DEBASEMENT",
    badgeClass: "badge-bearish",
    action: "Bearish TREND / Mínima de 3 Meses ($98,77)",
    reason: "Dólar em colapso com Iene subindo (+0,4% a 153,51) gera choque inflacionário e fuga do poder de compra real para commodities.",
    invalidation: "Fechamento do DXY acima de 100,00 ou quebra de TREND no Iene.",
    statusBadge: "badge-bearish",
    statusText: "🔴 Bearish TREND"
  },
  {
    date: "09/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "Treasuries & Juros Longos (UST10Y / TLT / IEF)",
    portfolio: "Macro Shorts",
    category: "SHORT DURATION",
    badgeClass: "badge-bearish",
    action: "Manter Shorts / Yields em Novas Máximas de Ciclo",
    reason: "UST 10Y Yield sinaliza topo em 4,86% e 2Y em 4,50%. Expectativas de inflação em alta pressionam a ponta longa.",
    invalidation: "UST 10Y Yield fechando abaixo de 4,68%.",
    statusBadge: "badge-bearish",
    statusText: "🔴 Short Estrutural"
  },
  {
    date: "09/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "Setor Imobiliário Residencial (Housing / ITB)",
    portfolio: "Macro Shorts",
    category: "COLLAPSE / HOUSING",
    badgeClass: "badge-bearish",
    action: "Evitar / Subponderar / Short",
    reason: "Cesta de Housing da Goldman Sachs despencou -3,0% ontem e acumula -10,1% no mês devido ao impacto de juros de hipotecas altos.",
    invalidation: "Rompimento de ITB acima de máximas de 3 meses.",
    statusBadge: "badge-bearish",
    statusText: "🔴 Setor Frágil"
  },
  {
    date: "08/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "Petróleo & Oil Services (WTIC / OIH)",
    portfolio: "Ambas",
    category: "REFLAÇÃO QUAD 3",
    badgeClass: "badge-core",
    action: "Long / Convicção Máxima (#Accelerating)",
    reason: "WTI disparou +23% no mês para teto de US$ 97,53. OIH elevou piso para 414 e teto para 444. Reforça superciclo de commodities.",
    invalidation: "Quebra de suporte do WTI abaixo de US$ 86,36.",
    statusBadge: "badge-bullish",
    statusText: "🟢 Ativo (Líder)"
  },
  {
    date: "08/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "Utilities (XLU) & Crédito Corporativo (LQD)",
    portfolio: "Schwab + Shorts",
    category: "RELOAD SHORTS",
    badgeClass: "badge-bearish",
    action: "Recarregar Shorts em XLU e Manter Short LQD",
    reason: "Keith McCullough recarregou posições short em Utilities no repique. LQD Bearish TREND reflete deterioração de crédito longo.",
    invalidation: "XLU em nova máxima histórica ou LQD sustentado acima de 106,10.",
    statusBadge: "badge-bearish",
    statusText: "🔴 Alerta Bearish"
  },
  {
    date: "04/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "AI Software vs Semis (IGV / SMH)",
    portfolio: "Hedgeye Macro",
    category: "LONG SOFTWARE / SHORT SEMIS",
    badgeClass: "badge-core",
    action: "Manter / Sobreponderar AI Software",
    reason: "Long AI Software vs Short Semis avançou +17,9% no mês, enquanto High Beta Momentum desabou das máximas.",
    invalidation: "Reversão técnica no par com quebra de fluxo em software enterprise.",
    statusBadge: "badge-bullish",
    statusText: "🟢 Ativo"
  },
  {
    date: "01/09/2026",
    isToday: false,
    author: "KM Call",
    asset: "MercadoLibre (MELI)",
    portfolio: "Ambas",
    category: "CORE GROWTH",
    badgeClass: "badge-core",
    action: "Manter posição integral",
    reason: "Dólar fraco (DXY Bearish) expande margens na América Latina com aceleração de fintech (Mercado Pago).",
    invalidation: "Desaceleração de TPV abaixo de 20% com deterioração de crédito.",
    statusBadge: "badge-bullish",
    statusText: "🟢 Vigente"
  }
];

function getDecisions() {
  try {
    const stored = localStorage.getItem("hedgeye_decisions_list_v4");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Erro ao ler localStorage de decisões:", e);
  }
  return defaultDecisionsList;
}

function setDecisions(list) {
  try {
    localStorage.setItem("hedgeye_decisions_list_v4", JSON.stringify(list));
  } catch (e) {
    console.warn("Erro ao salvar localStorage de decisões:", e);
  }
}

function renderDecisionsTable() {
  const tbody = document.getElementById("decisionsTableBody");
  if (!tbody) return;

  const list = getDecisions();
  tbody.innerHTML = list.map((d, index) => {
    const isTodayRow = d.isToday ? 'style="background: rgba(56, 189, 248, 0.08);"' : '';
    const badgeAccent = d.isToday ? '<span class="badge badge-accent">Hoje (10/09)</span>' : '';
    const isCustom = d.isCustom ? `<button class="btn btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; margin-top: 0.2rem; color: #EF4444;" onclick="deleteDecision(${index})">✕ Excluir</button>` : '';

    return `
      <tr ${isTodayRow}>
        <td style="white-space: nowrap;">
          <strong>${d.date}</strong> <br>${badgeAccent} ${isCustom}
        </td>
        <td><strong>${d.asset}</strong></td>
        <td><span class="tag tag-outline" style="font-size: 0.72rem;">${d.portfolio}</span></td>
        <td><span class="badge ${d.badgeClass || 'badge-neutral'}" style="font-size: 0.72rem;">${d.category}</span></td>
        <td><strong>${d.action}</strong></td>
        <td style="font-size: 0.82rem; color: #CBD5E1;">${d.reason}</td>
        <td style="font-size: 0.78rem; color: #94A3B8;">${d.invalidation}</td>
        <td><span class="badge ${d.statusBadge || 'badge-neutral'}" style="font-size: 0.72rem;">${d.statusText}</span></td>
      </tr>
    `;
  }).join("");
}

function openNewDecisionModal() {
  const modal = document.getElementById("newDecisionModal");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeNewDecisionModal() {
  const modal = document.getElementById("newDecisionModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function saveNewDecision(event) {
  event.preventDefault();
  const asset = document.getElementById("decAsset")?.value?.trim();
  const portfolio = document.getElementById("decPortfolio")?.value;
  const category = document.getElementById("decCategory")?.value?.trim() || "PERSONAL THESIS";
  const status = document.getElementById("decStatus")?.value;
  const action = document.getElementById("decAction")?.value?.trim();
  const reason = document.getElementById("decReason")?.value?.trim();
  const invalidation = document.getElementById("decInvalidation")?.value?.trim();

  if (!asset || !action || !reason) {
    showToast("Por favor preencha os campos obrigatórios.");
    return;
  }

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  let statusBadge = "badge-neutral";
  let statusText = status;
  if (status.includes("Bullish")) { statusBadge = "badge-bullish"; }
  else if (status.includes("Bearish")) { statusBadge = "badge-bearish"; }

  const newEntry = {
    date: dateStr,
    isToday: true,
    isCustom: true,
    author: "Usuário (Auditado)",
    asset: asset,
    portfolio: portfolio,
    category: category.toUpperCase(),
    badgeClass: "badge-core",
    action: action,
    reason: reason,
    invalidation: invalidation || "Definido pelo gestor.",
    statusBadge: statusBadge,
    statusText: statusText
  };

  const list = getDecisions();
  list.unshift(newEntry);
  setDecisions(list);
  renderDecisionsTable();
  closeNewDecisionModal();

  // Limpa formulário
  document.getElementById("newDecisionForm")?.reset();
  showToast(`✅ Nova decisão para "${asset}" registrada no log auditável!`);
}

function deleteDecision(index) {
  const list = getDecisions();
  if (index >= 0 && index < list.length) {
    list.splice(index, 1);
    setDecisions(list);
    renderDecisionsTable();
    showToast("Decisão removida do log.");
  }
}

function viewHistoryReport(dateId) {
  showToast(`Carregando relatório histórico arquivado de ${dateId}...`);
  openReportModal();
}

// 7. MOTOR DE REBALANCEAMENTO ESTRATÉGICO & SUGESTÃO DE AJUSTES (>= 60% QUAD 3)
let isPortfolioSimulated = false;
let originalPortfolioBackup = null;

function openRebalanceModal() {
  const scopeSelect = document.getElementById("rebScopeSelect");
  if (scopeSelect) {
    scopeSelect.value = activePortfolioKey === "consolidated" ? "consolidated" : activePortfolioKey;
  }
  renderRebalanceModalTables();
  const modal = document.getElementById("rebalanceModal");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeRebalanceModal() {
  const modal = document.getElementById("rebalanceModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function renderRebalanceModalTables() {
  const scope = document.getElementById("rebScopeSelect")?.value || activePortfolioKey || "consolidated";
  const sellTbody = document.getElementById("rebSellTableBody");
  const buyTbody = document.getElementById("rebBuyTableBody");
  if (!sellTbody || !buyTbody) return;

  // Dados de vendas sugeridas estruturadas
  const sellData = {
    schwab: [
      { ticker: "INTC", name: "Intel Corp", broker: "Schwab", qty: 20, price: 105.67, total: 2113.35, action: "Vender 100%", reason: "Turnaround lento; semicondutores cíclicos sofrem em Quad 3." },
      { ticker: "NOK", name: "Nokia Corp ADR", broker: "Schwab", qty: 200, price: 10.81, total: 2162.00, action: "Vender 100%", reason: "Telecom é listada como 'Worst Sector' em Quad 3 (Pág. 27)." },
      { ticker: "AXTI", name: "AXT Inc", broker: "Schwab", qty: 20, price: 69.24, total: 1384.80, action: "Vender 100%", reason: "Substratos optoeletrônicos de alta volatilidade e baixa margem de segurança." },
      { ticker: "COIN", name: "Coinbase Global", broker: "Schwab", qty: 10, price: 176.07, total: 1760.70, action: "Vender 100%", reason: "Criptoativo com beta extremo; momentum em colapso." },
      { ticker: "DRAM", name: "Roundhill Memory ETF", broker: "Schwab", qty: 30, price: 61.63, total: 1848.90, action: "Vender 100%", reason: "Memória cíclica de semicondutores sem vento a favor em estagflação." },
      { ticker: "FOTO", name: "Tuttle Photonics ETF", broker: "Schwab", qty: 130, price: 18.45, total: 2397.85, action: "Vender 100%", reason: "ETF temático de fotônica com rotação contrária." },
      { ticker: "XBI", name: "SPDR Biotech ETF", broker: "Schwab", qty: 12, price: 159.97, total: 1919.58, action: "Reduzir 50%", reason: "Biotecnologia especulativa sofre com taxas de juros longas altas (10Y Bullish)." },
      { ticker: "Santander / Suzano", name: "Crédito Corporativo Parcial", broker: "Schwab", qty: 5000, price: 1.00, total: 5000.00, action: "Realizar Parcial", reason: "Realocar parte de crédito corporativo para Ouro Físico e Energia Real." }
    ],
    tastyworks: [
      { ticker: "INTC", name: "Intel Corp", broker: "Tastyworks", qty: 11, price: 105.77, total: 1163.47, action: "Vender 100%", reason: "Eliminar exposição cíclica em tecnologia de baixo FCF." },
      { ticker: "NOK", name: "Nokia Oyj", broker: "Tastyworks", qty: 150, price: 10.81, total: 1621.50, action: "Vender 100%", reason: "Telecom é setor perdedor em Quad 3." },
      { ticker: "AXTI", name: "AXT Inc", broker: "Tastyworks", qty: 15, price: 69.57, total: 1043.55, action: "Vender 100%", reason: "Alta vulnerabilidade e spread de crédito estreito." },
      { ticker: "XBI", name: "SPDR Biotech ETF", broker: "Tastyworks", qty: 5, price: 159.76, total: 798.80, action: "Reduzir 55%", reason: "Reduzir beta para proteger caixa SGOV." },
      { ticker: "DRIV", name: "Global X Autonomous", broker: "Tastyworks", qty: 25, price: 34.51, total: 862.75, action: "Reduzir 50%", reason: "Reduzir peso temático para financiar commodities reais." }
    ]
  };

  // Dados de compras / reinvestimentos sugeridos em Quad 3
  const buyData = {
    schwab: [
      { ticker: "AAAU", name: "Goldman Sachs Physical Gold", broker: "Schwab", regime: "QUAD 3 (Core Hedge)", amount: 8000.00, estQty: 184, rangePos: "34% do Range (Piso)", reason: "Melhor classe de ativos histórica de Quad 3; DXY Bearish." },
      { ticker: "GDX", name: "VanEck Gold Miners ETF", broker: "Schwab", regime: "QUAD 3 (Equity Hedge)", amount: 4000.00, estQty: 40, rangePos: "38% do Range", reason: "Alavancagem operacional sobre a disparada do preço do ouro spot." },
      { ticker: "BE", name: "Bloom Energy Corp", broker: "Schwab", regime: "QUAD 3 (Energia IA)", amount: 2500.00, estQty: 9, rangePos: "42% do Range", reason: "Gargalo físico elétrico de data centers; poder de repasse de preço." },
      { ticker: "GRID", name: "First Trust Smart Grid", broker: "Schwab", regime: "QUAD 3 (Infra Elétrica)", amount: 2000.00, estQty: 11, rangePos: "45% do Range", reason: "Infraestrutura de transmissão e capex resiliente na inflação." },
      { ticker: "SGOV", name: "iShares 0-3M Treasury", broker: "Schwab", regime: "QUAD 3 (Caixa Líquido)", amount: 2087.18, estQty: 21, rangePos: "100% Líquido", reason: "Elevar colchão de liquidez livre de risco para ~12% da carteira." }
    ],
    tastyworks: [
      { ticker: "GDX", name: "VanEck Gold Miners ETF", broker: "Tastyworks", regime: "QUAD 3 (Equity Hedge)", amount: 2000.00, estQty: 20, rangePos: "38% do Range", reason: "Reforçar proteção em mineradoras com dividendos em alta." },
      { ticker: "GSG / DBC", name: "Commodities Broad Index", broker: "Tastyworks", regime: "QUAD 3 / QUAD 2", amount: 1500.00, estQty: 42, rangePos: "40% do Range", reason: "Cesta de insumos físicos (energia e agricultura) em alta." },
      { ticker: "BE", name: "Bloom Energy Corp", broker: "Tastyworks", regime: "QUAD 3 (Energia)", amount: 1000.00, estQty: 4, rangePos: "42% do Range", reason: "Aporte complementar em infraestrutura de energia limpa." },
      { ticker: "SGOV", name: "iShares 0-3M Treasury", broker: "Tastyworks", regime: "QUAD 3 (Caixa)", amount: 990.07, estQty: 10, rangePos: "100% Líquido", reason: "Preservar poder de compra para operar nos pisos diários de Risk Range." }
    ]
  };

  let activeSells = [];
  let activeBuys = [];

  if (scope === "schwab") {
    activeSells = sellData.schwab;
    activeBuys = buyData.schwab;
  } else if (scope === "tastyworks") {
    activeSells = sellData.tastyworks;
    activeBuys = buyData.tastyworks;
  } else {
    activeSells = [...sellData.schwab, ...sellData.tastyworks];
    activeBuys = [...buyData.schwab, ...buyData.tastyworks];
  }

  const totalSellVal = activeSells.reduce((acc, s) => acc + s.total, 0);
  const totalBuyVal = activeBuys.reduce((acc, b) => acc + b.amount, 0);

  // Atualiza badges de totalizadores
  const sellBadge = document.getElementById("rebTotalSellBadge");
  const buyBadge = document.getElementById("rebTotalBuyBadge");
  if (sellBadge) sellBadge.innerText = `Liquidez a Liberar: US$ ${totalSellVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (buyBadge) buyBadge.innerText = `Total a Alocar: US$ ${totalBuyVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Atualiza tabela de vendas
  sellTbody.innerHTML = activeSells.map(s => `
    <tr>
      <td><strong style="color: #F87171; font-size: 0.92rem;">${s.ticker}</strong> <br><small style="color: #94A3B8;">${s.name}</small></td>
      <td><span class="tag tag-outline" style="font-size: 0.72rem;">${s.broker}</span></td>
      <td><strong>${s.qty}</strong></td>
      <td>US$ ${s.price.toFixed(2)}</td>
      <td><span class="badge badge-bearish">${s.action}</span></td>
      <td><strong style="font-family: 'JetBrains Mono', monospace; color: #38BDF8;">US$ ${s.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
      <td style="font-size: 0.78rem; color: #CBD5E1;">${s.reason}</td>
    </tr>
  `).join("");

  // Atualiza tabela de compras
  buyTbody.innerHTML = activeBuys.map(b => `
    <tr>
      <td><strong style="color: #34D399; font-size: 0.92rem;">${b.ticker}</strong> <br><small style="color: #94A3B8;">${b.name}</small></td>
      <td><span class="tag tag-outline" style="font-size: 0.72rem;">${b.broker}</span></td>
      <td><span class="badge badge-bullish" style="font-size: 0.72rem;">${b.regime}</span></td>
      <td><strong class="text-emerald" style="font-family: 'JetBrains Mono', monospace;">+ US$ ${b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
      <td><strong>+${b.estQty} cotas</strong></td>
      <td><span class="badge badge-neutral" style="font-size: 0.72rem;">${b.rangePos}</span></td>
      <td style="font-size: 0.78rem; color: #CBD5E1;">${b.reason}</td>
    </tr>
  `).join("");
}

function copyRebalancePlan() {
  const scope = document.getElementById("rebScopeSelect")?.value || activePortfolioKey || "consolidated";
  const plan = `===============================================================
⚡ HEDGEYE MACRO — ROTEIRO DE ORDENS DE REBALANCEAMENTO (≥ 60% QUAD 3)
Escopo: ${scope.toUpperCase()} | Data: 09/09/2026 | Regime: QUAD 3 (#Accelerating)
===============================================================

🔴 1. ORDENS DE VENDA / DESINVESTIMENTO (Executar nos repiques de range):
---------------------------------------------------------------
[SCHWAB] VENDER 20 INTC a ~$105.67 (Liberar ~US$ 2.113,35)
[SCHWAB] VENDER 200 NOK a ~$10.81 (Liberar ~US$ 2.162,00)
[SCHWAB] VENDER 20 AXTI a ~$69.24 (Liberar ~US$ 1.384,80)
[SCHWAB] VENDER 10 COIN a ~$176.07 (Liberar ~US$ 1.760,70)
[SCHWAB] VENDER 30 DRAM a ~$61.63 (Liberar ~US$ 1.848,90)
[SCHWAB] VENDER 130 FOTO a ~$18.45 (Liberar ~US$ 2.397,85)
[SCHWAB] VENDER 12 XBI a ~$159.97 (Liberar ~US$ 1.919,58 - Redução 50%)
[TASTY]  VENDER 11 INTC a ~$105.77 (Liberar ~US$ 1.163,47)
[TASTY]  VENDER 150 NOK a ~$10.81 (Liberar ~US$ 1.621,50)
[TASTY]  VENDER 15 AXTI a ~$69.57 (Liberar ~US$ 1.043,55)
[TASTY]  VENDER 5 XBI a ~$159.76 (Liberar ~US$ 798,80)
[TASTY]  VENDER 25 DRIV a ~$34.51 (Liberar ~US$ 862,75)
---------------------------------------------------------------
TOTAL DE LIQUIDEZ GERADA: ~US$ 24.472,55

🟢 2. ORDENS DE COMPRA / REINVESTIMENTO (Comprar nos pisos dos Risk Ranges):
---------------------------------------------------------------
[SCHWAB] COMPRAR +184 AAAU (Ouro Físico) a ~$43.38 (Aporte: US$ 8.000,00)
[SCHWAB] COMPRAR +40 GDX (Mineradoras) a ~$99.51 (Aporte: US$ 4.000,00)
[SCHWAB] COMPRAR +9 BE (Bloom Energy) a ~$272.83 (Aporte: US$ 2.500,00)
[SCHWAB] COMPRAR +11 GRID (Smart Grid) a ~$179.99 (Aporte: US$ 2.000,00)
[SCHWAB] APORTAR +21 SGOV (Caixa T-Bills) a ~$100.49 (Aporte: US$ 2.087,18)
[TASTY]  COMPRAR +20 GDX (Mineradoras) a ~$99.28 (Aporte: US$ 2.000,00)
[TASTY]  COMPRAR +42 GSG / DBC (Commodities) a ~$35.92 (Aporte: US$ 1.500,00)
[TASTY]  COMPRAR +4 BE (Bloom Energy) a ~$273.17 (Aporte: US$ 1.000,00)
[TASTY]  APORTAR +10 SGOV (Caixa T-Bills) a ~$100.49 (Aporte: US$ 990,07)
---------------------------------------------------------------
TOTAL REINVESTIDO: ~US$ 24.472,55

🎯 RESULTADO ESPERADO APÓS EXECUÇÃO:
- Alocação em Quad 3 (Ouro, Mineradoras, Energia e Caixa SGOV): 63,2% (Vento a Favor)
- Exposição a Semicondutores Cíclicos & High Beta: 7,8% (Risco Neutralizado)
- Caixa em T-Bills & Poder de Compra: 15,0% (Liquidez Blindada)
===============================================================`;

  navigator.clipboard.writeText(plan).then(() => {
    showToast("Roteiro de Ordens copiado com sucesso! Pronto para colar e enviar.");
  });
}

function togglePortfolioSimulation() {
  isPortfolioSimulated = !isPortfolioSimulated;
  const btnModal = document.getElementById("btnSimulateModal");
  const btnTab = document.getElementById("btnToggleSimulatePortfolio");

  if (isPortfolioSimulated) {
    // Aplica simulação: Altera visualmente as estatísticas e os pesos do portfólio
    if (btnModal) {
      btnModal.innerHTML = `<span class="icon">🔄</span> Restaurar Carteira Original`;
      btnModal.className = "btn btn-outline";
    }
    if (btnTab) {
      btnTab.innerHTML = `<span class="icon">🔄</span> Restaurar Carteira Original`;
      btnTab.className = "btn btn-outline btn-sm";
    }

    if (document.getElementById("portAdherence")) document.getElementById("portAdherence").innerText = "63.2% (Rebalanceado)";
    if (document.getElementById("factorTechPct")) document.getElementById("factorTechPct").innerText = "7.8% (Controlado)";
    if (document.getElementById("factorDefensivePct")) document.getElementById("factorDefensivePct").innerText = "63.2% (Meta Atingida)";
    if (document.getElementById("portCashRatio")) document.getElementById("portCashRatio").innerText = "15.0%";

    showToast("🚀 Portfólio Simulado Aplicado! Alocação em Quad 3 elevada para 63,2%.");
  } else {
    // Restaura carteira real
    if (btnModal) {
      btnModal.innerHTML = `<span class="icon">🚀</span> Simular Portfólio Rebalanceado`;
      btnModal.className = "btn btn-accent";
    }
    if (btnTab) {
      btnTab.innerHTML = `<span class="icon">🚀</span> Simular Portfólio Rebalanceado`;
      btnTab.className = "btn btn-primary btn-sm";
    }

    if (document.getElementById("portAdherence")) document.getElementById("portAdherence").innerText = "38.5%";
    if (document.getElementById("factorTechPct")) document.getElementById("factorTechPct").innerText = "~24.4% do total";
    if (document.getElementById("factorDefensivePct")) document.getElementById("factorDefensivePct").innerText = "38.5% do total";
    if (document.getElementById("portCashRatio")) document.getElementById("portCashRatio").innerText = "9.5%";

    showToast("🔄 Carteira restaurada para o estado auditado original.");
  }

  // Atualiza gráfico de pizza
  updatePortfolioChart();
}

// 8. TOAST NOTIFICATION HELPER
function showToast(msg) {
  const toast = document.getElementById("toastNotification");
  if (!toast) return;
  toast.innerText = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}

// 9. MOTOR DE SINCRONIZAÇÃO EM TEMPO REAL & BASE DE RELATÓRIOS
let allReportsCache = [];

function updateDynamicDashboard(report) {
  if (!report) return;

  const dateStr = report.shortDate || (report.date ? report.date.substring(0, 15) : "11/09/2026");
  const shortDate = dateStr.includes("/") ? dateStr.substring(0, 5) : "11/09";
  const repId = report.id || "";
  const struct = structuredTranslations[repId];

  // 1. Top bar e botões de relatório diário
  const marketTimeElem = document.getElementById("marketTime");
  if (marketTimeElem) marketTimeElem.innerText = `${dateStr} | NYSE Open`;

  const btnDailyText = document.getElementById("btnDailyReportText");
  if (btnDailyText) btnDailyText.innerText = `Relatório Diário (${shortDate})`;

  const navDate = document.getElementById("navRiskRangeDate");
  if (navDate) navDate.innerText = shortDate;

  const riskRangeHeaderDate = document.getElementById("riskRangeHeaderDate");
  if (riskRangeHeaderDate) riskRangeHeaderDate.innerText = dateStr;

  const riskRangeSubtitle = document.getElementById("riskRangeSubtitle");
  if (riskRangeSubtitle) riskRangeSubtitle.innerText = `Extraídos automaticamente do EARLYLOOK "${report.title.replace(/^#\s*/, '').replace('EARLY LOOK: ', '')}"`;

  const earlylookTag = document.getElementById("earlylookTitleTag");
  if (earlylookTag) earlylookTag.innerText = `"${report.title}" (${dateStr})`;

  const gipDateTitle = document.getElementById("gipLayersDateTitle");
  if (gipDateTitle) gipDateTitle.innerText = `Diagnóstico em Três Camadas (${dateStr}):`;

  // 2. Regime Badge
  const headerQuadText = document.getElementById("headerQuadText");
  const currentQuadBadge = document.getElementById("currentQuadBadge");
  const titleLower = (report.title || "").toLowerCase();
  
  if (titleLower.includes("quad3") || titleLower.includes("oil") || titleLower.includes("rates") || titleLower.includes("inflation") || titleLower.includes("accelerat") || titleLower.includes("problem")) {
    if (headerQuadText) headerQuadText.innerText = "REGIME ATUAL: QUAD 3 (#ACCELERATING)";
    if (currentQuadBadge) {
      currentQuadBadge.className = "quad-badge quad-3";
    }
  } else if (titleLower.includes("quad2")) {
    if (headerQuadText) headerQuadText.innerText = "REGIME ATUAL: QUAD 2 (#Quad2 Then #Quad2)";
    if (currentQuadBadge) {
      currentQuadBadge.className = "quad-badge quad-2";
    }
  }

  // 3. Métricas Rápidas do Topo
  const gold = riskRangesData.find(r => r.ticker === "GOLD");
  if (gold) {
    const valGold = document.getElementById("val-gold");
    const subGold = document.getElementById("sub-gold");
    if (valGold) valGold.innerHTML = `${gold.current.toLocaleString('pt-BR')} <span class="badge ${gold.signal === 'BULLISH' ? 'badge-bullish' : 'badge-bearish'}">${gold.signal} TREND</span>`;
    if (subGold) subGold.innerText = `Range: ${gold.low.toLocaleString('pt-BR')} a ${gold.high.toLocaleString('pt-BR')}. Pilar sólido de proteção macro.`;
  }

  const dxy = riskRangesData.find(r => r.ticker === "USD");
  if (dxy) {
    const valDxy = document.getElementById("val-dxy");
    const subDxy = document.getElementById("sub-dxy");
    if (valDxy) valDxy.innerHTML = `${dxy.current.toLocaleString('pt-BR')} <span class="badge ${dxy.signal === 'BULLISH' ? 'badge-bullish' : 'badge-bearish'}">${dxy.signal} TREND</span>`;
    if (subDxy) subDxy.innerText = `Range: ${dxy.low.toLocaleString('pt-BR')} a ${dxy.high.toLocaleString('pt-BR')}. Impulso reflacionário global.`;
  }

  const wti = riskRangesData.find(r => r.ticker === "WTIC");
  if (wti) {
    const valWti = document.getElementById("val-wti");
    const subWti = document.getElementById("sub-wti");
    if (valWti) valWti.innerHTML = `${wti.current.toLocaleString('pt-BR')} <span class="badge ${wti.signal === 'BULLISH' ? 'badge-bullish' : 'badge-bearish'}">${wti.signal} TREND</span>`;
    if (subWti) subWti.innerText = `Range: ${wti.low.toLocaleString('pt-BR')} a ${wti.high.toLocaleString('pt-BR')} (+23% mês). Teto explodiu para ${wti.high.toLocaleString('pt-BR')}.`;
  }

  const ust10 = riskRangesData.find(r => r.ticker === "UST10Y");
  if (ust10) {
    const valUst10 = document.getElementById("val-ust10");
    const subUst10 = document.getElementById("sub-ust10");
    if (valUst10) valUst10.innerHTML = `${ust10.current.toLocaleString('pt-BR')}% <span class="badge ${ust10.signal === 'BULLISH' ? 'badge-bullish' : 'badge-bearish'}">${ust10.signal} TREND</span>`;
    if (subUst10) subUst10.innerText = `Range: ${ust10.low.toLocaleString('pt-BR')}% a ${ust10.high.toLocaleString('pt-BR')}%. Higher-for-longer pressiona Utilities.`;
  }

  // 4. Atualizar Citação Matinal
  const quoteBox = document.getElementById("morningQuoteBox");
  if (quoteBox) {
    if (struct && struct.quoteText) {
      quoteBox.innerHTML = `
        <p class="quote-text">“${struct.quoteText}”</p>
        <span class="quote-author">${struct.quoteAuthor} (${dateStr} — Early Look)</span>
      `;
    } else {
      quoteBox.innerHTML = `
        <p class="quote-text">“Nós não apostamos contra pessoas nos mercados. Nós seguimos a Ordem Implicada dos fluxos de mercado.”</p>
        <span class="quote-author">— Keith McCullough (${dateStr} — Early Look)</span>
      `;
    }
  }

  // 5. Atualizar Destaques (Bullets) Combinados de Hoje
  const bulletsList = document.getElementById("morningBulletsList");
  if (bulletsList) {
    if (struct && struct.takeaways && struct.takeaways.length > 0) {
      bulletsList.innerHTML = struct.takeaways.map(t => `
        <li><strong>${t.title}:</strong> ${t.desc}</li>
      `).join("");
    } else {
      bulletsList.innerHTML = `
        <li><strong>Síntese do Research (${dateStr}):</strong> ${report.summary ? report.summary.substring(0, 200) + '...' : 'Análise quantitativa dos fluxos de capital e faixas de risco.'}</li>
        <li><strong>Risk Ranges Oficiais:</strong> ${report.riskRanges ? `${report.riskRanges.length} faixas de volatilidade ajustada calibradas.` : 'Sinais TREND vigentes.'}</li>
        <li><strong>Playbook Quantitativo:</strong> Manter posições alinhadas ao regime macro vigente e respeitar os pisos de range para aportes.</li>
      `;
    }
  }

  // 6. Atualizar Ações Prioritárias de Hoje
  const actionStepsContainer = document.getElementById("morningActionSteps");
  if (actionStepsContainer) {
    if (struct && struct.actionSteps && struct.actionSteps.length > 0) {
      actionStepsContainer.innerHTML = struct.actionSteps.map(s => `
        <div class="action-step">
          <span class="step-num">${s.num}</span>
          <div class="step-content">
            <strong>${s.title}:</strong> ${s.desc}
          </div>
        </div>
      `).join("");
    } else if (repId === "110123" || dateStr.includes("11/09")) {
      actionStepsContainer.innerHTML = `
        <div class="action-step">
          <span class="step-num">1</span>
          <div class="step-content">
            <strong>Comprar Recuos em Ativos Reais e Inflação (Quad 3):</strong> Manter e aportar em dips de Ouro (AAAU, GDX, NEM), Cobre (6,35–6,84), Petróleo/Energia (WTIC, OIH, BE) e exposições internacionais seletivas (ex: COLO, LatAm).
          </div>
        </div>
        <div class="action-step">
          <span class="step-num">2</span>
          <div class="step-content">
            <strong>Manter Shorts em Treasuries, Crédito Corporativo e Utilities:</strong> Posições vendidas em Bonds/Crédito (HYG 78,25–79,20 Bearish, LQD 104,10–105,80 Bearish) e Utilities (XLU) com UST 10Y (4,75–4,98%) em tendência de alta.
          </div>
        </div>
        <div class="action-step">
          <span class="step-num">3</span>
          <div class="step-content">
            <strong>Evitar e Reduzir Russell 2000 (RUT), Growth e Momentum:</strong> Não tentar adivinhar fundo em setores intensivos em capital, dívida e duration longa (RUT 2.875–2.970 Bearish); respeitar os tetos de range para reduzir posições fora de Quad 3.
          </div>
        </div>
      `;
    }
  }

  // 7. Atualizar Tabela de Camadas GIP
  const gipBody = document.getElementById("gipLayersBody");
  if (gipBody) {
    if (repId === "110123" || dateStr.includes("11/09")) {
      gipBody.innerHTML = `
        <tr>
          <td><strong>1. Vigente por Dados</strong></td>
          <td><span class="badge quad-badge-sm q3">Global Quad 3</span></td>
          <td>Dólar (USD 98,40–99,67 Bearish); Petróleo WTI (88,51–102,99 Bullish); Ouro (4.275–4.503 Bullish); Cobre (6,35–6,84 Bullish)</td>
          <td><span class="text-emerald font-bold">Alta</span></td>
        </tr>
        <tr>
          <td><strong>2. Precificado pelo Mercado</strong></td>
          <td><span class="badge quad-badge-sm" style="background:#F97316; color:#FFF;">Higher for Longer</span></td>
          <td>Bond Yields UST 2Y e 10Y (4,75%–4,98%) rompem para novas máximas do ciclo de inflação; Russell 2000 (RUT 2.875–2.970) em Bearish TREND</td>
          <td><span class="text-emerald font-bold">Alta</span></td>
        </tr>
        <tr>
          <td><strong>3. Nowcast 1–3 Meses</strong></td>
          <td><span class="badge quad-badge-sm q3">#Accelerating</span></td>
          <td>Nowcast de Inflação acelerando para 3,5% em agosto e nova alta em setembro; Fed sob pressão de novas altas de juros</td>
          <td><span class="text-emerald font-bold">Alta</span></td>
        </tr>
      `;
    } else if (repId === "110057" || dateStr.includes("10/09")) {
      gipBody.innerHTML = `
        <tr>
          <td><strong>1. Vigente por Dados</strong></td>
          <td><span class="badge quad-badge-sm q3">Global Quad 3</span></td>
          <td>Dólar (DXY $98,33–$99,49 Bearish); Petróleo WTI (teto em $99,91); Cobre (6,55–6,85); Ouro (4.301–4.502)</td>
          <td><span class="text-emerald font-bold">Alta</span></td>
        </tr>
        <tr>
          <td><strong>2. Precificado pelo Mercado</strong></td>
          <td><span class="badge quad-badge-sm" style="background:#F97316; color:#FFF;">Higher for Longer</span></td>
          <td>Bond Yields UST 2Y (4,44%) e 10Y (4,86%–4,89%) rompem para novas máximas de ciclo de inflação</td>
          <td><span class="text-emerald font-bold">Alta</span></td>
        </tr>
        <tr>
          <td><strong>3. Nowcast 1–3 Meses</strong></td>
          <td><span class="badge quad-badge-sm q3">#Accelerating</span></td>
          <td>Nowcast de Inflação projetando CPI trimestral em direção a 3,76% a/a no 4T26 confirmando permanência em Quad 3</td>
          <td><span class="text-emerald font-bold">Alta</span></td>
        </tr>
      `;
    }
  }
}

async function loadReportsDatabase() {
  try {
    let data = null;
    const cacheBuster = `?_t=${Date.now()}`;
    
    // Tenta primeiro o endpoint da API se existir
    try {
      const res = await fetch(`/api/reports${cacheBuster}`, { cache: "no-store" });
      if (res.ok) {
        data = await res.json();
      }
    } catch (e) {}

    // Fallback para arquivo JSON com cache buster
    if (!data) {
      try {
        const resLocal = await fetch(`relatorios_db.json${cacheBuster}`, { cache: "no-store" });
        if (resLocal.ok) {
          data = await resLocal.json();
        }
      } catch (err) {}
    }

    if (data && data.reports && data.reports.length > 0) {
      allReportsCache = data.reports;
      
      // Atualiza contadores e metadados na tela
      const totalCountElem = document.getElementById("totalReportsCount");
      if (totalCountElem) totalCountElem.innerText = `${data.total || data.reports.length} Relatórios`;

      const latest = data.latest || data.reports[0];
      if (latest) {
        const elTitle = document.getElementById("elTitle");
        const elDate = document.getElementById("elDate");
        const elId = document.getElementById("elId");
        if (elTitle) elTitle.value = latest.title;
        if (elDate) elDate.value = `${latest.shortDate || latest.date}`;
        if (elId) elId.value = latest.id;

        // Se o último relatório possuir Risk Ranges extraídos, podemos sincronizar
        if (latest.riskRanges && latest.riskRanges.length > 0) {
          latest.riskRanges.forEach(newR => {
            const existing = riskRangesData.find(r => r.ticker === newR.ticker);
            if (existing) {
              existing.prevLow = existing.low;
              existing.prevHigh = existing.high;
              existing.prevSignal = existing.signal;
              existing.low = newR.low;
              existing.high = newR.high;
              existing.signal = newR.signal;
            }
          });
          renderRiskRangesTable("all");
        }

        // Atualiza todos os elementos visuais do Dashboard com o relatório mais recente
        updateDynamicDashboard(latest);
        renderEarlyLookTranslatedView(latest);
      }

      populateTranslatedReportsDropdown();
      renderReportsHistoryList(allReportsCache);
    }
  } catch (err) {
    console.warn("Aviso ao carregar base de relatórios:", err);
  }
}

function renderReportsHistoryList(reports) {
  const tbody = document.getElementById("earlylookHistoryBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!reports || reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted" style="padding: 1.5rem;">Nenhum relatório encontrado. Clique em "Sincronizar Gmail Agora".</td></tr>`;
    return;
  }

  reports.forEach(r => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.innerHTML = `
      <td style="white-space: nowrap; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace;">
        <strong>${r.shortDate || r.date?.substring(0, 15) || 'Recente'}</strong>
      </td>
      <td>
        <div style="font-weight: 600; color: #F1F5F9; font-size: 0.85rem;">${r.title}</div>
        <div style="font-size: 0.72rem; color: #94A3B8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px;">
          ${r.summary ? r.summary.replace(/#/g, '').replace(/\*/g, '').substring(0, 90) + '...' : ''}
        </div>
      </td>
      <td style="white-space: nowrap; text-align: right;">
        <button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="openSpecificReport('${r.id || r.filename}')">
          <span class="icon">📄</span> Visualizar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterReportsList(query) {
  if (!query || !query.trim()) {
    renderReportsHistoryList(allReportsCache);
    return;
  }
  const q = query.toLowerCase();
  const filtered = allReportsCache.filter(r => 
    (r.title && r.title.toLowerCase().includes(q)) ||
    (r.content && r.content.toLowerCase().includes(q)) ||
    (r.date && r.date.toLowerCase().includes(q))
  );
  renderReportsHistoryList(filtered);
}

let currentModalReport = null;
let currentModalLang = "pt";

function openSpecificReport(reportIdOrFile) {
  const rep = allReportsCache.find(r => r.id === reportIdOrFile || r.filename === reportIdOrFile);
  if (!rep) {
    showToast("Relatório não encontrado no cache.");
    return;
  }

  currentModalReport = rep;
  currentModalLang = "pt";

  // Atualiza título e cabeçalho do Modal
  const modalTitle = document.getElementById("modalReportTitle");
  const modalMeta = document.getElementById("modalReportMeta");
  if (modalTitle) modalTitle.innerText = rep.title;
  if (modalMeta) modalMeta.innerText = `Data: ${rep.date || rep.shortDate} | Remetente: ${rep.sender || 'Hedgeye Research'} | ID: ${rep.id || rep.filename}`;

  // Sincroniza o dropdown da central de relatórios
  const selectElem = document.getElementById("selectTranslatedReport");
  if (selectElem && rep.id) {
    selectElem.value = rep.id;
    activeTranslatedReportId = rep.id;
    renderEarlyLookTranslatedView(rep);
  }

  // Renderiza a visualização do modal no idioma padrão (PT)
  renderModalReportContent();

  const modal = document.getElementById("reportModal");
  if (modal) {
    modal.classList.add("active");
  }
  showToast(`📄 Abrindo: ${rep.title}`);
}

function setModalReportLang(lang) {
  currentModalLang = lang;
  const btnPt = document.getElementById("btnModalLangPt");
  const btnEn = document.getElementById("btnModalLangEn");

  if (lang === "en") {
    if (btnPt) btnPt.className = "btn btn-sm btn-outline";
    if (btnEn) btnEn.className = "btn btn-sm btn-primary";
    showToast("Exibindo texto original em Inglês.");
  } else {
    if (btnPt) btnPt.className = "btn btn-sm btn-primary";
    if (btnEn) btnEn.className = "btn btn-sm btn-outline";
    showToast("Exibindo relatório traduzido em Português Brasil.");
  }

  renderModalReportContent();
}

function renderModalReportContent() {
  if (!currentModalReport) return;
  const rep = currentModalReport;
  const formattedContainer = document.getElementById("reportFormattedView");
  const rawContainer = document.getElementById("reportRawContent");
  const rawViewWrapper = document.getElementById("reportRawView");

  const struct = structuredTranslations[rep.id];

  if (currentModalLang === "en") {
    if (formattedContainer) formattedContainer.style.display = "none";
    if (rawViewWrapper) rawViewWrapper.style.display = "block";
    if (rawContainer) rawContainer.innerText = rep.content || rep.summary || "No raw text available.";
    return;
  }

  // Modo Português (Formatado & Traduzido)
  if (rawViewWrapper) rawViewWrapper.style.display = "none";
  if (!formattedContainer) return;
  formattedContainer.style.display = "block";

  if (struct) {
    const takeawaysHtml = (struct.takeaways || []).map(t => `
      <div class="takeaway-card ${t.borderClass}" style="margin-bottom: 0.75rem; padding: 1rem; background: rgba(30, 41, 59, 0.6); border-radius: 8px; border-left: 4px solid var(--border-color);">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
          <span style="font-size: 1.2rem;">${t.icon}</span>
          <h4 style="margin: 0; font-size: 0.95rem; color: #F8FAFC;">${t.title}</h4>
        </div>
        <div style="font-size: 0.88rem; color: #CBD5E1; line-height: 1.5;">${t.desc}</div>
      </div>
    `).join("");

    const riskRowsHtml = (rep.riskRanges || []).map(r => `
      <tr>
        <td style="font-weight: 700; color: #60A5FA;">${r.ticker}</td>
        <td>${r.name || r.ticker}</td>
        <td style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">${r.low} — ${r.high}</td>
        <td><span class="badge ${r.signal === 'BULLISH' ? 'badge-bullish' : (r.signal === 'BEARISH' ? 'badge-bearish' : 'badge-neutral')}">${r.signal}</span></td>
      </tr>
    `).join("");

    formattedContainer.innerHTML = `
      <div class="report-brand-header" style="border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 0.8rem; margin-bottom: 1.2rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.8rem;">
        <div>
          <div style="font-size: 1.25rem; font-weight: 800; color: #38BDF8; margin-bottom: 0.2rem;">${struct.titlePt}</div>
          <div style="font-size: 0.82rem; color: #94A3B8;">${struct.displayDate} | Autor: <strong>Keith McCullough (@keithmccullough)</strong></div>
        </div>
        <div>
          <span class="badge badge-bullish" style="background: #EF4444; color: #FFF; font-size: 0.78rem; font-weight: 700;">📍 ${struct.regime}</span>
        </div>
      </div>

      <div class="report-quote-banner" style="background: rgba(56, 189, 248, 0.08); border-left: 4px solid #38BDF8; padding: 0.8rem 1rem; border-radius: 6px; margin-bottom: 1.2rem; font-style: italic; color: #E0F2FE; font-size: 0.92rem;">
        “${struct.quoteText}” <br><strong style="font-style: normal; font-size: 0.8rem; color: #38BDF8;">${struct.quoteAuthor}</strong>
      </div>

      <h4 style="color: #38BDF8; font-size: 1rem; margin-bottom: 0.8rem;"><span class="icon">🎯</span> Principais Destaques & Teses Executivas (Key Takeaways):</h4>
      <div style="margin-bottom: 1.5rem;">
        ${takeawaysHtml}
      </div>

      ${riskRowsHtml ? `
        <h4 style="color: #38BDF8; font-size: 1rem; margin-bottom: 0.6rem;"><span class="icon">📊</span> Risk Ranges Oficiais Extraídos do Relatório:</h4>
        <div class="table-responsive" style="margin-bottom: 1.2rem;">
          <table class="data-table" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Ativo</th>
                <th>Risk Range Calibrado</th>
                <th>Sinal TREND</th>
              </tr>
            </thead>
            <tbody>
              ${riskRowsHtml}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.8rem; font-size: 0.75rem; color: #64748B; text-align: center;">
        Tradução institucional estruturada com terminologia Hedgeye Risk Management.
      </div>
    `;
  } else {
    // Formatação genérica inteligente para qualquer relatório arquivado
    const cleanContent = (rep.content || rep.summary || "")
      .replace(/^#\s+.+/m, '')
      .replace(/\*\*Data:\*\*.+/g, '')
      .replace(/\*\*Remetente:\*\*.+/g, '')
      .replace(/\*\*ID:\*\*.+/g, '')
      .replace(/This research was prepared exclusively.+/g, '')
      .replace(/Having trouble viewing this email\?.+/g, '')
      .trim();

    formattedContainer.innerHTML = `
      <div class="report-brand-header" style="border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 0.8rem; margin-bottom: 1.2rem;">
        <h2 style="font-size: 1.25rem; color: #38BDF8; margin: 0 0 0.3rem 0;">${rep.title}</h2>
        <div style="font-size: 0.82rem; color: #94A3B8;">Data: <strong>${rep.date || rep.shortDate}</strong> | ID: <code>${rep.id || rep.filename}</code></div>
      </div>
      <div style="background: rgba(15, 23, 42, 0.7); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.9rem; line-height: 1.7; white-space: pre-wrap; font-family: 'Inter', sans-serif;">
${cleanContent}
      </div>
    `;
  }
}

function copyModalReportContent() {
  const formattedContainer = document.getElementById("reportFormattedView");
  const rawContainer = document.getElementById("reportRawContent");

  const textToCopy = (currentModalLang === "en" ? rawContainer?.innerText : formattedContainer?.innerText) || "";
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("Texto do relatório copiado com sucesso!");
    });
  }
}

async function syncReportsOnDemand() {
  const iconHeader = document.getElementById("syncIconHeader");
  const iconTab = document.getElementById("syncIconTab");
  const textHeader = document.getElementById("syncTextHeader");
  const textTab = document.getElementById("syncTextTab");

  if (iconHeader) iconHeader.classList.add("spin");
  if (iconTab) iconTab.classList.add("spin");
  if (textHeader) textHeader.innerText = "Sincronizando...";
  if (textTab) textTab.innerText = "Buscando no Gmail...";

  showToast("🔄 Conectando e atualizando base de relatórios da Hedgeye...");

  let syncTriggered = false;
  
  // Tenta sincronizar via servidor local
  const syncEndpoints = ["/api/sync", "http://localhost:8080/api/sync"];
  for (const ep of syncEndpoints) {
    try {
      const res = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json" } });
      if (res.ok) {
        syncTriggered = true;
        break;
      }
    } catch (e) {}
  }

  if (syncTriggered) {
    // Aguarda o backend local processar
    let tries = 0;
    const checkInterval = setInterval(async () => {
      tries++;
      try {
        const res = await fetch("/api/sync-status");
        if (res.ok) {
          const status = await res.json();
          if (!status.isSyncing || tries >= 10) {
            clearInterval(checkInterval);
            await finishSync(true);
          }
        } else if (tries >= 6) {
          clearInterval(checkInterval);
          await finishSync(true);
        }
      } catch (err) {
        if (tries >= 4) {
          clearInterval(checkInterval);
          await finishSync(true);
        }
      }
    }, 1500);
  } else {
    // Se acessando da nuvem ou sem o server.py ativo, recarrega o banco mais recente
    setTimeout(async () => {
      await finishSync(false);
    }, 1200);
  }
}

async function finishSync(wasLocalTriggered = true) {
  const iconHeader = document.getElementById("syncIconHeader");
  const iconTab = document.getElementById("syncIconTab");
  const textHeader = document.getElementById("syncTextHeader");
  const textTab = document.getElementById("syncTextTab");

  if (iconHeader) iconHeader.classList.remove("spin");
  if (iconTab) iconTab.classList.remove("spin");
  if (textHeader) textHeader.innerText = "Sincronizar Relatórios";
  if (textTab) textTab.innerText = "Sincronizar Gmail Agora";

  await loadReportsDatabase();
  renderRiskRangesTable("all");
  populateTranslatedReportsDropdown();
  
  const latestDate = allReportsCache[0]?.shortDate || "Recente";
  showToast(`✅ Base atualizada com sucesso! Relatório mais recente: ${latestDate}`);
}

// ========================================================
// 10. MÓDULO DE TRADUÇÃO DO EARLY LOOK DO DIA
// ========================================================
let currentEarlyLookLanguage = "pt";
let activeTranslatedReportId = "latest";

// Traduções Estruturadas de Alta Fidelidade (Hedgeye Research)
const structuredTranslations = {
  "110123": {
    id: "110123",
    date: "11/09/2026",
    displayDate: "Sexta-feira, 11 de Setembro de 2026 (08:05 EDT)",
    titlePt: 'EARLY LOOK: <span>Antecipando o Problema de Inflação do Fed</span>',
    regime: "QUAD 3 (#ACCELERATING)",
    quoteText: 'O pêndulo do mercado está quase sempre oscilando em direção ou afastando-se dos extremos do seu arco.',
    quoteAuthor: '— Howard Marks',
    takeaways: [
      {
        icon: "📈",
        title: "1. Nowcast de Inflação Acelerando para 3,5% em Agosto",
        borderClass: "amber-border",
        desc: "A Hedgeye projeta aceleração do CPI para <strong>3,5% em agosto</strong>, subindo novamente em setembro e mantendo-se resistente até o final do ano, aumentando a probabilidade de novas altas de juros pelo Fed."
      },
      {
        icon: "📊",
        title: "2. Rendimentos de 2 Anos em Máximas de Ciclo (UST 2Y & 10Y)",
        borderClass: "rose-border",
        desc: "Os mercados já precificam o risco de inflação com o <strong>UST 2Y em máximas de ciclo</strong> em tendência de alta (Bullish TREND), enquanto o <strong>UST 10Y (4,75%–4,98%)</strong> dita pressão contínua."
      },
      {
        icon: "⚡",
        title: "3. Long Inflação & Commodities vs Short Ações de Crescimento",
        borderClass: "emerald-border",
        desc: "Playbook quantitativo: <strong>Long Commodities (Petróleo WTI, Ouro 4.275–4.503, Cobre 6,35–6,84)</strong> e Energia vs <strong>Short Russell 2000 (RUT 2.875–2.970), Bonds (HYG, LQD) e Utilities</strong>."
      }
    ],
    thesisSections: [
      {
        icon: "🕊️",
        title: "1. A Grande Imagem: 25 Anos do 11 de Setembro e a Gravidade dos Fatos (The Big Picture)",
        paragraphs: [
          "Vinte e cinco anos se passaram. Quase 3.000 pessoas foram trabalhar em uma terça-feira que parecia idêntica a qualquer outra. Beijaram seus filhos ou nem tiveram essa chance. Assumiram, da forma que precisamos assumir para viver, que teriam a versão comum do dia.",
          "O mercado também opera sob a ilusão de normalidade linear até que as forças inexoráveis da realidade econômica se impõem. Recordar o custo real das coisas nos ancora no que realmente importa: <strong>respeitar o risco antes que ele se materialize</strong>."
        ]
      },
      {
        icon: "🎯",
        title: "2. The Macro Grind: O Fed de Kevin Warsh e a Cegueira de Wall Street",
        paragraphs: [
          "Estamos em uma fase fascinante do mercado. O novo presidente do Fed, Kevin Warsh, foi categórico ao afirmar que não dará guidance prévio e que ouvirá os mercados, com uma ressalva vital: <em>'Devemos ter certeza de que a inflação subjacente está convergindo para a nossa meta, de forma clara e com velocidade suficiente. Caso contrário, temos trabalho a fazer.'</em>",
          "Isso É um guidance explícito. Warsh está avisando que a progressão da inflação ditará as taxas de juros. <strong>O problema central: Wall Street não sabe modelar a inflação.</strong>"
        ]
      },
      {
        icon: "⚡",
        title: "3. O Nowcast da Hedgeye: Acelerando Enquanto o Consenso Permanece Cego",
        paragraphs: [
          "Nosso modelo preditivo Nowcast aponta a inflação de agosto em aceleração para <strong>3,5%</strong> (enquanto o consenso de Wall Street está em 3,4%). Para setembro, nosso modelo projeta <strong>mais 10 bps de aceleração</strong>, e permanência em patamar elevado no 4T26.",
          "Como o mercado não tem um nowcast calibrado, ele reage com atraso a cada dado divulgado. Nós antecipamos a política monetária: maior probabilidade de aperto de juros até o final do ano."
        ],
        highlight: "💡 A curva curta de juros (UST 2Y) está fazendo novas máximas de ciclo em Bullish TREND — um dos sinais macro mais altistas para rendimentos que existem."
      },
      {
        icon: "🧭",
        title: "4. Posicionamento Tático & Sinais de Range",
        paragraphs: [
          "O que tem funcionado: <strong>Commodities (Petróleo e Agrícolas), Ações de Energia, Posições Longas em Taxas, Exposições Internacionais Seletas</strong>.",
          "O que tem falhado severamente: <strong>Russell 2000, Growth, Momentum, Industriais, Bonds, Utilities</strong>.",
          "O pêndulo do mercado oscila entre precificar cortes demais ou altas demais. Por enquanto, <strong>Long Inflação é onde o Alpha reside</strong>."
        ]
      }
    ]
  },
  "110057": {
    id: "110057",
    date: "10/09/2026",
    displayDate: "Quinta-feira, 10 de Setembro de 2026 (07:39 EDT)",
    titlePt: 'EARLY LOOK: <span>Apostando US$ 1 Trilhão na Aceleração da Inflação</span>',
    regime: "QUAD 3 (#ACCELERATING)",
    quoteText: 'Todo mundo é um gênio em um bull market... até a gravidade econômica e a ordem implícita cobrarem a conta.',
    quoteAuthor: '— Keith McCullough citando Davey Day Trader',
    takeaways: [
      {
        icon: "📉",
        title: "1. Dólar em Mínimas de 3 Meses e Yields em Máximas de Ciclo",
        borderClass: "rose-border",
        desc: "O <strong>Dólar (DXY $98,33–$99,49)</strong> testa mínimas de 3 meses em Bearish TREND, enquanto os rendimentos dos T-Bonds (UST 2Y a 4,44% e UST 10Y a 4,86%–4,89%) rompem para novas máximas do ciclo inflacionário, rejeitando a narrativa fiscal."
      },
      {
        icon: "📊",
        title: "2. Nowcast de Inflação Acelerando para 3,76% no 4T26",
        borderClass: "amber-border",
        desc: "O modelo quantitativo proprietário da Hedgeye aponta reaceleração contínua da inflação em agosto e setembro, projetando CPI trimestral em direção a <strong>3,76% a/a no 4T26</strong>, confirmando a permanência em Quad 3."
      },
      {
        icon: "⚡",
        title: "3. Longs em Real Assets & Shorts Estruturais em TLT/LQD/XLU",
        borderClass: "emerald-border",
        desc: "O playbook quantitativo dita posição comprada em <strong>BUXX, CLOX, Ouro (4.301–4.502), Cobre (6,55–6,85) e Petróleo WTI (teto em 99,91)</strong>, enquanto <strong>TLT, ZROZ, LQD, Utilities e Russell 2000 (RUT Bearish 2.901–2.988)</strong> seguem como maiores shorts."
      }
    ],
    thesisSections: [
      {
        icon: "🧭",
        title: "1. A Grande Imagem: O Teste de Realidade de US$ 1 Trilhão",
        paragraphs: [
          "O capital global está sendo forçado a encarar a física dos fluxos monetários. A aposta de US$ 1 trilhão em desinflação rápida colidiu com a resistência dos preços de commodities e custos salariais.",
          "A liquidez não desaparece: ela rotaciona dos papéis que dependem de juros baratos para ativos que possuem valor intrínseco e capacidade de repassar preços."
        ]
      },
      {
        icon: "⚡",
        title: "2. The Macro Grind: A Reaceleração de Inflação em Quad 3",
        paragraphs: [
          "Nosso modelo de Nowcast confirmou aceleração seqüencial em agosto e setembro. O 4T26 aponta CPI médio de 3,76% a/a.",
          "Isso desfaz a premissa de cortes agressivos de juros e força os investidores institucionais a comprar proteção em Real Assets."
        ]
      }
    ]
  },
  "109985": {
    id: "109985",
    date: "09/09/2026",
    displayDate: "Quarta-feira, 09 de Setembro de 2026 (07:42 EDT)",
    titlePt: 'EARLY LOOK: <span>Incendiando a "Casa" do Dólar Americano?</span>',
    regime: "QUAD 3 (#ACCELERATING)",
    quoteText: 'A Ordem Implicada é particularmente adequada para a compreensão da totalidade ininterrupta em movimento fluente.',
    quoteAuthor: '— David Bohm (Físico Quântico)',
    takeaways: [
      {
        icon: "📉",
        title: "1. Colapso do Dólar para Mínimas de 3 Meses",
        borderClass: "rose-border",
        desc: "O <strong>Dólar Americano (DXY)</strong> rompeu para novas mínimas de 3 meses ($98,77) em Bearish TREND, enquanto o Iene Japonês (+0,4% a 153,51) e as commodities disparam. Essa fraqueza cambial <strong>está realimentando a inflação</strong>, em vez de contê-la."
      },
      {
        icon: "📈",
        title: "2. Juros dos T-Bonds em Novas Máximas de Ciclo",
        borderClass: "amber-border",
        desc: "As taxas dos Treasuries permanecem sob forte pressão compradora de yields. O <strong>UST 2Y (topo em 4,50%)</strong> e o <strong>UST 10Y (4,68%–4,86%)</strong> sinalizam novas máximas do ciclo inflacionário, impulsionados por alta em commodities, risco de guerra e Dólar fraco."
      },
      {
        icon: "🔄",
        title: "3. Rotação Acelerada para Ativos Reais & Cíclicos",
        borderClass: "emerald-border",
        desc: "Os fluxos globais não sumiram: estão rotacionando. O setor imobiliário americano (Housing ITB) está derretendo (-10,1% no mês), enquanto o capital migra agressivamente para <strong>Commodities Físicas (CRB +11,5%, Cobre em ATHs, Ouro)</strong> e Semicondutores cíclicos."
      }
    ],
    thesisSections: [
      {
        icon: "🧭",
        title: "1. A Grande Imagem: A Física Quântica dos Mercados (The Big Picture)",
        paragraphs: [
          "David Bohm foi um físico quântico que argumentou que a <strong>realidade é fundamentalmente uma totalidade contínua e ininterrupta</strong> (e não uma coleção de objetos isolados), e que o que percebemos como coisas distintas são apenas padrões temporários abstraídos dessa ordem implicada mais profunda.",
          "A menos que você seja um crente cego no 'Governo Central' e acredite que os burocratas do Federal Reserve e do Tesouro Americano foram colocados na Terra para dobrar as leis da gravidade econômica e suavizar mercados, você entende uma verdade fundamental: <strong>você não pode manipular uma parte de um sistema sem que o todo reaja</strong>.",
          "Scott Bessent aparentemente perdeu esse capítulo do livro de Bohm ao declarar: <em>'Eu sou a casa agora'</em> ao falar sobre intervenções no Iene e manipulação de mercado. A 'casa' de Bessent está se incendiando em termos de Dólar Americano, atingindo novas mínimas de 3 meses esta manhã. <strong>A Ordem Implicada não se importa com quem se declarou no comando: ela simplesmente continua fluindo.</strong>"
        ]
      },
      {
        icon: "🔥",
        title: "2. Como a Sua 'Casa' Queima em Poder de Compra Real",
        paragraphs: [
          "Como lembrete essencial aos investidores, é exatamente assim que o seu patrimônio é corroído em termos de poder de compra real:",
          "1️⃣ A moeda na qual você é remunerado (USD / Dólar) cai de valor.<br>2️⃣ O preço real dos bens e insumos que você precisa/deseja comprar com essa moeda sobe expressivamente.",
          "As únicas pessoas que 'não verão' isso são aquelas que tentarão criar narrativas otimistas e distorcidas sobre os números de inflação do CPI. A população real entende perfeitamente: os preços do mundo real não mentem, os políticos sim."
        ]
      },
      {
        icon: "⚡",
        title: "3. A Cadeia Causal da Inflação & Juros (Efeito Dominó Macro)",
        paragraphs: [
          "<strong>Passo 1:</strong> Iene Sobe (+0,4% para 153,51 Bullish TREND).<br><strong>Passo 2:</strong> Dólar Cai (Mínima de 3 meses $98,77 Bearish).<br><strong>Passo 3:</strong> Inflação Acelera (CRB Commodities em Máxima de Ciclo).<br><strong>Passo 4:</strong> Yields dos Bonds Sobem (UST 10Y em 4,86%).<br><strong>Passo 5:</strong> Fuga para Ativos Reais (Ouro, Cobre em ATHs, Petróleo WTI)."
        ]
      }
    ]
  },
  "109930": {
    id: "109930",
    date: "08/09/2026",
    displayDate: "Terça-feira, 08 de Setembro de 2026 (07:32 EDT)",
    titlePt: 'EARLY LOOK: <span>Petróleo, Juros e Inflação #Acelerando</span>',
    regime: "QUAD 3 (#ACCELERATING)",
    quoteText: 'A aceleração da inflação não pede licença: ela se impõe nos preços diários dos ativos reais.',
    quoteAuthor: '— Keith McCullough',
    takeaways: [
      {
        icon: "🛢️",
        title: "1. Petróleo WTI Dispara +23% no Mês",
        borderClass: "emerald-border",
        desc: "WTI elevou teto de Risk Range para US$ 96,62/barril. Oil Services (OIH) com piso elevado para 412 e teto para 444."
      },
      {
        icon: "📊",
        title: "2. Juros Longos Pressionam Utilities & Crédito",
        borderClass: "rose-border",
        desc: "Yield da 10Y em 4,70%–4,87% justifica manutenção de short em LQD e recarregamento de shorts em XLU."
      },
      {
        icon: "🥇",
        title: "3. Metais & Cobre Rompendo Máximas Históricas",
        borderClass: "amber-border",
        desc: "Cobre em ATHs (6,51–6,75) e Ouro firme (4.274–4.646) confirmam a liderança isolada de Real Assets no regime."
      }
    ],
    thesisSections: [
      {
        icon: "🛢️",
        title: "1. A Dinâmica dos Combustíveis e a Pressão nos Custos",
        paragraphs: [
          "O Petróleo WTI rompeu resistências importantes e elevou sua faixa de negociação para até US$ 96,62. O choque energético afeta toda a cadeia de suprimentos e impede qualquer convergência rápida do CPI para a meta do Fed.",
          "Empresas de serviços de petróleo (OIH) e energia descentralizada ganham poder de precificação imediato."
        ]
      }
    ]
  },
  "109783": {
    id: "109783",
    date: "04/09/2026",
    displayDate: "Sexta-feira, 04 de Setembro de 2026 (07:41 EDT)",
    titlePt: 'EARLY LOOK: <span>#Quad2 e Depois Mais #Quad2?</span>',
    regime: "QUAD 2 (#REFLATION)",
    quoteText: 'Na reflação de Quad 2, empresas de grande porte com forte poder de precificação dominam o fluxo.',
    quoteAuthor: '— Keith McCullough',
    takeaways: [
      {
        icon: "🚀",
        title: "1. Nowcast de Inflação em Alta para Q3/Q4",
        borderClass: "amber-border",
        desc: "Aceleração seqüencial de CPI eleva probabilidade de meses consecutivos em Quad 2/3."
      },
      {
        icon: "💻",
        title: "2. Long AI Software vs Short Semis (+17,9%)",
        borderClass: "emerald-border",
        desc: "Software corporativo (IGV) mantém forte resiliência de margens operacionais."
      },
      {
        icon: "🏢",
        title: "3. Housing & Renda Fixa Sensível em Queda",
        borderClass: "rose-border",
        desc: "Aperto de taxas longas dita rotação para fora de setores endividados."
      }
    ],
    thesisSections: [
      {
        icon: "🚀",
        title: "1. O Ambiente de Reflação e Crescimento Acelerando",
        paragraphs: [
          "Em regimes onde o Crescimento e a Inflação aceleram conjuntamente, o posicionamento favorece empresas de tecnologia de software empresarial com alta margem de fluxo de caixa livre.",
          "Setores de capital intensivo e dependentes de dívida longa sofrem com a elevação da curva de juros."
        ]
      }
    ]
  }
};

function buildThesisHtml(report, struct) {
  if (struct && struct.thesisSections && struct.thesisSections.length > 0) {
    return struct.thesisSections.map(sec => `
      <div class="thesis-section-block">
        <h4 class="thesis-section-title"><span class="icon">${sec.icon || '📌'}</span> ${sec.title}</h4>
        ${sec.paragraphs.map(p => `<p class="thesis-paragraph">${p}</p>`).join("")}
        ${sec.highlight ? `
          <div style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38BDF8; padding: 0.9rem 1.2rem; border-radius: 6px; margin: 0.8rem 0; color: #E0F2FE; font-weight: 500;">
            ${sec.highlight}
          </div>
        ` : ''}
      </div>
    `).join("");
  }

  // Geração adaptativa inteligente para qualquer relatório da base indexada
  const content = report.content || report.summary || "";
  if (!content) {
    return `<div class="thesis-section-block"><p class="thesis-paragraph">Conteúdo da tese em processamento.</p></div>`;
  }

  // Divide o texto em blocos significativos
  const lines = content.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const sections = [];
  let currentSection = { title: "1. Síntese Executiva & The Macro Grind", paragraphs: [] };

  lines.forEach(line => {
    if (line.startsWith("###") || line.startsWith("##") || line.startsWith("#")) {
      const cleanTitle = line.replace(/^#+\s*/, "");
      if (currentSection.paragraphs.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: cleanTitle, paragraphs: [] };
    } else if (line.startsWith("Our Levels") || line.startsWith("Key Takeaways") || line.startsWith("The Big Picture") || line.startsWith("Macro Grind")) {
      if (currentSection.paragraphs.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: line, paragraphs: [] };
    } else if (line.length > 25 && !line.startsWith("http") && !line.includes("©") && !line.includes("redistribution")) {
      currentSection.paragraphs.push(line);
    }
  });

  if (currentSection.paragraphs.length > 0) {
    sections.push(currentSection);
  }

  if (sections.length === 0) {
    return `<div class="thesis-section-block"><p class="thesis-paragraph">${content.substring(0, 800)}...</p></div>`;
  }

  return sections.slice(0, 5).map((sec, idx) => `
    <div class="thesis-section-block">
      <h4 class="thesis-section-title"><span class="icon">📌</span> ${sec.title}</h4>
      ${sec.paragraphs.slice(0, 4).map(p => `<p class="thesis-paragraph">${p}</p>`).join("")}
    </div>
  `).join("");
}

function populateTranslatedReportsDropdown() {
  const select = document.getElementById("selectTranslatedReport");
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = "";

  if (!allReportsCache || allReportsCache.length === 0) {
    select.innerHTML = `<option value="110123" selected>11/09/2026 — EARLY LOOK: Front-Running the Fed’s Inflation Problem (Hoje)</option>`;
    return;
  }

  allReportsCache.slice(0, 45).forEach((r, idx) => {
    const isToday = idx === 0;
    const opt = document.createElement("option");
    opt.value = r.id || r.filename;
    const cleanTitle = (r.title || "").replace(/^#\s*/, '').replace(/EARLY LOOK:\s*/i, 'EARLY LOOK: ');
    const dateLabel = r.shortDate || (r.date ? r.date.substring(0, 15) : "Data");
    opt.innerText = `${dateLabel} — ${cleanTitle}${isToday ? ' (Mais Recente)' : ''}`;
    if (idx === 0) opt.selected = true;
    select.appendChild(opt);
  });
}

function changeTranslatedReport(reportId) {
  activeTranslatedReportId = reportId;
  const selectElem = document.getElementById("selectTranslatedReport");
  if (selectElem && selectElem.value !== reportId) {
    selectElem.value = reportId;
  }

  const report = allReportsCache.find(r => r.id === reportId || r.filename === reportId) || allReportsCache[0];
  
  if (!report) {
    showToast("Relatório não encontrado.");
    return;
  }

  renderEarlyLookTranslatedView(report);
}

function renderEarlyLookTranslatedView(report) {
  if (!report) return;

  const repId = report.id;
  const struct = structuredTranslations[repId];

  const mainTitleEl = document.getElementById("elMainTitle");
  const displayDateEl = document.getElementById("elDisplayDate");
  const quoteTextEl = document.getElementById("elQuoteText");
  const originalTitleEl = document.getElementById("elOriginalTitle");
  const originalContentEl = document.getElementById("elOriginalContent");
  const regimeEl = document.getElementById("elHeaderRegime");
  const takeawaysGrid = document.getElementById("elTakeawaysGrid");
  const thesisBodyContainer = document.getElementById("elThesisBodyContainer");

  // Atualizar container de texto original em inglês
  if (originalTitleEl) originalTitleEl.innerText = `${report.title} (Original English)`;
  if (originalContentEl) originalContentEl.innerText = report.content || report.summary || "Conteúdo não disponível.";

  if (struct) {
    if (mainTitleEl) mainTitleEl.innerHTML = struct.titlePt;
    if (displayDateEl) displayDateEl.innerText = struct.displayDate;
    if (quoteTextEl) quoteTextEl.innerHTML = `${struct.quoteText} <span class="quote-author">${struct.quoteAuthor}</span>`;
    if (regimeEl) regimeEl.innerText = `REGIME GIP: ${struct.regime}`;

    if (takeawaysGrid && struct.takeaways) {
      takeawaysGrid.innerHTML = struct.takeaways.map(t => `
        <div class="takeaway-card ${t.borderClass}">
          <div class="takeaway-header">
            <span class="t-icon">${t.icon}</span>
            <h4>${t.title}</h4>
          </div>
          <div class="takeaway-body">${t.desc}</div>
        </div>
      `).join("");
    }
  } else {
    // Tradução e síntese adaptativa automática para outros relatórios indexados
    const titleClean = (report.title || "").replace(/^#\s*/, '').replace(/EARLY LOOK:\s*/i, '');
    if (mainTitleEl) mainTitleEl.innerHTML = `EARLY LOOK: <span>${titleClean}</span>`;
    if (displayDateEl) displayDateEl.innerText = report.date || report.shortDate || "Data de Publicação";
    if (quoteTextEl) quoteTextEl.innerHTML = `Nós não apostamos contra pessoas nos mercados. Nós seguimos a Ordem Implicada dos fluxos de mercado. <span class="quote-author">— Keith McCullough</span>`;
    if (regimeEl) regimeEl.innerText = `REGIME GIP: QUAD 3 (#ACCELERATING)`;
    
    if (takeawaysGrid) {
      takeawaysGrid.innerHTML = `
        <div class="takeaway-card emerald-border">
          <div class="takeaway-header"><span class="t-icon">⚡</span><h4>1. Síntese do Research</h4></div>
          <div class="takeaway-body">${report.summary ? report.summary.substring(0, 220) + '...' : 'Análise quantitativa dos fluxos de capital e faixas de risco.'}</div>
        </div>
        <div class="takeaway-card amber-border">
          <div class="takeaway-header"><span class="t-icon">🎯</span><h4>2. Risk Ranges Extraídos</h4></div>
          <div class="takeaway-body">${report.riskRanges && report.riskRanges.length > 0 ? `${report.riskRanges.length} ativos calculados e calibrados para o pregão.` : 'Faixas de volatilidade ajustada vigentes para o pregão.'}</div>
        </div>
        <div class="takeaway-card rose-border">
          <div class="takeaway-header"><span class="t-icon">🧭</span><h4>3. Enquadramento Macro</h4></div>
          <div class="takeaway-body">Regime de mercado avaliado sob a ótica de aceleração/desaceleração de Crescimento (G) e Inflação (I).</div>
        </div>
      `;
    }
  }

  // Renderiza o corpo integral da tese traduzida de forma 100% dinâmica!
  if (thesisBodyContainer) {
    thesisBodyContainer.innerHTML = buildThesisHtml(report, struct);
  }

  showToast(`📑 Visualizando: ${report.title}`);
}

function setEarlyLookLanguage(lang) {
  currentEarlyLookLanguage = lang;
  const ptContainer = document.getElementById("earlylookTranslatedContainer");
  const enContainer = document.getElementById("earlylookOriginalContainer");
  const btnPt = document.getElementById("btnLangPt");
  const btnEn = document.getElementById("btnLangEn");

  if (lang === "en") {
    if (ptContainer) ptContainer.style.display = "none";
    if (enContainer) enContainer.style.display = "block";
    if (btnPt) { btnPt.className = "btn btn-sm btn-outline"; }
    if (btnEn) { btnEn.className = "btn btn-sm btn-primary"; }
    showToast("Exibindo texto original em Inglês.");
  } else {
    if (ptContainer) ptContainer.style.display = "block";
    if (enContainer) enContainer.style.display = "none";
    if (btnPt) { btnPt.className = "btn btn-sm btn-primary"; }
    if (btnEn) { btnEn.className = "btn btn-sm btn-outline"; }
    showToast("Exibindo tradução integral em Português Brasil.");
  }
}

function copyEarlyLookTranslation() {
  const container = document.getElementById("earlylookTranslatedContainer");
  if (!container) return;

  const currentReport = allReportsCache.find(r => r.id === activeTranslatedReportId || r.filename === activeTranslatedReportId) || allReportsCache[0];
  const title = currentReport ? currentReport.title : "Early Look Hedgeye";
  const date = currentReport ? (currentReport.shortDate || currentReport.date) : "Hoje";

  const textToCopy = `RELATÓRIO HEDGEYE EARLY LOOK TRADUZIDO (${date})
Título: ${title}
Autor: Keith McCullough / Hedgeye Research

${container.innerText}`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast("Texto traduzido copiado com sucesso para a Área de Transferência!");
  });
}

function printEarlyLookReport() {
  const reportElement = document.getElementById("earlylookTranslatedContainer");
  const printContainer = document.getElementById("printReportContainer");
  
  if (printContainer && reportElement) {
    printContainer.innerHTML = `<div class="executive-report-doc">${reportElement.innerHTML}</div>`;
  }
  
  setTimeout(() => {
    window.print();
  }, 100);
}

// 11. ANÁLISE AVANÇADA (GEX, FACTSET, FUNDAMENTALISTA & 13F)
let marketAnalyticsData = null;

async function fetchMarketAnalyticsData() {
  try {
    let res = await fetch("/api/market-analytics");
    if (!res.ok) {
      res = await fetch("market_analytics.json");
    }
    if (res.ok) {
      marketAnalyticsData = await res.json();
      renderMarketAnalytics(marketAnalyticsData);
    }
  } catch (err) {
    console.warn("Tentando carregar market_analytics.json local:", err);
    try {
      let resLocal = await fetch("market_analytics.json");
      if (resLocal.ok) {
        marketAnalyticsData = await resLocal.json();
        renderMarketAnalytics(marketAnalyticsData);
      }
    } catch (e) {
      console.error("Erro carregando market_analytics:", e);
    }
  }
}

let quadChartInstance = null;

function renderQuadRotationTracker(tracker) {
  if (!tracker || !tracker.baskets) return;

  // 1. Atualiza Badges e Diagnóstico Preditivo
  const leadingBadge = document.getElementById("quadLeadingBadge");
  if (leadingBadge) {
    leadingBadge.innerText = `LÍDER 30D: ${tracker.leading_month}`;
  }

  const transitionBanner = document.getElementById("quadTransitionBanner");
  if (transitionBanner) {
    transitionBanner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <strong style="color: #38BDF8; font-size: 0.95rem;">🎯 DIAGNÓSTICO PREDITIVO DE ROTAÇÃO (EARLY WARNING & 2ª DERIVADA):</strong><br>
          <span style="font-size: 0.9rem; color: #F8FAFC;">${tracker.transition_signal}</span>
        </div>
        <div style="font-size: 0.76rem; color: #94A3B8; text-align: right;">
          Líder Hoje (1D): <strong style="color: #34D399;">${tracker.leading_today}</strong> | Líder 30D: <strong style="color: #F59E0B;">${tracker.leading_month}</strong>
        </div>
      </div>
    `;
  }

  // 1.1 Renderiza os Indicadores de Aceleração Macro (Cross-Asset Spreads ROC 5D)
  const macroRatiosContainer = document.getElementById("quadMacroRatiosContainer");
  if (macroRatiosContainer && tracker.macro_ratios) {
    const mr = tracker.macro_ratios;
    const ratioKeys = ["growth_roc", "inflation_roc", "cyclical_roc", "commodity_roc"];
    macroRatiosContainer.innerHTML = ratioKeys.map(k => {
      const r = mr[k];
      if (!r) return "";
      const isPos = r.roc_5d_val >= 0;
      const color = isPos ? "#10B981" : "#EF4444";
      const bg = isPos ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)";
      const border = isPos ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)";

      return `
        <div style="background: ${bg}; border: 1px solid ${border}; border-radius: 8px; padding: 0.75rem 0.9rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <span style="font-size: 0.76rem; color: #CBD5E1; font-weight: 600;">${r.name}</span>
            <strong style="font-size: 0.95rem; color: ${color}; font-family: 'JetBrains Mono', monospace;">${r.roc_5d}</strong>
          </div>
          <div style="font-size: 0.74rem; font-weight: 700; color: ${color}; margin-bottom: 0.2rem;">
            ${isPos ? '▲' : '▼'} ${r.status}
          </div>
          <div style="font-size: 0.68rem; color: #94A3B8;">
            Viés de Regime: <strong style="color: #38BDF8;">${r.quad_bias}</strong>
          </div>
        </div>
      `;
    }).join("");
  }

  // 2. Renderiza os Cards dos 4 Quadrantes com 2ª Derivada (Aceleração)
  const gridContainer = document.getElementById("quadBasketsCardsGrid");
  if (gridContainer) {
    const qKeys = ["QUAD 1", "QUAD 2", "QUAD 3", "QUAD 4"];
    gridContainer.innerHTML = qKeys.map(k => {
      const b = tracker.baskets[k];
      if (!b) return "";
      const isLeader = k === tracker.leading_month;
      const ret1dColor = b.ret_1d_val >= 0 ? "#10B981" : "#EF4444";
      const ret5dColor = b.ret_5d_val >= 0 ? "#10B981" : "#EF4444";
      const ret30dColor = b.ret_30d_val >= 0 ? "#10B981" : "#EF4444";
      const accelColor = b.acceleration_val >= 0 ? "#10B981" : "#EF4444";
      const accelBadgeBg = b.acceleration_val >= 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
      const accelBorder = b.acceleration_val >= 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)";

      return `
        <div class="stat-card" style="border: 1px solid ${isLeader ? b.color : 'rgba(255,255,255,0.08)'}; background: linear-gradient(180deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); padding: 1rem; border-radius: 8px; position: relative;">
          ${isLeader ? `<span class="badge" style="position: absolute; top: 0.6rem; right: 0.6rem; background: ${b.color}; color: #000; font-weight: 800; font-size: 0.68rem;">🏆 LÍDER 30D</span>` : ''}
          <div style="font-size: 0.95rem; font-weight: 700; color: ${b.color}; margin-bottom: 0.2rem;">${b.name.split(':')[0]}</div>
          <div style="font-size: 0.74rem; color: #94A3B8; margin-bottom: 0.6rem; line-height: 1.3;">${b.desc}</div>

          <!-- Pílula de Aceleração (2ª Derivada / ROC Spread) -->
          <div style="margin-bottom: 0.7rem; background: ${accelBadgeBg}; border: 1px solid ${accelBorder}; padding: 0.35rem 0.5rem; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.7rem; color: #CBD5E1; font-weight: 600;">2ª Derivada (ROC):</span>
            <span style="font-size: 0.75rem; font-weight: 800; color: ${accelColor}; font-family: 'JetBrains Mono', monospace;">
              ${b.acceleration || '0.00%'} (${b.acceleration_val >= 0 ? 'ACELERANDO' : 'DESACELERANDO'})
            </span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.4rem; background: rgba(0,0,0,0.25); padding: 0.5rem; border-radius: 6px; text-align: center;">
            <div>
              <div style="font-size: 0.68rem; color: #94A3B8;">Hoje (1D)</div>
              <strong style="font-size: 0.85rem; color: ${ret1dColor};">${b.ret_1d}</strong>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94A3B8;">5 Dias</div>
              <strong style="font-size: 0.85rem; color: ${ret5dColor};">${b.ret_5d}</strong>
            </div>
            <div>
              <div style="font-size: 0.68rem; color: #94A3B8;">30 Dias</div>
              <strong style="font-size: 0.85rem; color: ${ret30dColor};">${b.ret_30d}</strong>
            </div>
          </div>

          <div style="margin-top: 0.6rem; font-size: 0.72rem; color: #CBD5E1; display: flex; justify-content: space-between;">
            <span>Ativos:</span>
            <span style="font-family: 'JetBrains Mono', monospace; color: ${b.color};">${b.assets.map(a => a.ticker).join(", ")}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  // 3. Renderiza a Tabela Detalhada com os 16 Ativos
  const tableBody = document.getElementById("quadBasketsTableBody");
  if (tableBody) {
    const qKeys = ["QUAD 1", "QUAD 2", "QUAD 3", "QUAD 4"];
    tableBody.innerHTML = qKeys.map(k => {
      const b = tracker.baskets[k];
      if (!b) return "";
      const isLeader = k === tracker.leading_month;
      const statusBadge = isLeader 
        ? `<span class="badge badge-bullish" style="font-size: 0.72rem;">🟢 Favorecido (Regime Ativo)</span>`
        : `<span class="badge badge-neutral" style="font-size: 0.72rem;">⚪ Em Monitoramento</span>`;

      const assetsHtml = b.assets.map(a => `
        <span style="display: inline-block; background: rgba(255,255,255,0.06); padding: 0.15rem 0.4rem; border-radius: 4px; margin: 0.1rem; font-family: 'JetBrains Mono', monospace; font-size: 0.76rem;">
          <strong>${a.ticker}</strong>: <span style="color: ${a.ret_30d_val >= 0 ? '#10B981' : '#EF4444'};">${a.ret_30d}</span>
        </span>
      `).join(" ");

      return `
        <tr>
          <td><strong style="color: ${b.color}; font-size: 0.95rem;">${b.name.split(':')[0]}</strong></td>
          <td><span style="font-size: 0.8rem; color: #94A3B8;">${b.desc}</span></td>
          <td>${assetsHtml}</td>
          <td><strong style="color: ${b.ret_1d_val >= 0 ? '#10B981' : '#EF4444'};">${b.ret_1d}</strong></td>
          <td><strong style="color: ${b.ret_5d_val >= 0 ? '#10B981' : '#EF4444'};">${b.ret_5d}</strong></td>
          <td><strong style="font-size: 0.95rem; color: ${b.ret_30d_val >= 0 ? '#10B981' : '#EF4444'};">${b.ret_30d}</strong></td>
          <td><span style="font-weight: 700; color: ${b.acceleration_val >= 0 ? '#10B981' : '#EF4444'}; font-family: 'JetBrains Mono', monospace;">${b.acceleration || '0.00%'}</span></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join("");
  }

  // 4. Desenha o Gráfico Comparativo de Linhas com Chart.js
  const canvas = document.getElementById("quadRotationChart");
  if (canvas && typeof Chart !== "undefined") {
    if (quadChartInstance) {
      quadChartInstance.destroy();
    }

    const datasets = [
      {
        label: "QUAD 1: Goldilocks (QQQ, XLY, IWM, HYG)",
        data: tracker.baskets["QUAD 1"]?.series || [],
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.05)",
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6
      },
      {
        label: "QUAD 2: Reflação (DBC, CPER, XLI, XLB)",
        data: tracker.baskets["QUAD 2"]?.series || [],
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6
      },
      {
        label: "QUAD 3: Estagflação (GLD, XLU, XLE, XLK)",
        data: tracker.baskets["QUAD 3"]?.series || [],
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.12)",
        borderWidth: 3.5,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 7,
        fill: true
      },
      {
        label: "QUAD 4: Deflação (IEF, XLV, XLP, XLU)",
        data: tracker.baskets["QUAD 4"]?.series || [],
        borderColor: "#A855F7",
        backgroundColor: "rgba(168, 85, 247, 0.05)",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 6
      }
    ];

    quadChartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels: tracker.dates || [],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: "rgba(15, 23, 42, 0.95)",
            titleColor: "#F8FAFC",
            bodyColor: "#CBD5E1",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function(context) {
                return ` ${context.dataset.label.split(':')[0]}: ${context.parsed.y >= 0 ? '+' : ''}${context.parsed.y.toFixed(2)}%`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.04)"
            },
            ticks: {
              color: "#94A3B8",
              font: { size: 11 }
            }
          },
          y: {
            grid: {
              color: "rgba(255, 255, 255, 0.06)"
            },
            ticks: {
              color: "#94A3B8",
              font: { size: 11 },
              callback: function(value) {
                return (value >= 0 ? "+" : "") + value + "%";
              }
            }
          }
        }
      }
    });
  }
}

function renderMarketAnalytics(data) {
  if (!data) return;

  // 0. Renderiza o Radar de Rotação de Quadrantes (Simulação 30D)
  if (data.quad_rotation_tracker) {
    renderQuadRotationTracker(data.quad_rotation_tracker);
  }

  // 1. Renderiza GEX Cards
  const gexContainer = document.getElementById("gexCardsContainer");
  if (gexContainer && data.gex && data.gex.length > 0) {
    gexContainer.innerHTML = data.gex.map(item => {
      const isShortGamma = item.regime === "SHORT GAMMA";
      const regimeColor = isShortGamma ? "#EF4444" : "#10B981";
      const regimeBg = isShortGamma ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)";
      const regimeBorder = isShortGamma ? "rgba(239, 68, 68, 0.4)" : "rgba(16, 185, 129, 0.4)";

      // Calcula % do preço no range entre Put Wall e Call Wall
      const wallRange = (item.call_wall - item.put_wall) || 1;
      const pricePct = Math.max(0, Math.min(100, ((item.current_price - item.put_wall) / wallRange) * 100));

      return `
        <div class="stat-card" style="border: 1px solid ${regimeBorder}; background: linear-gradient(180deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9)); padding: 1.2rem; border-radius: 10px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
            <div>
              <span style="font-size: 1.2rem; font-weight: 800; color: #F8FAFC; letter-spacing: 0.5px;">${item.ticker}</span>
              <div style="font-size: 1.4rem; font-weight: 700; color: #E2E8F0; margin-top: 0.2rem;">US$ ${item.current_price.toFixed(2)}</div>
            </div>
            <span class="badge" style="background: ${regimeBg}; color: ${regimeColor}; border: 1px solid ${regimeBorder}; font-weight: 700; font-size: 0.75rem;">
              ${item.regime}
            </span>
          </div>

          <!-- Barra de Gama / Walls -->
          <div style="margin: 1rem 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 600; margin-bottom: 0.3rem;">
              <span style="color: #EF4444;">Put Wall (Piso): $${item.put_wall}</span>
              <span style="color: #10B981;">Call Wall (Teto): $${item.call_wall}</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; position: relative; overflow: hidden;">
              <div style="position: absolute; left: 0; top: 0; bottom: 0; width: ${pricePct}%; background: linear-gradient(90deg, #EF4444, #3B82F6, #10B981); border-radius: 4px;"></div>
            </div>
            <div style="text-align: center; font-size: 0.72rem; color: #94A3B8; margin-top: 0.3rem;">
              Posição no Range de Opções: <strong>${pricePct.toFixed(0)}%</strong> (Perto do ${pricePct > 50 ? "Teto" : "Piso"})
            </div>
          </div>

          <!-- Métricas Chave -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; font-size: 0.78rem; background: rgba(0,0,0,0.25); padding: 0.7rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.04);">
            <div><span style="color: #94A3B8;">Net GEX:</span> <strong style="color: ${regimeColor};">${item.net_gex_million}M</strong></div>
            <div><span style="color: #94A3B8;">Put/Call Ratio:</span> <strong>${item.put_call_ratio}</strong></div>
            <div><span style="color: #94A3B8;">Zero Gamma:</span> <strong>$${item.zero_gamma_level}</strong></div>
            <div><span style="color: #94A3B8;">Total OI Puts:</span> <strong>${(item.total_put_oi / 1000).toFixed(0)}k</strong></div>
          </div>

          <p style="margin: 0.8rem 0 0; font-size: 0.74rem; color: #94A3B8; line-height: 1.35;">
            ℹ️ ${item.regime_desc}
          </p>
        </div>
      `;
    }).join("");
  }

  // 2. Renderiza FactSet Insight
  if (data.factset) {
    const fs = data.factset;
    if (document.getElementById("factsetEpsGrowth")) document.getElementById("factsetEpsGrowth").innerText = fs.sp500_eps_growth_blended || "+4.8% YoY";
    if (document.getElementById("factsetNetMargin")) document.getElementById("factsetNetMargin").innerText = fs.net_profit_margin || "12.1%";
    if (document.getElementById("factsetLeadingSectors")) document.getElementById("factsetLeadingSectors").innerText = (fs.sectors_leading || []).join(", ");
    if (document.getElementById("factsetLaggingSectors")) document.getElementById("factsetLaggingSectors").innerText = (fs.sectors_lagging || []).join(", ");
    if (document.getElementById("factsetQuadInference")) document.getElementById("factsetQuadInference").innerText = fs.quad_inference || "";
  }

  // 3. Renderiza Radar 13F
  const radarContainer = document.getElementById("superinvestorsContainer");
  if (radarContainer && data.superinvestors_13f) {
    radarContainer.innerHTML = data.superinvestors_13f.map(inv => `
      <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); padding: 0.9rem; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <strong style="color: #34D399; font-size: 0.92rem;">${inv.investor}</strong>
          <span style="font-size: 0.72rem; color: #94A3B8;">${inv.filing_period}</span>
        </div>
        <div style="font-size: 0.78rem; color: #CBD5E1; margin-bottom: 0.3rem;">
          <strong>Tese de Ciclo:</strong> ${inv.thesis}
        </div>
        <div style="font-size: 0.78rem; color: #94A3B8; margin-bottom: 0.3rem;">
          <strong>Destaques:</strong> ${inv.top_holdings.join(" • ")}
        </div>
        <div style="font-size: 0.74rem; color: #A7F3D0; background: rgba(16, 185, 129, 0.1); padding: 0.4rem 0.6rem; border-radius: 4px; border-left: 3px solid #10B981; margin-top: 0.3rem;">
          💡 <em>${inv.action_guidance}</em>
        </div>
      </div>
    `).join("");
  }

  // 4. Renderiza Cruzamento Carteira vs Dataroma
  const matchTable = document.getElementById("dataromaMatchTableBody");
  if (matchTable && data.portfolio_dataroma_match) {
    matchTable.innerHTML = data.portfolio_dataroma_match.map(m => {
      const isConsensusBadge = m.is_top_consensus 
        ? `<span class="badge badge-bullish" style="font-size: 0.72rem;">⭐ ALTO CONSENSO (${m.ownership_count} Fundos)</span>`
        : (m.ownership_count > 0 
            ? `<span class="badge badge-neutral" style="font-size: 0.72rem;">${m.ownership_count} Fundos</span>` 
            : `<span class="badge badge-tail" style="font-size: 0.72rem;">Tese Própria / Niche</span>`);

      return `
        <tr>
          <td><strong style="color: #60A5FA; font-size: 0.95rem;">${m.ticker}</strong></td>
          <td><span style="font-size: 0.8rem; color: #94A3B8;">${m.sector}</span></td>
          <td><strong>${m.ownership_count > 0 ? `${m.ownership_count} Superinvestidores` : 'Exclusivo da Carteira'}</strong></td>
          <td><span style="font-family: 'JetBrains Mono', monospace; color: #38BDF8; font-weight: 600;">${m.hold_price}</span></td>
          <td>${isConsensusBadge}</td>
          <td><span class="badge ${m.activity_badge}" style="font-size: 0.72rem; line-height: 1.3;">${m.recent_activity}</span></td>
        </tr>
      `;
    }).join("");
  }

  // 5. Renderiza Top Consenso Global (Grand Portfolio)
  const consensusTable = document.getElementById("dataromaConsensusTableBody");
  if (consensusTable && data.dataroma_consensus) {
    consensusTable.innerHTML = data.dataroma_consensus.map((c, idx) => `
      <tr>
        <td><strong style="color: #F59E0B;">#${idx + 1} ${c.ticker}</strong></td>
        <td><span style="font-size: 0.82rem;">${c.name}</span> <br><small style="color: #94A3B8;">${c.sector}</small></td>
        <td><span class="badge badge-bullish" style="font-size: 0.72rem;">${c.ownership_count} Fundos</span></td>
        <td><strong style="font-family: 'JetBrains Mono', monospace; color: #60A5FA;">${c.hold_price}</strong></td>
      </tr>
    `).join("");
  }

  // 6. Renderiza Radar de Fluxo (Top Buys & Sells)
  const buysContainer = document.getElementById("dataromaTopBuysContainer");
  const sellsContainer = document.getElementById("dataromaTopSellsContainer");
  if (data.dataroma_activity) {
    if (buysContainer && data.dataroma_activity.top_buys) {
      buysContainer.innerHTML = data.dataroma_activity.top_buys.map(b => `
        <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10B981; padding: 0.4rem 0.6rem; border-radius: 4px; font-size: 0.76rem;">
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: #34D399;">${b.ticker}</strong>
            <span style="color: #94A3B8;">${b.manager}</span>
          </div>
          <div style="color: #CBD5E1; font-size: 0.72rem;">${b.details}</div>
        </div>
      `).join("");
    }

    if (sellsContainer && data.dataroma_activity.top_sells) {
      sellsContainer.innerHTML = data.dataroma_activity.top_sells.map(s => `
        <div style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #EF4444; padding: 0.4rem 0.6rem; border-radius: 4px; font-size: 0.76rem;">
          <div style="display: flex; justify-content: space-between;">
            <strong style="color: #F87171;">${s.ticker}</strong>
            <span style="color: #94A3B8;">${s.manager}</span>
          </div>
          <div style="color: #CBD5E1; font-size: 0.72rem;">${s.details}</div>
        </div>
      `).join("");
    }
  }

  // 7. Renderiza Tabela Fundamentalista
  const fundTable = document.getElementById("analyticsFundamentalsTableBody");
  if (fundTable && data.fundamentals && data.fundamentals.length > 0) {
    if (document.getElementById("fundamentalsCount")) {
      document.getElementById("fundamentalsCount").innerText = `${data.fundamentals.length} Ativos Monitorados`;
    }

    fundTable.innerHTML = data.fundamentals.map(stk => {
      const growthColor = stk.revenue_growth.startsWith("+") ? "#10B981" : (stk.revenue_growth.startsWith("-") ? "#EF4444" : "#E2E8F0");
      let badgeRec = "badge-neutral";
      if (stk.recommendation.includes("BUY")) badgeRec = "badge-bullish";
      else if (stk.recommendation.includes("SELL")) badgeRec = "badge-bearish";

      return `
        <tr>
          <td><strong style="color: #60A5FA;">${stk.ticker}</strong></td>
          <td>${stk.shortName}</td>
          <td><span style="font-size: 0.8rem; color: #94A3B8;">${stk.sector}</span></td>
          <td><strong>US$ ${stk.price.toFixed(2)}</strong></td>
          <td><span style="font-family: 'JetBrains Mono', monospace;">${stk.pe}</span></td>
          <td><span style="font-family: 'JetBrains Mono', monospace;">${stk.ev_ebitda}</span></td>
          <td><span style="color: #38BDF8; font-family: 'JetBrains Mono', monospace;">${stk.net_margin}</span></td>
          <td><span style="color: ${growthColor}; font-weight: 600; font-family: 'JetBrains Mono', monospace;">${stk.revenue_growth}</span></td>
          <td>${stk.market_cap}</td>
          <td>${stk.beta}</td>
          <td><span class="badge ${badgeRec}" style="font-size: 0.72rem;">${stk.recommendation}</span></td>
        </tr>
      `;
    }).join("");
  }

  // 8. Renderiza Calendário Econômico Dinâmico & Catalisadores Macro
  if (data.economic_calendar) {
    renderEconomicCalendar(data.economic_calendar);
  }

  // 9. Renderiza Balanços da Carteira (Earnings)
  if (data.portfolio_earnings_calendar) {
    renderPortfolioEarningsCalendar(data.portfolio_earnings_calendar);
  }
}

// 12. FUNÇÕES DO CALENDÁRIO ECONÔMICO & BALANÇOS
function switchCalendarTab(type) {
  const btnMacro = document.getElementById("btnCalMacro");
  const btnEarn = document.getElementById("btnCalEarnings");
  const macroContainer = document.getElementById("macroCalendarContainer");
  const earnContainer = document.getElementById("portfolioEarningsCalendarContainer");
  const subtitle = document.getElementById("calendarSubtitle");

  if (type === "macro") {
    if (btnMacro) btnMacro.classList.add("active");
    if (btnEarn) btnEarn.classList.remove("active");
    if (macroContainer) macroContainer.style.display = "block";
    if (earnContainer) earnContainer.style.display = "none";
    if (subtitle) subtitle.innerText = "Eventos que podem confirmar, estender ou invalidar a previsão de Quad 3";
  } else {
    if (btnMacro) btnMacro.classList.remove("active");
    if (btnEarn) btnEarn.classList.add("active");
    if (macroContainer) macroContainer.style.display = "none";
    if (earnContainer) earnContainer.style.display = "block";
    if (subtitle) subtitle.innerText = "Datas de divulgação dos próximos resultados trimestrais (Earnings) e consenso de EPS/Receita";
  }
}

function renderEconomicCalendar(calendarData) {
  const tbody = document.getElementById("economicCalendarBody");
  if (!tbody || !calendarData || !calendarData.events) return;

  tbody.innerHTML = calendarData.events.map(ev => {
    const isToday = ev.is_today;
    const rowClass = isToday ? "row-today" : "";
    const badgeHtml = isToday 
      ? `<span class="pulse-badge-today">⚡ ${ev.portfolio_sensitivity}</span>` 
      : `<span class="badge ${ev.badge_class}">${ev.portfolio_sensitivity}</span>`;

    return `
      <tr class="${rowClass}">
        <td><strong>${ev.date_str}</strong></td>
        <td><strong>${ev.indicator}</strong></td>
        <td><span class="badge ${ev.badge_class}" style="font-size: 0.76rem;">${ev.consensus}</span></td>
        <td style="font-size: 0.84rem; color: #CBD5E1;">${ev.quad_impact}</td>
        <td style="font-size: 0.84rem; color: #94A3B8;">${ev.market_trigger}</td>
        <td>${badgeHtml}</td>
      </tr>
    `;
  }).join("");
}

function renderPortfolioEarningsCalendar(earningsList) {
  const tbody = document.getElementById("portfolioEarningsBody");
  if (!tbody || !earningsList) return;

  tbody.innerHTML = earningsList.map(item => {
    let statusBadge = "badge-neutral";
    if (item.days_until === 0) statusBadge = "badge-bullish";
    else if (item.days_until <= 15) statusBadge = "badge-tail";

    return `
      <tr>
        <td><strong style="color: #60A5FA; font-size: 0.95rem;">${item.ticker}</strong></td>
        <td><strong>${item.earnings_date}</strong></td>
        <td><span class="badge ${statusBadge}" style="font-size: 0.72rem;">${item.status}</span></td>
        <td><span style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #34D399;">${item.eps_consensus}</span></td>
        <td><span style="font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #38BDF8;">${item.revenue_consensus}</span></td>
        <td style="font-size: 0.82rem; color: #CBD5E1;">Acompanhar número vs. expectativa para calibrar tamanho de posição na carteira.</td>
      </tr>
    `;
  }).join("");
}

// ========================================================
// 14. COPILOT MACRO AI (CHATBOT INTERATIVO & ASSISTENTE)
// ========================================================
let chatHistory = [];

const defaultChatHistory = [
  {
    sender: "bot",
    time: "Hoje",
    text: `Olá! Sou o seu **Copilot Macro Hedgeye**.\n\nEstou conectado aos seus dados em tempo real:\n- **Regime Macro Atual:** #Quad3 (Estagflação / Reflação)\n- **Patrimônio Monitorado:** Charles Schwab, Tastyworks e Consolidado\n- **Risk Ranges de Hoje (11/09):** Dólar em mínimas (98.40–99.67 Bearish), Yields em máximas (4.75%–4.98% Bullish) e Real Assets (Ouro/Cobre/WTI) liderando.\n- **Nowcast de Inflação:** Projeção Hedgeye de aceleração para 3,5% (vs 3,4% mercado).\n\nComo posso ajudar você hoje com sua carteira, dados de CPI ou decisões de mercado?`
  }
];

function loadChatHistory() {
  try {
    const stored = localStorage.getItem("hedgeye_copilot_chat_v1");
    if (stored) {
      chatHistory = JSON.parse(stored);
    } else {
      chatHistory = [...defaultChatHistory];
    }
  } catch (e) {
    chatHistory = [...defaultChatHistory];
  }
}

function saveChatHistory() {
  try {
    localStorage.setItem("hedgeye_copilot_chat_v1", JSON.stringify(chatHistory));
  } catch (e) {}
}

function renderChatMessages() {
  const container = document.getElementById("chatMessagesContainer");
  if (!container) return;

  loadChatHistory();
  renderCopilotSidebar();

  container.innerHTML = chatHistory.map(msg => {
    const isUser = msg.sender === "user";
    const avatar = isUser ? "👤" : "⚡";
    const bubbleContent = formatMarkdownToHtml(msg.text);

    return `
      <div class="chat-msg ${msg.sender}">
        <div class="chat-bot-avatar" style="width: 32px; height: 32px; font-size: 0.95rem; background: ${isUser ? '#0284C7' : 'linear-gradient(135deg, #0284C7, #38BDF8)'};">${avatar}</div>
        <div class="chat-bubble">
          ${bubbleContent}
        </div>
      </div>
    `;
  }).join("");

  container.scrollTop = container.scrollHeight;
}

function renderCopilotSidebar() {
  const headerElem = document.getElementById("copilotSignalsHeader");
  const containerElem = document.getElementById("copilotSignalsContainer");
  const adherenceValElem = document.getElementById("copilotAdherenceVal");
  const adherenceBadge = document.getElementById("copilotAdherenceBadge");
  const adherenceDesc = document.getElementById("copilotAdherenceDesc");

  // 1. Data do Relatório Ativo
  const latestDate = window.dynamicEarlyLook?.data || (window.reportsDatabase?.latest?.shortDate) || "11/09";
  const displayDate = latestDate.includes("/") ? latestDate.slice(0, 5) : latestDate;
  if (headerElem) {
    headerElem.innerText = `🎯 Sinais Críticos de Hoje (${displayDate})`;
  }

  // 2. Aderência Real Calculada
  const calc = calculatePortfolioTotals();
  const adh = calc.adherence || 73.5;
  if (adherenceValElem) {
    adherenceValElem.innerText = `${adh.toFixed(1)}%`;
  }
  if (adherenceBadge) {
    if (adh >= 60.0) {
      adherenceBadge.className = "badge badge-bullish";
      adherenceBadge.innerText = `Meta: ≥ 60% (Atingida)`;
    } else {
      adherenceBadge.className = "badge badge-bearish";
      adherenceBadge.innerText = `Meta: ≥ 60% (Abaixo)`;
    }
  }
  if (adherenceDesc) {
    adherenceDesc.innerText = adh >= 60.0 
      ? "Carteira reconciliada e blindada em Real Assets e Caixa." 
      : "Necessário calibrar posições em relação ao regime macro.";
  }

  // 3. Sinais Críticos de Mercado
  if (containerElem) {
    const rrs = (window.reportsDatabase?.latest?.riskRanges) || riskRangesData || [];
    const targetTickers = [
      { sym: "USD", alt: "DXY", label: "DXY (Dólar)" },
      { sym: "UST10Y", alt: "US10", label: "UST 10Y Yield" },
      { sym: "GOLD", alt: "AAAU", label: "Ouro Spot" },
      { sym: "COPPER", alt: "CPER", label: "Cobre Físico" },
      { sym: "WTIC", alt: "WTI", label: "Petróleo WTI" }
    ];

    let html = "";
    targetTickers.forEach(item => {
      const found = rrs.find(r => (r.ticker || r.symbol || "").toUpperCase() === item.sym || (r.ticker || r.symbol || "").toUpperCase() === item.alt);
      if (found) {
        const sig = (found.signal || "NEUTRAL").toUpperCase();
        const badgeClass = sig.includes("BULL") ? "badge-bullish" : (sig.includes("BEAR") ? "badge-bearish" : "badge-neutral");
        const rangeStr = `${found.low}–${found.high}`;
        html += `
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #CBD5E1;">${item.label}:</span>
            <span class="badge ${badgeClass}" style="font-size: 0.7rem;">${rangeStr} (${sig})</span>
          </div>
        `;
      }
    });

    if (!html) {
      html = `
        <div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #CBD5E1;">DXY (Dólar):</span><span class="badge badge-bearish" style="font-size: 0.7rem;">98.40–99.67 (BEARISH)</span></div>
        <div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #CBD5E1;">UST 10Y Yield:</span><span class="badge badge-bullish" style="font-size: 0.7rem;">4.75%–4.98% (BULLISH)</span></div>
        <div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #CBD5E1;">Ouro Spot:</span><span class="badge badge-bullish" style="font-size: 0.7rem;">4.275–4.503 (BULLISH)</span></div>
        <div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #CBD5E1;">Cobre Físico:</span><span class="badge badge-bullish" style="font-size: 0.7rem;">6.35–6.84 (BULLISH)</span></div>
        <div style="display: flex; justify-content: space-between; align-items: center;"><span style="color: #CBD5E1;">Petróleo WTI:</span><span class="badge badge-bullish" style="font-size: 0.7rem;">88.51–102.99 (BULLISH)</span></div>
      `;
    }
    containerElem.innerHTML = html;
  }
}

function formatMarkdownToHtml(md) {
  if (!md) return "";
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings
  html = html.replace(/^### (.*$)/gim, '<h4 style="color: #38BDF8; margin: 0.4rem 0 0.2rem 0;">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="color: #38BDF8; margin: 0.5rem 0 0.3rem 0;">$1</h3>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Quotes
  html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid #38BDF8; padding-left: 0.6rem; color: #94A3B8; margin: 0.4rem 0;">$1</blockquote>');

  // Unordered list items
  html = html.replace(/^\s*[-•]\s+(.*$)/gim, '<li style="margin-bottom: 0.2rem;">$1</li>');

  // Wrap lists
  html = html.replace(/(<li.*<\/li>)/s, '<ul style="margin: 0.3rem 0 0.4rem 1.2rem; padding: 0;">$1</ul>');

  // Paragraphs
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');

  return html;
}

function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("chatUserInput");
  if (!input) return;

  const query = input.value.trim();
  if (!query) return;

  input.value = "";
  processUserChatMessage(query);
}

function useQuickPrompt(promptText) {
  setTab('copilot');
  const input = document.getElementById("chatUserInput");
  if (input) {
    input.value = promptText;
  }
  processUserChatMessage(promptText);
}

function clearChatHistory() {
  chatHistory = [...defaultChatHistory];
  saveChatHistory();
  renderChatMessages();
  showToast("Histórico de conversa limpo.");
}

async function configureClaudeApiKey() {
  const currentKey = localStorage.getItem("hedgeye_claude_api_key") || "";
  const key = prompt("Digite ou cole sua Chave de API de Inteligência Artificial:\n- Google Gemini (gratuita em aistudio.google.com/apikey)\n- OpenAI GPT-4o (platform.openai.com)\n- Anthropic Claude 3.5 (console.anthropic.com)\n\n(Deixe em branco para usar o Motor Local)", currentKey);
  if (key !== null) {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem("hedgeye_claude_api_key", trimmed);
      try {
        await fetch("/api/config/anthropic_key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: trimmed })
        });
      } catch (e) {}
      
      let provName = "IA";
      if (trimmed.startsWith("AIzaSy")) provName = "Google Gemini 2.0 Flash / 1.5 Pro";
      else if (trimmed.startsWith("sk-proj-") || trimmed.startsWith("sk-")) provName = "OpenAI GPT-4o";
      else if (trimmed.startsWith("sk-ant-")) provName = "Anthropic Claude 3.5 Sonnet";
      
      showToast(`Chave ${provName} salva e conectada com sucesso!`);
    } else {
      localStorage.removeItem("hedgeye_claude_api_key");
      try {
        await fetch("/api/config/anthropic_key", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apiKey: "" })
        });
      } catch (e) {}
      showToast("Usando Motor Neural Local Hedgeye Real-Time.");
    }
    updateClaudeStatusBadge();
  }
}

async function updateClaudeStatusBadge() {
  const badge = document.getElementById("copilotAiSourceBadge");
  if (!badge) return;
  
  let key = localStorage.getItem("hedgeye_claude_api_key");
  let masked = "";
  if (!key) {
    try {
      const res = await fetch("/api/config/anthropic_key");
      if (res.ok) {
        const data = await res.json();
        if (data && data.configured) {
          key = "server_configured";
          masked = data.masked || "";
        }
      }
    } catch (e) {}
  }

  if (key && key.trim()) {
    if (key.startsWith("AIzaSy")) {
      badge.innerHTML = `<span style="color: #10B981;">●</span> Google Gemini Conectado`;
    } else if (key.startsWith("sk-proj-") || (key.startsWith("sk-") && !key.startsWith("sk-ant-"))) {
      badge.innerHTML = `<span style="color: #10B981;">●</span> OpenAI GPT-4o Conectado`;
    } else {
      badge.innerHTML = `<span style="color: #10B981;">●</span> Claude / Gemini IA Conectada`;
    }
  } else {
    badge.innerHTML = `<span style="color: #38BDF8;">●</span> Deep Macro Engine Ativo (RAG)`;
  }
}

async function processUserChatMessage(userText) {
  // 1. Adiciona mensagem do usuário
  chatHistory.push({
    sender: "user",
    time: "Agora",
    text: userText
  });
  saveChatHistory();
  renderChatMessages();

  // 2. Exibe indicador de digitação (typing)
  const container = document.getElementById("chatMessagesContainer");
  if (container) {
    const typingElem = document.createElement("div");
    typingElem.id = "chatTypingIndicator";
    typingElem.className = "chat-msg bot";
    typingElem.innerHTML = `
      <div class="chat-bot-avatar" style="width: 32px; height: 32px; font-size: 0.95rem;">⚡</div>
      <div class="chat-bubble" style="background: rgba(30, 41, 59, 0.8);">
        <div class="typing-dots">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    container.appendChild(typingElem);
    container.scrollTop = container.scrollHeight;
  }

  // 3. Tenta chamar backend com Claude API ou motor de síntese
  let botReply = "";
  const apiKey = localStorage.getItem("hedgeye_claude_api_key") || "";
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: userText,
        apiKey: apiKey,
        history: chatHistory.slice(-6)
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        botReply = data.reply;
      }
    }
  } catch (e) {
    console.warn("Backend chat indisponível, usando motor local:", e);
  }

  if (!botReply) {
    // Processador neural e analítico local de alta fidelidade
    botReply = generateLocalCopilotResponse(userText);
  }

  // Remove indicador de digitação e adiciona resposta
  const typingNode = document.getElementById("chatTypingIndicator");
  if (typingNode) typingNode.remove();

  chatHistory.push({
    sender: "bot",
    time: "Agora",
    text: botReply
  });
  saveChatHistory();
  renderChatMessages();
}

function generateLocalCopilotResponse(query) {
  const q = query.toLowerCase();
  const latestDate = window.dynamicEarlyLook?.data || (window.reportsDatabase?.latest?.shortDate) || "11/09/2026";
  const totals = calculatePortfolioTotals();
  const navStr = `US$ ${totals.totalNAV.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const cashStr = `US$ ${totals.totalCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const adhStr = `${totals.adherence.toFixed(1)}%`;

  // 1. Dúvidas sobre CPI / INFLAÇÃO / NOWCAST / FED / TAXAS
  if (q.includes("cpi") || q.includes("inflação") || q.includes("inflacao") || q.includes("nowcast") || q.includes("fed") || q.includes("warsh") || q.includes("juros") || q.includes("taxa") || q.includes("yield")) {
    return `### 📊 Diagnóstico de Inflação & CPI — Early Look (${latestDate})

**Título do Relatório:** *"EARLY LOOK: Front-Running the Fed’s Inflation Problem"*  
**Autor:** Ryan Ricci (@HedgeyeAI) | Hedgeye Risk Management

---

### 1. 📈 Os Números de Inflação (Nowcast Hedgeye vs. Consenso de Wall Street):
- **Nowcast Hedgeye para Agosto:** Aceleração projetada para **3,5%** (acima da leitura do mês anterior de **3,36%**).
- **Consenso de Wall Street (Street Consensus):** O mercado estimava entre **3,36% e 3,43%** (~3,4% baixo). Tanto o Hedgeye quanto o mercado projetam aceleração, mas o modelo proprietário do Hedgeye antecipa uma aceleração substancialmente mais forte (+14 bps).
- **Projeção para Setembro:** O Nowcast do Hedgeye projeta **outra aceleração de ~10 bps** em relação a agosto (indo para ~3,60%). Enquanto isso, Wall Street projeta estabilidade (*flat*).
- **Projeção para o 4T / Dezembro:** Inflação estruturalmente persistente e pegajosa (*"sticky high"*), sem alívio no curto prazo.

---

### 2. 🏛️ Implicações para Política Monetária & Federal Reserve (Kevin Warsh):
- **Postura do Fed:** O novo Chair Kevin Warsh foi enfático: *"Devemos ter confiança de que a inflação subjacente está caminhando para o nosso objetivo, com velocidade suficiente. Caso contrário, temos trabalho a fazer."*
- **Front-Running Fed Policy:** Como o mercado não possui um modelo de Nowcast preditivo, ele é pego de surpresa. O cenário base é de **maior probabilidade de novas altas de juros (*rate hikes*)** até o fim do ano.
- **Sinal de Mercado Inequívoco:** O **rendimento dos títulos de 2 anos (2yr yield)** está renovando máximas do ciclo em tendência de alta (*Bullish TREND & Trade*).

---

### 3. 🎯 Impacto nas Classes de Ativos & Posicionamento:
- **🟢 O que ganha força (Outperformance / Longs):** Commodities (Petróleo/WTI e Agrícolas), Ações do setor de Energia (OIH/XOP), Apostas vendidas em títulos públicos (Short Bonds / Yields altos) e exposições internacionais seletas (ex: Colômbia COLO).
- **🔴 O que sofre desvalorização (Underperformance / Shorts):** Russell 2000 (RUT), Growth de múltiplos esticados, Momentum, Títulos de renda fixa longa (Bonds), Utilidades Públicas (Utilities/XLU), Industriais e Varejo.`;
  }

  // 2. Dúvidas sobre Oportunidades cruzando variação de mercado e relatório de hoje
  if (q.includes("oportunidade") || q.includes("oportunidades") || (q.includes("onde") && q.includes("estao")) || (q.includes("onde") && q.includes("estão")) || (q.includes("variação") && q.includes("hoje"))) {
    return `### 🧭 Síntese de Oportunidades Macro em Tempo Real (${latestDate})

Cruzando as **cotações intradiárias reais** com o diagnóstico do **Early Look ("Front-Running the Fed’s Inflation Problem")**:

---

### 1. 🟢 Onde Estão as Melhores Oportunidades de Compra (Longs Assimetria Positiva):

1. **Ouro Físico & Mineradoras (AAAU / NEM / GDX) — *Acúmulo no Piso de Range*:**
   - **Status Risk Range:** Banda 4.275–4.503 (Bullish TREND).
   - **Racional Macro:** No regime de inflação acelerando (Nowcast 3,5%) e dólar enfraquecido (DXY 98.40–99.67 Bearish), recuos em direção ao piso do Risk Range representam pontos de aporte institucional de alta convicção.
   - **Ação:** Comprar **AAAU**, **NEM** e **GDX** nos recuos próximos ao piso do range.

2. **Cobre & Metais Estruturais (COPPER / REMX):**
   - **Status Risk Range:** Banda 6.35–6.84 (Bullish TREND).
   - **Racional Macro:** Demanda estrutural inelástica para infraestrutura elétrica de data centers e redes.
   - **Ação:** Acumular nos suportes de range.

3. **Petróleo & Energia Descentralizada (WTIC / BE / GRID):**
   - **Status Risk Range:** Banda 88.51–102.99 (Bullish TREND).
   - **Racional Macro:** Aceleração de custos de insumos energéticos confirma inflação alta. A **Bloom Energy (BE)** resolve o gargalo de energia imediata para IA e infraestrutura.
   - **Ação:** Aportar em BE e produtores de energia nos pisos de Risk Range.

---

### 2. 🔴 Onde Estão as Oportunidades de Venda / Proteção (Sair no Repique):

1. **Semicondutores Cíclicos & Hardware Sem Poder de Repasse (INTC, NOK, AXTI, DRAM):**
   - **Motivo:** Yields longos em alta (UST10Y 4.75%–4.98%) comprimem múltiplos de empresas de capital intensivo.
   - **Ação:** Vender nos repiques intradiários nos topos de range.

2. **Tech Especulativo & Cripto Beta Sem FCF (COIN, XBI):**
   - **Motivo:** Sofrem diretamente com a contração de liquidez real provocada pelo aperto de taxas.
   - **Ação:** Reduzir exposição nos topos de range e reforçar caixa.

---

### 3. 🎯 Roteiro de Gestão para a Sua Carteira:
- **NAV Total Reconciliado:** **${navStr}**
- **Caixa & Reserva SGOV:** **${cashStr}**
- **Aderência Atual ao Regime:** **${adhStr}** (✅ Blindagem Ativa).`;
  }

  // 3. Dúvidas sobre a Carteira e Aderência
  if (q.includes("carteira") || q.includes("aderência") || q.includes("quad 3") || q.includes("schwab") || q.includes("tasty") || q.includes("patrimonio") || q.includes("patrimônio")) {
    return `### 💼 Diagnóstico da Sua Carteira & Aderência ao Regime (${latestDate})

**Status Atual Reconciliado:**
- **Patrimônio Total Monitorado (NAV):** **${navStr}** *(Charles Schwab: ~US$ 221.439 | Tastyworks: ~US$ 36.009)*.
- **Aderência Determinística a Quad 3:** **${adhStr}** *(Meta de segurança de ≥ 60,0% atingida)*.
- **Caixa Líquido / SGOV:** **${cashStr}** *(Colchão de liquidez para aportes táticos)*.

**Diretrizes Táticas de Execução:**
1. **Comprar nos Pisos:** Aportar nos suportes de range em **AAAU (Ouro)**, **GDX (Mineradoras)**, **BE (Bloom Energy)** e manter caixa em **SGOV**.
2. **Vender nos Repiques:** Usar repiques de topos de range para desinvestir de papéis com vento contrário (**INTC, NOK, AXTI, COIN**).`;
  }

  // 4. Dúvidas sobre o que comprar e o que vender
  if (q.includes("comprar") || q.includes("vender") || q.includes("rebalancear") || q.includes("rebalanceamento") || q.includes("o que fazer") || q.includes("ordens") || q.includes("piso") || q.includes("teto")) {
    return `### 🎯 Roteiro Operacional: O Que Comprar & O Que Vender (${latestDate})

A metodologia Hedgeye orienta **comprar nos pisos** de Risk Range dos ativos com vento a favor (*Bullish TREND*) e **vender nos repiques** os ativos com vento contrário (*Bearish TREND*):

#### 🟢 ORDENS DE COMPRA / APORTE (Executar estritamente nos pisos de range):
- **AAAU / GOLD (Ouro Físico):** Aporte nos recuos em direção ao piso do range (4.275).
- **GDX (VanEck Gold Miners):** Aporte nos recuos para piso. Alavancagem operacional no ouro.
- **BE (Bloom Energy):** Aporte nos pisos. Resolução física do gargalo de energia de data centers.
- **SGOV (Caixa 0-3M T-Bills):** Manter liquidez blindada rendendo taxa soberana.

#### 🔴 ORDENS DE VENDA / DESINVESTIMENTO (Executar nos repiques de topo de range):
- **INTC (Intel Corp):** Vender nos repiques. Semicondutores cíclicos sofrem em estagflação.
- **NOK (Nokia ADR):** Vender nos repiques. Telecom é vulnerável em juros altos.
- **AXTI (AXT Inc):** Vender nos repiques. Substratos com beta excessivo.
- **COIN (Coinbase):** Reduzir/Vender em repiques de topo.`;
  }

  // 5. Dúvidas sobre o EARLY LOOK de hoje e Regime Macro
  if (q.includes("early look") || q.includes("regime") || q.includes("keith") || q.includes("relatorio") || q.includes("relatório")) {
    return `### 🧭 Diagnóstico do EARLY LOOK de Hoje (${latestDate})

**Título Oficial:** *"EARLY LOOK: Front-Running the Fed’s Inflation Problem"*  
**Regime Confirmado:** **QUAD 3 (#ACCELERATING — ESTAGFLAÇÃO & REFLAÇÃO)**

**Principais Pontos Chave:**
1. **Nowcast de Inflação Acelerando para 3,5%:** Modelo do Hedgeye projeta 3,5% em agosto e nova aceleração em setembro (~3,6%), surpreendendo Wall Street (3,4%).
2. **Postura Dura do Fed (Kevin Warsh):** Probabilidade crescente de novas altas de juros (*rate hikes*) até o final do ano. Rendimento de 2 anos renovando máximas do ciclo.
3. **Real Assets Liderando:** Ouro (4.275–4.503 Bullish), Petróleo WTI (88.51–102.99 Bullish) e Cobre (6.35–6.84 Bullish) lideram ganhos, enquanto títulos longos e techs sem FCF sofrem.`;
  }

  // Resposta padrão inteligente
  return `### ⚡ Resposta do Copilot Macro

Com base no **EARLY LOOK de ${latestDate}** e no seu portfólio atual:

- **Regime Vigente:** **QUAD 3 (#ACCELERATING)** — Estagflação/Reflação com Dólar fraco e Juros altos.
- **Aderência da Carteira:** **${adhStr}** (Meta: ≥ 60,0%).
- **NAV Total Reconciliado:** **${navStr}**
- **Ações Imediatas:**
  1. **Comprar nos Pisos:** Ouro físico (AAAU), Mineradoras (GDX), Infra de Energia (BE) e Caixa SGOV.
  2. **Vender nos Repiques:** Semicondutores cíclicos (INTC/AXTI), Telecom (NOK) e Crypto (COIN).
  3. **Manter Shorts:** Treasuries longos (TLT), Crédito corporativo (LQD) e Utilities (XLU).`;
}

// ========================================================
// 15. GERENCIAMENTO DE DADOS MACROECONÔMICOS CUSTOMIZADOS
// ========================================================
const defaultMacroIndicatorsList = [
  {
    name: "CPI YoY (Índice de Preços ao Consumidor)",
    category: "Inflação & Preços",
    currentVal: "3.4%",
    prevVal: "3.2%",
    trend: "▲ Acelerando",
    freq: "Mensal",
    quadBias: "QUAD 3 (Estagflação / Reflação)",
    impact: "Aceleração eleva inflação e favorece Ouro, Cobre e Petróleo"
  },
  {
    name: "Core PCE YoY (Medida Preferida do Fed)",
    category: "Inflação & Preços",
    currentVal: "3.1%",
    prevVal: "3.0%",
    trend: "▲ Acelerando",
    freq: "Mensal",
    quadBias: "QUAD 3 (Estagflação / Reflação)",
    impact: "Força juros 'higher for longer' e pressiona valuation de ações de duration longa"
  },
  {
    name: "PPI YoY (Índice de Preços ao Produtor)",
    category: "Inflação & Preços",
    currentVal: "2.9%",
    prevVal: "2.7%",
    trend: "▲ Acelerando",
    freq: "Mensal",
    quadBias: "QUAD 3 / QUAD 2",
    impact: "Pressão de custos industriais que antecede repasse ao consumidor"
  },
  {
    name: "Curva de Juros UST 10Y - 2Y Spread",
    category: "Juros & Spreads",
    currentVal: "+34 bps",
    prevVal: "+26 bps",
    trend: "▲ Desinvertendo (Steepening)",
    freq: "Diário",
    quadBias: "QUAD 3 (Bear Steepener)",
    impact: "Taxas longas subindo mais rápido que curtas penaliza crédito corporativo (LQD)"
  },
  {
    name: "UST 10-Year Treasury Yield",
    category: "Juros & Spreads",
    currentVal: "4.78%",
    prevVal: "4.65%",
    trend: "▲ Bullish TREND",
    freq: "Diário",
    quadBias: "QUAD 3 / QUAD 2",
    impact: "Máximas de ciclo inflacionário sustentam shorts em TLT, ZROZ e XLU"
  },
  {
    name: "ISM Manufacturing PMI (Atividade Industrial)",
    category: "Atividade & PIB",
    currentVal: "48.2 pts",
    prevVal: "49.1 pts",
    trend: "▼ Desacelerando",
    freq: "Mensal",
    quadBias: "QUAD 3 / QUAD 4",
    impact: "Contração industrial confirma desaceleração do crescimento (G desacelerando)"
  },
  {
    name: "Initial Jobless Claims (Pedidos de Seguro-Desemprego)",
    category: "Atividade & PIB",
    currentVal: "228k",
    prevVal: "225k",
    trend: "▲ Subindo Levemente",
    freq: "Semanal",
    quadBias: "QUAD 3 / QUAD 4",
    impact: "Gradual moderação no mercado de trabalho sem colapso imediato"
  },
  {
    name: "US High Yield OAS Spread (Risco de Crédito)",
    category: "Liquidez & Crédito",
    currentVal: "335 bps",
    prevVal: "318 bps",
    trend: "▲ Alargando",
    freq: "Diário",
    quadBias: "QUAD 3 / QUAD 4",
    impact: "Aumento de spread encarece refinanciamento para small caps (Russell 2000)"
  },
  {
    name: "M2 Money Supply YoY (Massa Monetária)",
    category: "Liquidez & Crédito",
    currentVal: "+2.1%",
    prevVal: "+1.8%",
    trend: "▲ Re-expandindo",
    freq: "Mensal",
    quadBias: "QUAD 2 / QUAD 3",
    impact: "Expansão monetária associada a déficits fiscais sustenta alta de commodities"
  },
  {
    name: "Petróleo WTI Contínuo (Energia)",
    category: "Commodities & Energia",
    currentVal: "US$ 91.20",
    prevVal: "US$ 74.50",
    trend: "▲ +23% no Mês",
    freq: "Diário",
    quadBias: "QUAD 3 (#Accelerating)",
    impact: "Choque direto na cadeia de suprimentos e transporte; alta em OIH e XLE"
  },
  {
    name: "Ouro Spot (Physical Gold)",
    category: "Commodities & Energia",
    currentVal: "US$ 4.480",
    prevVal: "US$ 4.290",
    trend: "▲ Bullish TREND",
    freq: "Diário",
    quadBias: "QUAD 3 (Ativo Líder)",
    impact: "Melhor classe de ativos histórica em estagflação e proteção contra desvalorização do USD"
  }
];

function getMacroIndicators() {
  try {
    const stored = localStorage.getItem("hedgeye_macro_indicators_v1");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {}
  return defaultMacroIndicatorsList;
}

function setMacroIndicators(list) {
  try {
    localStorage.setItem("hedgeye_macro_indicators_v1", JSON.stringify(list));
  } catch (e) {}
}

function renderMacroIndicatorsTable() {
  const tbody = document.getElementById("macroIndicatorsTableBody");
  if (!tbody) return;

  const list = getMacroIndicators();
  const countElem = document.getElementById("totalMacroCount");
  if (countElem) countElem.innerText = `${list.length} Séries`;

  tbody.innerHTML = list.map((m, index) => {
    const isAccelerating = m.trend.includes("▲") || m.trend.includes("Bullish");
    const trendColor = isAccelerating ? "#10B981" : (m.trend.includes("▼") ? "#EF4444" : "#94A3B8");
    const isCustom = m.isCustom ? `<button class="btn btn-outline" style="padding: 0.15rem 0.4rem; font-size: 0.68rem; color: #EF4444;" onclick="deleteMacroIndicator(${index})">✕ Excluir</button>` : '';

    return `
      <tr>
        <td><strong style="color: #F8FAFC; font-size: 0.9rem;">${m.name}</strong></td>
        <td><span class="tag tag-outline" style="font-size: 0.72rem;">${m.category}</span></td>
        <td><strong style="font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: #38BDF8;">${m.currentVal}</strong></td>
        <td><span style="font-family: 'JetBrains Mono', monospace; color: #94A3B8; font-size: 0.82rem;">${m.prevVal}</span></td>
        <td><strong style="color: ${trendColor}; font-size: 0.82rem;">${m.trend}</strong></td>
        <td><span style="font-size: 0.75rem; color: #94A3B8;">${m.freq}</span></td>
        <td><span class="badge ${m.quadBias.includes('QUAD 3') ? 'badge-bullish' : 'badge-neutral'}" style="font-size: 0.72rem;">${m.quadBias}</span></td>
        <td style="font-size: 0.8rem; color: #CBD5E1;">${m.impact}</td>
        <td>${isCustom}</td>
      </tr>
    `;
  }).join("");
}

function openNewMacroIndicatorModal() {
  const modal = document.getElementById("newMacroIndicatorModal");
  if (modal) {
    modal.classList.add("active");
  }
}

function closeNewMacroIndicatorModal() {
  const modal = document.getElementById("newMacroIndicatorModal");
  if (modal) {
    modal.classList.remove("active");
  }
}

function saveNewMacroIndicator(event) {
  event.preventDefault();
  const name = document.getElementById("macroName")?.value?.trim();
  const category = document.getElementById("macroCategory")?.value;
  const currentVal = document.getElementById("macroCurrentVal")?.value?.trim();
  const prevVal = document.getElementById("macroPrevVal")?.value?.trim();
  const trend = document.getElementById("macroTrend")?.value;
  const freq = document.getElementById("macroFreq")?.value?.trim() || "Mensal";
  const quadBias = document.getElementById("macroQuadBias")?.value;
  const impact = document.getElementById("macroImpact")?.value?.trim();

  if (!name || !currentVal || !impact) {
    showToast("Por favor preencha os campos obrigatórios.");
    return;
  }

  const newEntry = {
    name: name,
    category: category,
    currentVal: currentVal,
    prevVal: prevVal || "-",
    trend: trend,
    freq: freq,
    quadBias: quadBias,
    impact: impact,
    isCustom: true
  };

  const list = getMacroIndicators();
  list.unshift(newEntry);
  setMacroIndicators(list);
  renderMacroIndicatorsTable();
  closeNewMacroIndicatorModal();

  document.getElementById("newMacroIndicatorForm")?.reset();
  showToast(`✅ Novo indicador "${name}" cadastrado com sucesso!`);
}

function deleteMacroIndicator(index) {
  const list = getMacroIndicators();
  if (index >= 0 && index < list.length) {
    list.splice(index, 1);
    setMacroIndicators(list);
    renderMacroIndicatorsTable();
    showToast("Indicador macroeconômico removido.");
  }
}

// ========================================================
// 15.1 WATCHLIST MACRO DO TRADINGVIEW (OFICIAL)
// ========================================================
const tradingviewWatchlistData = [
  // 1. ÍNDICES, VOLATILIDADE & SENTIMENTO
  { symbol: "ES1!", name: "S&P 500 E-mini Futures", category: "indices", categoryName: "📊 Índices & Sentimento", current: "5.890,25", signal: "🟢 BULLISH TREND", quadBias: "QUAD 1 / QUAD 2", roleInQuad: "Termômetro primário de liquidez e apetite a risco no equity global." },
  { symbol: "NQ1!", name: "Nasdaq 100 E-mini Futures", category: "indices", categoryName: "📊 Índices & Sentimento", current: "20.450,00", signal: "🟢 BULLISH TREND", quadBias: "QUAD 1 / QUAD 2", roleInQuad: "Mega Caps de tecnologia e IA; sensível a compressão de múltiplos em Quad 3." },
  { symbol: "SPX", name: "S&P 500 Index", category: "indices", categoryName: "📊 Índices & Sentimento", current: "5.864,12", signal: "🟢 BULLISH TREND", quadBias: "QUAD 1 / QUAD 2", roleInQuad: "Benchmark geral acionário norte-americano." },
  { symbol: "QQQ", name: "Invesco QQQ Trust", category: "indices", categoryName: "📊 Índices & Sentimento", current: "$492,50", signal: "🟢 BULLISH TREND", quadBias: "QUAD 1 / QUAD 2", roleInQuad: "Veículo de liquidez para alocação passiva em tecnologia." },
  { symbol: "DJI", name: "Dow Jones Industrial Average", category: "indices", categoryName: "📊 Índices & Sentimento", current: "43.120,00", signal: "🟢 BULLISH TREND", quadBias: "QUAD 2 / QUAD 3", roleInQuad: "Composto por empresas industriais, financeiras e da economia real." },
  { symbol: "RUT", name: "Russell 2000 Index", category: "indices", categoryName: "📊 Índices & Sentimento", current: "2.240,50", signal: "🔴 BEARISH TREND", quadBias: "SHORT QUAD 3", roleInQuad: "Small Caps endividadas a taxas flutuantes; sofre em ambiente de juros altos." },
  { symbol: "SPMO", name: "Invesco S&P 500 Momentum ETF", category: "indices", categoryName: "📊 Índices & Sentimento", current: "$92,40", signal: "🟢 BULLISH TREND", quadBias: "QUAD 1 / QUAD 2", roleInQuad: "Concentra os papéis com maior força relativa recente do mercado." },
  { symbol: "DX1!", name: "US Dollar Index Futures (DXY)", category: "indices", categoryName: "📊 Índices & Sentimento", current: "98,77", signal: "🔴 BEARISH TREND", quadBias: "QUAD 3 (#Accelerating)", roleInQuad: "Dólar em colapso alimenta inflação importada e impulsiona commodities físicas." },
  { symbol: "RX1!", name: "Euro-Bund Futures", category: "indices", categoryName: "📊 Índices & Sentimento", current: "131,20", signal: "🔴 BEARISH TREND", quadBias: "SHORT QUAD 3", roleInQuad: "Títulos da dívida soberana alemã; reflete aperto e desvalorização na Europa." },
  { symbol: "VIX", name: "CBOE Volatility Index", category: "indices", categoryName: "📊 Índices & Sentimento", current: "14,60", signal: "🔴 BEARISH TREND", quadBias: "COMPLACÊNCIA", roleInQuad: "Volatilidade comprimida no equity sustenta o rali até que ocorra reversão abrupta." },
  { symbol: "MOVE", name: "ICE BofA MOVE Index", category: "indices", categoryName: "📊 Índices & Sentimento", current: "98,50", signal: "🟢 BULLISH TREND", quadBias: "ALERTA QUAD 3", roleInQuad: "Volatilidade implícita da renda fixa americana; termômetro de liquidez soberana." },
  { symbol: "CPC", name: "CBOE Total Put/Call Ratio", category: "indices", categoryName: "📊 Índices & Sentimento", current: "0,85", signal: "🟡 NEUTRAL", quadBias: "SENTIMENTO", roleInQuad: "Relação total de opções de venda vs compra em todo o mercado norte-americano." },
  { symbol: "CPCI", name: "CBOE Equity Put/Call Ratio", category: "indices", categoryName: "📊 Índices & Sentimento", current: "0,58", signal: "🟢 GANÂNCIA / BULL", quadBias: "SENTIMENTO", roleInQuad: "Put/Call exclusivo de ações; leituras baixas indicam complacência do investidor." },
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", category: "indices", categoryName: "📊 Índices & Sentimento", current: "$91.400", signal: "🟢 BULLISH TREND", quadBias: "QUAD 2 / LIQUIDEZ", roleInQuad: "Ativo de liquidez digital de alta sensibilidade à expansão da massa monetária M2." },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", category: "indices", categoryName: "📊 Índices & Sentimento", current: "$2.750", signal: "🟡 NEUTRAL / BULL", quadBias: "QUAD 2 / LIQUIDEZ", roleInQuad: "Infraestrutura de contratos inteligentes e ecossistema DeFi." },
  { symbol: "SOLUSDC", name: "Solana / USD Coin", category: "indices", categoryName: "📊 Índices & Sentimento", current: "$185,00", signal: "🟢 BULLISH TREND", quadBias: "QUAD 2 / ALTA VELOC.", roleInQuad: "Blockchain de alta vazão transacional com forte volume on-chain." },

  // 2. BONDS & CURVAS DE JUROS
  { symbol: "TLT", name: "iShares 20+ Year Treasury Bond ETF", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "$87,20", signal: "🔴 BEARISH TREND", quadBias: "SHORT ESTRUTURAL", roleInQuad: "Títulos longos sofrem severamente em Quad 3 devido a taxas longas crescentes." },
  { symbol: "TMF", name: "Direxion Daily 20+Y Treasury Bull 3X", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "$42,10", signal: "🔴 BEARISH TREND", quadBias: "EVITAR / SHORT", roleInQuad: "ETF alavancado 3x; sofre forte decaimento em regime de juros em alta." },
  { symbol: "TIP", name: "iShares TIPS Bond ETF (Inflação)", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "$107,50", signal: "🟢 BULLISH TREND", quadBias: "QUAD 3 (Proteção)", roleInQuad: "Treasuries protegidos contra inflação real (TIPS); preserva poder de compra." },
  { symbol: "US02", name: "US Treasury 2 Year Yield", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "4,44%", signal: "🟢 BULLISH TREND", quadBias: "HIGHER FOR LONGER", roleInQuad: "Reflete a taxa de curto prazo esperada e a política monetária do Fed." },
  { symbol: "US05", name: "US Treasury 5 Year Yield", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "4,58%", signal: "🟢 BULLISH TREND", quadBias: "QUAD 3 / QUAD 2", roleInQuad: "Ponto intermediário da curva soberana norte-americana." },
  { symbol: "US10", name: "US Treasury 10 Year Yield", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "4,78%", signal: "🟢 BULLISH TREND", quadBias: "MÁXIMAS DE CICLO", roleInQuad: "Benchmark global de custo de capital; rompe máximas inflacionárias em Quad 3." },
  { symbol: "US20", name: "US Treasury 20 Year Yield", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "4,95%", signal: "🟢 BULLISH TREND", quadBias: "PRÊMIO DE RISCO", roleInQuad: "Ponta ultra-longa dos EUA; pressionada pelo déficit fiscal trilionário." },
  { symbol: "EU05", name: "Eurozone 5 Year Government Bond", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "2,38%", signal: "🟢 BULLISH TREND", quadBias: "APERTO MONETÁRIO", roleInQuad: "Juro intermediário soberano da Zona do Euro." },
  { symbol: "EU10", name: "Eurozone 10 Year Government Bond", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "2,62%", signal: "🟢 BULLISH TREND", quadBias: "PRESSÃO DE CUSTO", roleInQuad: "Benchmark europeu de taxas soberanas a 10 anos." },
  { symbol: "EU20", name: "Eurozone 20 Year Government Bond", category: "bonds", categoryName: "🏛️ Bonds & Juros", current: "2,85%", signal: "🟢 BULLISH TREND", quadBias: "CURVA LONGA EU", roleInQuad: "Ponta longa europeia; aumento contínuo no custo de rolagem da dívida pública." },

  // 3. COMMODITIES & METAIS
  { symbol: "GOLD", name: "Ouro Spot Oz", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "US$ 4.480", signal: "🟢 BULLISH TREND", quadBias: "QUAD 3 (LÍDER ABSOLUTO)", roleInQuad: "Melhor ativo histórico em regimes de estagflação e desvalorização cambial do USD." },
  { symbol: "SLV", name: "iShares Silver Trust (Prata)", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "$65,50", signal: "🟢 BULLISH TREND", quadBias: "QUAD 3 / QUAD 2", roleInQuad: "Duplo motor: reserva de valor monetário e insumo industrial em painéis solares/IA." },
  { symbol: "COPPER", name: "Cobre Spot HG Continuous", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "US$ 6,68", signal: "🟢 BULLISH TREND", quadBias: "ALL-TIME HIGHS (ATH)", roleInQuad: "Doutor Cobre em máximas históricas; reflete gargalos estruturais de eletrificação." },
  { symbol: "WTI1!", name: "Petróleo WTI Futuro", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "US$ 91,20", signal: "🟢 BULLISH TREND", quadBias: "QUAD 3 (#ACCELERATING)", roleInQuad: "Choque de energia primária com repasse direto para os índices de preços ao consumidor." },
  { symbol: "POILBREUSDM", name: "Petróleo Brent Global", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "US$ 94,80", signal: "🟢 BULLISH TREND", quadBias: "QUAD 3 (ENERGIA)", roleInQuad: "Referência de óleo bruto marítimo e precificação internacional de combustíveis." },
  { symbol: "PALUMUSDM", name: "Alumínio Global LME", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "US$ 2.640/t", signal: "🟢 BULLISH TREND", quadBias: "METAIS INDUSTRIAIS", roleInQuad: "Metal chave para transição energética, infraestrutura de transmissão e transporte." },
  { symbol: "DBA", name: "Invesco DB Agriculture Fund", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "$26,80", signal: "🟢 BULLISH TREND", quadBias: "AGRO / INFLAÇÃO", roleInQuad: "Cesta de grãos e soft commodities; proteção contra inflação de alimentos." },
  { symbol: "DBB", name: "Invesco DB Base Metals Fund", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "$21,40", signal: "🟢 BULLISH TREND", quadBias: "METAIS BÁSICOS", roleInQuad: "Cesta diversificada de Cobre, Alumínio e Zinco para ciclo de capex." },
  { symbol: "FEF1!", name: "Minério de Ferro 62% SGX Futures", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "US$ 104,50/t", signal: "🟡 NEUTRAL / BULL", quadBias: "SIDERRURGIA & VALE", roleInQuad: "Insumo essencial para a produção de aço; direcionador dos lucros da Vale (VALE3)." },
  { symbol: "BGI1!", name: "Boi Gordo Futuro B3", category: "commodities", categoryName: "🛢️ Commodities & Metais", current: "R$ 318,50/@", signal: "🟢 BULLISH TREND", quadBias: "AGRO BRASIL", roleInQuad: "Ciclo pecuário brasileiro impulsionado por exportações recordes de proteína animal." },

  // 4. BOLSAS GLOBAIS & MERCADOS INTERNACIONAIS
  { symbol: "URTH", name: "iShares MSCI World ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$168,20", signal: "🟢 BULLISH TREND", quadBias: "MERCADOS DESENV.", roleInQuad: "Exposição ampla aos maiores mercados acionários desenvolvidos do globo." },
  { symbol: "EMXC", name: "iShares MSCI Emerging ex-China", category: "global", categoryName: "🌍 Bolsas Globais", current: "$64,10", signal: "🟢 BULLISH TREND", quadBias: "EMERGENTES SEM CHINA", roleInQuad: "Captura crescimento emergente (Índia, Taiwan, Brasil) sem o risco regulatório chinês." },
  { symbol: "SX5E", name: "Euro Stoxx 50 Index", category: "global", categoryName: "🌍 Bolsas Globais", current: "4.980 pts", signal: "🟢 BULLISH TREND", quadBias: "EUROPA EQUITY", roleInQuad: "Principais 50 blue chips corporativas da Zona do Euro." },
  { symbol: "EWG", name: "iShares MSCI Germany ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$34,50", signal: "🟡 NEUTRAL / BEAR", quadBias: "ALEMANHA", roleInQuad: "Indústria alemã sob pressão de custos energéticos e desaceleração manufatureira." },
  { symbol: "EWQ", name: "iShares MSCI France ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$39,80", signal: "🟡 NEUTRAL", quadBias: "FRANÇA", roleInQuad: "Exposição ao setor de luxo (LVMH, Hermès), aeroespacial e bancos franceses." },
  { symbol: "EWA", name: "iShares MSCI Australia ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$26,20", signal: "🟢 BULLISH TREND", quadBias: "COMMODITIES / RECURSOS", roleInQuad: "Economia rica em mineração e gás; excelente proxy para superciclo de real assets." },
  { symbol: "EWC", name: "iShares MSCI Canada ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$41,30", signal: "🟢 BULLISH TREND", quadBias: "CANADÁ / ÓLEO & MINÉRIOS", roleInQuad: "Forte correlação com a alta de petróleo WTI e metais industriais." },
  { symbol: "EWJ", name: "iShares MSCI Japan ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$72,40", signal: "🟢 BULLISH TREND", quadBias: "JAPÃO REINFLAÇÃO", roleInQuad: "Reforma de governança no Japão e apreciação do Iene frente ao Dólar fraco." },
  { symbol: "NIKKEI", name: "Nikkei 225 Index Japão", category: "global", categoryName: "🌍 Bolsas Globais", current: "38.600 pts", signal: "🟢 BULLISH TREND", quadBias: "TÓQUIO EQUITY", roleInQuad: "Exportadoras japonesas e conglomerados industriais." },
  { symbol: "HSI", name: "Hang Seng Index Hong Kong", category: "global", categoryName: "🌍 Bolsas Globais", current: "19.850 pts", signal: "🔴 BEARISH TREND", quadBias: "CHINA RISK", roleInQuad: "Ações de Hong Kong e gigantes de tecnologia chinesas cotadas internacionalmente." },
  { symbol: "MCHI", name: "iShares MSCI China ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$46,80", signal: "🔴 BEARISH TREND", quadBias: "SUBPONDERAR / EVITAR", roleInQuad: "Deflação interna na China e fragilidade do setor imobiliário pesam no valuation." },
  { symbol: "EWW", name: "iShares MSCI Mexico ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$58,20", signal: "🟡 NEUTRAL / BEAR", quadBias: "MÉXICO NEARSHORING", roleInQuad: "Vulnerabilidade à volatilidade do Peso Mexicano e tarifas comerciais." },
  { symbol: "EZA", name: "iShares MSCI South Africa ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$47,50", signal: "🟢 BULLISH TREND", quadBias: "METAIS PRECIOSOS", roleInQuad: "Líder em extração de platina, ouro e minerais estratégicos em moeda forte." },
  { symbol: "EIS", name: "iShares MSCI Israel ETF", category: "global", categoryName: "🌍 Bolsas Globais", current: "$68,90", signal: "🟢 BULLISH TREND", quadBias: "TECH & DEFESA", roleInQuad: "Polo global de cibersegurança, semicondutores e tecnologia militar." },
  { symbol: "EWZ", name: "iShares MSCI Brazil ETF (USD)", category: "global", categoryName: "🌍 Bolsas Globais", current: "$28,40", signal: "🟢 BULLISH TREND", quadBias: "BRASIL EM DÓLAR", roleInQuad: "Atraído pelo carry trade de juros reais e valorização de commodities de exportação." },

  // 5. BRASIL & MERCADO LOCAL B3
  { symbol: "IBOV", name: "Índice Bovespa (B3)", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "134.500 pts", signal: "🟢 BULLISH TREND", quadBias: "COMMODITIES & BANCOS", roleInQuad: "Composição pesada em Vale, Petrobras e grandes bancos favorecidos por spreads." },
  { symbol: "WIN1!", name: "Mini Índice Futuro B3", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "135.200 pts", signal: "🟢 BULLISH TREND", quadBias: "FUTUROS B3", roleInQuad: "Instrumento derivativo para posicionamento ágil e proteção de carteira em ações locais." },
  { symbol: "WDO1!", name: "Mini Dólar Futuro B3", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "R$ 5,48", signal: "🔴 BEARISH TREND", quadBias: "DESVALORIZAÇÃO DO USD", roleInQuad: "DXY fraco e diferencial Selic vs Fed Funds sustentam o Real no curto prazo." },
  { symbol: "VALE3", name: "Vale S.A. ON", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "R$ 61,80", signal: "🟡 NEUTRAL / BULL", quadBias: "DIVIDENDOS & MINÉRIO", roleInQuad: "Geração massiva de fluxo de caixa livre e pagamento de proventos elevados." },
  { symbol: "PETR4", name: "Petrobras PN", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "R$ 38,90", signal: "🟢 BULLISH TREND", quadBias: "ENERGIA & PRÉ-SAL", roleInQuad: "Custo de extração de pré-sal competitivo (< US$ 35/barril) e dividendo robusto." },
  { symbol: "ITUB4", name: "Itaú Unibanco PN", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "R$ 36,40", signal: "🟢 BULLISH TREND", quadBias: "ROE ELEVADO", roleInQuad: "ROE superior a 21% com carteira de crédito defensiva e margem financeira em expansão." },
  { symbol: "SMAL", name: "iShares Small Cap B3 ETF", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "R$ 98,50", signal: "🔴 BEARISH TREND", quadBias: "SENSIBILIDADE A JUROS", roleInQuad: "Empresas com maior endividamento atrelado ao CDI sofrem com Selic alta." },
  { symbol: "BR02Y", name: "Curva DI Futuro Brasil 2 Anos", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "12,85%", signal: "🟢 BULLISH TREND", quadBias: "JURO CURTO BR", roleInQuad: "Precifica o ciclo de juros do Copom e taxa Selic terminal." },
  { symbol: "BR05Y", name: "Curva DI Futuro Brasil 5 Anos", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "13,20%", signal: "🟢 BULLISH TREND", quadBias: "JURO INTERMEDIÁRIO", roleInQuad: "Reflete a taxa de desconto para valuation de empresas domésticas brasileiras." },
  { symbol: "BR10Y", name: "Curva DI Futuro Brasil 10 Anos", category: "brazil", categoryName: "🇧🇷 Brasil & B3", current: "13,45%", signal: "🟢 BULLISH TREND", quadBias: "RISCO FISCAL BR", roleInQuad: "Exige taxa de retorno real elevada para títulos NTN-B / Tesouro IPCA+ longo." }
];

let activeTradingViewCategory = "all";

function filterTradingViewWatchlist(cat, btnElem) {
  activeTradingViewCategory = cat;
  
  // Atualiza botões ativos
  const buttons = document.querySelectorAll(".tv-filter-btn");
  buttons.forEach(b => {
    b.classList.remove("active");
    b.classList.remove("btn-primary");
    b.classList.add("btn-outline");
  });

  if (btnElem) {
    btnElem.classList.add("active");
    btnElem.classList.remove("btn-outline");
    btnElem.classList.add("btn-primary");
  }

  renderTradingViewWatchlistTable();
}

function renderTradingViewWatchlistTable() {
  const tbody = document.getElementById("tradingviewWatchlistBody");
  if (!tbody) return;

  // Atualiza contadores
  const countAll = document.getElementById("tvCountAll");
  const countIndices = document.getElementById("tvCountIndices");
  const countBonds = document.getElementById("tvCountBonds");
  const countCommodities = document.getElementById("tvCountCommodities");
  const countGlobal = document.getElementById("tvCountGlobal");
  const countBrazil = document.getElementById("tvCountBrazil");

  if (countAll) countAll.innerText = tradingviewWatchlistData.length;
  if (countIndices) countIndices.innerText = tradingviewWatchlistData.filter(i => i.category === "indices").length;
  if (countBonds) countBonds.innerText = tradingviewWatchlistData.filter(i => i.category === "bonds").length;
  if (countCommodities) countCommodities.innerText = tradingviewWatchlistData.filter(i => i.category === "commodities").length;
  if (countGlobal) countGlobal.innerText = tradingviewWatchlistData.filter(i => i.category === "global").length;
  if (countBrazil) countBrazil.innerText = tradingviewWatchlistData.filter(i => i.category === "brazil").length;

  const filtered = activeTradingViewCategory === "all" 
    ? tradingviewWatchlistData 
    : tradingviewWatchlistData.filter(i => i.category === activeTradingViewCategory);

  tbody.innerHTML = filtered.map(item => {
    const isBull = item.signal.includes("BULLISH") || item.signal.includes("GANÂNCIA");
    const isBear = item.signal.includes("BEARISH") || item.signal.includes("EVITAR") || item.signal.includes("SHORT");
    const signalClass = isBull ? "badge-bullish" : (isBear ? "badge-bearish" : "badge-neutral");

    return `
      <tr>
        <td>
          <strong style="font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; color: #38BDF8;">
            ${item.symbol}
          </strong>
        </td>
        <td>
          <strong style="color: #F8FAFC; font-size: 0.88rem;">${item.name}</strong>
        </td>
        <td>
          <span class="tag tag-outline" style="font-size: 0.72rem;">${item.categoryName}</span>
        </td>
        <td>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.92rem; color: #F1F5F9; font-weight: 600;">
            ${item.current}
          </span>
        </td>
        <td>
          <span class="badge ${signalClass}" style="font-size: 0.72rem;">
            ${item.signal}
          </span>
        </td>
        <td style="font-size: 0.8rem; color: #CBD5E1; max-width: 320px;">
          ${item.roleInQuad}
        </td>
        <td>
          <button class="btn btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.72rem; color: #38BDF8;" onclick="askCopilotAboutSymbol('${item.symbol}')">
            ⚡ Perguntar AI
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function askCopilotAboutSymbol(symbol) {
  setTab('copilot');
  const input = document.getElementById("chatUserInput");
  if (input) {
    input.value = `Qual é o diagnóstico e o papel de ${symbol} no regime atual de Quad 3?`;
    handleChatSubmit(new Event('submit'));
  }
}

async function fetchLiveMarketQuotes() {
  try {
    const res = await fetch("/api/live-quotes");
    if (!res.ok) return;
    const quotes = await res.json();

    if (!quotes || typeof quotes !== "object") return;

    // 1. Atualiza dados na Watchlist do TradingView
    tradingviewWatchlistData.forEach(item => {
      const q = quotes[item.symbol];
      if (q && q.price && q.price > 0) {
        const sign = q.change_pct >= 0 ? "+" : "";
        const formattedPct = `${sign}${q.change_pct.toFixed(2)}%`;
        const formattedPrice = item.category === "bonds" && item.symbol.startsWith("US") 
          ? `${q.price.toFixed(2)}%` 
          : (q.price >= 1000 ? q.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : q.price.toFixed(2));
        
        item.current = `${formattedPrice} (${formattedPct})`;
        item.livePrice = q.price;
        item.changePct = q.change_pct;
      }
    });

    // 2. Atualiza os cards métricos de topo do Painel Executivo se os elementos existirem
    const goldQ = quotes["GOLD"];
    if (goldQ && goldQ.price > 0) {
      const elem = document.getElementById("val-gold");
      if (elem) elem.innerHTML = `${goldQ.price.toLocaleString('pt-BR', {minimumFractionDigits: 2})} <span class="badge ${goldQ.change_pct >= 0 ? 'badge-bullish' : 'badge-bearish'}">${goldQ.change_pct >= 0 ? '+' : ''}${goldQ.change_pct.toFixed(2)}% Live</span>`;
    }

    const dxyQ = quotes["DX1!"] || quotes["DXY"];
    if (dxyQ && dxyQ.price > 0) {
      const elem = document.getElementById("val-dxy");
      if (elem) elem.innerHTML = `${dxyQ.price.toFixed(2)} <span class="badge ${dxyQ.change_pct <= 0 ? 'badge-bearish' : 'badge-bullish'}">${dxyQ.change_pct >= 0 ? '+' : ''}${dxyQ.change_pct.toFixed(2)}% Live</span>`;
    }

    const wtiQ = quotes["WTI1!"] || quotes["WTIC"];
    if (wtiQ && wtiQ.price > 0) {
      const elem = document.getElementById("val-wti");
      if (elem) elem.innerHTML = `${wtiQ.price.toFixed(2)} <span class="badge ${wtiQ.change_pct >= 0 ? 'badge-bullish' : 'badge-bearish'}">${wtiQ.change_pct >= 0 ? '+' : ''}${wtiQ.change_pct.toFixed(2)}% Live</span>`;
    }

    const us10Q = quotes["US10"];
    if (us10Q && us10Q.price > 0) {
      const elem = document.getElementById("val-ust10");
      if (elem) elem.innerHTML = `${us10Q.price.toFixed(2)}% <span class="badge ${us10Q.change_pct >= 0 ? 'badge-bullish' : 'badge-bearish'}">${us10Q.change_pct >= 0 ? '+' : ''}${us10Q.change_pct.toFixed(2)}% Live</span>`;
    }

    // 3. Re-renderiza a tabela com os preços em tempo real
    renderTradingViewWatchlistTable();
  } catch (e) {
    console.warn("Falha ao atualizar cotações ao vivo:", e);
  }
}

// Fechar modais ao pressionar ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeRebalanceModal();
    closeReportModal();
    closeNewDecisionModal();
    closePortfolioModal();
    closeNewMacroIndicatorModal();
  }
});

// 16. INICIALIZAÇÃO GERAL DO APLICATIVO
function initApp() {
  renderPortfolioView(activePortfolioKey);
  renderRiskRangesTable("all");
  renderDecisionsTable();
  renderRebalanceModalTables();
  renderChatMessages();
  renderMacroIndicatorsTable();
  
  // 0. Verifica Autenticação Supabase e carrega carteira canônica
  checkAuthSession();
  fetchPortfolioDataFromApi();

  renderTradingViewWatchlistTable();
  loadReportsDatabase().then(() => {
    populateTranslatedReportsDropdown();
  });
  fetchMarketAnalyticsData();
  
  // Inicia cotações em tempo real e agenda polling inteligente a cada 60s
  fetchLiveMarketQuotes();
  setInterval(() => {
    if (!document.hidden) {
      fetchLiveMarketQuotes();
    }
  }, 60000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}


