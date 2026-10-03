// Hospital Staff Dashboard UI - Clean, Intuitive, Real-Time Synchronized

class HospitalUI {
  constructor() {
    this.container = null;
    this.isSubscribed = false;
    this.lastHandledAlertTimestamp = null;
    this.alertDismissTimer = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.render();

    // Subscribe to state updates once
    if (!this.isSubscribed) {
      this.isSubscribed = true;
      window.appState.subscribe((state, reason, extraData) => {
        this.render();

        const alertData = extraData || state?.incomingTokenAlert?.token;
        const alertTimestamp = state?.incomingTokenAlert?.timestamp;

        if (reason === 'NEW_ONLINE_TOKEN' && alertData) {
          if (alertTimestamp !== this.lastHandledAlertTimestamp) {
            this.lastHandledAlertTimestamp = alertTimestamp;
            this.handleIncomingOnlineToken(alertData);
          }
        }
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
            <button onclick="hospitalUI.testIncomingOnlineBooking()"
                    class="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white border border-indigo-400 text-xs font-black px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
                    title="Test incoming booking ringtone chime and nurse notification alert">
              <span class="animate-phone-ring">📞</span>
              <span class="hidden sm:inline">Test Ringtone & Alert</span>
            </button>
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

          <!-- HYBRID OPD RECEPTION DESK: WALK-IN QUEUE INJECTION -->
          <div class="bg-gradient-to-r from-blue-950/80 via-slate-950 to-indigo-950/80 p-4 rounded-3xl border-2 border-blue-500/50 shadow-2xl space-y-3">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="text-3xl p-2 bg-blue-600/30 rounded-2xl border border-blue-400/40">🏥</span>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-black text-white uppercase tracking-wider">
                      Reception Desk: Physical Walk-In Patients (Hospital DB)
                    </h3>
                    <span class="text-[10px] font-black bg-blue-900/80 text-blue-200 border border-blue-500/60 px-2 py-0.5 rounded-full">
                      NO CLINIC SOFTWARE DISTURBANCE
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 font-medium">
                    Nurse increments queue when patients arrive physically at counter. Stored in Hospital DB. Online home bookings automatically follow behind.
                  </p>
                </div>
              </div>

              <!-- Reset to Token #18 Button -->
              <button onclick="hospitalUI.resetQueueTo18()"
                      class="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                      title="Reset Dr. Rajesh queue to initial Token #18 state">
                <span>🔄</span>
                <span>Reset to Token #18</span>
              </button>
            </div>

            <!-- Quick Walk-In Injection Buttons -->
            <div class="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-800/80">
              <!-- 1. The Doctor Requirement Scenario: +3 Walk-Ins -->
              <button onclick="hospitalUI.addWalkIns(3)"
                      class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm tracking-wide transition border-2 border-blue-400 ring-2 ring-blue-500/30">
                <span class="text-lg">➕</span>
                <span>+3 Walk-In Patients</span>
                <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-mono font-bold">Doctor Scenario (#19, #20, #21)</span>
              </button>

              <!-- 2. +1 Walk-in -->
              <button onclick="hospitalUI.addWalkIns(1)"
                      class="bg-slate-800 hover:bg-slate-700 active:scale-95 text-blue-300 font-bold px-3.5 py-2.5 rounded-2xl shadow text-xs flex items-center gap-1.5 border border-blue-500/40 transition">
                <span>➕</span>
                <span>+1 Walk-In</span>
              </button>

              <!-- 3. Walk-In With Details Modal -->
              <button onclick="hospitalUI.openWalkInModal()"
                      class="bg-slate-800 hover:bg-slate-700 active:scale-95 text-indigo-300 font-bold px-3.5 py-2.5 rounded-2xl shadow text-xs flex items-center gap-1.5 border border-indigo-500/40 transition">
                <span>📝</span>
                <span>Enter Walk-In With Details...</span>
              </button>

              <!-- 4. Simulate Incoming Online Booking (Ringtone & Alert Test) -->
              <button onclick="hospitalUI.testIncomingOnlineBooking()"
                      class="bg-slate-800 hover:bg-slate-700 active:scale-95 text-emerald-300 font-bold px-3.5 py-2.5 rounded-2xl shadow text-xs flex items-center gap-1.5 border border-emerald-500/40 transition">
                <span class="animate-phone-ring">📞</span>
                <span>Simulate Online Booking</span>
              </button>

              <!-- Next Token Live Indicator -->
              <div class="ml-auto bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <span class="text-slate-400">Next Available Token:</span>
                <span class="text-emerald-400 font-black text-sm">#${window.appState.getNextAvailableToken(activeDocId)}</span>
              </div>
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
              <div class="text-xs font-bold text-slate-400 flex items-center gap-2">
                <span>Current Token:</span>
                <span class="text-emerald-400 font-black font-mono text-sm">#${docQueue.currentToken}</span>
                <span class="text-slate-600">|</span>
                <span>Next Online Token:</span>
                <span class="text-amber-400 font-black font-mono text-sm">#${window.appState.getNextAvailableToken(activeDocId)}</span>
              </div>
            </div>

            <!-- The Queue Table with Full Patient Details -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-900 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th class="py-3 px-3">Token</th>
                    <th class="py-3 px-3">Patient Info & Origin</th>
                    <th class="py-3 px-3">Purpose of Visit</th>
                    <th class="py-3 px-3">Phone</th>
                    <th class="py-3 px-3">Status</th>
                    <th class="py-3 px-3">Fee</th>
                    <th class="py-3 px-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 font-medium">
                  ${docQueue.queue.map(item => {
                    const isCurrent = item.tokenNumber === docQueue.currentToken;
                    const isDone = item.tokenNumber < docQueue.currentToken;
                    const isUser = item.isUser;
                    const isWalkIn = item.isWalkIn;
                    const isLatestOnline = state.latestNewOnlineToken &&
                      state.latestNewOnlineToken.tokenNumber === item.tokenNumber &&
                      state.latestNewOnlineToken.doctorId === activeDocId;

                    let statusBadge = '';
                    let rowBg = '';

                    if (isCurrent) {
                      statusBadge = '<span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full font-black flex items-center gap-1 w-max"><span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> 🟡 Current</span>';
                      rowBg = 'bg-amber-500/10 font-bold';
                    } else if (isDone) {
                      statusBadge = '<span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 w-max">✅ Done</span>';
                      rowBg = 'text-slate-400 opacity-80';
                    } else if (isLatestOnline) {
                      statusBadge = '<span class="bg-emerald-500/30 text-emerald-300 border border-emerald-400 px-2.5 py-1 rounded-full font-black flex items-center gap-1 w-max"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> ✨ Just Arrived</span>';
                      rowBg = 'row-new-online-token font-bold text-white';
                    } else {
                      statusBadge = '<span class="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 w-max">⏳ Waiting</span>';
                      if (isUser) {
                        rowBg = 'bg-teal-500/15 border-l-4 border-teal-400';
                      } else if (isWalkIn) {
                        rowBg = 'bg-blue-500/10 border-l-4 border-blue-500';
                      }
                    }

                    return `
                      <tr class="${rowBg} hover:bg-slate-800/50 transition">
                        <!-- 1. Token Number -->
                        <td class="py-3 px-3 font-mono font-black text-sm ${isCurrent ? 'text-amber-400 text-base' : (isUser ? 'text-teal-400 font-extrabold text-base' : (isWalkIn ? 'text-blue-300' : 'text-slate-200'))}">
                          #${item.tokenNumber}
                        </td>

                        <!-- 2. Patient Demographics & Origin Badge -->
                        <td class="py-3 px-3">
                          <div>
                            <div class="flex items-center gap-1.5 flex-wrap">
                              <button type="button" onclick="hospitalUI.showPatientDetailsModal(${item.tokenNumber}, '${activeDocId}')"
                                      class="text-left font-black text-white hover:text-indigo-400 hover:underline transition text-xs">
                                ${item.patientName}
                              </button>
                              ${isUser ? `
                                <span class="bg-emerald-950 text-emerald-300 border border-emerald-600/80 text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider">
                                  🌐 ONLINE HOME
                                </span>
                              ` : ''}
                              ${isLatestOnline ? `
                                <span class="bg-emerald-500 text-slate-950 text-[9px] px-2 py-0.2 rounded font-black uppercase tracking-wider animate-pulse">
                                  🔔 NEW ONLINE
                                </span>
                              ` : ''}
                              ${isWalkIn ? `
                                <span class="bg-blue-950 text-blue-300 border border-blue-600/80 text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider">
                                  🏥 RECEPTION DB
                                </span>
                              ` : ''}
                            </div>
                            <div class="text-[10px] text-slate-400 font-semibold mt-0.5 flex items-center gap-1.5">
                              <span>${item.age || 45} Y / ${item.gender ? item.gender[0] : 'M'}</span>
                              <span>•</span>
                              <span class="truncate max-w-[130px]">📍 ${item.place || 'Moga'}</span>
                            </div>
                          </div>
                        </td>

                        <!-- 3. Purpose of Visit / Chief Complaint (The Doctor Requirement!) -->
                        <td class="py-3 px-3">
                          <span class="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 w-max">
                            <span>${item.purposeIcon || '🩺'}</span>
                            <span class="truncate max-w-[140px]">${item.purpose || 'General Consultation'}</span>
                          </span>
                        </td>

                        <!-- 4. Phone -->
                        <td class="py-3 px-3 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                          ${item.phone || '98765-XXXXX'}
                        </td>

                        <!-- 5. Status -->
                        <td class="py-3 px-3">${statusBadge}</td>

                        <!-- 6. Platform Fee -->
                        <td class="py-3 px-3">
                          ${item.isFree ? `
                            <span class="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 whitespace-nowrap">
                              🎁 FREE
                            </span>
                          ` : `
                            <span class="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 whitespace-nowrap">
                              🪙 ₹10
                            </span>
                          `}
                        </td>

                        <!-- 7. View Details Button -->
                        <td class="py-3 px-3 text-right">
                          <button type="button" onclick="hospitalUI.showPatientDetailsModal(${item.tokenNumber}, '${activeDocId}')"
                                  class="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 px-2.5 py-1 rounded-xl text-[11px] font-bold transition inline-flex items-center gap-1"
                                  title="View full patient details">
                            <span>👁️</span>
                            <span>Details</span>
                          </button>
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

  showPatientDetailsModal(tokenNumber, doctorId) {
    const docId = doctorId || window.appState.state.hospitalActiveDoctorId;
    const docQueue = window.appState.state.doctorQueues[docId];
    if (!docQueue) return;

    const patient = docQueue.queue.find(t => t.tokenNumber === tokenNumber);
    if (!patient) return;

    const doctor = MOCK_DOCTORS.find(d => d.id === docId) || MOCK_DOCTORS[0];
    const isCurrent = patient.tokenNumber === docQueue.currentToken;
    const isDone = patient.tokenNumber < docQueue.currentToken;

    let statusText = isCurrent ? "🟡 Currently in Doctor Room" : (isDone ? "✅ Consultation Completed" : "⏳ Waiting in Queue");
    let statusClass = isCurrent ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : (isDone ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-800 text-slate-300 border-slate-700");

    let modal = document.getElementById('patient-details-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'patient-details-modal';
      modal.className = 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-slate-900 border-2 border-indigo-500 rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden">
        <!-- Close Button -->
        <button onclick="document.getElementById('patient-details-modal').remove()"
                class="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-9 h-9 rounded-full flex items-center justify-center font-bold text-lg transition">
          ✕
        </button>

        <!-- Top Header Badge -->
        <div class="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <span class="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
              PATIENT CLINICAL OPD SLIP
            </span>
            <h2 class="text-xl font-black text-white flex items-center gap-2">
              <span>${patient.patientName}</span>
              ${patient.isUser ? '<span class="bg-teal-900 text-teal-300 text-[10px] px-2 py-0.5 rounded-full font-bold">HOME</span>' : ''}
            </h2>
          </div>
        </div>

        <!-- Big Token Number Banner -->
        <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 my-4 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-slate-400 uppercase font-bold block">ASSIGNED TOKEN</span>
            <div class="text-3xl font-black text-amber-400 font-mono">#${patient.tokenNumber}</div>
            <span class="text-xs text-slate-400 font-semibold">${doctor.nameEn} • ${doctor.room}</span>
          </div>

          <div class="text-right">
            <span class="text-[10px] text-slate-400 uppercase font-bold block">QUEUE STATUS</span>
            <span class="inline-block mt-1 text-xs px-2.5 py-1 rounded-full border font-bold ${statusClass}">
              ${statusText}
            </span>
            <div class="text-[10px] text-slate-500 font-mono mt-1">Booked at ${patient.bookedAt || '09:30 AM'}</div>
          </div>
        </div>

        <!-- Full Patient Demographics & Complaint Details -->
        <div class="space-y-3 text-xs">
          <!-- 1. Age, Sex & Place -->
          <div class="grid grid-cols-3 gap-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
            <div>
              <span class="text-[10px] text-slate-400 font-semibold block uppercase">Age (उम्र)</span>
              <span class="text-sm font-black text-white">${patient.age || 45} Years</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-semibold block uppercase">Sex (लिंग)</span>
              <span class="text-sm font-black text-white">${patient.gender || 'Male'}</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-semibold block uppercase">Place (स्थान)</span>
              <span class="text-sm font-black text-white truncate block">📍 ${patient.place || 'Moga'}</span>
            </div>
          </div>

          <!-- 2. Phone Number with Direct Call Action -->
          <div class="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-slate-400 font-semibold block uppercase">Phone Number (मोबाइल)</span>
              <span class="text-sm font-black text-white font-mono">${patient.phone || '98765-43210'}</span>
            </div>
            <a href="tel:${patient.phone || '9876543210'}"
               class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition">
              <span>📞</span>
              <span>Call Patient</span>
            </a>
          </div>

          <!-- 3. Purpose of Visit / Chief Complaint (The Doctor Requirement!) -->
          <div class="bg-indigo-950/40 p-3.5 rounded-2xl border border-indigo-500/30">
            <span class="text-[10px] text-indigo-300 font-bold block uppercase flex items-center gap-1">
              <span>🩺</span>
              <span>Chief Complaint / Purpose of Visit (आने का मुख्य कारण)</span>
            </span>
            <div class="text-sm font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span class="text-xl">${patient.purposeIcon || '❤️'}</span>
              <span>${patient.purpose || 'General OPD Consultation & Checkup'}</span>
            </div>
          </div>

          <!-- 4. Fee & Billing info -->
          <div class="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <span>Platform Fee Status:</span>
            <span class="font-bold ${patient.isFree ? 'text-emerald-400' : 'text-amber-400'}">
              ${patient.isFree ? '🎁 Free Scheme (0₹ Charged)' : '🪙 ₹10 Convenience Fee Paid'}
            </span>
          </div>
        </div>

        <!-- Action Buttons in Modal -->
        <div class="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2">
          ${!isCurrent ? `
            <button onclick="hospitalUI.callSpecificPatientFromModal(${patient.tokenNumber}, '${docId}')"
                    class="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition shadow">
              <span>📢</span>
              <span>Call This Patient</span>
            </button>
          ` : `
            <button onclick="hospitalUI.recall()"
                    class="bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition shadow">
              <span>🔁</span>
              <span>Recall Token</span>
            </button>
          `}

          <button onclick="window.print()"
                  class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
            <span>🖨️</span>
            <span>Print OPD Slip</span>
          </button>
        </div>
      </div>
    `;
  }

  callSpecificPatientFromModal(tokenNumber, doctorId) {
    const docId = doctorId || window.appState.state.hospitalActiveDoctorId;
    const docQueue = window.appState.state.doctorQueues[docId];
    if (docQueue) {
      docQueue.currentToken = tokenNumber;
      docQueue.completedCount = Math.max(docQueue.completedCount, tokenNumber - 1);
      docQueue.waitingCount = docQueue.queue.filter(t => t.tokenNumber > tokenNumber).length;
      if (window.appState.state.userToken && window.appState.state.userToken.doctorId === docId) {
        if (window.appState.state.userToken.tokenNumber === tokenNumber) {
          window.appState.state.patientScreen = 'token-called';
        }
      }
      window.appState.saveState();
      window.sound.playHospitalChime();
    }
    const modal = document.getElementById('patient-details-modal');
    if (modal) modal.remove();
  }

  togglePause() {
    window.appState.togglePauseQueue();
  }

  // Nurse adds physical walk-in patients arriving at reception
  addWalkIns(count = 1) {
    const activeDocId = window.appState.state.hospitalActiveDoctorId || 'doc-rajesh';
    const created = window.appState.addWalkInPatients(activeDocId, count);
    if (window.sound) window.sound.playSuccessSound();

    const firstNum = created[0]?.tokenNumber;
    const lastNum = created[created.length - 1]?.tokenNumber;
    const rangeText = created.length === 1 ? `#${firstNum}` : `#${firstNum} to #${lastNum}`;
    const nextOnline = window.appState.getNextAvailableToken(activeDocId);

    this.showToast(`✅ Added ${count} Reception Walk-In Patient(s) (${rangeText}) into Hospital DB. Next online token is now #${nextOnline}!`);
  }

  // Quick reset to Token #18 calling in room for doctor presentation / pitch
  resetQueueTo18() {
    const activeDocId = window.appState.state.hospitalActiveDoctorId || 'doc-rajesh';
    window.appState.resetDoctorQueueTo18(activeDocId);
    if (window.sound) window.sound.playHospitalChime();
    this.showToast(`🔄 Queue reset to Token #18 for Dr. Rajesh Sharma. Ready for walk-in demo!`);
  }

  openWalkInModal() {
    const activeDocId = window.appState.state.hospitalActiveDoctorId || 'doc-rajesh';
    const nextNum = window.appState.getNextAvailableToken(activeDocId);

    let modal = document.getElementById('walkin-entry-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'walkin-entry-modal';
      modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-slate-900 border-2 border-blue-500 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <button onclick="document.getElementById('walkin-entry-modal').remove()"
                class="absolute top-4 right-4 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold">
          ✕
        </button>

        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl p-2 bg-blue-500/20 rounded-2xl border border-blue-500/40">🏥</span>
          <div>
            <h3 class="text-base font-black">Register Front Desk Walk-In</h3>
            <p class="text-xs text-slate-400">Stores in Hospital DB without disrupting existing software</p>
          </div>
        </div>

        <form onsubmit="event.preventDefault(); hospitalUI.submitWalkInModal();" class="space-y-3.5 text-xs text-left">
          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Patient Name</label>
            <input type="text" id="walkin-name" value="Ramesh Kumar (Walk-in)"
                   class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Age (Years)</label>
              <input type="number" id="walkin-age" value="52" min="1" max="110"
                     class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label class="block font-bold text-slate-300 uppercase mb-1">Gender</label>
              <select id="walkin-gender" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500">
                <option value="Male">👨 Male</option>
                <option value="Female">👩 Female</option>
                <option value="Other">👤 Other</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-300 uppercase mb-1">Chief Complaint / Purpose of Visit</label>
            <input type="text" id="walkin-purpose" value="Chest heaviness & Routine checkup"
                   class="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500" />
          </div>

          <div class="bg-blue-950/60 border border-blue-800/80 rounded-xl p-3 text-[11px] text-blue-200">
            Next token allocated will be: <span class="font-black text-amber-400 font-mono text-sm">#${nextNum}</span>
          </div>

          <button type="submit"
                  class="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-black py-3.5 rounded-2xl shadow-xl text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition">
            <span>➕</span>
            <span>Confirm & Add To Hospital Queue (#${nextNum})</span>
          </button>
        </form>
      </div>
    `;
  }

  submitWalkInModal() {
    const activeDocId = window.appState.state.hospitalActiveDoctorId || 'doc-rajesh';
    const name = document.getElementById('walkin-name')?.value || "Walk-In Patient (Hospital DB)";
    const age = parseInt(document.getElementById('walkin-age')?.value) || 45;
    const gender = document.getElementById('walkin-gender')?.value || "Male";
    const purpose = document.getElementById('walkin-purpose')?.value || "OPD Walk-in Consultation";

    const modal = document.getElementById('walkin-entry-modal');
    if (modal) modal.remove();

    window.appState.addWalkInPatients(activeDocId, 1, { name, age, gender, purpose });
    if (window.sound) window.sound.playSuccessSound();

    const nextOnline = window.appState.getNextAvailableToken(activeDocId);
    this.showToast(`✅ Registered Walk-in patient "${name}" in Hospital DB. Next online token is #${nextOnline}!`);
  }

  showToast(message) {
    let toast = document.getElementById('hospital-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hospital-toast';
      toast.className = 'fixed bottom-5 right-5 z-50 bg-slate-900 border-2 border-emerald-500 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 max-w-md transition-all duration-300';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>🔔</span><span>${message}</span>`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
      if (toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
      }
    }, 4500);
  }

  // Handle incoming new online token arrival from home
  handleIncomingOnlineToken(token) {
    if (!token) return;

    // 1. Play the incoming receptionist ringtone chime
    if (window.sound) {
      window.sound.playIncomingBookingRingtone(token.tokenNumber, token.patientName);
    }

    // 2. Render prominent incoming call / arrival alert banner
    let banner = document.getElementById('incoming-online-token-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'incoming-online-token-banner';
      banner.className = 'fixed top-20 right-4 sm:right-6 z-50 max-w-md w-[calc(100%-2rem)] bg-slate-900/95 backdrop-blur-md border-2 border-emerald-400 rounded-3xl p-5 shadow-2xl animate-slide-down animate-call-banner text-white';
      document.body.appendChild(banner);
    }

    // Clear any previous dismiss timer
    if (this.alertDismissTimer) {
      clearTimeout(this.alertDismissTimer);
      this.alertDismissTimer = null;
    }

    banner.innerHTML = `
      <!-- Header Bar -->
      <div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-xl animate-phone-ring">
            📞
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-black text-emerald-400 uppercase tracking-wider">NEW ONLINE TOKEN ARRIVED!</span>
              <span class="bg-red-500 text-white animate-pulse text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">RINGING</span>
            </div>
            <p class="text-[11px] text-slate-300 font-semibold">Patient booked from home • Saved in Hospital DB</p>
          </div>
        </div>
        <button onclick="hospitalUI.dismissIncomingAlert(false)" class="text-slate-400 hover:text-white p-1 rounded-lg text-sm font-bold transition">
          ✕
        </button>
      </div>

      <!-- Body with Patient Demographics and Token Number -->
      <div class="grid grid-cols-12 gap-3 my-3.5 items-center">
        <!-- Big Token Badge -->
        <div class="col-span-4 bg-gradient-to-br from-emerald-950 to-slate-950 p-3 rounded-2xl border border-emerald-500/60 text-center shadow-inner">
          <span class="text-[9px] text-emerald-300 font-bold uppercase block">Token Number</span>
          <span class="text-4xl font-black font-mono text-emerald-300 block my-0.5">#${token.tokenNumber}</span>
          <span class="text-[9px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded uppercase inline-block">
            🌐 ONLINE
          </span>
        </div>

        <!-- Patient Demographics & Doctor -->
        <div class="col-span-8 space-y-1">
          <div class="text-sm font-black text-white truncate flex items-center gap-1">
            <span>${token.patientName}</span>
          </div>
          <div class="text-xs text-slate-300 font-medium">
            <span>${token.age || 45} Y / ${token.gender || 'Male'}</span>
            <span>•</span>
            <span>📍 ${token.place || 'Moga'}</span>
          </div>
          <div class="text-xs text-slate-400 font-mono">
            <span>📞 ${token.phone || '98765-XXXXX'}</span>
          </div>
          <div class="text-xs text-indigo-300 font-bold flex items-center gap-1">
            <span>👨‍⚕️ ${token.doctorName}</span>
            <span class="text-slate-500">(${token.roomNumber || 'Room 204'})</span>
          </div>
        </div>
      </div>

      <!-- Chief Complaint / Purpose of Visit Box (Doctor Requirement) -->
      <div class="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2 text-xs">
        <span class="text-lg">${token.purposeIcon || '🩺'}</span>
        <div class="truncate">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Purpose of Visit:</span>
          <span class="text-xs font-bold text-amber-300">${token.purpose || 'OPD Consultation'}</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-2 mt-3.5 pt-3 border-t border-slate-800">
        <!-- View Full Details & Slip -->
        <button onclick="hospitalUI.viewPatientSlipFromAlert(${token.tokenNumber}, '${token.doctorId}')"
                class="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition">
          <span>👁️</span>
          <span>View Patient Slip</span>
        </button>

        <!-- Mute / Acknowledge -->
        <button onclick="hospitalUI.acknowledgeIncomingAlert()"
                class="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition">
          <span>🔕</span>
          <span id="alert-ack-btn-text">Acknowledge Ring</span>
        </button>
      </div>

      <!-- Ringtone countdown bar -->
      <div class="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
        <div id="alert-countdown-bar" class="bg-gradient-to-r from-emerald-400 to-indigo-500 h-full w-full"></div>
      </div>
    `;

    // Start progress bar animation
    setTimeout(() => {
      const bar = document.getElementById('alert-countdown-bar');
      if (bar) {
        bar.style.transition = 'width 14s linear';
        bar.style.width = '0%';
      }
    }, 50);

    // Auto-dismiss after 15 seconds
    this.alertDismissTimer = setTimeout(() => {
      this.dismissIncomingAlert(false);
    }, 15000);
  }

  acknowledgeIncomingAlert() {
    if (window.sound) window.sound.stopIncomingRingtone();

    const ackBtn = document.getElementById('alert-ack-btn-text');
    if (ackBtn) {
      ackBtn.innerText = "Acknowledged ✓";
    }

    this.showToast("🔔 Online booking acknowledged. Patient stored in Hospital DB.");

    setTimeout(() => {
      this.dismissIncomingAlert(false);
    }, 1200);
  }

  viewPatientSlipFromAlert(tokenNumber, doctorId) {
    if (window.sound) window.sound.stopIncomingRingtone();
    this.dismissIncomingAlert(false);

    if (doctorId && doctorId !== window.appState.state.hospitalActiveDoctorId) {
      window.appState.setHospitalActiveDoctor(doctorId);
    }

    this.showPatientDetailsModal(tokenNumber, doctorId);
  }

  dismissIncomingAlert(stopSound = true) {
    if (stopSound && window.sound) {
      window.sound.stopIncomingRingtone();
    }
    if (this.alertDismissTimer) {
      clearTimeout(this.alertDismissTimer);
      this.alertDismissTimer = null;
    }
    const banner = document.getElementById('incoming-online-token-banner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-20px)';
      banner.style.transition = 'all 0.3s ease-out';
      setTimeout(() => {
        banner.remove();
      }, 350);
    }
  }

  testIncomingOnlineBooking() {
    const activeDocId = window.appState.state.hospitalActiveDoctorId || 'doc-rajesh';
    const nextNum = window.appState.getNextAvailableToken(activeDocId);
    const testPatients = [
      { name: "Gurpreet Singh (घर से ऑनलाइन)", age: 45, gender: "Male", place: "Moga (GT Road)", phone: "98765-43210", purpose: "Chest heaviness & Routine checkup", purposeIcon: "❤️" },
      { name: "Harpreet Kaur (घर से ऑनलाइन)", age: 38, gender: "Female", place: "Baghapurana", phone: "98141-88990", purpose: "Severe migraine & dizziness", purposeIcon: "🧠" },
      { name: "Manjit Singh (घर से ऑनलाइन)", age: 62, gender: "Male", place: "Kotkapura Road", phone: "98720-33441", purpose: "High blood pressure & shortness of breath", purposeIcon: "🩺" }
    ];
    const patientData = testPatients[nextNum % testPatients.length];
    window.appState.bookUserToken(activeDocId, patientData);
  }
}

// Global hospital UI instance
window.hospitalUI = new HospitalUI();
