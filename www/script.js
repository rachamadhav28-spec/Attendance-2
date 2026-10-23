
const DEFAULT_SUBJECTS = {
  'ENG': 'English',
  'DLD': 'Digital Logic Design',
  'M1': 'Maths-I',
  'CHEM': 'Engg. Chemistry',
  'GRAPHICS': 'Engg. Graphics',
  'CHEM_LAB': 'CHEM LAB',
  'ENG_LAB': 'Comm. ENGLISH lab'
};

const TIMETABLE = {
  'MON': [
    { time: '10:00-11:00', code: 'ENG' },
    { time: '11:00-12:00', code: 'DLD' },
    { time: '12:00-01:00', code: 'M1' },
    { time: '02:00-03:00', code: 'GRAPHICS' },
    { time: '03:00-04:00', code: 'GRAPHICS' },
    { time: '04:00-05:00', code: 'GRAPHICS' }
  ],
  'TUE': [
    { time: '10:00-11:00', code: 'CHEM' },
    { time: '11:00-12:00', code: 'DLD' },
    { time: '12:00-01:00', code: 'M1' },
    { time: '02:00-03:00', code: 'DLD' },
    { time: '03:00-04:00', code: 'ENG_LAB' },
    { time: '04:00-05:00', code: 'ENG_LAB' }
  ],
  'WED': [
    { time: '10:00-11:00', code: 'GRAPHICS' },
    { time: '11:00-12:00', code: 'GRAPHICS' },
    { time: '12:00-01:00', code: 'GRAPHICS' },
    { time: '02:00-03:00', code: 'M1' },
    { time: '03:00-04:00', code: 'ENG_LAB' },
    { time: '04:00-05:00', code: 'ENG_LAB' }
  ],
  'THUR': [
    { time: '10:00-11:00', code: 'FREE', name: 'No Class / Free Period' },
    { time: '11:00-12:00', code: 'FREE', name: 'No Class / Free Period' },
    { time: '12:00-01:00', code: 'ENG' },
    { time: '02:00-03:00', code: 'CHEM_LAB' },
    { time: '03:00-04:00', code: 'CHEM_LAB' },
    { time: '04:00-05:00', code: 'CHEM_LAB' }
  ],
  'FRI': [
    { time: '10:00-11:00', code: 'CHEM' },
    { time: '11:00-12:00', code: 'CHEM' },
    { time: '12:00-01:00', code: 'ENG' },
    { time: '02:00-03:00', code: 'CHEM_LAB' },
    { time: '03:00-04:00', code: 'CHEM_LAB' },
    { time: '04:00-05:00', code: 'CHEM_LAB' }
  ],
  'SAT': [
    { time: '10:00-11:00', code: 'FREE', name: 'No Class / Free Period' },
    { time: '11:00-12:00', code: 'M1' },
    { time: '12:00-01:00', code: 'M1' },
    { time: '02:00-03:00', code: 'CHEM_LAB' },
    { time: '03:00-04:00', code: 'CHEM_LAB' },
    { time: '04:00-05:00', code: 'CHEM_LAB' }
  ]
};

let appState = {
  target: 75,
  subjects: { ...DEFAULT_SUBJECTS },
  counts: {},
  history: []
};

function initApp() {
  loadFromStorage();
  setTodayDate();
  renderDashboard();
  renderManualEdit();
  renderBunkCalc();
  renderHistory();
  renderSettings();
}

function loadFromStorage() {
  const saved = localStorage.getItem('mgu_attendance_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      appState = { ...appState, ...parsed };
    } catch(e) {
      console.error(e);
    }
  }
  Object.keys(appState.subjects).forEach(code => {
    if (!appState.counts[code]) {
      appState.counts[code] = { attended: 0, missed: 0 };
    }
  });
}

function saveToStorage() {
  localStorage.setItem('mgu_attendance_data', JSON.stringify(appState));
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  event.currentTarget.classList.add('active');
  document.getElementById(`tab-${tabId}`).classList.add('active');

  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'manualEdit') renderManualEdit();
  if (tabId === 'bunkCalc') renderBunkCalc();
  if (tabId === 'history') renderHistory();
}

function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('logDate').value = today;
  loadDaySchedule();
}

function getDayName(dateStr) {
  const date = new Date(dateStr);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THUR', 'FRI', 'SAT'];
  return days[date.getDay()];
}

