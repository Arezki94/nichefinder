// ============================================
// NICHEFINDER V2.1 - COMPLETE
// ============================================
// Corrections:
// ✅ Fix scoring (plus strict)
// ✅ Fix tendances (graphique)
// ✅ Fix catégorisation (généralistes vs spécialistes)
// ✅ CPC moyen réel
// ✅ Messages nuancés
//
// Phase 2:
// ✅ Domain Rating (DR)
// ✅ Backlinks count
// ✅ Long-tail keywords
// ============================================

var http = require('http');
var fs = require('fs');
var path = require('path');
var axios = require('axios');

var GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
var DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || '';
var DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || '';
var PORT = process.env.PORT || 3000;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  🎯 NicheFinder v2.1 COMPLETE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Cache
var cache = { keywords: {}, serp: {}, trends: {}, backlinks: {}, longtail: {} };

setInterval(function() {
  var now = Date.now();
  var maxAge = 7 * 24 * 60 * 60 * 1000;
  Object.keys(cache).forEach(function(type) {
    Object.keys(cache[type]).forEach(function(key) {
      if (now - cache[type][key].timestamp > maxAge) delete cache[type][key];
    });
  });
}, 60 * 60 * 1000);

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

// Gemini
async function callGemini(prompt) {
  for (var i = 0; i < 3; i++) {
    try {
      var res = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + GEMINI_API_KEY,
        { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1000 } },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );
      return res.data.candidates[0].content.parts[0].text;
    } catch (e) {
      if (e.response && (e.response.status === 429 || e.response.status >= 500)) {
        await sleep(Math.pow(2, i + 1) * 1000);
        continue;
      }
      throw e;
    }
  }
  throw new Error('Gemini failed');
}

// DataForSEO
async function callAPI(endpoint, data) {
  var auth = Buffer.from(DATAFORSEO_LOGIN + ':' + DATAFORSEO_PASSWORD).toString('base64');
  var res = await axios.post('https://api.dataforseo.com/v3' + endpoint, data, {
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    timeout: 30000
  });
  return res.data;
}

// 1. Keywords + Google Ads
async function getKeywordData(kw) {
  var key = 'kw_' + kw.toLowerCase();
  if (cache.keywords[key] && Date.now() - cache.keywords[key].timestamp < 7 * 24 * 60 * 60 * 1000) {
    console.log('✅ Cache: keywords');
    return cache.keywords[key].data;
  }
  
  console.log('🔍 API: keywords + Google Ads');
  var result = await callAPI('/keywords_data/google_ads/search_volume/live', [{
    keywords: [kw],
    location_code: 2250,
    language_code: 'fr'
  }]);
  
  if (result.tasks && result.tasks[0] && result.tasks[0].result && result.tasks[0].result[0]) {
    var k = result.tasks[0].result[0];
    
    // CPC moyen réel = (low_bid + high_bid) / 2
    var cpcReal = 0;
    if (k.low_top_of_page_bid && k.high_top_of_page_bid) {
      cpcReal = (k.low_top_of_page_bid + k.high_top_of_page_bid) / 2;
    } else {
      cpcReal = k.cpc || 0;
    }
    
    var data = {
      keyword: k.keyword,
      volume: k.search_volume || 0,
      cpcOrganic: k.cpc || 0,
      cpcReal: cpcReal,
      competition: k.competition || 0,
      competitionLevel: k.competition > 0.66 ? 'High' : k.competition > 0.33 ? 'Medium' : 'Low',
      lowBid: k.low_top_of_page_bid || 0,
      highBid: k.high_top_of_page_bid || 0
    };
    cache.keywords[key] = { data: data, timestamp: Date.now() };
    return data;
  }
  throw new Error('No data');
}

