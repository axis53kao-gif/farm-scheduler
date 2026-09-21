'use strict';

/* ===================================================
   模擬資料
=================================================== */
const CROPS = [
  { id: 'butter',  name: '奶油萵苣', seedDays: 7, growDays: 18 },
  { id: 'romaine', name: '蘿蔓生菜', seedDays: 7, growDays: 21 },
  { id: 'arugula', name: '芝麻葉',   seedDays: 5, growDays: 14 },
  { id: 'pakchoi', name: '小白菜',   seedDays: 5, growDays: 16 },
];

const TASKS = [
  { id: 1, type: '播種', rack: 'A架1層3號板', crop: '芝麻葉',   qty: '2 盤' },
  { id: 2, type: '定植', rack: 'B架2層1號板', crop: '奶油萵苣', qty: '20 株' },
  { id: 3, type: '定植', rack: 'C架1層4號板', crop: '小白菜',   qty: '24 株' },
  { id: 4, type: '採收', rack: 'A架3層2號板', crop: '蘿蔓生菜', qty: '30 顆' },
  { id: 5, type: '採收', rack: 'B架4層1號板', crop: '奶油萵苣', qty: '25 顆' },
  { id: 6, type: '播種', rack: 'D架2層2號板', crop: '蘿蔓生菜', qty: '3 盤' },
];

/* ===================================================
   工具函式
=================================================== */
/**
 * 將日期字串或 Date 物件格式化為 YYYY-MM-DD
 */