function loadDaySchedule() {
  const dateVal = document.getElementById('logDate').value;
  if (!dateVal) return;

  const dayName = getDayName(dateVal);
  const container = document.getElementById('loggerSlotsContainer');
  const info = document.getElementById('dayInfoText');
  container.innerHTML = '';

  if (dayName === 'SUN') {
    info.innerText = 'Sunday - No regular classes scheduled.';
    return;
  }

  info.innerText = `${dayName} Schedule:`;
  const slots = TIMETABLE[dayName] || [];

  slots.forEach((slot, idx) => {
    const isFree = slot.code === 'FREE';
    const subName = isFree ? slot.name : appState.subjects[slot.code];

    const row = document.createElement('div');
    row.className = 'slot-row';
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="slot-time">${slot.time}</span>
        <span class="slot-sub">${subName}</span>
      </div>
      <div class="slot-actions">
        ${isFree ? '<span style="font-size: 0.75rem; color: #64748b;">Free Period</span>' : `
          <button class="btn-status present active" onclick="setSlotStatus(${idx}, 'present', this)">Present</button>
          <button class="btn-status absent" onclick="setSlotStatus(${idx}, 'absent', this)">Absent</button>
          <button class="btn-status cancelled" onclick="setSlotStatus(${idx}, 'cancelled', this)">Cancelled</button>
        `}
      </div>
    `;
    container.appendChild(row);
  });
}

function setSlotStatus(idx, status, btn) {
  const parent = btn.parentElement;
  parent.querySelectorAll('.btn-status').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function saveDailyAttendance() {
  const dateVal = document.getElementById('logDate').value;
  const dayName = getDayName(dateVal);
  if (dayName === 'SUN') return alert('No classes on Sunday!');

  const slots = TIMETABLE[dayName] || [];
  const rows = document.querySelectorAll('#loggerSlotsContainer .slot-row');

  rows.forEach((row, idx) => {
    const slot = slots[idx];
    if (!slot || slot.code === 'FREE') return;

    const activeBtn = row.querySelector('.btn-status.active');
    if (!activeBtn) return;

    const status = activeBtn.innerText.toLowerCase();
    if (status === 'present') {
      appState.counts[slot.code].attended += 1;
    } else if (status === 'absent') {
      appState.counts[slot.code].missed += 1;
    }
  });

  appState.history.unshift({
    date: dateVal,
    day: dayName,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  saveToStorage();
  alert('Daily log saved!');
  renderDashboard();
}

function renderDashboard() {
  let totalAttended = 0;
  let totalMissed = 0;

  Object.keys(appState.subjects).forEach(code => {
    const c = appState.counts[code] || { attended: 0, missed: 0 };
    totalAttended += c.attended;
    totalMissed += c.missed;
  });

  const totalConducted = totalAttended + totalMissed;
  const overallPct = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '0.0';

  document.getElementById('kpiConducted').innerText = totalConducted;
  document.getElementById('kpiAttended').innerText = totalAttended;
  document.getElementById('kpiMissed').innerText = totalMissed;
  document.getElementById('kpiPercentage').innerText = `${overallPct}%`;
  document.getElementById('headerPctValue').innerText = `${overallPct}%`;

  const bannerText = document.getElementById('statusBannerText');
  if (parseFloat(overallPct) >= appState.target) {
    bannerText.innerText = `Attendance (${overallPct}%) is above target (${appState.target}%).`;
  } else {
    bannerText.innerText = `Warning: Attendance (${overallPct}%) is below target (${appState.target}%).`;
  }

  const grid = document.getElementById('subjectCardsGrid');
  grid.innerHTML = '';

  Object.keys(appState.subjects).forEach(code => {
    const name = appState.subjects[code];
    const c = appState.counts[code] || { attended: 0, missed: 0 };
    const cond = c.attended + c.missed;
    const pct = cond > 0 ? ((c.attended / cond) * 100).toFixed(1) : '0.0';
    const isSafe = parseFloat(pct) >= appState.target;

    const card = document.createElement('div');
    card.className = 'sub-card';
    card.innerHTML = `
      <div class="sub-header">
        <div>
          <div class="sub-title">${name}</div>
          <span class="sub-code">${code}</span>
        </div>
        <span style="font-weight: 700; color: ${isSafe ? 'var(--success)' : 'var(--danger)'}">${pct}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${pct}%; background: ${isSafe ? 'var(--success)' : 'var(--danger)'}"></div>
      </div>
      <div class="sub-stats">
        <span>Attended: ${c.attended}</span>
        <span>Missed: ${c.missed}</span>
        <span>Total: ${cond}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderManualEdit() {
  const container = document.getElementById('manualEditContainer');
  container.innerHTML = '';

  Object.keys(appState.subjects).forEach(code => {
    const name = appState.subjects[code];
    const c = appState.counts[code] || { attended: 0, missed: 0 };

    const card = document.createElement('div');
    card.className = 'manual-edit-card';
    card.innerHTML = `
      <strong>${name} (${code})</strong>
      <div class="manual-input-pair">
        <div>
          <label>Attended:</label>
          <input type="number" min="0" class="input-field" id="edit-att-${code}" value="${c.attended}">
        </div>
        <div>
          <label>Missed:</label>
          <input type="number" min="0" class="input-field" id="edit-miss-${code}" value="${c.missed}">
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function saveManualCounts() {
  Object.keys(appState.subjects).forEach(code => {
    const attVal = parseInt(document.getElementById(`edit-att-${code}`).value) || 0;
    const missVal = parseInt(document.getElementById(`edit-miss-${code}`).value) || 0;
    appState.counts[code] = { attended: attVal, missed: missVal };
  });

  saveToStorage();
  alert('Counts updated!');
  renderDashboard();
}

function renderBunkCalc() {
  const container = document.getElementById('bunkAnalysisCards');
  container.innerHTML = '';

  Object.keys(appState.subjects).forEach(code => {
    const name = appState.subjects[code];
    const c = appState.counts[code] || { attended: 0, missed: 0 };
    const cond = c.attended + c.missed;
    const pct = cond > 0 ? (c.attended / cond) * 100 : 0;
    const t = appState.target / 100;

    let statusMsg = '';
    if (cond === 0) {
      statusMsg = 'No classes conducted yet.';
    } else if (pct >= appState.target) {
      const b = Math.floor((c.attended - t * cond) / t);
      statusMsg = b > 0 ? `Safe to bunk next ${b} class(es).` : 'On target threshold!';
    } else {
      const req = Math.ceil((t * cond - c.attended) / (1 - t));
      statusMsg = `Need to attend next ${req} class(es) continuously.`;
    }

    const card = document.createElement('div');
    card.className = 'bunk-card';
    card.innerHTML = `
      <strong>${name}</strong>
      <div style="margin-top: 2px; font-size: 0.8rem; color: var(--text-muted)">Current: ${pct.toFixed(1)}%</div>
      <div class="bunk-status-text">${statusMsg}</div>
    `;
    container.appendChild(card);
  });
}

function renderHistory() {
  const container = document.getElementById('historyTableContainer');
  if (appState.history.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No history logged yet.</p>';
    return;
  }

  let html = `
    <table class="history-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Day</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
  `;

  appState.history.forEach(item => {
    html += `
      <tr>
        <td>${item.date}</td>
        <td>${item.day}</td>
        <td>${item.timestamp}</td>
      </tr>
    `;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function clearAllHistory() {
  if (confirm('Reset all logged history and attendance counts?')) {
    appState.history = [];
    Object.keys(appState.counts).forEach(k => appState.counts[k] = { attended: 0, missed: 0 });
    saveToStorage();
    renderDashboard();
    renderHistory();
  }
}

function renderSettings() {
  document.getElementById('targetThreshold').value = appState.target;
  const list = document.getElementById('settingsSubjectList');
  list.innerHTML = '';

  Object.keys(appState.subjects).forEach(code => {
    const name = appState.subjects[code];
    const item = document.createElement('div');
    item.className = 'settings-subject-item';
    item.innerHTML = `
      <label>Code: <strong>${code}</strong></label>
      <input type="text" class="input-field" id="subname-${code}" value="${name}">
    `;
    list.appendChild(item);
  });
}

function saveSettings() {
  const targetVal = parseInt(document.getElementById('targetThreshold').value) || 75;
  appState.target = targetVal;

  Object.keys(appState.subjects).forEach(code => {
    const nameVal = document.getElementById(`subname-${code}`).value;
    appState.subjects[code] = nameVal;
  });

  saveToStorage();
  alert('Settings saved!');
  renderDashboard();
}

window.onload = initApp;