// 2. Trends + graphique
async function getTrends(kw) {
  var key = 'trend_' + kw.toLowerCase();
  if (cache.trends[key] && Date.now() - cache.trends[key].timestamp < 7 * 24 * 60 * 60 * 1000) {
    console.log('✅ Cache: trends');
    return cache.trends[key].data;
  }
  
  console.log('🔍 API: trends');
  var today = new Date();
  var yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
  
  var result = await callAPI('/keywords_data/google_trends/explore/live', [{
    keywords: [kw],
    location_code: 2250,
    language_code: 'fr',
    date_from: yearAgo.toISOString().split('T')[0],
    date_to: today.toISOString().split('T')[0]
  }]);
  
  if (result.tasks && result.tasks[0] && result.tasks[0].result && result.tasks[0].result[0]) {
    var items = result.tasks[0].result[0].items;
    if (items && items[0] && items[0].data) {
      var monthly = items[0].data;
      var values = Object.values(monthly);
      
      // FIX: Vérifier que values contient bien des nombres
      values = values.filter(function(v) { return typeof v === 'number'; });
      
      if (values.length === 0) {
        return { trend: 'stable', trendPercent: 0, seasonal: false, variance: 0, monthlyData: {} };
      }
      
      var avg = values.reduce(function(a, b) { return a + b; }, 0) / values.length;
      var recent = values.slice(-3).reduce(function(a, b) { return a + b; }, 0) / 3;
      var trend = recent > avg * 1.1 ? 'up' : recent < avg * 0.9 ? 'down' : 'stable';
      var percent = avg > 0 ? ((recent - avg) / avg * 100).toFixed(1) : 0;
      
      var max = Math.max(...values);
      var min = Math.min(...values);
      var variance = avg > 0 ? (max - min) / avg : 0;
      var seasonal = variance > 0.5;
      
      var data = {
        trend: trend,
        trendPercent: parseFloat(percent),
        seasonal: seasonal,
        variance: Math.round(variance * 100),
        monthlyData: monthly // Pour graphique
      };
      cache.trends[key] = { data: data, timestamp: Date.now() };
      return data;
    }
  }
  
  return { trend: 'stable', trendPercent: 0, seasonal: false, variance: 0, monthlyData: {} };
}

// 3. SERP avec catégorisation CORRIGÉE
async function getSerpData(kw) {
  var key = 'serp_' + kw.toLowerCase();
  if (cache.serp[key] && Date.now() - cache.serp[key].timestamp < 7 * 24 * 60 * 60 * 1000) {
    console.log('✅ Cache: SERP');
    return cache.serp[key].data;
  }
  
  console.log('🔍 API: SERP');
  var result = await callAPI('/serp/google/organic/live/advanced', [{
    keyword: kw,
    location_code: 2250,
    language_code: 'fr',
    device: 'desktop',
    os: 'windows',
    depth: 10
  }]);
  
  if (result.tasks && result.tasks[0] && result.tasks[0].result && result.tasks[0].result[0]) {
    var items = result.tasks[0].result[0].items || [];
    var serp = items.filter(function(i) { return i.type === 'organic'; }).slice(0, 10).map(function(i) {
      return {
        position: i.rank_group,
        url: i.url,
        domain: i.domain,
        title: i.title,
        type: categorize(i.domain)
      };
    });
    
    cache.serp[key] = { data: serp, timestamp: Date.now() };
    return serp;
  }
  return [];
}

// Catégorisation CORRIGÉE
function categorize(domain) {
  domain = domain.toLowerCase();
  
  // GÉNÉRALISTES (vendent TOUT)
  var generalistes = [
    'amazon', 'cdiscount', 'fnac', 'ebay', 'rakuten', 'priceminister',
    'carrefour', 'leclerc', 'auchan', 'intermarche',
    'darty', 'boulanger' // Électro généraliste
  ];
  if (generalistes.some(function(g) { return domain.includes(g); })) {
    return domain.includes('amazon') ? 'amazon' : 'generaliste';
  }
  
  // SPÉCIALISTES (focus niche/secteur)
  var specialistes = [
    'norauto', 'feu vert', 'euromaster', 'midas', 'speedy', // Auto
    'leroy merlin', 'castorama', 'bricomarche', 'bricodepot', // Bricolage
    'decathlon', 'intersport', 'go sport', // Sport
    'maisons du monde', 'conforama', 'but', 'ikea', // Meuble/déco
    'sephora', 'nocibe', 'marionnaud', // Beauté
    'kiabi', 'h&m', 'zara', 'celio', // Mode
    'cultura', 'la fnac' // Culture
  ];
  if (specialistes.some(function(s) { return domain.includes(s); })) {
    return 'specialiste';
  }
  
  // MÉDIAS
  var medias = ['lesnumeriques', '60millions', 'quechoisir', 'cnet', 'frandroid', 'clubic'];
  if (medias.some(function(m) { return domain.includes(m); })) {
    return 'media';
  }
  
  // SHOPIFY
  if (domain.includes('myshopify.com')) {
    return 'shopify';
  }
  
  // Par défaut: petit site (probable Shopify ou indépendant)
  return 'shopify';
}

