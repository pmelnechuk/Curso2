/* Híbrido Box — prototipo navegable.
   Lógica y datos ficticios compartidos por las dos propuestas visuales.
   Cada propuesta aporta su CSS y puede reemplazar plantillas en HB.T antes de HB.boot(). */
window.HB = (function () {
  'use strict';

  /* ---------- utilidades ---------- */
  const DAY = 864e5;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const addDays = n => new Date(today.getTime() + n * DAY);
  const daysTo = d => Math.round((d - today) / DAY);
  const pad = n => String(n).padStart(2, '0');
  const fDate = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const fShort = d => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const DIAS_C = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fLong = d => `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`;
  const money = n => '$' + Math.round(n).toLocaleString('es-AR');
  const fDni = s => String(s).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const nowHM = (minAgo = 0) => { const d = new Date(Date.now() - minAgo * 6e4); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const toMin = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
  const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };
  const rnd = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;

  /* ---------- íconos ---------- */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.4 3.3-5.5 6.5-5.5s5.9 2.1 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.5 3.5 5.2"/>',
    card: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6.5 15h4"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    coach: '<circle cx="12" cy="7" r="4"/><path d="M4 21c.8-4 4-6.5 8-6.5s7.2 2.5 8 6.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    back: '<path d="m15 6-6 6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    more: '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3.2"/>',
    msg: '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12z"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
    alert: '<path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4.5M12 17.2v.3"/>',
    dumbbell: '<path d="M6 7v10M3 9.5v5M18 7v10M21 9.5v5M6 12h12"/>',
    tablet: '<rect x="4" y="2.5" width="16" height="19" rx="2"/><path d="M11 18.5h2"/>',
    mobile: '<rect x="6.5" y="2.5" width="11" height="19" rx="2"/><path d="M11 18.5h2"/>',
    monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
    cash: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6.5 8-6.5s7.2 2.5 8 6.5"/>',
  };
  const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  /* ---------- datos ficticios ---------- */
  const PLANS = {
    libre: { name: 'Pase libre', short: 'Pase libre', price: 45000 },
    '3x': { name: '3 veces por semana', short: '3x semana', price: 38000 },
    '2x': { name: '2 veces por semana', short: '2x semana', price: 31000 },
  };
  const MEDIOS = ['Efectivo', 'Transferencia', 'Mercado Pago'];
  const OWNER = { nombre: 'Martín Aguirre', corto: 'Martín' };
  const COACHES = [
    { id: 1, nombre: 'Lucas Bianchi', rol: 'Head coach', tel: '11 4021-7783', esp: 'CrossFit · Halterofilia' },
    { id: 2, nombre: 'Paula Ríos', rol: 'Coach', tel: '11 3398-1204', esp: 'CrossFit · Funcional' },
    { id: 3, nombre: 'Matías Correa', rol: 'Coach', tel: '11 5562-0937', esp: 'CrossFit' },
    { id: 4, nombre: 'Sol Ferreyra', rol: 'Coach', tel: '11 6710-4458', esp: 'Híbrido · Funcional' },
  ];
  const ME = COACHES[1]; // profesor logueado en la vista móvil

  // nombre, apellido, dni, plan, días al vencimiento, días desde la última asistencia, teléfono, meses de antigüedad
  const RAW = [
    ['Juan', 'Pérez', '35482117', '3x', -4, 2, '11 5823-4471', 14],
    ['María', 'López', '38901442', 'libre', 1, 0, '11 3947-2210', 8],
    ['Carlos', 'Díaz', '32115870', 'libre', 18, 12, '11 4482-9013', 22],
    ['Lucía', 'Fernández', '40223519', 'libre', 17, 1, '11 6235-8841', 5],
    ['Martín', 'Gómez', '36778004', '3x', 5, 1, '11 2876-3392', 11],
    ['Sofía', 'Romero', '41556230', 'libre', 22, 0, '11 5190-6627', 3],
    ['Federico', 'Álvarez', '33890612', '2x', -9, 6, '11 4703-1158', 19],
    ['Valentina', 'Torres', '39004781', 'libre', 3, 0, '11 6624-0075', 7],
    ['Nicolás', 'Ruiz', '37612905', '3x', 26, 1, '11 3301-8846', 16],
    ['Camila', 'Sosa', '42118367', 'libre', 11, 2, '11 5548-2931', 2],
    ['Agustín', 'Molina', '34450228', 'libre', -1, 3, '11 4129-6650', 9],
    ['Florencia', 'Castro', '38337640', '2x', 14, 4, '11 6082-7714', 12],
    ['Tomás', 'Herrera', '43020556', '3x', 2, 0, '11 2955-4038', 4],
    ['Julieta', 'Medina', '36905113', 'libre', 29, 1, '11 4876-2290', 25],
    ['Ignacio', 'Benítez', '31774890', 'libre', 8, 15, '11 5317-9902', 30],
    ['Micaela', 'Acosta', '40889017', '3x', -15, 18, '11 3762-5581', 6],
    ['Diego', 'Suárez', '35120774', 'libre', 19, 0, '11 6449-1307', 17],
    ['Rocío', 'Giménez', '39660385', '2x', 6, 2, '11 5091-8463', 10],
  ];
  const mkEmail = (n, a) => `${norm(n)}.${norm(a)}@gmail.com`.replace(/\s/g, '');
  const socios = RAW.map((r, i) => {
    const alta = new Date(today); alta.setMonth(alta.getMonth() - r[7]);
    return { id: i + 1, nombre: r[0], apellido: r[1], full: `${r[0]} ${r[1]}`, dni: r[2], plan: r[3], venc: addDays(r[4]), last: r[5], tel: r[6], email: mkEmail(r[0], r[1]), alta };
  });
  const byId = id => socios.find(s => s.id === +id);
  const byDni = dni => socios.find(s => s.dni === dni);

  let pid = 0;
  const pagos = [];
  socios.forEach(s => {
    const r = rnd(s.id * 97);
    for (let k = 1; k <= 4; k++) {
      const f = new Date(s.venc); f.setMonth(f.getMonth() - k);
      if (f > today) continue;
      if (f < s.alta) break;
      pagos.push({ id: ++pid, socioId: s.id, fecha: f, monto: PLANS[s.plan].price, plan: s.plan, medio: MEDIOS[Math.floor(r() * 3)], por: COACHES[Math.floor(r() * 4)].nombre });
    }
  });
  pagos.sort((a, b) => b.fecha - a.fecha);

  const HORAS = ['07:00', '08:00', '12:30', '18:30', '19:30', '20:30', '21:30'];
  socios.forEach(s => {
    const r = rnd(s.id * 131 + 7);
    const gap = { libre: [1, 2], '3x': [2, 3], '2x': [3, 4] }[s.plan];
    const pref = HORAS[Math.floor(r() * HORAS.length)];
    s.asist = [];
    let d = s.last;
    while (d < 60) {
      s.asist.push({ fecha: addDays(-d), hora: r() < 0.75 ? pref : HORAS[Math.floor(r() * 7)] });
      d += gap[0] + Math.floor(r() * (gap[1] - gap[0] + 1));
    }
  });

  // ingresos de hoy por la tablet
  const hoy = [];
  [8, 21, 34, 49, 66, 83].forEach((min, i) => {
    const s = socios.filter(x => x.last === 0)[i];
    if (!s) return;
    const h = nowHM(min);
    s.asist[0].hora = h;
    hoy.push({ socioId: s.id, hora: h });
  });

  // agenda semanal
  const CLASES = [];
  let cid = 0;
  for (let dow = 1; dow <= 6; dow++) {
    const defs = dow === 6
      ? [['09:00', 'Open Box', 1, 20], ['10:30', 'Híbrido en equipos', 4, 20]]
      : [['07:00', 'CrossFit', 2, 16], ['08:00', 'Funcional', 2, 16], ['12:30', 'CrossFit', 3, 16],
         ['18:30', dow % 2 ? 'Halterofilia' : 'Funcional', dow % 2 ? 1 : 4, 12],
         ['19:30', 'CrossFit', 1, 16], ['20:30', 'CrossFit', 3, 16], ['21:30', 'Híbrido', 4, 16]];
    defs.forEach(([hora, tipo, coachId, cupo], i) => {
      const r = rnd(dow * 31 + i * 7 + 3);
      CLASES.push({ id: ++cid, dow, hora, tipo, coachId, cupo, ins: Math.min(cupo, Math.round(cupo * (0.45 + r() * 0.55))) });
    });
  }
  const coach = id => COACHES.find(c => c.id === +id);
  const monday = addDays(-((today.getDay() + 6) % 7));
  const dateOfDow = d => new Date(monday.getTime() + (d - 1) * DAY);
  const clsState = c => {
    if (c.dow !== today.getDay()) return '';
    const st = toMin(c.hora), n = nowMin();
    if (n >= st + 60) return 'done';
    if (n >= st) return 'live';
    return 'next';
  };
  const nextClass = () => {
    const t = CLASES.filter(c => c.dow === today.getDay() && toMin(c.hora) > nowMin() - 60).sort((a, b) => toMin(a.hora) - toMin(b.hora));
    if (t.length) return { c: t[0], when: 'Hoy' };
    let d = today.getDay() % 7 + 1; if (d === 7) d = 1;
    return { c: CLASES.filter(c => c.dow === d).sort((a, b) => toMin(a.hora) - toMin(b.hora))[0], when: d === (today.getDay() + 1) % 7 ? 'Mañana' : cap(DIAS[d]) };
  };
  const asistentesDe = c => {
    const n = Math.min(c.ins, socios.length);
    const out = [];
    for (let i = 0; i < n; i++) out.push(socios[(c.id * 5 + i * 7) % socios.length]);
    return [...new Set(out)];
  };

  // indicadores del negocio (el listado de arriba es una muestra del padrón completo)
  const BASE = { total: 212, activos: 184, semana: 12, vencidas: 7, hoy: 46, ingresos: 6840000, nPagos: 182, prom: 41, mesAnt: 6330000 };

  /* ---------- estado ---------- */
  const S = {
    role: 'owner', logged: false, view: 'dashboard', back: 'socios', socioId: null,
    q: '', filter: 'all', vtab: 'bad', dow: today.getDay() || 1,
    sheet: null, ck: { phase: 'idle', val: '' }, extraIng: 0, nPagos: 0, newCk: 0, nuevos: 0,
  };

  const st = s => { const d = daysTo(s.venc); return d < 0 ? 'bad' : d <= 7 ? 'warn' : 'ok'; };
  const ST_LABEL = { ok: 'Activa', warn: 'Por vencer', bad: 'Vencida' };
  const ST_LONG = { ok: 'Membresía activa', warn: 'Próxima a vencer', bad: 'Membresía vencida' };
  const vencTxt = s => {
    const d = daysTo(s.venc);
    if (d < -1) return `Vencida hace ${d * -1} días`;
    if (d === -1) return 'Venció ayer';
    if (d === 0) return 'Vence hoy';
    if (d === 1) return 'Vence mañana';
    if (d <= 7) return `Vence en ${d} días`;
    return `Vence el ${fShort(s.venc)}`;
  };
  const ini = s => (s.nombre[0] + s.apellido[0]).toUpperCase();
  const count = k => k === 'all' ? socios.length : socios.filter(s => st(s) === k).length;
  const waLink = (s, txt) => `https://wa.me/549${s.tel.replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`;
  const waVenc = s => {
    const d = daysTo(s.venc);
    return waLink(s, `Hola ${s.nombre}! Te escribimos de Híbrido Box: tu cuota ${d < 0 ? 'venció el' : 'vence el'} ${fShort(s.venc)}. Podés renovarla en recepción o por transferencia. ¡Te esperamos!`);
  };
  const atencion = () => {
    const out = [];
    socios.filter(s => st(s) === 'bad').sort((a, b) => b.venc - a.venc).forEach(s => out.push({ s, kind: 'bad', txt: vencTxt(s) }));
    socios.filter(s => { const d = daysTo(s.venc); return d >= 0 && d <= 2; }).sort((a, b) => a.venc - b.venc).forEach(s => out.push({ s, kind: 'warn', txt: vencTxt(s) }));
    socios.filter(s => s.last >= 10 && st(s) !== 'bad').sort((a, b) => b.last - a.last).forEach(s => out.push({ s, kind: 'idle', txt: `No asiste hace ${s.last} días` }));
    return out;
  };
  const newVenc = s => { const b = new Date(Math.max(s.venc, today)); b.setMonth(b.getMonth() + 1); return b; };
  const pagosMes = () => pagos.filter(p => p.fecha.getMonth() === today.getMonth() && p.fecha.getFullYear() === today.getFullYear());

  /* ---------- piezas de UI ---------- */
  const pill = (s, k = st(s)) => `<span class="pill pill-${k}"><i></i>${ST_LABEL[k]}</span>`;
  const av = (s, cls = '') => `<span class="av ${cls}">${ini(s)}</span>`;
  const head = (title, sub, actions = '') => `<header class="vh"><div class="vh-t"><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${actions ? `<div class="vh-a">${actions}</div>` : ''}</header>`;
  const empty = (t, d = '') => `<div class="empty"><b>${t}</b>${d ? `<span>${d}</span>` : ''}</div>`;
  const chips = (act, items, cur) => `<div class="chips" role="group">${items.map(([v, l, n]) => `<button type="button" class="chip" data-act="${act}" data-v="${v}" aria-pressed="${cur === v}">${l}${n !== undefined ? ` <span class="chip-n">${n}</span>` : ''}</button>`).join('')}</div>`;
  const isProf = () => S.role === 'prof';

  const T = {};

  T.rowSocio = s => `<button class="row" data-socio="${s.id}">${av(s)}<span class="row-main"><b>${s.full}</b><small>DNI ${fDni(s.dni)} · ${PLANS[s.plan].short}</small></span><span class="row-end">${pill(s)}<small>${vencTxt(s)}</small></span>${ic('chev', 'chev')}</button>`;

  T.rowAtt = a => {
    const act = a.kind === 'idle'
      ? `<a class="btn btn-sm" href="${waLink(a.s, `Hola ${a.s.nombre}! Te extrañamos en Híbrido Box 💪 ¿Te reservamos lugar en la clase de esta semana?`)}" target="_blank" rel="noopener">${ic('msg')}Escribir</a>`
      : `<button class="btn btn-sm btn-primary" data-act="pay" data-id="${a.s.id}">Cobrar</button>`;
    return `<div class="row row-static att-${a.kind}"><button class="row-link" data-socio="${a.s.id}">${av(a.s)}<span class="row-main"><b>${a.s.full}</b><small class="t-${a.kind}"><i class="dot dot-${a.kind}"></i>${a.txt}</small></span></button>${act}</div>`;
  };

  T.stat = (label, value, sub, go, tone = '') => `<button class="stat ${tone ? 'stat-' + tone : ''}" ${go ? `data-go="${go}"` : 'disabled'}><span class="stat-l">${tone ? `<i class="dot dot-${tone}"></i>` : ''}${label}</span><span class="stat-v">${value}</span>${sub ? `<span class="stat-s">${sub}</span>` : ''}</button>`;

  T.rowPago = (p, showSocio = true) => {
    const s = byId(p.socioId);
    return `<div class="row row-static pay-row">${showSocio ? av(s) : `<span class="av av-ghost">${ic('cash')}</span>`}<span class="row-main"><b>${showSocio ? s.full : PLANS[p.plan].name}</b><small>${showSocio ? PLANS[p.plan].short + ' · ' : ''}${p.medio} · ${p.por.split(' ')[0]}</small></span><span class="row-end"><b class="num">${money(p.monto)}</b><small>${fDate(p.fecha)}</small></span></div>`;
  };

  T.dashboard = () => {
    const att = atencion().slice(0, 6);
    const ing = BASE.ingresos + S.extraIng;
    const varPct = Math.round((ing / BASE.mesAnt - 1) * 100);
    return `${head(`Buen día, ${OWNER.corto}`, cap(fLong(today)), `<button class="btn" data-act="new-socio">${ic('plus')}Nuevo socio</button><button class="btn btn-primary" data-act="pay">${ic('card')}Registrar pago</button>`)}
    <div class="stats">
      ${T.stat('Socios activos', BASE.activos + S.nuevos, `de ${BASE.total + S.nuevos} registrados`, 'socios')}
      ${T.stat('Vencen esta semana', BASE.semana, 'Hasta el domingo', 'venc', 'warn')}
      ${T.stat('Cuotas vencidas', BASE.vencidas, 'Sin renovar', 'venc', 'bad')}
      ${T.stat('Asistencias hoy', BASE.hoy + S.newCk, `Promedio diario: ${BASE.prom}`, 'asist')}
    </div>
    <div class="grid2">
      <section class="card"><div class="card-h"><h2>Necesitan atención</h2><button class="link" data-go="venc">Ver vencimientos</button></div><div class="list">${att.map(T.rowAtt).join('')}</div></section>
      <section class="card income"><div class="card-h"><h2>Ingresos de ${MESES[today.getMonth()]}</h2><button class="link" data-go="pagos">Ver pagos</button></div>
        <div class="income-v num">${money(ing)}</div>
        <p class="income-s"><span class="t-ok">${varPct >= 0 ? '+' : ''}${varPct}%</span> respecto de ${MESES[(today.getMonth() + 11) % 12]} · ${BASE.nPagos + S.nPagos} pagos</p>
        <dl class="kv">
          <div><dt>Transferencia</dt><dd class="num">${money(ing * 0.44)}</dd></div>
          <div><dt>Efectivo</dt><dd class="num">${money(ing * 0.35)}</dd></div>
          <div><dt>Mercado Pago</dt><dd class="num">${money(ing * 0.21)}</dd></div>
        </dl>
      </section>
    </div>`;
  };

  T.socios = () => `${head('Socios', `${BASE.total + S.nuevos} socios en el padrón`, `<button class="btn btn-primary" data-act="new-socio">${ic('plus')}Nuevo socio</button>`)}
    <div class="toolbar"><label class="search">${ic('search')}<input id="q" type="search" placeholder="Buscar por nombre o DNI" value="${esc(S.q)}" autocomplete="off" aria-label="Buscar socio"></label>
    ${chips('filter', [['all', 'Todos', count('all')], ['ok', 'Activas', count('ok')], ['warn', 'Por vencer', count('warn')], ['bad', 'Vencidas', count('bad')]], S.filter)}</div>
    <div class="card list" id="list">${T.socioList()}</div>
    <p class="foot-note">Datos de ejemplo: se muestran ${socios.length} socios del padrón.</p>`;

  T.socioList = () => {
    const q = norm(S.q.trim()), dq = S.q.replace(/\D/g, '');
    const arr = socios.filter(s => (S.filter === 'all' || st(s) === S.filter) && (!q || norm(s.full).includes(q) || (dq && s.dni.includes(dq))))
      .sort((a, b) => a.apellido.localeCompare(b.apellido));
    if (!arr.length) return empty('No encontramos socios con esa búsqueda', 'Probá con el apellido o el DNI sin puntos.');
    return arr.map(T.rowSocio).join('');
  };

  T.socio = () => {
    const s = byId(S.socioId); if (!s) return '';
    const k = st(s);
    const pg = pagos.filter(p => p.socioId === s.id);
    const mes = s.asist.filter(a => a.fecha.getMonth() === today.getMonth() && a.fecha.getFullYear() === today.getFullYear()).length;
    const backLbl = { socios: 'Socios', dashboard: 'Inicio', venc: 'Vencimientos', profHome: 'Inicio', asist: 'Asistencias', pagos: 'Pagos' }[S.back] || 'Socios';
    return `<button class="back" data-go="${S.back}">${ic('back')}${backLbl}</button>
    <section class="card profile">
      <div class="p-id">${av(s, 'av-lg')}<div><h1>${s.full}</h1><p>DNI ${fDni(s.dni)} · ${PLANS[s.plan].name}</p></div></div>
      <div class="status-box sb-${k}">${pill(s)}<strong>${k === 'bad' ? 'Venció el' : 'Vence el'} ${fDate(s.venc)}</strong><small>${vencTxt(s)}</small></div>
      <div class="p-actions"><button class="btn btn-primary btn-lg" data-act="pay" data-id="${s.id}">${ic('card')}Registrar pago</button><a class="btn btn-lg" href="${waVenc(s)}" target="_blank" rel="noopener">${ic('msg')}WhatsApp</a></div>
    </section>
    <div class="grid2">
      <section class="card"><div class="card-h"><h2>Pagos</h2><small>${plural(pg.length, 'pago', 'pagos')}</small></div><div class="list">${pg.map(p => T.rowPago(p, false)).join('') || empty('Sin pagos registrados')}</div></section>
      <section class="card"><div class="card-h"><h2>Asistencias</h2><small>${mes} este mes</small></div><div class="list">${s.asist.slice(0, 7).map(a => `<div class="row row-static"><span class="av av-ghost">${ic('check')}</span><span class="row-main"><b>${cap(DIAS[a.fecha.getDay()])} ${fShort(a.fecha)}</b><small>Ingreso ${a.hora}</small></span><span class="row-end"><small>${daysTo(a.fecha) === 0 ? 'Hoy' : daysTo(a.fecha) === -1 ? 'Ayer' : `Hace ${daysTo(a.fecha) * -1} días`}</small></span></div>`).join('') || empty('Todavía no registra asistencias')}</div></section>
    </div>
    <section class="card"><div class="card-h"><h2>Datos</h2></div><dl class="kv kv-2">
      <div><dt>Teléfono</dt><dd>${s.tel}</dd></div><div><dt>Email</dt><dd>${s.email}</dd></div>
      <div><dt>Socio desde</dt><dd>${cap(MESES[s.alta.getMonth()])} ${s.alta.getFullYear()}</dd></div><div><dt>Plan actual</dt><dd>${PLANS[s.plan].name} · ${money(PLANS[s.plan].price)}</dd></div>
    </dl></section>`;
  };

  T.pagos = () => {
    const ing = BASE.ingresos + S.extraIng;
    return `${head('Pagos', `${cap(MESES[today.getMonth()])} ${today.getFullYear()}`, `<button class="btn btn-primary" data-act="pay">${ic('card')}Registrar pago</button>`)}
    <div class="stats stats-3">
      ${T.stat('Ingresos del mes', money(ing), `${MESES[(today.getMonth() + 11) % 12]}: ${money(BASE.mesAnt)}`)}
      ${T.stat('Pagos registrados', BASE.nPagos + S.nPagos, 'En el mes')}
      ${T.stat('Cuotas sin cobrar', BASE.vencidas, 'Socios con cuota vencida', 'venc', 'bad')}
    </div>
    <section class="card"><div class="card-h"><h2>Últimos pagos</h2></div><div class="list">${pagosMes().slice(0, 14).map(p => T.rowPago(p)).join('')}</div></section>`;
  };

  T.venc = () => {
    const groups = {
      bad: socios.filter(s => daysTo(s.venc) < 0).sort((a, b) => a.venc - b.venc),
      week: socios.filter(s => { const d = daysTo(s.venc); return d >= 0 && d <= 7; }).sort((a, b) => a.venc - b.venc),
      next: socios.filter(s => { const d = daysTo(s.venc); return d > 7 && d <= 30; }).sort((a, b) => a.venc - b.venc),
    };
    const arr = groups[S.vtab];
    return `${head('Vencimientos', 'Cobrá y avisá desde acá')}
    ${chips('vtab', [['bad', 'Vencidas', groups.bad.length], ['week', 'Próximos 7 días', groups.week.length], ['next', 'Próximos 30 días', groups.next.length]], S.vtab)}
    <div class="card list">${arr.map(s => `<div class="row row-static"><button class="row-link" data-socio="${s.id}" data-from="venc">${av(s)}<span class="row-main"><b>${s.full}</b><small class="t-${st(s)}"><i class="dot dot-${st(s)}"></i>${vencTxt(s)} · ${PLANS[s.plan].short} ${money(PLANS[s.plan].price)}</small></span></button><span class="row-acts"><a class="btn btn-sm btn-ghost" href="${waVenc(s)}" target="_blank" rel="noopener" aria-label="Avisar por WhatsApp">${ic('msg')}<span class="hide-sm">Avisar</span></a><button class="btn btn-sm btn-primary" data-act="pay" data-id="${s.id}">Cobrar</button></span></div>`).join('') || empty('Nada por acá', 'No hay socios en este grupo.')}</div>`;
  };

  T.rowClase = c => {
    const k = clsState(c), pct = Math.round(c.ins / c.cupo * 100);
    const chip = k === 'live' ? '<span class="tag tag-live">En curso</span>' : k === 'done' ? '<span class="tag">Finalizada</span>' : '';
    return `<button class="row cls ${k === 'done' ? 'is-done' : ''}" data-act="class" data-id="${c.id}"><span class="cls-time num"><b>${c.hora}</b><small>60 min</small></span><span class="row-main"><b>${c.tipo} ${chip}</b><small>${coach(c.coachId).nombre}</small></span><span class="cupo"><span class="bar"><i style="width:${pct}%"></i></span><small class="num">${c.ins}/${c.cupo}</small></span>${ic('chev', 'chev')}</button>`;
  };

  T.clases = () => `${head('Clases', `Semana del ${fShort(monday)} al ${fShort(dateOfDow(6))}`, `<button class="btn btn-primary" data-act="new-class">${ic('plus')}Nueva clase</button>`)}
    <div class="days" role="group" aria-label="Día">${[1, 2, 3, 4, 5, 6].map(d => `<button class="day ${d === today.getDay() ? 'is-today' : ''}" data-act="dow" data-v="${d}" aria-pressed="${S.dow === d}"><small>${DIAS_C[d]}</small><b>${dateOfDow(d).getDate()}</b></button>`).join('')}</div>
    <div class="card list">${CLASES.filter(c => c.dow === S.dow).sort((a, b) => toMin(a.hora) - toMin(b.hora)).map(T.rowClase).join('') || empty('Sin clases este día')}</div>`;

  T.asist = () => `${head('Asistencias', cap(fLong(today)), `<button class="btn" data-role="tablet">${ic('tablet')}Abrir recepción</button>`)}
    <div class="stats stats-3">${T.stat('Ingresos hoy', BASE.hoy + S.newCk, 'Registrados con DNI')}${T.stat('Promedio diario', BASE.prom, 'Últimos 30 días')}${T.stat('Esta semana', 287 + S.newCk, '+6% vs. semana pasada')}</div>
    <section class="card"><div class="card-h"><h2>Últimos ingresos</h2><small>Tablet de recepción</small></div><div class="list">${hoy.map(h => { const s = byId(h.socioId); return `<button class="row" data-socio="${s.id}" data-from="asist"><span class="cls-time num"><b>${h.hora}</b></span>${av(s)}<span class="row-main"><b>${s.full}</b><small>DNI ${fDni(s.dni)}</small></span><span class="row-end">${pill(s)}</span></button>`; }).join('')}</div></section>`;

  T.profes = () => `${head('Profesores', `${COACHES.length} en el equipo`, `<button class="btn btn-primary" data-act="new-coach">${ic('plus')}Agregar profesor</button>`)}
    <div class="coach-grid">${COACHES.map(c => { const cl = CLASES.filter(x => x.coachId === c.id); const td = cl.filter(x => x.dow === today.getDay()).map(x => x.hora); return `<section class="card coach"><div class="p-id"><span class="av av-lg">${c.nombre.split(' ').map(w => w[0]).join('')}</span><div><h2>${c.nombre}</h2><p>${c.rol} · ${c.esp}</p></div></div>
      <dl class="kv"><div><dt>Clases por semana</dt><dd class="num">${cl.length}</dd></div><div><dt>Hoy</dt><dd class="num">${td.join(' · ') || 'Libre'}</dd></div><div><dt>Teléfono</dt><dd>${c.tel}</dd></div></dl></section>`; }).join('')}</div>`;

  T.profHome = () => {
    const nx = nextClass();
    const att = atencion().filter(a => a.kind !== 'idle').slice(0, 4);
    return `<div class="hello"><p>${cap(fLong(today))}</p><h1>Hola, ${ME.nombre.split(' ')[0]}</h1></div>
    <button class="search search-fake" data-act="focus-search">${ic('search')}<span>Buscar socio por nombre o DNI</span></button>
    <div class="quick">
      <button class="qbtn qbtn-primary" data-act="pay">${ic('card')}<b>Registrar pago</b><small>En 3 toques</small></button>
      <button class="qbtn" data-act="new-socio">${ic('plus')}<b>Nuevo socio</b><small>Alta en 1 minuto</small></button>
    </div>
    ${nx.c ? `<button class="card next-class" data-act="class" data-id="${nx.c.id}"><span class="nc-l">Próxima clase · ${nx.when}</span><span class="nc-m"><b class="num">${nx.c.hora}</b><span><b>${nx.c.tipo}</b><small>${coach(nx.c.coachId).nombre}</small></span></span><span class="cupo"><span class="bar"><i style="width:${Math.round(nx.c.ins / nx.c.cupo * 100)}%"></i></span><small class="num">${nx.c.ins}/${nx.c.cupo} anotados</small></span></button>` : ''}
    <section class="card"><div class="card-h"><h2>Cuotas para cobrar</h2><button class="link" data-go="socios" data-filter="bad">Ver todas</button></div><div class="list">${att.map(T.rowAtt).join('')}</div></section>`;
  };

  T.login = () => `<div class="login-wrap"><form class="login" data-form="login" novalidate>
    <img class="login-logo" src="${HB.logo}" alt="Híbrido Box">
    <h1>Ingresá a Híbrido Box</h1><p class="login-sub">Socios, pagos y clases en un solo lugar</p>
    <label class="field"><span>Email</span><input id="l-email" type="email" value="martin@hibridobox.com.ar" autocomplete="username"></label>
    <label class="field"><span>Contraseña</span><input id="l-pass" type="password" value="hibrido2026" autocomplete="current-password"></label>
    <button class="btn btn-primary btn-lg btn-block" type="submit">Ingresar</button>
    <button class="link link-center" type="button" data-act="forgot">Olvidé mi contraseña</button>
  </form></div>`;

  const NAV = [['dashboard', 'Inicio', 'home'], ['socios', 'Socios', 'users'], ['pagos', 'Pagos', 'card'], ['venc', 'Vencimientos', 'calendar'], ['clases', 'Clases', 'clock'], ['asist', 'Asistencias', 'check'], ['profes', 'Profesores', 'coach']];
  const curNav = () => S.view === 'socio' ? 'socios' : S.view;

  T.ownerShell = () => `<div class="app owner-app"><div class="shell">
    <aside class="side">
      <div class="brand"><img src="${HB.logo}" alt=""><div><b>Híbrido Box</b><small>Panel del dueño</small></div></div>
      <nav class="side-nav">${NAV.map(([v, l, i]) => `<button class="nav-i" data-go="${v}" aria-current="${curNav() === v ? 'page' : 'false'}">${ic(i)}<span>${l}</span>${v === 'venc' ? `<span class="badge">${count('bad')}</span>` : ''}</button>`).join('')}</nav>
      <div class="side-foot"><button class="nav-i" data-role="tablet">${ic('tablet')}<span>Abrir recepción</span></button>
      <div class="me"><span class="av">MA</span><div><b>${OWNER.nombre}</b><small>Dueño</small></div><button class="icon-btn" data-act="logout" aria-label="Cerrar sesión">${ic('logout')}</button></div></div>
    </aside>
    <div class="main">
      <div class="topbar"><img src="${HB.logo}" alt=""><b>Híbrido Box</b><span class="av av-sm">MA</span></div>
      <div class="scroll" id="scroll"><div class="content">${T.view()}</div></div>
      <nav class="tabbar">${[['dashboard', 'Inicio', 'home'], ['socios', 'Socios', 'users'], ['venc', 'Vencim.', 'calendar'], ['clases', 'Clases', 'clock']].map(([v, l, i]) => `<button class="tab" data-go="${v}" aria-current="${curNav() === v ? 'page' : 'false'}">${ic(i)}<span>${l}</span></button>`).join('')}<button class="tab" data-act="more" aria-current="${['pagos', 'asist', 'profes'].includes(curNav()) ? 'page' : 'false'}">${ic('more')}<span>Más</span></button></nav>
    </div></div><div id="sheet-root"></div><div id="toast-root" class="toast-root" aria-live="polite"></div></div>`;

  T.profStage = () => `<div class="prof-wrap"><div class="phone"><div class="app prof-app">
      <div class="sbar"><b class="num">${nowHM()}</b><span>${ic('mobile')}</span></div>
      <div class="ph-head"><img src="${HB.logo}" alt=""><b>Híbrido Box</b><span class="av av-sm">PR</span></div>
      <div class="scroll" id="scroll"><div class="content">${T.view()}</div></div>
      <nav class="tabbar">
        <button class="tab" data-go="profHome" aria-current="${S.view === 'profHome' ? 'page' : 'false'}">${ic('home')}<span>Inicio</span></button>
        <button class="tab" data-go="socios" aria-current="${['socios', 'socio'].includes(S.view) ? 'page' : 'false'}">${ic('users')}<span>Socios</span></button>
        <button class="tab tab-cta" data-act="pay">${ic('card')}<span>Cobrar</span></button>
        <button class="tab" data-go="clases" aria-current="${S.view === 'clases' ? 'page' : 'false'}">${ic('clock')}<span>Clases</span></button>
      </nav>
      <div id="sheet-root"></div><div id="toast-root" class="toast-root" aria-live="polite"></div>
    </div></div>
    <aside class="prof-notes">${HB.profNotes || ''}</aside></div>`;

  const DEMO = [['40223519', 'Activa'], ['38901442', 'Vence mañana'], ['35482117', 'Vencida'], ['30111222', 'No registrado']];

  T.tabletStage = () => `<div class="tab-wrap"><div class="tablet"><div class="kiosk" id="kiosk">${T.kiosk()}</div></div>
    <div class="ck-help"><span>DNIs de prueba</span>${DEMO.map(([d, l]) => `<button class="chip" data-act="ck-try" data-v="${d}">${fDni(d)} <span class="chip-n">${l}</span></button>`).join('')}</div></div>`;

  T.kioskTop = () => `<div class="k-top"><img src="${HB.logo}" alt="Híbrido Box"><span class="k-clock num" id="k-clock">${nowHM()}</span></div>`;

  T.kiosk = () => {
    const c = S.ck;
    if (c.phase === 'idle') return `${T.kioskTop()}<form class="k-form" data-form="ck" autocomplete="off">
      <label for="dni" class="k-label">Ingresá tu DNI</label>
      <input id="dni" class="k-input num" inputmode="numeric" maxlength="8" value="${esc(c.val || '')}" placeholder="Sin puntos" aria-describedby="k-hint">
      <button class="btn btn-primary k-btn" type="submit">Ingresar</button>
      <p class="k-hint ${c.err ? 'is-err' : ''}" id="k-hint">${c.err || 'Escribí tu número y presioná <kbd>Enter</kbd>'}</p></form>`;
    if (c.phase === 'missing') return `${T.kioskTop()}<div class="k-res k-missing"><span class="k-badge">${ic('info')}</span><h1 class="k-name">No encontramos ese DNI</h1><p class="k-venc num">${fDni(c.dni)}</p><p class="k-note">Revisá el número o consultá en recepción.</p><div class="k-timer"><i style="animation-duration:${c.ms}ms"></i></div></div>`;
    const s = byId(c.socioId), k = st(s);
    return `${T.kioskTop()}<div class="k-res k-${k}">
      <span class="k-badge">${ic(k === 'bad' ? 'alert' : 'check')}</span>
      <h1 class="k-name">${s.full}</h1>
      <p class="k-status"><i class="dot dot-${k}"></i>${ST_LONG[k]}</p>
      <p class="k-venc">${k === 'bad' ? 'Venció el' : 'Vence el'} <b class="num">${fDate(s.venc)}</b></p>
      ${k === 'bad' ? '<p class="k-note">Tu cuota está vencida. Pasá por el mostrador para renovarla.</p>' : k === 'warn' ? `<p class="k-note">${vencTxt(s)}. Podés renovarla hoy en recepción.</p>` : ''}
      <p class="k-ok">${ic('check')}Asistencia registrada · ${c.hora}</p>
      <div class="k-timer"><i style="animation-duration:${c.ms}ms"></i></div></div>`;
  };

  /* ---------- hojas (modales) ---------- */
  const sheetWrap = (title, body, sub = '') => `<div class="overlay" data-act="close-bg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t"><div class="sheet-h"><div><h2 id="sh-t">${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic('x')}</button></div><div class="sheet-b">${body}</div></div></div>`;

  T.sheet = () => {
    const sh = S.sheet; if (!sh) return '';
    if (sh.type === 'pay') {
      if (sh.done) {
        const s = byId(sh.socioId);
        return sheetWrap('Pago registrado', `<div class="done"><span class="done-i">${ic('check')}</span><b class="num">${money(sh.done.monto)}</b><p>${s.full} · ${PLANS[sh.done.plan].name} · ${sh.done.medio}</p><div class="status-box sb-ok">${pill(s, 'ok')}<strong>Activa hasta el ${fDate(s.venc)}</strong><small>Comprobante enviado por WhatsApp</small></div></div><div class="sheet-f"><button class="btn btn-lg" data-socio="${s.id}">Ver socio</button><button class="btn btn-primary btn-lg" data-act="close">Listo</button></div>`);
      }
      if (!sh.socioId) {
        return sheetWrap('Registrar pago', `<label class="search">${ic('search')}<input id="pq" type="search" placeholder="Nombre o DNI del socio" autocomplete="off" aria-label="Buscar socio"></label><p class="sheet-hint">Primero los que tienen la cuota vencida o por vencer</p><div class="list" id="plist">${T.payList('')}</div>`, 'Paso 1 de 2 · Elegí el socio');
      }
      const s = byId(sh.socioId), pl = PLANS[sh.plan];
      return sheetWrap('Registrar pago', `<div class="pay-who">${av(s)}<span class="row-main"><b>${s.full}</b><small>${vencTxt(s)}</small></span>${pill(s)}</div>
        <div class="fgroup"><span class="flabel">Plan</span>${chips('plan', Object.entries(PLANS).map(([k, p]) => [k, `${p.short}<em class="num">${money(p.price)}</em>`]), sh.plan)}</div>
        <div class="fgroup"><span class="flabel">Medio de pago</span>${chips('medio', MEDIOS.map(m => [m, m]), sh.medio)}</div>
        <dl class="kv sum"><div><dt>Nuevo vencimiento</dt><dd class="num" id="sum-venc">${fDate(newVenc(s))}</dd></div></dl>
        <div class="sheet-f"><button class="btn btn-primary btn-lg btn-block" data-act="confirm-pay" id="pay-btn">Confirmar <span class="num" id="sum-monto">${money(pl.price)}</span></button></div>`, sh.fromPick ? 'Paso 2 de 2 · Confirmá' : 'Plan y medio ya están precargados');
    }
    if (sh.type === 'alta') {
      return sheetWrap('Nuevo socio', `<form data-form="alta" novalidate class="form">
        <div class="frow"><label class="field"><span>Nombre</span><input id="f-nom" autocomplete="off" placeholder="Ej.: Laura"></label><label class="field"><span>Apellido</span><input id="f-ape" autocomplete="off" placeholder="Ej.: Vázquez"></label></div>
        <div class="frow"><label class="field"><span>DNI</span><input id="f-dni" inputmode="numeric" maxlength="8" placeholder="Sin puntos"></label><label class="field"><span>Celular</span><input id="f-tel" inputmode="tel" placeholder="11 2345-6789"></label></div>
        <div class="fgroup"><span class="flabel">Plan</span>${chips('plan', Object.entries(PLANS).map(([k, p]) => [k, `${p.short}<em class="num">${money(p.price)}</em>`]), sh.plan)}</div>
        <label class="check"><input type="checkbox" id="f-cobrar" checked><span>Cobrar la primera cuota ahora</span></label>
        <div class="fgroup" id="f-medio-g"><span class="flabel">Medio de pago</span>${chips('medio', MEDIOS.map(m => [m, m]), sh.medio)}</div>
        <p class="form-err" id="f-err" role="alert"></p>
        <div class="sheet-f"><button class="btn btn-primary btn-lg btn-block" type="submit">Dar de alta</button></div></form>`, 'Completá los datos básicos. El resto se puede sumar después.');
    }
    if (sh.type === 'class') {
      const c = CLASES.find(x => x.id === sh.id), list = asistentesDe(c);
      return sheetWrap(`${c.tipo} · ${c.hora}`, `<dl class="kv kv-2"><div><dt>Día</dt><dd>${cap(DIAS[c.dow])} ${fShort(dateOfDow(c.dow))}</dd></div><div><dt>Profesor</dt><dd>${coach(c.coachId).nombre}</dd></div><div><dt>Cupo</dt><dd class="num">${c.ins} de ${c.cupo}</dd></div><div><dt>Duración</dt><dd>60 min</dd></div></dl>
        <div class="card-h"><h3>Anotados</h3><small>${list.length}</small></div><div class="list">${list.map(s => `<button class="row" data-socio="${s.id}">${av(s)}<span class="row-main"><b>${s.full}</b><small>${PLANS[s.plan].short}</small></span>${pill(s)}</button>`).join('')}</div>
        <div class="sheet-f"><button class="btn btn-lg btn-block" data-act="edit-class" data-id="${c.id}">${ic('edit')}Editar clase</button></div>`);
    }
    if (sh.type === 'classForm') {
      const c = sh.id ? CLASES.find(x => x.id === sh.id) : { dow: S.dow, hora: '19:30', tipo: 'CrossFit', coachId: ME.id, cupo: 16 };
      const opt = (arr, cur) => arr.map(([v, l]) => `<option value="${v}" ${String(v) === String(cur) ? 'selected' : ''}>${l}</option>`).join('');
      return sheetWrap(sh.id ? 'Editar clase' : 'Nueva clase', `<form data-form="class" novalidate class="form">
        <div class="frow"><label class="field"><span>Día</span><select id="c-dow">${opt([1, 2, 3, 4, 5, 6].map(d => [d, cap(DIAS[d])]), c.dow)}</select></label><label class="field"><span>Horario</span><input id="c-hora" type="time" value="${c.hora}"></label></div>
        <label class="field"><span>Actividad</span><select id="c-tipo">${opt(['CrossFit', 'Funcional', 'Halterofilia', 'Híbrido', 'Open Box', 'Híbrido en equipos'].map(t => [t, t]), c.tipo)}</select></label>
        <div class="frow"><label class="field"><span>Profesor</span><select id="c-coach">${opt(COACHES.map(x => [x.id, x.nombre]), c.coachId)}</select></label><label class="field"><span>Cupo</span><input id="c-cupo" type="number" min="1" max="40" value="${c.cupo}"></label></div>
        <div class="sheet-f"><button class="btn btn-primary btn-lg btn-block" type="submit">${sh.id ? 'Guardar cambios' : 'Crear clase'}</button></div></form>`);
    }
    if (sh.type === 'coach') {
      return sheetWrap('Agregar profesor', `<form data-form="coach" novalidate class="form">
        <label class="field"><span>Nombre y apellido</span><input id="k-nom" autocomplete="off" placeholder="Ej.: Bruno Paz"></label>
        <div class="frow"><label class="field"><span>Celular</span><input id="k-tel" inputmode="tel" placeholder="11 2345-6789"></label><label class="field"><span>Especialidad</span><input id="k-esp" placeholder="CrossFit"></label></div>
        <p class="sheet-hint">Le llega un acceso por WhatsApp para entrar desde el celular.</p><p class="form-err" id="k-err" role="alert"></p>
        <div class="sheet-f"><button class="btn btn-primary btn-lg btn-block" type="submit">Agregar</button></div></form>`);
    }
    if (sh.type === 'more') {
      return sheetWrap('Más opciones', `<div class="list">${[['pagos', 'Pagos', 'card'], ['asist', 'Asistencias', 'check'], ['profes', 'Profesores', 'coach']].map(([v, l, i]) => `<button class="row" data-go="${v}"><span class="av av-ghost">${ic(i)}</span><span class="row-main"><b>${l}</b></span>${ic('chev', 'chev')}</button>`).join('')}
        <button class="row" data-role="tablet"><span class="av av-ghost">${ic('tablet')}</span><span class="row-main"><b>Abrir recepción</b><small>Pantalla de check-in por DNI</small></span>${ic('chev', 'chev')}</button>
        <button class="row" data-act="logout"><span class="av av-ghost">${ic('logout')}</span><span class="row-main"><b>Cerrar sesión</b></span></button></div>`);
    }
    return '';
  };

  T.payList = q => {
    const nq = norm(q.trim()), dq = q.replace(/\D/g, '');
    const rank = { bad: 0, warn: 1, ok: 2 };
    const arr = socios.filter(s => !nq || norm(s.full).includes(nq) || (dq && s.dni.includes(dq)))
      .sort((a, b) => rank[st(a)] - rank[st(b)] || a.venc - b.venc).slice(0, 8);
    return arr.map(s => `<button class="row" data-act="pick" data-id="${s.id}">${av(s)}<span class="row-main"><b>${s.full}</b><small>DNI ${fDni(s.dni)} · ${vencTxt(s)}</small></span>${pill(s)}</button>`).join('') || empty('Sin resultados', 'Probá con otro nombre o DNI.');
  };

  T.view = () => (T[S.view] || T.dashboard)();

  /* ---------- render ---------- */
  const $ = sel => document.querySelector(sel);
  function render() {
    document.querySelectorAll('.demobar [data-role]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.role === S.role)));
    const stage = $('#stage');
    stage.className = 'stage stage-' + S.role;
    if (S.role === 'owner') stage.innerHTML = S.logged ? T.ownerShell() : T.login();
    else if (S.role === 'prof') stage.innerHTML = T.profStage();
    else stage.innerHTML = T.tabletStage();
    renderSheet();
    if (S.role === 'tablet') focusDni();
  }
  function renderView() {
    const sc = $('#scroll'); if (!sc) return render();
    const top = sc.scrollTop;
    sc.firstElementChild.innerHTML = T.view();
    sc.scrollTop = top;
    document.querySelectorAll('.app [data-go], .app [data-act="more"]').forEach(b => {
      if (b.closest('.side-nav, .tabbar')) {
        const v = b.dataset.go;
        const on = v ? (v === curNav() || (v === 'socios' && S.view === 'socio')) : ['pagos', 'asist', 'profes'].includes(curNav());
        b.setAttribute('aria-current', on ? 'page' : 'false');
      }
    });
    const badge = document.querySelector('.side-nav .badge'); if (badge) badge.textContent = count('bad');
  }
  function renderSheet() {
    const root = $('#sheet-root'); if (!root) return;
    root.innerHTML = T.sheet();
    const f = root.querySelector('#pq, #f-nom, #k-nom');
    if (f && window.matchMedia('(pointer:fine)').matches) f.focus();
  }
  function go(view, opts = {}) {
    if (view === 'socio') S.back = opts.from || (S.view === 'socio' ? S.back : S.view);
    S.view = view; S.sheet = null;
    if (!$('#scroll')) return render();
    renderView(); renderSheet();
    $('#scroll').scrollTop = 0;
  }
  function setSheet(sh) { S.sheet = sh; renderSheet(); }
  function toast(msg) {
    const root = $('#toast-root'); if (!root) return;
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = `${ic('check')}<span>${msg}</span>`;
    root.appendChild(t); setTimeout(() => t.classList.add('out'), 2600); setTimeout(() => t.remove(), 3000);
  }

  /* ---------- check-in ---------- */
  let ckTimer = null;
  function focusDni() { const i = $('#dni'); if (i) { i.focus(); const v = i.value; i.value = ''; i.value = v; } }
  function renderKiosk() { const k = $('#kiosk'); if (k) k.innerHTML = T.kiosk(); focusDni(); }
  function ckReset(val = '') { clearTimeout(ckTimer); S.ck = { phase: 'idle', val }; renderKiosk(); }
  function ckSubmit(raw) {
    const dni = String(raw).replace(/\D/g, '');
    if (dni.length < 7) { S.ck = { phase: 'idle', val: dni, err: 'El DNI tiene 7 u 8 números' }; renderKiosk(); const i = $('#dni'); if (i) { i.classList.remove('shake'); void i.offsetWidth; i.classList.add('shake'); } return; }
    const s = byDni(dni);
    clearTimeout(ckTimer);
    if (!s) { S.ck = { phase: 'missing', dni, ms: 4000 }; renderKiosk(); ckTimer = setTimeout(() => ckReset(), 4000); return; }
    const hora = nowHM();
    hoy.unshift({ socioId: s.id, hora }); s.asist.unshift({ fecha: new Date(today), hora }); s.last = 0; S.newCk++;
    const ms = st(s) === 'bad' ? 8000 : 6000;
    S.ck = { phase: 'result', socioId: s.id, hora, ms }; renderKiosk();
    ckTimer = setTimeout(() => ckReset(), ms);
  }
  setInterval(() => { const c = $('#k-clock'); if (c) c.textContent = nowHM(); }, 15000);

  /* ---------- eventos ---------- */
  function onClick(e) {
    const el = e.target.closest('[data-role],[data-go],[data-socio],[data-act]');
    if (!el) return;
    if (el.dataset.act === 'close-bg') { if (e.target === el) setSheet(null); return; }
    if (el.dataset.role) {
      clearTimeout(ckTimer); S.role = el.dataset.role; S.sheet = null; S.ck = { phase: 'idle', val: '' };
      if (S.role === 'prof') { S.view = 'profHome'; S.q = ''; S.filter = 'all'; }
      if (S.role === 'owner' && (S.view === 'profHome' || !S.view)) S.view = 'dashboard';
      if (S.role === 'owner' && S.view === 'socio' && S.back === 'profHome') S.back = 'dashboard';
      render(); return;
    }
    if (el.dataset.go) { if (el.dataset.filter) S.filter = el.dataset.filter; if (el.dataset.go === 'socios' && !el.dataset.filter && el.closest('.side-nav,.tabbar')) { S.q = ''; S.filter = 'all'; } go(el.dataset.go); return; }
    if (el.dataset.socio) { S.socioId = +el.dataset.socio; go('socio', { from: el.dataset.from }); return; }
    const a = el.dataset.act, v = el.dataset.v, id = el.dataset.id;
    switch (a) {
      case 'close': setSheet(null); break;
      case 'more': setSheet({ type: 'more' }); break;
      case 'logout': S.logged = false; S.sheet = null; S.view = 'dashboard'; render(); break;
      case 'forgot': toast('Te enviamos un enlace a tu email'); break;
      case 'filter': S.filter = v; renderView(); break;
      case 'vtab': S.vtab = v; renderView(); break;
      case 'dow': S.dow = +v; renderView(); break;
      case 'class': setSheet({ type: 'class', id: +id }); break;
      case 'edit-class': setSheet({ type: 'classForm', id: +id }); break;
      case 'new-class': setSheet({ type: 'classForm' }); break;
      case 'new-coach': setSheet({ type: 'coach' }); break;
      case 'new-socio': setSheet({ type: 'alta', plan: 'libre', medio: 'Efectivo' }); break;
      case 'focus-search': S.q = ''; S.filter = 'all'; go('socios'); setTimeout(() => { const q = $('#q'); if (q) q.focus(); }, 30); break;
      case 'pay': {
        const s = id ? byId(id) : null;
        setSheet({ type: 'pay', socioId: s ? s.id : null, plan: s ? s.plan : 'libre', medio: 'Efectivo' }); break;
      }
      case 'pick': { const s = byId(id); setSheet({ type: 'pay', socioId: s.id, plan: s.plan, medio: 'Efectivo', fromPick: true }); break; }
      case 'plan': case 'medio': {
        el.parentElement.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === el)));
        S.sheet[a] = v;
        const m = $('#sum-monto'); if (m) m.textContent = money(PLANS[S.sheet.plan].price);
        break;
      }
      case 'confirm-pay': {
        const sh = S.sheet, s = byId(sh.socioId), monto = PLANS[sh.plan].price;
        s.venc = newVenc(s); s.plan = sh.plan;
        pagos.unshift({ id: ++pid, socioId: s.id, fecha: new Date(today), monto, plan: sh.plan, medio: sh.medio, por: isProf() ? ME.nombre : OWNER.nombre });
        S.extraIng += monto; S.nPagos++;
        sh.done = { monto, plan: sh.plan, medio: sh.medio };
        renderSheet(); renderView(); break;
      }
      case 'ck-try': ckReset(v); setTimeout(() => ckSubmit(v), 350); break;
    }
  }

  function onSubmit(e) {
    const f = e.target.closest('[data-form]'); if (!f) return;
    e.preventDefault();
    const val = id => (document.getElementById(id) || {}).value || '';
    switch (f.dataset.form) {
      case 'login': S.logged = true; S.view = 'dashboard'; render(); break;
      case 'ck': ckSubmit(val('dni')); break;
      case 'alta': {
        const nom = val('f-nom').trim(), ape = val('f-ape').trim(), dni = val('f-dni').replace(/\D/g, ''), tel = val('f-tel').trim();
        const err = !nom || !ape ? 'Completá nombre y apellido.' : dni.length < 7 ? 'El DNI tiene que tener 7 u 8 números.' : byDni(dni) ? `Ya hay un socio con DNI ${fDni(dni)}.` : '';
        if (err) { $('#f-err').textContent = err; return; }
        const cobrar = document.getElementById('f-cobrar').checked, sh = S.sheet;
        const s = { id: socios.length + 1, nombre: cap(nom), apellido: cap(ape), dni, plan: sh.plan, venc: new Date(today), last: 99, tel: tel || '11 0000-0000', alta: new Date(today), asist: [] };
        s.full = `${s.nombre} ${s.apellido}`; s.email = mkEmail(s.nombre, s.apellido);
        if (cobrar) { s.venc = newVenc(s); pagos.unshift({ id: ++pid, socioId: s.id, fecha: new Date(today), monto: PLANS[s.plan].price, plan: s.plan, medio: sh.medio, por: isProf() ? ME.nombre : OWNER.nombre }); S.extraIng += PLANS[s.plan].price; S.nPagos++; }
        else s.venc = addDays(-1);
        socios.push(s); S.nuevos++; S.socioId = s.id;
        go('socio'); toast(`${s.full} ya es socio${cobrar ? ' · pago registrado' : ''}`);
        break;
      }
      case 'class': {
        const sh = S.sheet;
        const data = { dow: +val('c-dow'), hora: val('c-hora') || '19:30', tipo: val('c-tipo'), coachId: +val('c-coach'), cupo: Math.max(1, +val('c-cupo') || 16) };
        if (sh.id) Object.assign(CLASES.find(x => x.id === sh.id), data);
        else CLASES.push({ id: ++cid, ins: 0, ...data });
        S.dow = data.dow; setSheet(null); renderView(); toast(sh.id ? 'Clase actualizada' : 'Clase creada');
        break;
      }
      case 'coach': {
        const nom = val('k-nom').trim();
        if (!nom) { $('#k-err').textContent = 'Escribí el nombre del profesor.'; return; }
        COACHES.push({ id: COACHES.length + 1, nombre: nom, rol: 'Coach', tel: val('k-tel') || '—', esp: val('k-esp') || 'CrossFit' });
        setSheet(null); renderView(); toast(`${nom} se sumó al equipo`);
        break;
      }
    }
  }

  function onInput(e) {
    const t = e.target;
    if (t.id === 'q') { S.q = t.value; const l = $('#list'); if (l) l.innerHTML = T.socioList(); }
    if (t.id === 'pq') { $('#plist').innerHTML = T.payList(t.value); }
    if (t.id === 'dni' || t.id === 'f-dni') { const c = t.value.replace(/\D/g, ''); if (c !== t.value) t.value = c; if (t.id === 'dni' && S.ck.err) { S.ck.err = ''; const h = $('#k-hint'); if (h) { h.classList.remove('is-err'); h.innerHTML = 'Escribí tu número y presioná <kbd>Enter</kbd>'; } } }
  }
  function onChange(e) {
    if (e.target.id === 'f-cobrar') { const g = $('#f-medio-g'); if (g) g.hidden = !e.target.checked; }
  }
  function onKey(e) {
    if (e.key === 'Escape' && S.sheet) { setSheet(null); return; }
    if (S.role !== 'tablet') return;
    if (S.ck.phase !== 'idle') {
      if (/^\d$/.test(e.key)) { e.preventDefault(); ckReset(e.key); }
      else if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); ckReset(); }
      return;
    }
    const i = $('#dni');
    if (i && document.activeElement !== i && /^\d$/.test(e.key) && !e.target.closest('input,select,textarea')) { e.preventDefault(); i.value += e.key; focusDni(); }
    if (e.key === 'Escape' && i) { i.value = ''; }
  }

  function boot() {
    const h = (location.hash || '').slice(1);
    if (h === 'profesor') { S.role = 'prof'; S.view = 'profHome'; }
    else if (h === 'recepcion') S.role = 'tablet';
    else if (h === 'panel') S.logged = true;
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    document.addEventListener('input', onInput);
    document.addEventListener('change', onChange);
    document.addEventListener('keydown', onKey);
    render();
  }

  return { T, S, boot, ic, logo: '', profNotes: '', util: { money, fDate, fShort, fLong, fDni, cap, esc, daysTo, plural, MESES, DIAS }, data: { socios, pagos, hoy, CLASES, COACHES, BASE, PLANS, ME, OWNER }, fn: { st, vencTxt, pill, av, head, atencion, nextClass, coach, clsState, empty, ini, ST_LABEL, ST_LONG, byId } };
})();
