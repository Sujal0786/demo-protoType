// Hospital Waiting Lounge Big Screen TV Display

class TVDisplay {
  constructor() {
    this.container = null;
    this.latestCalledToken = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.checkServingTokens();
    this.render();

    window.store.subscribe((event, data) => {
      if (event === 'TOKEN_CALLED') {
        this.latestCalledToken = data.token;
        this.render();
      } else {
        this.checkServingTokens();
        this.render();
      }
    });
  }

  checkServingTokens() {
    const serving = window.store.tokens.filter(t => t.status === 'SERVING');
    if (serving.length > 0) {
      this.latestCalledToken = serving[serving.length - 1];
    } else {
      this.latestCalledToken = null;
    }
  }

  render() {
    if (!this.container) return;

    const tok = this.latestCalledToken;
    const waitingTokens = window.store.tokens.filter(t => t.status === 'WAITING');

    const html = `
      <div class="tv-display bg-black text-white p-6 sm:p-8 rounded-3xl shadow-2xl border-4 border-slate-800 flex flex-col justify-between min-h-[500px]">

        <!-- TV Header -->
        <div class="flex items-center justify-between border-b-2 border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 bg-red-600 rounded-xl">🏥</span>
            <div>
              <h1 class="text-xl sm:text-2xl font-black tracking-wide text-white uppercase">
                सिटी जनरल अस्पताल ओपीडी प्रतीक्षा कक्ष
              </h1>
              <p class="text-xs sm:text-sm text-slate-400">CITY GENERAL HOSPITAL — LIVE OPD DISPLAY</p>
            </div>
          </div>

          <div class="text-right">
            <div id="tv-clock" class="text-xl sm:text-2xl font-mono font-black text-amber-400">
              ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div class="text-xs text-slate-400 font-semibold">लाइव प्रसारण (Live)</div>
          </div>
        </div>

        <!-- Main Display: Calling Token -->
        <div class="my-6 text-center">
          ${tok ? `
            <div class="bg-gradient-to-b from-slate-900 to-indigo-950/80 rounded-3xl p-6 sm:p-10 border-4 border-emerald-500 shadow-2xl animate-pulse relative">
              <div class="inline-block bg-emerald-500 text-slate-950 font-black text-sm sm:text-base px-6 py-1.5 rounded-full uppercase tracking-widest shadow-lg mb-4">
                📢 अभी अंदर पधारें (NOW CALLING)
              </div>

              <div class="text-7xl sm:text-9xl font-black text-white tracking-tight my-2 font-mono">
                #${String(tok.tokenNumber).padStart(2, '0')}
              </div>

              <div class="text-2xl sm:text-4xl font-black text-emerald-400 mt-2">
                ${tok.patientName}
              </div>

              <!-- Doctor and Room Info -->
              <div class="mt-6 flex flex-wrap items-center justify-center gap-4 text-base sm:text-xl">
                <span class="bg-slate-800 px-5 py-2.5 rounded-2xl border border-slate-700 font-bold text-slate-200">
                  👨‍⚕️ ${tok.doctorName}
                </span>
                <span class="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black shadow-lg">
                  🚪 ${tok.room}
                </span>
              </div>
            </div>
          ` : `
            <div class="bg-slate-900 rounded-3xl p-12 border-2 border-dashed border-slate-800 text-slate-500 text-base">
              प्रतीक्षा कक्ष में आपका स्वागत है। डॉक्टर द्वारा बुलाए जाने पर यहाँ टोकन प्रदर्शित होगा।
            </div>
          `}
        </div>

        <!-- Upcoming Next Tokens Bar (Bottom Marquee / List) -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-amber-400 font-black text-xs uppercase tracking-wider">
              ⏳ आगामी कतार (Next in Waiting Line):
            </span>
          </div>

          <div class="flex items-center gap-3 overflow-x-auto pb-1">
            ${waitingTokens.length === 0 ? `
              <span class="text-xs text-slate-500">कतार में कोई टोकन नहीं है</span>
            ` : waitingTokens.slice(0, 8).map(w => `
              <div class="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2 shrink-0">
                <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs font-mono">
                  #${w.tokenNumber}
                </span>
                <div class="text-left text-xs">
                  <div class="font-bold text-white truncate max-w-[100px]">${w.patientName.split(' ')[0]}</div>
                  <div class="text-[10px] text-slate-400 font-mono">${w.tokenCode}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    this.container.innerHTML = html;
  }
}

// Global TV display instance
window.tvDisplay = new TVDisplay();