// 4. Backlinks + DR (NOUVEAU - Phase 2)
async function getBacklinksData(domains) {
  var results = [];
  
  for (var i = 0; i < domains.length; i++) {
    var domain = domains[i];
    var key = 'bl_' + domain.toLowerCase();
    
    if (cache.backlinks[key] && Date.now() - cache.backlinks[key].timestamp < 14 * 24 * 60 * 60 * 1000) {
      console.log('✅ Cache: backlinks ' + domain);
      results.push(cache.backlinks[key].data);
      continue;
    }
    
    try {
      console.log('🔍 API: backlinks ' + domain);
      var result = await callAPI('/backlinks/summary/live', [{
        target: domain,
        internal_list_limit: 1,
        backlinks_status_type: 'all'
      }]);
      
      if (result.tasks && result.tasks[0] && result.tasks[0].result && result.tasks[0].result[0]) {
        var bl = result.tasks[0].result[0];
        var data = {
          domain: domain,
          rank: bl.rank || 0, // Domain Rating
          backlinks: bl.backlinks || 0,
          referring_domains: bl.referring_domains || 0,
          referring_main_domains: bl.referring_main_domains || 0
        };
        cache.backlinks[key] = { data: data, timestamp: Date.now() };
        results.push(data);
      } else {
        results.push({ domain: domain, rank: 0, backlinks: 0, referring_domains: 0 });
      }
      
      // Rate limit: 1 requête/seconde
      await sleep(1100);
      
    } catch (error) {
      console.error('Backlinks error for ' + domain + ':', error.message);
      results.push({ domain: domain, rank: 0, backlinks: 0, referring_domains: 0 });
    }
  }
  
  return results;
}

// 5. Long-tail keywords (NOUVEAU - Phase 2)
async function getLongTail(kw) {
  var key = 'lt_' + kw.toLowerCase();
  if (cache.longtail[key] && Date.now() - cache.longtail[key].timestamp < 7 * 24 * 60 * 60 * 1000) {
    console.log('✅ Cache: long-tail');
    return cache.longtail[key].data;
  }
  
  try {
    console.log('🔍 API: long-tail');
    var result = await callAPI('/keywords_data/google_ads/keywords_for_keywords/live', [{
      keywords: [kw],
      location_code: 2250,
      language_code: 'fr',
      search_partners: false,
      include_seed_keyword: false,
      include_serp_info: false,
      limit: 20
    }]);
    
    if (result.tasks && result.tasks[0] && result.tasks[0].result && result.tasks[0].result[0]) {
      var suggestions = result.tasks[0].result[0]
        .filter(function(k) {
          return k.search_volume > 50 && k.keyword.length > kw.length + 3;
        })
        .map(function(k) {
          return {
            keyword: k.keyword,
            volume: k.search_volume || 0,
            cpc: k.cpc || 0,
            competition: k.competition || 0
          };
        })
        .sort(function(a, b) { return b.volume - a.volume; })
        .slice(0, 10);
      
      cache.longtail[key] = { data: suggestions, timestamp: Date.now() };
      return suggestions;
    }
  } catch (error) {
    console.error('Long-tail error:', error.message);
  }
  
  return [];
}

// Analyse SERP
function analyzeSerp(serp) {
  var counts = { amazon: 0, generaliste: 0, specialiste: 0, media: 0, shopify: 0 };
  var amazonPos = null;
  
  serp.forEach(function(item) {
    counts[item.type]++;
    if (item.type === 'amazon' && !amazonPos) amazonPos = item.position;
  });
  
  return {
    counts: counts,
    amazonPresent: counts.amazon > 0,
    amazonPosition: amazonPos,
    shopifyPercent: Math.round((counts.shopify / serp.length) * 100),
    accessiblePercent: Math.round(((counts.shopify) / serp.length) * 100)
  };
}

// Suite du fichier à cause de la limite de taille...