function formatDate(d) {
  const date = (d instanceof Date) ? d : new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 取得今日日期（忽略時區，以本地日期計算）
 */
function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * 日期加/減天數，回傳新 Date
 */
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* ===================================================
   Tab 切換
=================================================== */
function initTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-content');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

/* ===================================================
   SC-01 倒排排程
=================================================== */
function calcSchedule(deliveryDateStr, crop) {
  const deliveryDate = new Date(deliveryDateStr);
  const transplantDate = addDays(deliveryDate, -crop.growDays);
  const seedDate = addDays(transplantDate, -crop.seedDays);
  return { seedDate, transplantDate, deliveryDate, crop };
}

function renderResultTable(results) {
  const container = document.getElementById('result-table');
  if (!results || results.length === 0) {
    container.innerHTML = '';
    return;
  }
  const rows = results.map(r => `
    <tr>
      <td>${r.crop.name}</td>
      <td>${formatDate(r.deliveryDate)}</td>
      <td>${formatDate(r.transplantDate)}</td>
      <td>${formatDate(r.seedDate)}</td>
      <td>${r.crop.seedDays} 天</td>
      <td>${r.crop.growDays} 天</td>
    </tr>`).join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>菜種</th>
          <th>交貨日</th>
          <th>定植日</th>
          <th>育苗日</th>
          <th>育苗天數</th>
          <th>生長天數</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/* ===================================================
   SC-01 甘特圖（原生 SVG）
=================================================== */
function renderGantt(results) {
  const svg = document.getElementById('gantt-svg');
  svg.innerHTML = '';

  if (!results || results.length === 0) return;

  // 時間軸範圍
  const allDates = results.flatMap(r => [r.seedDate, r.deliveryDate]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  // 加一天 padding
  const rangeStart = addDays(minDate, -1);
  const rangeEnd = addDays(maxDate, 1);
  const totalDays = (rangeEnd - rangeStart) / 86400000;

  const LABEL_W = 80;   // 左側菜種名稱寬度
  const ROW_H   = 40;
  const BAR_H   = 22;
  const BAR_Y   = (ROW_H - BAR_H) / 2;
  const AXIS_H  = 28;
  const PAD_R   = 8;

  const svgWidth = Math.max(500, LABEL_W + 600);
  const chartW = svgWidth - LABEL_W - PAD_R;
  const svgHeight = AXIS_H + results.length * ROW_H + 8;

  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.setAttribute('height', svgHeight);

  const NS = 'http://www.w3.org/2000/svg';

  function px(date) {
    const days = (date - rangeStart) / 86400000;
    return LABEL_W + (days / totalDays) * chartW;
  }

  // 背景
  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('x', 0); bg.setAttribute('y', 0);
  bg.setAttribute('width', svgWidth); bg.setAttribute('height', svgHeight);
  bg.setAttribute('fill', '#fff');
  svg.appendChild(bg);

  // 時間軸刻度（每隔 5 天顯示一條輔助線 + 日期）
  const tickInterval = Math.ceil(totalDays / 10);
  for (let i = 0; i <= totalDays; i += tickInterval) {
    const xPos = LABEL_W + (i / totalDays) * chartW;
    const tickDate = addDays(rangeStart, i);

    // 輔助線
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', xPos); line.setAttribute('y1', AXIS_H);
    line.setAttribute('x2', xPos); line.setAttribute('y2', svgHeight);
    line.setAttribute('stroke', '#e0e0e0');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);

    // 日期文字
    const txt = document.createElementNS(NS, 'text');
    txt.setAttribute('x', xPos);
    txt.setAttribute('y', AXIS_H - 6);
    txt.setAttribute('text-anchor', 'middle');
    txt.setAttribute('font-size', '10');
    txt.setAttribute('fill', '#6c757d');
    txt.textContent = formatDate(tickDate).slice(5); // MM-DD
    svg.appendChild(txt);
  }

  // 今日基準線
  const todayDate = today();
  if (todayDate >= rangeStart && todayDate <= rangeEnd) {
    const xToday = px(todayDate);
    const todayLine = document.createElementNS(NS, 'line');
    todayLine.setAttribute('x1', xToday); todayLine.setAttribute('y1', 0);
    todayLine.setAttribute('x2', xToday); todayLine.setAttribute('y2', svgHeight);
    todayLine.setAttribute('stroke', '#d62828');
    todayLine.setAttribute('stroke-width', '1.5');
    todayLine.setAttribute('stroke-dasharray', '5,3');
    svg.appendChild(todayLine);

    const todayTxt = document.createElementNS(NS, 'text');
    todayTxt.setAttribute('x', xToday + 3);
    todayTxt.setAttribute('y', 12);
    todayTxt.setAttribute('font-size', '10');
    todayTxt.setAttribute('fill', '#d62828');
    todayTxt.textContent = '今日';
    svg.appendChild(todayTxt);
  }

  // 各列：菜種名稱 + 育苗期 + 生長期
  results.forEach((r, i) => {
    const rowY = AXIS_H + i * ROW_H;

    // 奇偶列底色
    if (i % 2 === 0) {
      const rowBg = document.createElementNS(NS, 'rect');
      rowBg.setAttribute('x', 0); rowBg.setAttribute('y', rowY);
      rowBg.setAttribute('width', svgWidth); rowBg.setAttribute('height', ROW_H);
      rowBg.setAttribute('fill', '#f8f9fa');
      svg.appendChild(rowBg);
    }

    // 菜種標籤
    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', LABEL_W - 6);
    label.setAttribute('y', rowY + ROW_H / 2 + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('font-size', '12');
    label.setAttribute('fill', '#212529');
    label.textContent = r.crop.name;
    svg.appendChild(label);

    // 育苗期矩形（藍）
    const x1 = px(r.seedDate);
    const x2 = px(r.transplantDate);
    const seedBar = document.createElementNS(NS, 'rect');
    seedBar.setAttribute('x', x1);
    seedBar.setAttribute('y', rowY + BAR_Y);
    seedBar.setAttribute('width', Math.max(x2 - x1, 2));
    seedBar.setAttribute('height', BAR_H);
    seedBar.setAttribute('fill', '#457b9d');
    seedBar.setAttribute('rx', '3');
    svg.appendChild(seedBar);

    // 育苗期文字
    if (x2 - x1 > 30) {
      const seedTxt = document.createElementNS(NS, 'text');
      seedTxt.setAttribute('x', (x1 + x2) / 2);
      seedTxt.setAttribute('y', rowY + BAR_Y + BAR_H / 2 + 4);
      seedTxt.setAttribute('text-anchor', 'middle');
      seedTxt.setAttribute('font-size', '10');
      seedTxt.setAttribute('fill', '#fff');
      seedTxt.textContent = '育苗';
      svg.appendChild(seedTxt);
    }

    // 生長期矩形（綠）
    const x3 = px(r.transplantDate);
    const x4 = px(r.deliveryDate);
    const growBar = document.createElementNS(NS, 'rect');
    growBar.setAttribute('x', x3);
    growBar.setAttribute('y', rowY + BAR_Y);
    growBar.setAttribute('width', Math.max(x4 - x3, 2));
    growBar.setAttribute('height', BAR_H);
    growBar.setAttribute('fill', '#52b788');
    growBar.setAttribute('rx', '3');
    svg.appendChild(growBar);

    // 生長期文字
    if (x4 - x3 > 30) {
      const growTxt = document.createElementNS(NS, 'text');
      growTxt.setAttribute('x', (x3 + x4) / 2);
      growTxt.setAttribute('y', rowY + BAR_Y + BAR_H / 2 + 4);
      growTxt.setAttribute('text-anchor', 'middle');
      growTxt.setAttribute('font-size', '10');
      growTxt.setAttribute('fill', '#fff');
      growTxt.textContent = '生長';
      svg.appendChild(growTxt);
    }
  });
}

/* ===================================================
   SC-01 表單事件
=================================================== */
function initScheduleForm() {
  const form = document.getElementById('schedule-form');
  const errorMsg = document.getElementById('error-msg');
  const scheduleResults = [];

  form.addEventListener('submit', e => {
    e.preventDefault();

    const cropId = document.getElementById('crop-select').value;
    const deliveryDateStr = document.getElementById('delivery-date').value;

    // 驗證：日期必填
    if (!deliveryDateStr) {
      errorMsg.textContent = '⚠ 請選擇交貨日期';
      errorMsg.classList.remove('hidden');
      return;
    }

    // 驗證：交期不能早於今日
    const deliveryDate = new Date(deliveryDateStr);
    const todayDate = today();
    if (deliveryDate < todayDate) {
      errorMsg.textContent = '⚠ 交期已過，請重新確認';
      errorMsg.classList.remove('hidden');
      renderResultTable([]);
      renderGantt([]);
      return;
    }

    errorMsg.classList.add('hidden');

    const crop = CROPS.find(c => c.id === cropId);
    const result = calcSchedule(deliveryDateStr, crop);

    // 累積結果（最多保留 8 筆）
    scheduleResults.unshift(result);
    if (scheduleResults.length > 8) scheduleResults.pop();

    renderResultTable(scheduleResults);
    renderGantt(scheduleResults);
  });
}

/* ===================================================
   SC-04 派工看板
=================================================== */
function initKanban() {
  const taskList = document.getElementById('task-list');
  const doneCount = document.getElementById('done-count');
  const totalCount = document.getElementById('total-count');

  totalCount.textContent = TASKS.length;
  let completed = 0;

  // 任務類型 → CSS class 對應
  const typeClass = { '播種': 'type-seeding', '定植': 'type-planting', '採收': 'type-harvest' };

  // 渲染卡片
  TASKS.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${typeClass[task.type] || ''}`;
    card.dataset.id = task.id;

    card.innerHTML = `
      <span class="task-badge">${task.type}</span>
      <div class="task-info">
        <strong>架位：</strong>${task.rack}<br />
        <strong>菜種：</strong>${task.crop}<br />
        <strong>數量：</strong>${task.qty}
      </div>
      <button class="task-done-btn" data-id="${task.id}">完成</button>`;

    taskList.appendChild(card);
  });

  // 事件委派
  taskList.addEventListener('click', e => {
    const btn = e.target.closest('.task-done-btn');
    if (!btn) return;
    const card = btn.closest('.task-card');
    if (!card || card.classList.contains('done')) return;

    card.classList.add('done');
    btn.textContent = '已完成';
    completed++;
    doneCount.textContent = completed;
  });
}

/* ===================================================
   初始化
=================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initScheduleForm();
  initKanban();
});
