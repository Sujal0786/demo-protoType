// Hospital Staff Dashboard UI - Clean, Intuitive, Real-Time Synchronized

class HospitalUI {
  constructor() {
    this.container = null;
    this.isSubscribed = false;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();

    // Subscribe to state updates once
    if (!this.isSubscribed) {
      this.isSubscribed = true;
      window.appState.subscribe(() => {
        this.render();
      });
    }
  }

  render() {
    if (!this.container) return;
    const isLoggedIn = window.appState.state.hospitalIsLoggedIn;

    if (!isLoggedIn) {
      this.renderLogin();
    } else {
      this.renderDashboard();
    }
  }

  // --- SCREEN 8: HOSPITAL LOGIN ---
  renderLogin() {
    const html = `
      <div class="hospital-screen flex flex-col h-full bg-slate-900 text-white p-6 justify-center items-center">
        <div class="max-w-md w-full bg-slate-800/90 rounded-3xl p-8 border border-slate-700 shadow-2xl">
          <div class="text-center mb-6">
            <span class="text-4xl p-3 bg-indigo-600/30 rounded-2xl inline-block border border-indigo-500/40">🏥</span>
            <h2 class="text-2xl font-black text-white mt-3">Hospital Staff Login</h2>
            <p class="text-xs text-slate-400 mt-1">City Care Hospital — OPD Reception Desk</p>
          </div>

          <form onsubmit="event.preventDefault(); hospitalUI.login();" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Hospital ID / Username</label>
              <input type="text" value="CITYCARE-MOGA" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 uppercase mb-1">Password</label>
              <input type="password" value="••••••••" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>

            <button type="submit"
                    class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl shadow-lg transition text-base tracking-wider uppercase mt-2">
              LOGIN TO DASHBOARD
            </button>
          </form>

          <p class="text-center text-[11px] text-slate-500 mt-4">
            Pre-authenticated demo mode. Click Login to access.
          </p>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  login() {
    window.appState.state.hospitalIsLoggedIn = true;
    window.appState.saveState();
  }

  logout() {
    window.appState.state.hospitalIsLoggedIn = false;
    window.appState.saveState();
  }

  // --- SCREEN 9-13: COMPLETE HOSPITAL DASHBOARD ---
  renderDashboard() {
    const state = window.appState.state;
    const activeDocId = state.hospitalActiveDoctorId || 'doc-rajesh';
    const activeDoc = MOCK_DOCTORS.find(d => d.id === activeDocId) || MOCK_DOCTORS[0];
    const docQueue = state.doctorQueues[activeDocId] || { currentToken: 21, totalTokens: 48, waitingCount: 12, completedCount: 20, queue: [] };
    const pricing = window.appState.calculatePricingBreakdown();

    const isPaused = state.isQueuePaused;

    const html = `
      <div class="hospital-screen flex flex-col h-full bg-slate-900 text-slate-100 overflow-y-auto">

        <!-- Top Header Navigation -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-1.5 bg-indigo-600/30 rounded-xl border border-indigo-500/40">🏥</span>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-black text-white">City Care Hospital</h1>
                <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Syncing
                </span>
              </div>
              <p class="text-xs text-slate-400">Good Morning, Reception Desk • Today's OPD</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="window.sound.playHospitalChime()"
                    class="bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1"
                    title="Play chime bell test">
              <span>🔔</span>
              <span class="hidden sm:inline">Chime Test</span>
            </button>
            <button onclick="hospitalUI.logout()"
                    class="bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold px-3 py-2 rounded-xl transition">
              Logout
            </button>
          </div>
        </div>

        <div class="p-4 flex-1 space-y-4">

          <!-- SCREEN 11: DOCTOR-WISE QUEUE SELECTOR TABS -->
          <div class="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
            <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Select Doctor Queue:</span>
              <span class="text-xs text-indigo-400">Separate Token Queues</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
              ${MOCK_DOCTORS.map(d => {
                const dq = state.doctorQueues[d.id] || { currentToken: d.initialCurrentToken, waitingCount: d.initialWaiting };
                const isSelected = d.id === activeDocId;
                return `
                  <button onclick="hospitalUI.switchDoctor('${d.id}')"
                          class="p-3 rounded-xl border text-left transition flex items-center justify-between ${isSelected ? 'bg-indigo-600/30 border-indigo-500 shadow-md ring-1 ring-indigo-400' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80'}">
                    <div>
                      <div class="text-xs font-black text-white flex items-center gap-1">
                        <span>${d.symptomIcon}</span>
                        <span>${d.nameEn}</span>
                      </div>
                      <div class="text-[11px] text-slate-400 font-semibold mt-0.5">${d.specialtyEn}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-[10px] text-slate-400 font-bold">Current: <span class="text-emerald-400 text-xs font-black">#${dq.currentToken}</span></div>
                      <div class="text-[10px] text-slate-400 font-bold">Waiting: <span class="text-amber-400 text-xs font-black">${dq.waitingCount}</span></div>
                    </div>
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <!-- SCREEN 9: METRICS BAR (Current Token, Total, Waiting, Completed) -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <!-- Current Token -->
            <div class="bg-gradient-to-br from-indigo-950/80 to-slate-900 p-3.5 rounded-2xl border-2 border-indigo-500/60 shadow-lg">
              <span class="text-xs font-black text-indigo-300 uppercase tracking-wider block">CURRENT TOKEN</span>
              <div class="text-4xl font-black text-white font-mono mt-1 flex items-center gap-2">
                <span>#${docQueue.currentToken}</span>
                ${isPaused ? '<span class="text-xs bg-red-600 text-white px-2 py-0.5 rounded-md font-bold">PAUSED</span>' : ''}
              </div>
              <span class="text-[11px] text-slate-400 font-semibold mt-0.5 block">${activeDoc.nameEn}</span>
            </div>

            <!-- Total Tokens -->
            <div class="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block">TOTAL TOKENS</span>
              <div class="text-3xl font-black text-white font-mono mt-1">#${docQueue.totalTokens}</div>
              <span class="text-[11px] text-slate-500 font-semibold mt-0.5 block">Issued Today</span>
            </div>

            <!-- Waiting -->
            <div class="bg-slate-950/60 p-3.5 rounded-2xl border border-amber-900/40">
              <span class="text-xs font-bold text-amber-400 uppercase tracking-wider block">WAITING</span>
              <div class="text-3xl font-black text-amber-400 font-mono mt-1">${docQueue.waitingCount}</div>
              <span class="text-[11px] text-amber-500/70 font-semibold mt-0.5 block">In Queue At Home</span>
            </div>

            <!-- Completed -->
            <div class="bg-slate-950/60 p-3.5 rounded-2xl border border-emerald-900/40">
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider block">COMPLETED</span>
              <div class="text-3xl font-black text-emerald-400 font-mono mt-1">${docQueue.completedCount}</div>
              <span class="text-[11px] text-emerald-500/70 font-semibold mt-0.5 block">Consultations Done</span>
            </div>
          </div>

          <!-- PRIMARY ACTION BAR: CALL NEXT PATIENT BUTTONS -->
          <div class="bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="text-xs font-black uppercase text-indigo-400">Queue Control</div>
              <div class="text-sm font-bold text-white">Next Patient in Line: <span class="text-emerald-400 font-mono font-black text-base">#${docQueue.currentToken + 1}</span></div>
            </div>

            <!-- Big Action Buttons -->
            <div class="flex flex-wrap items-center gap-2">
              <!-- 1. CALL NEXT TOKEN (Key Action) -->
              <button onclick="hospitalUI.callNext()"
                      class="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm sm:text-base tracking-wide transition border-2 border-indigo-400">
                <span class="text-xl">📢</span>
                <span>CALL NEXT PATIENT</span>
                <span class="text-xs bg-white/20 px-2 py-0.5 rounded-md font-mono">#${docQueue.currentToken + 1}</span>
              </button>

              <!-- 2. RECALL TOKEN -->
              <button onclick="hospitalUI.recall()"
                      class="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 font-bold px-4 py-3 rounded-2xl shadow transition text-xs flex items-center gap-1.5 border border-slate-700"
                      title="Ring hospital chime again">
                <span>🔁</span>
                <span>RECALL TOKEN</span>
              </button>

              <!-- 3. PAUSE QUEUE -->
              <button onclick="hospitalUI.togglePause()"
                      class="${isPaused ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'} font-bold px-4 py-3 rounded-2xl shadow transition text-xs flex items-center gap-1.5 border border-slate-700">
                <span>${isPaused ? '▶️' : '⏸️'}</span>
                <span>${isPaused ? 'RESUME QUEUE' : 'PAUSE QUEUE'}</span>
              </button>
            </div>
          </div>

          <!-- SCREEN 10: LIVE OPD QUEUE TABLE -->
          <div class="bg-slate-950/70 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div class="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">📋</span>
                <h3 class="text-sm font-black text-white uppercase tracking-wider">
                  Live OPD Queue Table — ${activeDoc.nameEn}
                </h3>
              </div>
              <div class="text-xs font-bold text-slate-400">
                Current Token: <span class="text-emerald-400 font-black font-mono text-sm">#${docQueue.currentToken}</span>
              </div>
            </div>

            <!-- The Queue Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-900 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th class="py-3 px-4">Token</th>
                    <th class="py-3 px-4">Patient</th>
                    <th class="py-3 px-4">Doctor</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4">Platform Fee</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 font-medium">
                  ${docQueue.queue.map(item => {
                    const isCurrent = item.tokenNumber === docQueue.currentToken;
                    const isDone = item.tokenNumber < docQueue.currentToken;
                    const isUser = item.isUser;

                    let statusBadge = '';
                    let rowBg = '';

                    if (isCurrent) {
                      statusBadge = '<span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full font-black flex items-center gap-1 w-max"><span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> 🟡 Current</span>';
                      rowBg = 'bg-amber-500/10 font-bold';
                    } else if (isDone) {
                      statusBadge = '<span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 w-max">✅ Done</span>';
                      rowBg = 'text-slate-400';
                    } else {
                      statusBadge = '<span class="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 w-max">⏳ Waiting</span>';
                      rowBg = isUser ? 'bg-teal-500/10 border-l-4 border-teal-500' : '';
                    }

                    return `
                      <tr class="${rowBg} hover:bg-slate-800/40 transition">
                        <td class="py-3 px-4 font-mono font-black text-sm ${isCurrent ? 'text-amber-400 text-base' : (isUser ? 'text-teal-400 font-extrabold' : 'text-slate-200')}">
                          #${item.tokenNumber}
                        </td>
                        <td class="py-3 px-4">
                          <div class="flex items-center gap-2">
                            <span class="${isUser ? 'font-black text-teal-300' : 'text-white'}">${item.patientName}</span>
                            ${isUser ? '<span class="bg-teal-900 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold">Booked from Home</span>' : ''}
                          </div>
                        </td>
                        <td class="py-3 px-4 text-slate-300">${item.doctorName}</td>
                        <td class="py-3 px-4">${statusBadge}</td>
                        <td class="py-3 px-4">
                          ${item.isFree ? `
                            <span class="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                              🎁 FREE
                            </span>
                          ` : `
                            <span class="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                              🪙 ₹10 Paid
                            </span>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- SCREEN 13: PRICING & PLATFORM CHARGES BREAKDOWN (For Hospital) -->
          <div class="bg-slate-950 rounded-3xl p-5 border border-slate-800 shadow-xl">
            <div class="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h3 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <span>🪙</span>
                  <span>Platform Token Charges & Revenue (Platform Model)</span>
                </h3>
                <p class="text-xs text-slate-400">First 3 tokens Free • ₹10 per token thereafter</p>
              </div>

              <!-- Today's Platform Charge Badge -->
              <div class="bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 px-4 py-2 rounded-2xl text-right">
                <span class="text-[10px] uppercase font-bold text-amber-400 block">Today's Platform Charge:</span>
                <span class="text-2xl font-black text-amber-300 font-mono">₹${pricing.totalPlatformCharge}</span>
              </div>
            </div>

            <!-- Visual Pricing Scheme Explanation -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <!-- Tier 1: First 3 Tokens -->
              <div class="bg-slate-900 p-3.5 rounded-2xl border border-emerald-900/60">
                <span class="text-xs font-black text-emerald-400 uppercase block">FIRST 3 TOKENS</span>
                <div class="text-2xl font-black text-emerald-300 mt-1">🟢 FREE</div>
                <p class="text-[11px] text-slate-400 mt-1">Free introductory tier for every patient.</p>
              </div>

              <!-- Tier 2: After 3 Tokens -->
              <div class="bg-slate-900 p-3.5 rounded-2xl border border-amber-900/60">
                <span class="text-xs font-black text-amber-400 uppercase block">AFTER 3 TOKENS</span>
                <div class="text-2xl font-black text-amber-300 mt-1">₹10 / token</div>
                <p class="text-[11px] text-slate-400 mt-1">Nominal convenience fee for remote queueing.</p>
              </div>

              <!-- Tier 3: Summary -->
              <div class="bg-slate-900 p-3.5 rounded-2xl border border-indigo-900/60">
                <span class="text-xs font-black text-indigo-400 uppercase block">TODAY'S TALLY</span>
                <div class="text-base font-bold text-slate-200 mt-1">
                  ${pricing.freeTokensCount} Free + ${pricing.paidTokensCount} Paid (@ ₹10)
                </div>
                <p class="text-[11px] text-slate-400 mt-1">Total tokens across all OPDs: ${pricing.totalTokens}</p>
              </div>
            </div>

            <!-- Sample Breakdown table matching prompt -->
            <div class="bg-slate-900/70 rounded-2xl p-3 border border-slate-800/80">
              <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sample Token Fee Ledger Today:
              </div>
              <div class="flex flex-wrap gap-2 text-xs font-mono">
                <span class="bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700">1 — FREE</span>
                <span class="bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700">2 — FREE</span>
                <span class="bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700">3 — FREE</span>
                <span class="bg-slate-800 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-700">4 — ₹10</span>
                <span class="bg-slate-800 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-700">5 — ₹10</span>
                <span class="bg-slate-800 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-700">6 — ₹10</span>
                <span class="bg-slate-800 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-700">...</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    this.container.innerHTML = html;
  }

  switchDoctor(docId) {
    window.appState.setHospitalActiveDoctor(docId);
  }

  callNext() {
    window.sound.playHospitalChime();
    const activeDocId = window.appState.state.hospitalActiveDoctorId;
    const newCurrent = window.appState.callNextToken(activeDocId);

    const doc = MOCK_DOCTORS.find(d => d.id === activeDocId);
    setTimeout(() => {
      const isHi = window.appState.state.language === 'hi';
      const msg = isHi
        ? `टोकन नंबर ${newCurrent}, कृपया ${doc ? doc.room : 'कमरे'} में डॉक्टर के पास जाएं।`
        : `Token number ${newCurrent}, please proceed to room ${doc ? doc.roomNumber : ''}.`;
      window.sound.speak(msg, isHi ? 'hi-IN' : 'en-IN');
    }, 900);
  }

  recall() {
    window.appState.recallCurrentToken();
  }

  togglePause() {
    window.appState.togglePauseQueue();
  }
}

// Global hospital UI instance
window.hospitalUI = new HospitalUI();