// Scoring CORRIGÉ (plus strict et nuancé)
function calculateScore(kwData, trendsData, serpAnalysis, backlinksData) {
  var score = 40; // Base plus basse
  
  // Volume (max +15)
  if (kwData.volume > 5000 && kwData.volume < 15000) score += 15;
  else if (kwData.volume >= 1000 && kwData.volume <= 5000) score += 12;
  else if (kwData.volume >= 500) score += 8;
  else if (kwData.volume >= 100) score += 4;
  else score -= 10; // Pénalité si trop faible
  
  // Tendance (max +12)
  if (trendsData.trend === 'up' && trendsData.trendPercent > 20) score += 12;
  else if (trendsData.trend === 'up' && trendsData.trendPercent > 10) score += 8;
  else if (trendsData.trend === 'up') score += 5;
  else if (trendsData.trend === 'stable') score += 2;
  else score -= 8; // Pénalité si down
  
  // Amazon (max +10, pas +20!)
  if (serpAnalysis.amazonPresent) {
    if (serpAnalysis.amazonPosition <= 3) score += 10;
    else if (serpAnalysis.amazonPosition <= 7) score += 7;
    else score += 4;
  } else {
    score -= 3; // Légère pénalité si absent
  }
  
  // Sites accessibles (max +20)
  if (serpAnalysis.accessiblePercent >= 60) score += 20;
  else if (serpAnalysis.accessiblePercent >= 40) score += 14;
  else if (serpAnalysis.accessiblePercent >= 20) score += 8;
  else score -= 5;
  
  // Généralistes/Spécialistes dominants (pénalité)
  var dominant = serpAnalysis.counts.generaliste + serpAnalysis.counts.specialiste;
  if (dominant >= 7) score -= 15;
  else if (dominant >= 5) score -= 10;
  else if (dominant >= 3) score -= 5;
  
  // DR moyen (max +15)
  if (backlinksData && backlinksData.length > 0) {
    var drValues = backlinksData.map(function(b) { return b.rank || 0; }).filter(function(r) { return r > 0; });
    if (drValues.length > 0) {
      var avgDR = drValues.reduce(function(a, b) { return a + b; }, 0) / drValues.length;
      if (avgDR < 25) score += 15;
      else if (avgDR < 40) score += 10;
      else if (avgDR < 55) score += 5;
      else score -= 8;
    }
  }
  
  // CPC (max +10)
  if (kwData.cpcReal > 0.5 && kwData.cpcReal < 2.5) score += 10;
  else if (kwData.cpcReal >= 0.3) score += 6;
  else if (kwData.cpcReal >= 0.1) score += 3;
  else score -= 5;
  
  // Competition (pénalité si High)
  if (kwData.competitionLevel === 'High') score -= 8;
  else if (kwData.competitionLevel === 'Medium') score -= 3;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Difficulté
function calculateDifficulty(kwData, serpAnalysis, backlinksData) {
  var diff = 0;
  
  if (kwData.volume > 15000) diff += 30;
  else if (kwData.volume > 8000) diff += 20;
  else if (kwData.volume > 3000) diff += 12;
  else if (kwData.volume > 1000) diff += 8;
  else diff += 4;
  
  if (kwData.cpcReal > 3) diff += 25;
  else if (kwData.cpcReal > 1.5) diff += 18;
  else if (kwData.cpcReal > 0.8) diff += 12;
  else if (kwData.cpcReal > 0.3) diff += 6;
  else diff += 3;
  
  var dominant = serpAnalysis.counts.generaliste + serpAnalysis.counts.specialiste;
  if (dominant >= 7) diff += 30;
  else if (dominant >= 5) diff += 20;
  else if (dominant >= 3) diff += 12;
  else diff += 5;
  
  if (backlinksData && backlinksData.length > 0) {
    var drValues = backlinksData.map(function(b) { return b.rank || 0; }).filter(function(r) { return r > 0; });
    if (drValues.length > 0) {
      var avgDR = drValues.reduce(function(a, b) { return a + b; }, 0) / drValues.length;
      if (avgDR > 60) diff += 15;
      else if (avgDR > 45) diff += 10;
      else if (avgDR > 30) diff += 6;
      else diff += 2;
    }
  }
  
  return Math.min(Math.round(diff), 100);
}

// Recommandation IA NUANCÉE
async function generateRecommendation(data) {
  var drAvg = 0;
  if (data.backlinksData && data.backlinksData.length > 0) {
    var drValues = data.backlinksData.map(function(b) { return b.rank || 0; }).filter(function(r) { return r > 0; });
    if (drValues.length > 0) {
      drAvg = Math.round(drValues.reduce(function(a, b) { return a + b; }, 0) / drValues.length);
    }
  }
  
  var prompt = 'Tu es un expert e-commerce CRITIQUE et RÉALISTE. Analyse cette niche avec HONNÊTETÉ:\n\n' +
    'Mot-clé: ' + data.keyword + '\n' +
    'Volume: ' + data.volume + '/mois\n' +
    'CPC moyen réel: ' + data.cpcReal.toFixed(2) + '€\n' +
    'Competition Google Ads: ' + data.competitionLevel + '\n' +
    'Difficulté SEO: ' + data.difficulty + '/100\n' +
    'Tendance: ' + data.trend + ' (' + data.trendPercent + '%)\n' +
    'Score: ' + data.score + '/100\n\n' +
    'Concurrence:\n' +
    '- Amazon: ' + (data.amazonPresent ? 'Position ' + data.amazonPosition + ' (marché validé mais concurrence féroce)' : 'Absent (peut-être marché trop petit?)') + '\n' +
    '- Généralistes: ' + data.serpAnalysis.counts.generaliste + '\n' +
    '- Spécialistes: ' + data.serpAnalysis.counts.specialiste + '\n' +
    '- Shopify: ' + data.serpAnalysis.counts.shopify + '\n' +
    '- DR moyen: ' + drAvg + '\n\n' +
    'IMPORTANT:\n' +
    '- Si score < 50: Clairement NO-GO ❌\n' +
    '- Si score 50-65: ATTENTION ⚠️ (difficile, budget conséquent nécessaire)\n' +
    '- Si score 65-75: GO avec prudence ⚠️ (faisable mais pas facile)\n' +
    '- Si score > 75: GO ✅ (bonne opportunité)\n' +
    '- Amazon présent = marché existe MAIS concurrence prix féroce\n' +
    '- Sois HONNÊTE sur les risques et difficultés\n\n' +
    'Format:\n' +
    '**Verdict: [GO ✅ / GO avec prudence ⚠️ / ATTENTION ⚠️ / NO-GO ❌]**\n\n' +
    '**Résumé (2-3 phrases réalistes)**\n\n' +
    '**Points forts:**\n- ...\n\n' +
    '**Risques et difficultés:**\n- ...\n\n' +
    '**Stratégie (si viable):**\n- ...\n\n' +
    'Max 250 mots. Sois DIRECT et HONNÊTE sur les chances de succès.';
  
  try {
    return await callGemini(prompt);
  } catch (e) {
    var verdict = data.score >= 75 ? 'GO ✅' : 
                  data.score >= 65 ? 'GO avec prudence ⚠️' : 
                  data.score >= 50 ? 'ATTENTION ⚠️' : 'NO-GO ❌';
    
    return '**Verdict: ' + verdict + '**\n\n' +
           '**Résumé:** Niche avec ' + data.volume + ' recherches/mois. ' +
           (data.score >= 65 ? 'Opportunité intéressante mais nécessite investissement. ' : 
            data.score >= 50 ? 'Faisable mais difficile, réservé aux expérimentés. ' : 
            'Niche trop compétitive ou marché trop petit. ') +
           (data.amazonPresent ? 'Amazon présent = demande confirmée mais concurrence prix difficile.' : '') +
           '\n\n**Score: ' + data.score + '/100**';
  }
}

// Analyse complète
async function analyzeNiche(keyword) {
  console.log('🎯 Analyzing:', keyword);
  
  try {
    // 1. Données de base
    var kwData = await getKeywordData(keyword);
    var trendsData = await getTrends(keyword);
    var serpData = await getSerpData(keyword);
    var serpAnalysis = analyzeSerp(serpData);
    
    // 2. Backlinks (Phase 2)
    var domains = serpData.map(function(s) { return s.domain; });
    var backlinksData = await getBacklinksData(domains);
    
    // Enrichir serpData avec backlinks
    serpData = serpData.map(function(item) {
      var bl = backlinksData.find(function(b) { return b.domain === item.domain; });
      if (bl) {
        item.dr = bl.rank || 0;
        item.backlinks = bl.backlinks || 0;
        item.referring_domains = bl.referring_domains || 0;
      }
      return item;
    });
    
    // 3. Long-tail (Phase 2)
    var longtailData = await getLongTail(keyword);
    
    // 4. Calculs
    var difficulty = calculateDifficulty(kwData, serpAnalysis, backlinksData);
    var score = calculateScore(kwData, trendsData, serpAnalysis, backlinksData);
    
    // 5. Recommandation
    var recommendation = await generateRecommendation({
      keyword: keyword,
      volume: kwData.volume,
      cpcReal: kwData.cpcReal,
      competitionLevel: kwData.competitionLevel,
      difficulty: difficulty,
      trend: trendsData.trend,
      trendPercent: trendsData.trendPercent,
      score: score,
      amazonPresent: serpAnalysis.amazonPresent,
      amazonPosition: serpAnalysis.amazonPosition,
      serpAnalysis: serpAnalysis,
      backlinksData: backlinksData
    });
    
    return {
      success: true,
      analysis: {
        keyword: keyword,
        volume: kwData.volume,
        cpcOrganic: kwData.cpcOrganic,
        cpcReal: kwData.cpcReal,
        competitionLevel: kwData.competitionLevel,
        lowBid: kwData.lowBid,
        highBid: kwData.highBid,
        difficulty: difficulty,
        trend: trendsData.trend,
        trendPercent: trendsData.trendPercent,
        seasonal: trendsData.seasonal,
        monthlyData: trendsData.monthlyData,
        score: score,
        recommendation: recommendation,
        serpData: serpData,
        serpAnalysis: serpAnalysis,
        longtailData: longtailData,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error:', error.message);
    return { success: false, error: error.message };
  }
}

// SERVER
var server = http.createServer(function(req, res) {
  try {
    if (req.method === 'GET' && req.url === '/') {
      fs.readFile(path.join(__dirname, 'index.html'), 'utf8', function(err, html) {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });
    }
    else if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', version: '2.1-complete' }));
    }
    else if (req.url === '/api/analyze' && req.method === 'POST') {
      var body = '';
      req.on('data', function(chunk) { body += chunk; });
      req.on('end', async function() {
        try {
          var data = JSON.parse(body);
          if (!data.keyword || !data.keyword.trim()) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Mot-clé requis' }));
            return;
          }
          
          if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'DataForSEO non configuré' }));
            return;
          }
          
          var result = await analyzeNiche(data.keyword.trim());
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
    }
    else if (req.url === '/api/cache-stats' && req.method === 'GET') {
      var stats = {
        keywords: Object.keys(cache.keywords).length,
        serp: Object.keys(cache.serp).length,
        trends: Object.keys(cache.trends).length,
        backlinks: Object.keys(cache.backlinks).length,
        longtail: Object.keys(cache.longtail).length,
        total: Object.keys(cache.keywords).length + Object.keys(cache.serp).length + 
               Object.keys(cache.trends).length + Object.keys(cache.backlinks).length +
               Object.keys(cache.longtail).length
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    }
    else {
      res.writeHead(404);
      res.end('Not found');
    }
  } catch (e) {
    res.writeHead(500);
    res.end('Server error');
  }
});

console.log('');
console.log('🌐 App: http://localhost:' + PORT);
console.log('');
if (GEMINI_API_KEY) console.log('🤖 Gemini:     ✅');
else console.log('🤖 Gemini:     ⚠️');
if (DATAFORSEO_LOGIN && DATAFORSEO_PASSWORD) console.log('🔍 DataForSEO: ✅');
else console.log('🔍 DataForSEO: ❌');
console.log('');
console.log('✨ Features v2.1:');
console.log('  - CPC moyen réel ((low+high)/2)');
console.log('  - Catégorisation corrigée');
console.log('  - Scoring plus strict et nuancé');
console.log('  - Domain Rating (DR)');
console.log('  - Backlinks count');
console.log('  - Long-tail suggestions');
console.log('  - Graphique tendances');
console.log('  - Messages Amazon nuancés');
console.log('');
console.log('💰 Coût: ~0,31€/analyse (avec cache: 0,15€)');
console.log('');
console.log('Ready! 🚀');
console.log('');

server.listen(PORT);

