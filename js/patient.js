// Patient UI Views - Simple, High Contrast, Elderly & Low-Literacy Friendly

class PatientUI {
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
      window.appState.subscribe((state, reason) => {
        this.render();
        if (reason === 'STATE_CHANGED' && state.patientScreen === 'token-called') {
          this.triggerTokenCalledEffects();
        }
      });
    }
  }

  triggerTokenCalledEffects() {
    if (window.sound) {
      window.sound.playHospitalChime();
      const isHi = window.appState.state.language === 'hi';
      const msg = isHi
        ? "ध्यान दें! आपकी बारी आ गई है। टोकन नंबर 25, कृपया कमरा नंबर 204 में डॉक्टर के पास जाएं।"
        : "Attention! It is your turn now. Token number 25, please proceed to Room 204.";
      setTimeout(() => {
        window.sound.speak(msg, isHi ? 'hi-IN' : 'en-IN');
      }, 1000);
    }
  }

  t(key) {
    const lang = window.appState.state.language || 'en';
    return I18N[lang][key] || I18N['en'][key] || key;
  }

  render() {
    if (!this.container) return;
    const screen = window.appState.state.patientScreen;

    switch (screen) {
      case 'welcome':
        this.renderWelcome();
        break;
      case 'hospitals':
        this.renderHospitalSelection();
        break;
      case 'doctors':
        this.renderDoctorSelection();
        break;
      case 'doctor-detail':
        this.renderDoctorDetail();
        break;
      case 'token-confirm':
        this.renderTokenConfirmation();
        break;
      case 'live-track':
        this.renderLiveTracking();
        break;
      case 'token-called':
        this.renderTokenCalled();
        break;
      case 'help':
        this.renderHelp();
        break;
      case 'my-token':
        this.renderMyToken();
        break;
      default:
        this.renderWelcome();
    }
  }

  // --- SCREEN 1: DEDICATED SINGLE HOSPITAL OPD HOME SCREEN ---
  renderWelcome() {
    const isHi = window.appState.state.language === 'hi';
    const userToken = window.appState.state.userToken;
    const hospital = MOCK_HOSPITALS[0]; // Dedicated Single Hospital Portal

    const html = `
      <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <!-- Top App Bar with Hospital Branding -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 shadow-md flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-1 bg-white/20 rounded-xl">🏥</span>
            <div>
              <div class="flex items-center gap-1.5">
                <h1 class="text-lg font-black leading-tight">
                  ${isHi ? hospital.nameHi : hospital.nameEn}
                </h1>
                <span class="bg-emerald-950/70 text-emerald-200 border border-emerald-400/50 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                  OPD LIVE
                </span>
              </div>
              <p class="text-[11px] text-emerald-100 font-semibold mt-0.5">
                ${isHi ? 'डिजिटल ओपीडी टोकन पोर्टल • घर बैठे टोकन लें' : 'Digital OPD Portal • Direct Home Token System'}
              </p>
            </div>
          </div>
          <button onclick="patientUI.toggleLanguage()"
                  class="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow flex items-center gap-1 transition">
            <span>🌐</span>
            <span>${isHi ? 'English' : 'हिंदी'}</span>
          </button>
        </div>

        <!-- Hospital Info Strip -->
        <div class="bg-emerald-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800">
          <div class="flex items-center gap-2 font-medium">
            <span>📍 ${isHi ? hospital.locationHi : hospital.locationEn}</span>
            <span>•</span>
            <span class="text-emerald-300 font-bold">⏰ ${isHi ? hospital.timingHi : hospital.timingEn}</span>
          </div>
          <a href="tel:${hospital.phone}" class="text-emerald-200 hover:text-white font-bold flex items-center gap-1 font-mono text-[11px]">
            <span>📞</span> <span>${hospital.phone}</span>
          </a>
        </div>

        <!-- Main Body -->
        <div class="p-4 sm:p-5 flex-1 flex flex-col space-y-4">

          <!-- Audio prompt button for illiterate users -->
          <div class="bg-white rounded-2xl p-3.5 border-2 border-slate-200 shadow-sm flex items-center justify-between gap-3">
            <div>
              <h2 class="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                ${this.t('welcomeHeading')}
              </h2>
              <p class="text-xs font-medium text-slate-500 mt-0.5">
                ${isHi ? 'अस्पताल की लाइन में न लगें, घर पर इंतज़ार करें।' : 'No lines at reception. Book token, wait at home, arrive when turn is near.'}
              </p>
            </div>
            <button onclick="window.sound.speak('${isHi ? 'सिटी केयर अस्पताल का घर बैठे डॉक्टर का टोकन लें। अस्पताल जाने की जरूरत नहीं। जब आपकी बारी आए, तभी जाएं।' : 'City Care Hospital home OPD tokens. Choose your doctor below to book.'}', '${isHi ? 'hi-IN' : 'en-IN'}')"
                    class="shrink-0 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 p-2.5 rounded-2xl border border-emerald-300 transition shadow-sm text-center">
              <span class="text-xl block">🔊</span>
              <span class="text-[10px] font-black uppercase block">${isHi ? 'सुनें' : 'Listen'}</span>
            </button>
          </div>

          <!-- Free Token Offer Banner -->
          <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl p-1 bg-amber-500 text-white rounded-xl shadow">🎁</span>
              <div>
                <div class="text-[11px] font-black text-amber-950 uppercase tracking-wide">
                  ${isHi ? 'प्रथम ३ टोकन मुफ़्त' : 'First 3 Tokens 100% FREE'}
                </div>
                <div class="text-[11px] font-bold text-slate-700">
                  ${isHi ? 'कोई अस्पताल लाइन नहीं • बाद में ₹१०' : 'Zero convenience fee • Then ₹10/token'}
                </div>
              </div>
            </div>
            <span class="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow">
              ₹0
            </span>
          </div>

          <!-- Primary Actions Grid: View Doctors & My Active Token -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- 1. VIEW DOCTORS & GET TOKEN -->
            <button onclick="patientUI.goToDoctorSelection()"
                    class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white p-3.5 rounded-2xl shadow-lg border-2 border-emerald-500 flex items-center justify-between transition group">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl bg-white/20 p-2 rounded-xl">👨‍⚕️</span>
                <div class="text-left">
                  <div class="text-sm font-black">${isHi ? 'डॉक्टर देखें व टोकन लें' : 'View Doctors & Book'}</div>
                  <div class="text-[10px] text-emerald-100 font-semibold">${isHi ? '३ डॉक्टर आज उपलब्ध' : '3 Doctors Available Today'}</div>
                </div>
              </div>
              <span class="text-lg text-emerald-100 group-hover:translate-x-1 transition">➔</span>
            </button>

            <!-- 2. MY ACTIVE TOKEN -->
            <button onclick="patientUI.goToMyToken()"
                    class="w-full bg-white hover:bg-slate-100 active:scale-98 text-slate-800 p-3.5 rounded-2xl shadow border-2 ${userToken ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-300' : 'border-slate-300'} flex items-center justify-between transition group">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl bg-slate-100 p-2 rounded-xl">🎟️</span>
                <div class="text-left">
                  <div class="text-sm font-black flex items-center gap-1.5">
                    <span>${this.t('btnMyToken')}</span>
                    ${userToken ? `<span class="bg-amber-500 text-white text-[10px] px-2 py-0.2 rounded-full font-black animate-pulse">#${userToken.tokenNumber}</span>` : ''}
                  </div>
                  <div class="text-[10px] text-slate-500 font-semibold">
                    ${userToken ? (isHi ? `सक्रिय: कमरा ${userToken.roomNumber}` : `Active: Room ${userToken.roomNumber}`) : (isHi ? 'जारी किया गया टोकन देखें' : 'Check live token status')}
                  </div>
                </div>
              </div>
              <span class="text-lg text-slate-400 group-hover:translate-x-1 transition">➔</span>
            </button>
          </div>

          <!-- DIRECT OPD DOCTORS CATALOG ON HOSPITAL HOME SCREEN -->
          <div class="pt-2">
            <div class="flex items-center justify-between mb-2.5">
              <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>🩺</span>
                <span>${isHi ? 'सिटी केयर अस्पताल — आज के डॉक्टर' : "Today's OPD Doctors at City Care Hospital"}</span>
              </h3>
              <span class="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                ● Live OPD
              </span>
            </div>

            <!-- Doctor Cards List -->
            <div class="space-y-3">
              ${MOCK_DOCTORS.map(doc => {
                const queueInfo = window.appState.state.doctorQueues[doc.id] || { currentToken: doc.initialCurrentToken, waitingCount: 0, queue: [] };
                const nextTokNum = window.appState.getNextAvailableToken(doc.id);
                const walkInCount = (queueInfo.queue || []).filter(t => t.isWalkIn && t.tokenNumber > queueInfo.currentToken).length;

                return `
                  <div class="doctor-card bg-white rounded-3xl p-3.5 sm:p-4 shadow-md border-2 border-slate-200 hover:border-emerald-500 transition-all cursor-pointer relative"
                       onclick="patientUI.selectDoctor('${doc.id}')">

                    <div class="flex items-center gap-3.5">
                      <!-- Doctor Photo -->
                      <div class="relative shrink-0">
                        <img src="${doc.photo}" alt="${doc.nameEn}" class="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-100 shadow-md" />
                        <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">
                          ${doc.symptomIcon}
                        </div>
                      </div>

                      <!-- Doctor Demographics -->
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm sm:text-base font-black text-slate-900 truncate">
                          ${isHi ? doc.nameHi : doc.nameEn}
                        </h4>
                        <p class="text-xs font-bold text-emerald-700 mt-0.5 truncate">
                          ${isHi ? doc.specialtyHi : doc.specialtyEn}
                        </p>
                        <p class="text-[10px] text-slate-500 font-semibold mt-0.5">
                          🚪 ${doc.room} • ⏰ ${doc.opdTime}
                        </p>

                        <!-- Live OPD Numbers -->
                        <div class="flex items-center gap-3 mt-2 text-xs">
                          <div class="bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                            <span class="text-[9px] text-slate-500 font-bold block">${this.t('currentToken')}</span>
                            <span class="text-sm font-black text-slate-900">#${queueInfo.currentToken}</span>
                          </div>
                          <div class="bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                            <span class="text-[9px] text-amber-800 font-bold block">${this.t('nextAvailableToken')}</span>
                            <span class="text-sm font-black text-amber-950">#${nextTokNum}</span>
                          </div>
                          <div class="bg-slate-50 px-2 py-1 rounded-xl border border-slate-200">
                            <span class="text-[9px] text-slate-500 font-bold block">${this.t('peopleWaiting')}</span>
                            <span class="text-sm font-black text-slate-700">${queueInfo.waitingCount}</span>
                          </div>
                        </div>

                        ${walkInCount > 0 ? `
                          <div class="mt-1.5 text-[10px] text-blue-700 font-bold flex items-center gap-1">
                            <span>🏥</span>
                            <span>${walkInCount} Reception Walk-Ins waiting ahead</span>
                          </div>
                        ` : ''}
                      </div>
                    </div>

                    <!-- Book Token Button -->
                    <button class="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-2xl shadow text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-98">
                      <span>🎟️</span>
                      <span>${isHi ? 'टोकन प्राप्त करें' : 'BOOK OPD TOKEN'}</span>
                      <span>➔</span>
                    </button>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Bottom reassuring note -->
          <div class="text-center pt-2 text-[11px] font-semibold text-slate-500">
            ${isHi ? '🔒 सिटी केयर अस्पताल द्वारा आधिकारिक रूप से संचालित' : '🔒 Directly synchronized with City Care Hospital OPD reception desk'}
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // --- SCREEN 2: HOSPITAL SELECTION ---
  renderHospitalSelection() {
    const isHi = window.appState.state.language === 'hi';

    const html = `
      <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md flex items-center justify-between">
          <button onclick="patientUI.goHome()" class="text-white hover:bg-white/20 p-2 rounded-xl text-xl font-bold transition">
            ←
          </button>
          <div class="text-center">
            <span class="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">${isHi ? 'कदम १ / २' : 'STEP 1 of 2'}</span>
            <h2 class="text-base font-black">${isHi ? 'अस्पताल चुनें' : 'Choose Hospital'}</h2>
          </div>
          <button onclick="patientUI.toggleLanguage()" class="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
            ${isHi ? 'EN' : 'हिंदी'}
          </button>
        </div>

        <!-- Hospital Cards List -->
        <div class="p-4 flex-1 space-y-4">
          <div class="text-xs font-bold text-slate-600 uppercase tracking-wider">
            ${isHi ? 'मोगा में उपलब्ध अस्पताल:' : 'Available Hospitals in Moga:'}
          </div>

          ${MOCK_HOSPITALS.map(hosp => `
            <div class="hospital-card bg-white rounded-3xl p-4 shadow-md border-2 border-slate-200 hover:border-emerald-500 transition-all cursor-pointer"
                 onclick="patientUI.selectHospital('${hosp.id}')">
              <div class="relative rounded-2xl overflow-hidden mb-3 h-32 bg-slate-100">
                <img src="${hosp.image}" alt="${hosp.nameEn}" class="w-full h-full object-cover" />
                <div class="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                  <span>${isHi ? hosp.statusHi : hosp.statusEn}</span>
                </div>
                <div class="absolute bottom-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  📍 ${isHi ? hosp.locationHi : hosp.locationEn}
                </div>
              </div>

              <div class="flex items-start justify-between gap-2">
                <div>
                  <h3 class="text-lg font-black text-slate-900">${isHi ? hosp.nameHi : hosp.nameEn}</h3>
                  <p class="text-xs text-slate-500 font-semibold mt-0.5">
                    👨‍⚕️ ${hosp.doctorCount} ${isHi ? 'डॉक्टर उपलब्ध' : 'Doctors Available Today'}
                  </p>
                </div>
              </div>

              <!-- Large Action Button -->
              <button class="w-full mt-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl shadow-md text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition active:scale-98">
                <span>${this.t('viewDoctors')}</span>
                <span>👉</span>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // --- SCREEN 3: DOCTOR SELECTION ---
  renderDoctorSelection() {
    const isHi = window.appState.state.language === 'hi';
    const hospital = MOCK_HOSPITALS[0];

    const html = `
      <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md flex items-center justify-between">
          <button onclick="patientUI.goHome()" class="text-white hover:bg-white/20 p-2 rounded-xl text-xl font-bold transition">
            ←
          </button>
          <div class="text-center">
            <span class="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">${isHi ? hospital.nameHi : hospital.nameEn}</span>
            <h2 class="text-base font-black">${isHi ? 'डॉक्टर चुनें व टोकन लें' : 'Choose Doctor For Token'}</h2>
          </div>
          <button onclick="patientUI.toggleLanguage()" class="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
            ${isHi ? 'EN' : 'हिंदी'}
          </button>
        </div>

        <!-- Instructions for Low Literacy -->
        <div class="bg-emerald-50 border-b border-emerald-100 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-emerald-950">
          <div class="flex items-center gap-1.5">
            <span>👇</span>
            <span>${isHi ? 'डॉक्टर का टोकन लेने के लिए उनकी फोटो पर छुएं:' : 'Tap doctor photo to book OPD token:'}</span>
          </div>
          <button onclick="window.sound.speak('${isHi ? 'डॉक्टर शर्मा - दिल के डॉक्टर, डॉक्टर गुप्ता - बच्चों की डॉक्टर, डॉक्टर अमित - बुखार और जनरल डॉक्टर।' : 'Doctors available: Doctor Sharma, Doctor Gupta, Doctor Amit.'}', '${isHi ? 'hi-IN' : 'en-IN'}')"
                  class="text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
            <span>🔊</span> <span>${isHi ? 'सुनें' : 'Listen'}</span>
          </button>
        </div>

        <!-- Doctors List with Large Profile Photos -->
        <div class="p-4 flex-1 space-y-4">
          ${MOCK_DOCTORS.map(doc => {
            const queueInfo = window.appState.state.doctorQueues[doc.id] || { currentToken: doc.initialCurrentToken, waitingCount: 0, queue: [] };
            const nextTokNum = window.appState.getNextAvailableToken(doc.id);
            const walkInCount = (queueInfo.queue || []).filter(t => t.isWalkIn && t.tokenNumber > queueInfo.currentToken).length;

            return `
              <div class="doctor-card bg-white rounded-3xl p-4 shadow-md border-2 border-slate-200 hover:border-emerald-500 transition-all cursor-pointer relative"
                   onclick="patientUI.selectDoctor('${doc.id}')">

                <!-- Doctor Photo & Basic Details -->
                <div class="flex items-center gap-4">
                  <!-- Large Doctor Profile Photo (Clickable) -->
                  <div class="relative shrink-0">
                    <img src="${doc.photo}" alt="${doc.nameEn}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md" />
                    <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow">
                      ✓
                    </div>
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-base sm:text-lg font-black text-slate-900 truncate">
                      ${isHi ? doc.nameHi : doc.nameEn}
                    </h3>
                    <p class="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <span>${doc.symptomIcon}</span>
                      <span>${isHi ? doc.specialtyHi : doc.specialtyEn}</span>
                    </p>

                    <div class="flex items-center gap-2 mt-1">
                      <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        🟢 ${isHi ? doc.statusTextHi : doc.statusTextEn}
                      </span>
                    </div>

                    <!-- Token & Waiting Metrics -->
                    <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-xs">
                      <div class="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <span class="text-[10px] text-slate-500 font-semibold block">${this.t('currentToken')}:</span>
                        <span class="font-black text-slate-900 text-sm">#${queueInfo.currentToken}</span>
                      </div>
                      <div class="bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <span class="text-[10px] text-slate-500 font-semibold block">${this.t('peopleWaiting')}:</span>
                        <span class="font-black text-amber-600 text-sm">${queueInfo.waitingCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Next Available Token Highlight -->
                <div class="mt-3 bg-amber-50 rounded-2xl p-2.5 border border-amber-200 flex items-center justify-between text-xs">
                  <div>
                    <span class="font-bold text-amber-900">
                      🎟️ ${this.t('nextAvailableToken')}:
                    </span>
                    ${walkInCount > 0 ? `
                      <span class="block text-[10px] text-blue-700 font-bold mt-0.5">
                        (${walkInCount} Reception Walk-Ins in queue ahead)
                      </span>
                    ` : ''}
                  </div>
                  <span class="font-black text-amber-950 text-sm bg-white px-2.5 py-1 rounded-xl border border-amber-300 font-mono shadow-sm">
                    #${nextTokNum}
                  </span>
                </div>

                <!-- Large "GET TOKEN" Button -->
                <button class="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl shadow-md text-sm uppercase tracking-wide flex items-center justify-center gap-2 transition active:scale-98">
                  <span>${this.t('getToken')}</span>
                  <span>👉</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // --- SCREEN 4: DOCTOR DETAIL / TOKEN SCREEN ---
  renderDoctorDetail() {
    const isHi = window.appState.state.language === 'hi';
    const docId = window.appState.state.selectedDoctorId;
    const doc = MOCK_DOCTORS.find(d => d.id === docId) || MOCK_DOCTORS[0];
    const hospital = MOCK_HOSPITALS[0];
    const queueInfo = window.appState.state.doctorQueues[doc.id] || { currentToken: doc.initialCurrentToken, waitingCount: 0, queue: [] };
    const nextTokNum = window.appState.getNextAvailableToken(doc.id);
    const walkInCount = (queueInfo.queue || []).filter(t => t.isWalkIn && t.tokenNumber > queueInfo.currentToken).length;

    const html = `
      <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md flex items-center justify-between">
          <button onclick="patientUI.goHome()" class="text-white hover:bg-white/20 p-2 rounded-xl text-xl font-bold transition">
            ←
          </button>
          <div class="text-center">
            <span class="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">${isHi ? 'टोकन विवरण' : 'Doctor Details'}</span>
            <h2 class="text-base font-black">${isHi ? doc.nameHi : doc.nameEn}</h2>
          </div>
          <button onclick="patientUI.toggleLanguage()" class="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
            ${isHi ? 'EN' : 'हिंदी'}
          </button>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <!-- Doctor Large Profile Card -->
          <div class="bg-white rounded-3xl p-5 shadow-lg border-2 border-slate-200 text-center">
            <!-- Large Photo -->
            <div class="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-3">
              <img src="${doc.photo}" alt="${doc.nameEn}" class="w-full h-full rounded-3xl object-cover border-4 border-emerald-100 shadow-md" />
              <div class="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-xs font-black p-1.5 rounded-full shadow">
                ${doc.symptomIcon}
              </div>
            </div>

            <h3 class="text-xl font-black text-slate-900">${isHi ? doc.nameHi : doc.nameEn}</h3>
            <p class="text-sm font-bold text-emerald-700 mt-0.5">${isHi ? doc.specialtyHi : doc.specialtyEn}</p>
            <p class="text-xs text-slate-500 font-semibold mt-1">🏥 ${isHi ? hospital.nameHi : hospital.nameEn} • ${doc.room}</p>

            <!-- Audio readout for elderly -->
            <button onclick="window.sound.speak('${isHi ? doc.voicePromptHi : doc.voicePromptEn}', '${isHi ? 'hi-IN' : 'en-IN'}')"
                    class="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full border border-slate-300">
              <span>🔊</span> <span>${isHi ? 'डॉक्टर का विवरण सुनें' : 'Listen to Doctor Info'}</span>
            </button>
          </div>

          <!-- Today's OPD Status Metrics Card -->
          <div class="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl border border-slate-800">
            <div class="flex items-center justify-between pb-3 border-b border-slate-800">
              <span class="text-xs font-black tracking-wider text-emerald-400 uppercase">
                ● ${isHi ? 'आज का ओपीडी विवरण' : "TODAY'S OPD STATUS"}
              </span>
              <span class="text-xs font-mono text-slate-400">Live</span>
            </div>

            <div class="grid grid-cols-3 gap-2.5 my-4 text-center">
              <!-- Current Token -->
              <div class="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                <span class="text-[10px] text-slate-400 font-semibold block">${this.t('currentToken')}</span>
                <span class="text-2xl font-black text-emerald-400 mt-1 block font-mono">#${queueInfo.currentToken}</span>
              </div>

              <!-- Next Token -->
              <div class="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                <span class="text-[10px] text-slate-400 font-semibold block">${isHi ? 'आगामी टोकन' : 'Next Token'}</span>
                <span class="text-2xl font-black text-amber-400 mt-1 block font-mono">#${nextTokNum}</span>
              </div>

              <!-- People Waiting -->
              <div class="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                <span class="text-[10px] text-slate-400 font-semibold block">${this.t('peopleWaiting')}</span>
                <span class="text-2xl font-black text-white mt-1 block font-mono">${queueInfo.waitingCount}</span>
              </div>
            </div>

            ${walkInCount > 0 ? `
              <div class="bg-blue-900/60 border border-blue-500/60 rounded-xl p-2 mb-2 text-center text-[11px] text-blue-200 font-bold flex items-center justify-center gap-1.5">
                <span>🏥</span>
                <span>${walkInCount} Reception Walk-In Patient(s) registered ahead at front desk</span>
              </div>
            ` : ''}

            <p class="text-[11px] text-slate-300 text-center font-medium">
              ${isHi ? 'घर पर टोकन बनाएं, अस्पताल में सीधे डॉक्टर के कमरे में जाएं।' : 'Generate token at home. Direct entry into doctor room when called.'}
            </p>
          </div>

          <!-- Big Action Button: GET MY TOKEN -->
          <button onclick="patientUI.confirmGetMyToken('${doc.id}')"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-4 sm:py-5 rounded-2xl shadow-xl border-2 border-emerald-500 text-base sm:text-lg uppercase tracking-wide flex items-center justify-center gap-2 transition group animate-bounce">
            <span class="text-2xl">🎟️</span>
            <span>${isHi ? `टोकन #${nextTokNum} प्राप्त करें` : `CONFIRM & GET OPD TOKEN #${nextTokNum}`}</span>
            <span class="text-xl group-hover:translate-x-1 transition">➔</span>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // --- SCREEN 5: TOKEN CONFIRMATION ---
  renderTokenConfirmation() {
    const isHi = window.appState.state.language === 'hi';
    const userToken = window.appState.state.userToken;
    if (!userToken) {
      this.renderWelcome();
      return;
    }

    const docQueue = window.appState.state.doctorQueues[userToken.doctorId] || { currentToken: 18 };
    const peopleBeforeYou = Math.max(0, userToken.tokenNumber - docQueue.currentToken - 1);
    const estimatedMinutes = Math.max(10, peopleBeforeYou * 6 + 10);

    const html = `
      <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md flex items-center justify-between">
          <button onclick="patientUI.goHome()" class="text-white hover:bg-white/20 p-2 rounded-xl text-xl font-bold transition">
            🏠
          </button>
          <div class="text-center">
            <span class="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">${isHi ? 'सफलतापूर्वक जारी' : 'BOOKING CONFIRMED'}</span>
            <h2 class="text-base font-black">${isHi ? 'आपका टोकन कार्ड' : 'Your Token Pass'}</h2>
          </div>
          <button onclick="patientUI.toggleLanguage()" class="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
            ${isHi ? 'EN' : 'हिंदी'}
          </button>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">

          <!-- Giant Printable-Style Token Pass Card -->
          <div class="bg-white rounded-3xl p-5 shadow-2xl border-4 border-dashed border-teal-500 text-center relative overflow-hidden">

            <!-- Top divider line -->
            <div class="text-xs font-black text-teal-800 uppercase tracking-widest pb-1 border-b border-dashed border-teal-300">
              ━━━━━━━━━━━━━━━━━━<br>
              ${this.t('yourOpdToken')}<br>
              ━━━━━━━━━━━━━━━━━━
            </div>

            <!-- GIGANTIC TOKEN NUMBER -->
            <div class="my-3">
              <span class="text-7xl sm:text-8xl font-black text-slate-900 tracking-tight font-mono">
                #${userToken.tokenNumber}
              </span>
              <div class="text-sm font-extrabold text-teal-900 mt-1">
                ${userToken.doctorName}
              </div>
              <div class="text-xs text-slate-500 font-semibold">
                ${userToken.hospitalName} • Room ${userToken.roomNumber}
              </div>
            </div>

            <!-- Patient Registered Info Snippet (Doctor Requirement) -->
            <div class="bg-teal-50/90 border border-teal-200 rounded-2xl p-3 my-2 text-left text-xs space-y-1">
              <div class="flex items-center justify-between font-black text-slate-900">
                <span>👤 ${userToken.patientName} (${userToken.age || 45} / ${userToken.gender ? userToken.gender[0] : 'M'})</span>
                <span class="text-teal-800 text-[11px] font-bold">📍 ${userToken.place || 'Moga'}</span>
              </div>
              <div class="text-[11px] text-teal-950 font-semibold flex items-center gap-1.5">
                <span>${userToken.purposeIcon || '🩺'}</span>
                <span><strong>${isHi ? 'समस्या:' : 'Purpose:'}</strong> ${userToken.purpose || 'Chest heaviness & Routine checkup'}</span>
              </div>
              <div class="text-[10px] text-slate-500 font-mono">
                📞 ${userToken.phone || '98765-43210'} • ⏰ ${userToken.bookedAt || 'Just now'}
              </div>
            </div>

            <!-- Free Badge -->
            <div class="inline-block my-1">
              <span class="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                🎁 ${isHi ? 'मुफ़्त टोकन (शुल्क ₹०)' : 'FREE TOKEN (₹0 Charge)'}
              </span>
            </div>

            <!-- 4 Metrics Grid -->
            <div class="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t-2 border-dashed border-slate-200 text-center">
              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span class="text-[11px] text-slate-500 font-bold block">${this.t('currentToken')}</span>
                <span class="text-xl font-black text-slate-900 block">#${docQueue.currentToken}</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span class="text-[11px] text-slate-500 font-bold block">${this.t('yourToken')}</span>
                <span class="text-xl font-black text-teal-700 block">#${userToken.tokenNumber}</span>
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span class="text-[11px] text-slate-500 font-bold block">${this.t('peopleBeforeYou')}</span>
                <span class="text-xl font-black text-amber-600 block font-mono">${peopleBeforeYou}</span>
                ${(docQueue.queue || []).filter(t => t.isWalkIn && t.tokenNumber > docQueue.currentToken && t.tokenNumber < userToken.tokenNumber).length > 0 ? `
                  <span class="text-[9px] text-blue-700 font-bold block mt-0.5">
                    (${docQueue.queue.filter(t => t.isWalkIn && t.tokenNumber > docQueue.currentToken && t.tokenNumber < userToken.tokenNumber).length} Walk-Ins ahead)
                  </span>
                ` : ''}
              </div>

              <div class="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <span class="text-[11px] text-slate-500 font-bold block">${this.t('estimatedWait')}</span>
                <span class="text-sm font-black text-slate-800 block mt-1 font-mono">~${estimatedMinutes} Min</span>
              </div>
            </div>

            <!-- Status Indicator Badge -->
            <div class="mt-4 bg-amber-100 text-amber-950 font-black text-xs py-2 px-3 rounded-xl border border-amber-300 flex items-center justify-center gap-2">
              <span class="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
              <span>🟡 ${this.t('statusPleaseWait')}</span>
            </div>
          </div>

          <!-- Large Illiterate-Friendly Instruction Box -->
          <div class="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-center">
            <p class="text-sm font-black text-blue-950">
              "${this.t('noQueueLine1')}"
            </p>
            <p class="text-xs font-bold text-blue-800 mt-1">
              "${this.t('noQueueLine2')}"
            </p>

            <button onclick="window.sound.speak('${isHi ? `आपका टोकन नंबर ${userToken.tokenNumber} बन गया है। आपके आगे ${peopleBeforeYou} मरीज हैं। अस्पताल की लाइन में न लगें, घर पर इंतज़ार करें।` : `Your token number ${userToken.tokenNumber} is confirmed. ${peopleBeforeYou} patients before you. Please wait comfortably at home.`}', '${isHi ? 'hi-IN' : 'en-IN'}')"
                    class="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 bg-white hover:bg-blue-100 px-3 py-1 rounded-full border border-blue-300 shadow-sm">
              <span>🔊</span> <span>${isHi ? 'यह हिदायत आवाज़ में सुनें' : 'Listen Instructions'}</span>
            </button>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-3">
            <button onclick="patientUI.goToLiveTracking()"
                    class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-4 rounded-2xl shadow-lg border-2 border-emerald-500 text-base flex items-center justify-center gap-2 transition group">
              <span>${this.t('btnTrackMyToken')}</span>
              <span class="group-hover:translate-x-1 transition">➔</span>
            </button>

            <button onclick="patientUI.goHome()"
                    class="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition">
              <span>${this.t('btnGoHome')}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // --- SCREEN 6: LIVE TOKEN TRACKING ---
  renderLiveTracking() {
    const isHi = window.appState.state.language === 'hi';
    const userToken = window.appState.state.userToken;
    if (!userToken) {
      this.renderWelcome();
      return;
    }

    const docQueue = window.appState.state.doctorQueues[userToken.doctorId] || { currentToken: 18, queue: [] };
    const currentTok = docQueue.currentToken;
    const peopleBefore = Math.max(0, userToken.tokenNumber - currentTok);

    // Status Message based on distance
    let statusBannerHtml = '';
    if (peopleBefore === 0) {
      statusBannerHtml = `
        <div class="bg-red-600 text-white p-3 rounded-2xl text-center font-black text-sm shadow animate-bounce flex items-center justify-center gap-2">
          <span>🔴</span>
          <span>${this.t('activeNow')}</span>
        </div>
      `;
    } else if (peopleBefore <= 1) {
      statusBannerHtml = `
        <div class="bg-amber-500 text-white p-3 rounded-2xl text-center font-black text-xs sm:text-sm shadow flex items-center justify-center gap-2">
          <span>🟡</span>
          <span>${this.t('startComing')}</span>
        </div>
      `;
    } else {
      statusBannerHtml = `
        <div class="bg-emerald-600 text-white p-3 rounded-2xl text-center font-black text-xs sm:text-sm shadow flex items-center justify-center gap-2">
          <span>🟢</span>
          <span>${this.t('turnIsComing')}</span>
        </div>
      `;
    }

    // Generate queue items around current token (e.g. 21, 22, 23, 24, 25, 26, 27)
    const queueNumbers = [21, 22, 23, 24, 25, 26, 27];

    const html = `
      <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md flex items-center justify-between">
          <div class="flex items-center gap-1">
            <button onclick="patientUI.goToMyToken()" class="text-white hover:bg-white/20 p-1.5 rounded-xl text-xl font-bold transition" title="Back">
              ←
            </button>
            <button onclick="patientUI.goHome()" class="text-white hover:bg-white/20 p-1.5 rounded-xl text-base font-bold transition" title="Home">
              🏠
            </button>
          </div>
          <div class="text-center">
            <span class="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">${isHi ? 'लाइव कतार ट्रैकिंग' : 'LIVE QUEUE TRACKER'}</span>
            <h2 class="text-base font-black">${userToken.doctorName}</h2>
          </div>
          <button onclick="patientUI.toggleLanguage()" class="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
            ${isHi ? 'EN' : 'हिंदी'}
          </button>
        </div>

        <div class="p-4 flex-1 space-y-4">
          <!-- Top Big Callout -->
          <div class="bg-white rounded-3xl p-4 shadow-md border-2 border-slate-200 flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">${isHi ? 'आपका टोकन' : 'YOUR TOKEN'}</span>
              <div class="text-4xl font-black text-teal-800 font-mono">#${userToken.tokenNumber}</div>
            </div>

            <div class="text-right">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wide">${isHi ? 'वर्तमान चल रहा टोकन' : 'CURRENT TOKEN'}</span>
              <div class="text-4xl font-black text-slate-900 font-mono flex items-center justify-end gap-1.5">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <span>#${currentTok}</span>
              </div>
            </div>
          </div>

          <!-- Dynamic Status Banner -->
          ${statusBannerHtml}

          <!-- People Before You Counter -->
          <div class="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-center">
            <span class="text-xs font-bold text-amber-900 block">${isHi ? 'आपके आगे शेष मरीज:' : 'People Before You in Queue:'}</span>
            <span class="text-3xl font-black text-amber-950 font-mono">${peopleBefore} ${isHi ? 'मरीज' : 'People'}</span>
          </div>

          <!-- Visual Queue Timeline (Matching exact specification) -->
          <div class="bg-white rounded-3xl p-4 shadow-md border border-slate-200">
            <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span class="text-xs font-black text-slate-700 uppercase tracking-wider">
                ${isHi ? 'ओपीडी लाइन की स्थिति:' : 'OPD QUEUE STATUS:'}
              </span>
              <span class="text-[11px] text-slate-400">Real-time Sync</span>
            </div>

            <div class="space-y-2">
              ${queueNumbers.map(num => {
                let statusBadge = '';
                let rowBg = 'bg-slate-50 border-slate-200';
                let isMe = num === userToken.tokenNumber;

                if (num < currentTok) {
                  statusBadge = '<span class="text-emerald-700 font-bold text-xs">✅ ' + (isHi ? 'पूर्ण' : 'Completed') + '</span>';
                  rowBg = 'bg-slate-100 text-slate-400 border-slate-200';
                } else if (num === currentTok) {
                  statusBadge = '<span class="text-emerald-700 font-black text-xs bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 animate-pulse">🟢 ' + (isHi ? 'बुलाया जा रहा है' : 'Calling') + '</span>';
                  rowBg = 'bg-emerald-50 border-2 border-emerald-500 shadow-sm';
                } else if (isMe) {
                  statusBadge = '<span class="text-teal-900 font-black text-xs bg-teal-100 px-2.5 py-0.5 rounded-full border border-teal-400">🔵 ' + (isHi ? 'आपका टोकन' : 'YOUR TOKEN') + '</span>';
                  rowBg = 'bg-teal-50/70 border-2 border-teal-500 shadow-md ring-2 ring-teal-200';
                } else {
                  statusBadge = '<span class="text-slate-500 font-semibold text-xs">⚪ ' + (isHi ? 'प्रतीक्षारत' : 'Waiting') + '</span>';
                  rowBg = 'bg-white border-slate-200';
                }

                return `
                  <div class="flex items-center justify-between p-3 rounded-2xl border ${rowBg} transition-all">
                    <div class="flex items-center gap-3">
                      <span class="font-mono font-black text-lg ${num === currentTok ? 'text-emerald-700' : (isMe ? 'text-teal-800' : 'text-slate-800')}">
                        #${num}
                      </span>
                      <span class="text-xs font-semibold ${isMe ? 'font-black text-teal-900' : 'text-slate-600'}">
                        ${isMe ? (isHi ? 'स्वयं (आप)' : 'You (Home)') : (num < currentTok ? 'Patient' : 'Waiting')}
                      </span>
                    </div>
                    <div>
                      ${statusBadge}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Bottom Audio Button -->
          <button onclick="window.sound.speak('${isHi ? `वर्तमान में टोकन ${currentTok} चल रहा है। आपका टोकन पच्चीस है। आपके आगे ${peopleBefore} मरीज हैं।` : `Current token is ${currentTok}. Your token is 25. ${peopleBefore} people before you.`}', '${isHi ? 'hi-IN' : 'en-IN'}')"
                  class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-300">
            <span>🔊</span>
            <span>${isHi ? 'कतार की वर्तमान स्थिति सुनें' : 'Listen Queue Update'}</span>
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // --- SCREEN 7: TOKEN CALLED SCREEN (ALERT VIEW) ---
  renderTokenCalled() {
    const isHi = window.appState.state.language === 'hi';
    const userToken = window.appState.state.userToken;

    const html = `
      <div class="patient-screen flex flex-col h-full bg-gradient-to-b from-red-600 via-rose-700 to-slate-950 text-white p-6 justify-between overflow-y-auto animate-pulse">

        <!-- Top Giant Bell Icon -->
        <div class="text-center pt-4">
          <div class="w-24 h-24 mx-auto rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-6xl shadow-2xl border-2 border-white/40 animate-bounce">
            🔔
          </div>

          <h1 class="text-4xl sm:text-5xl font-black tracking-tight text-white mt-4 uppercase drop-shadow-md">
            ${this.t('yourTurn')}
          </h1>

          <div class="my-5 bg-white text-slate-950 rounded-3xl p-6 shadow-2xl border-4 border-yellow-400">
            <span class="text-xs font-black text-slate-500 uppercase tracking-widest block">${this.t('yourToken')}</span>
            <div class="text-7xl sm:text-8xl font-black font-mono my-1 tracking-tight text-slate-900">
              #${userToken ? userToken.tokenNumber : 25}
            </div>
            <div class="text-xl font-black text-emerald-800 mt-2">
              ${userToken ? userToken.doctorName : 'Dr. Rajesh Sharma'}
            </div>
            <div class="text-base font-black text-slate-700 bg-amber-100 py-1.5 px-4 rounded-xl inline-block mt-2 border border-amber-300">
              🚪 Room 204 (कमरा नंबर २०४)
            </div>
          </div>

          <p class="text-lg font-black text-yellow-300 drop-shadow">
            👉 ${this.t('pleaseGoToRoom')}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 pb-2">
          <button onclick="patientUI.showHospitalDetailsModal()"
                  class="w-full bg-white hover:bg-slate-100 active:scale-98 text-slate-950 font-black py-4 rounded-2xl shadow-2xl text-base uppercase tracking-wider flex items-center justify-center gap-2">
            <span>🏥</span>
            <span>${this.t('viewHospitalDetails')}</span>
          </button>

          <button onclick="patientUI.goToLiveTracking()"
                  class="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-2xl text-xs">
            ← ${isHi ? 'कतार में वापस देखें' : 'Back to Queue'}
          </button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  // --- SCREEN 8: HELP & HELPLINE SCREEN ---
  renderHelp() {
    const isHi = window.appState.state.language === 'hi';

    const html = `
      <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md flex items-center justify-between">
          <button onclick="patientUI.goHome()" class="text-white hover:bg-white/20 p-2 rounded-xl text-xl font-bold transition">
            ←
          </button>
          <h2 class="text-base font-black">${isHi ? 'सहायता केंद्र' : 'Patient Help & Support'}</h2>
          <button onclick="patientUI.toggleLanguage()" class="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
            ${isHi ? 'EN' : 'हिंदी'}
          </button>
        </div>

        <div class="p-5 flex-1 space-y-4">
          <div class="bg-white rounded-3xl p-5 shadow border border-slate-200 text-center">
            <span class="text-5xl">☎️</span>
            <h3 class="text-xl font-black text-slate-900 mt-2">${isHi ? 'टोल-फ्री हेल्पलाइन' : 'Toll-Free Helpline'}</h3>
            <p class="text-2xl font-black text-emerald-700 mt-1">1800-22-4488</p>
            <p class="text-xs text-slate-500 font-semibold mt-1">24x7 Free Medical Queue Support</p>
          </div>

          <div class="bg-white rounded-3xl p-5 shadow border border-slate-200 space-y-3 text-xs text-slate-700">
            <h4 class="font-extrabold text-sm text-slate-900">
              ${isHi ? 'अक्सर पूछे जाने वाले सवाल:' : 'Frequently Asked Questions:'}
            </h4>
            <div class="border-b border-slate-100 pb-2">
              <p class="font-bold text-slate-900">1. ${isHi ? 'क्या मुझे लाइन में लगना होगा?' : 'Do I need to stand in line?'}</p>
              <p class="text-slate-600 mt-0.5">${isHi ? 'नहीं, टोकन घर से बुक करें और अपनी बारी आने पर ही अस्पताल आएं।' : 'No, book from home and arrive only when your turn approaches.'}</p>
            </div>
            <div class="border-b border-slate-100 pb-2">
              <p class="font-bold text-slate-900">2. ${isHi ? 'टोकन का शुल्क क्या है?' : 'What is the token fee?'}</p>
              <p class="text-slate-600 mt-0.5">${isHi ? 'पहले ३ टोकन बिल्कुल मुफ़्त हैं। उसके बाद मात्र ₹१० प्रति टोकन।' : 'First 3 tokens are completely free! After that only ₹10 per token.'}</p>
            </div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  showHospitalDetailsModal() {
    const isHi = window.appState.state.language === 'hi';
    const hosp = MOCK_HOSPITALS[0];
    alert(`🏥 ${isHi ? hosp.nameHi : hosp.nameEn}\n📍 ${isHi ? hosp.locationHi : hosp.locationEn}\n☎️ Phone: ${hosp.phone}\n🚪 OPD Room 204 (2nd Floor)`);
  }

  // Navigation handlers
  goHome() {
    window.appState.setPatientScreen('welcome');
  }

  goToHospitals() {
    window.appState.setPatientScreen('doctors');
  }

  goToDoctorSelection() {
    window.appState.setPatientScreen('doctors');
  }

  selectHospital(hospId) {
    window.appState.selectHospital(hospId);
  }

  selectDoctor(docId) {
    window.appState.selectDoctor(docId);
  }

  confirmGetMyToken(docId, customDetails = null) {
    if (customDetails) {
      window.sound.playSuccessSound();
      window.appState.bookUserToken(docId, customDetails);
    } else {
      this.openPatientRegistrationModal(docId);
    }
  }

  openPatientRegistrationModal(docId) {
    const isHi = window.appState.state.language === 'hi';
    const doctor = MOCK_DOCTORS.find(d => d.id === docId) || MOCK_DOCTORS[0];
    const nextTokNumber = window.appState.getNextAvailableToken(doctor.id);

    const lastDetails = window.appState.state.lastPatientDetails || {
      name: "Gurpreet Singh",
      age: 45,
      gender: "Male",
      place: "Moga (GT Road)",
      phone: "98765-43210",
      purpose: "Chest heaviness & Routine checkup",
      purposeIcon: "❤️"
    };

    let modal = document.getElementById('patient-reg-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'patient-reg-modal';
      modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-4 border-emerald-500 relative max-h-[92vh] overflow-y-auto">
        <!-- Close Button -->
        <button onclick="document.getElementById('patient-reg-modal').remove()"
                class="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg transition">
          ✕
        </button>

        <!-- Header -->
        <div class="text-center mb-4">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl mx-auto shadow-sm">
            📝
          </div>
          <h2 class="text-lg sm:text-xl font-black text-slate-900 mt-2">
            ${isHi ? 'मरीज पंजीकरण व विवरण' : 'Patient Registration Details'}
          </h2>
          <p class="text-xs text-slate-500 font-semibold mt-0.5">
            ${isHi ? `डॉ. ${doctor.nameHi} के लिए आवश्यक जानकारी` : `Required by ${doctor.nameEn} before token issuance`}
          </p>

          <button type="button" onclick="window.sound.speak('${isHi ? 'कृपया अपना नाम, उम्र, लिंग, गाँव, मोबाइल नंबर और बीमारी की समस्या दर्ज करें।' : 'Please enter patient name, age, gender, place, phone and purpose of visit.'}', '${isHi ? 'hi-IN' : 'en-IN'}')"
                  class="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            <span>🔊</span>
            <span>${isHi ? 'यह जानकारी आवाज में सुनें' : 'Listen with Audio'}</span>
          </button>
        </div>

        <form id="patient-reg-form" onsubmit="event.preventDefault(); patientUI.submitPatientRegistration('${doctor.id}'); return false;" class="space-y-3.5 text-xs text-left">
          <!-- 1. Patient Name -->
          <div>
            <label class="block font-black text-slate-800 uppercase mb-1">
              👤 ${isHi ? 'मरीज का पूरा नाम (Full Name)' : 'Patient Full Name'} <span class="text-red-500">*</span>
            </label>
            <input type="text" id="reg-name" required value="${lastDetails.name || 'Gurpreet Singh'}"
                   class="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none" />
          </div>

          <!-- 2. Age & Gender -->
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block font-black text-slate-800 uppercase mb-1">
                🎂 ${isHi ? 'उम्र (Age)' : 'Age (Years)'} <span class="text-red-500">*</span>
              </label>
              <input type="number" id="reg-age" required min="1" max="110" value="${lastDetails.age || 45}"
                     class="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none" />
            </div>

            <div>
              <label class="block font-black text-slate-800 uppercase mb-1">
                ⚧️ ${isHi ? 'लिंग (Gender)' : 'Gender'} <span class="text-red-500">*</span>
              </label>
              <select id="reg-gender" class="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none">
                <option value="Male" ${lastDetails.gender === 'Male' ? 'selected' : ''}>👨 Male (पुरुष)</option>
                <option value="Female" ${lastDetails.gender === 'Female' ? 'selected' : ''}>👩 Female (महिला)</option>
                <option value="Other" ${lastDetails.gender === 'Other' ? 'selected' : ''}>👤 Other (अन्य)</option>
              </select>
            </div>
          </div>

          <!-- 3. Place / Village / City -->
          <div>
            <label class="block font-black text-slate-800 uppercase mb-1">
              📍 ${isHi ? 'गाँव / शहर / स्थान (Place / City / Village)' : 'Place / Village / City'} <span class="text-red-500">*</span>
            </label>
            <input type="text" id="reg-place" required value="${lastDetails.place || 'Moga (GT Road)'}"
                   class="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none" />
            <!-- Quick Chips -->
            <div class="flex items-center gap-1.5 mt-1.5 overflow-x-auto pb-1">
              <span class="text-[10px] text-slate-400 font-semibold">Quick:</span>
              <button type="button" onclick="document.getElementById('reg-place').value='Moga City'" class="bg-slate-100 hover:bg-emerald-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">Moga</button>
              <button type="button" onclick="document.getElementById('reg-place').value='Bagha Purana'" class="bg-slate-100 hover:bg-emerald-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">Bagha Purana</button>
              <button type="button" onclick="document.getElementById('reg-place').value='Kotkapura'" class="bg-slate-100 hover:bg-emerald-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">Kotkapura</button>
              <button type="button" onclick="document.getElementById('reg-place').value='Dharamkot'" class="bg-slate-100 hover:bg-emerald-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">Dharamkot</button>
            </div>
          </div>

          <!-- 4. Phone Number -->
          <div>
            <label class="block font-black text-slate-800 uppercase mb-1">
              📞 ${isHi ? 'मोबाइल नंबर (Phone Number)' : 'Mobile Phone Number'} <span class="text-red-500">*</span>
            </label>
            <input type="tel" id="reg-phone" value="${lastDetails.phone || '98765-43210'}" placeholder="98765-43210"
                   class="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none font-mono" />
          </div>

          <!-- 5. Purpose of Visit / Chief Complaint (The Doctor Requirement!) -->
          <div>
            <label class="block font-black text-slate-800 uppercase mb-1">
              🩺 ${isHi ? 'आने का मुख्य कारण / समस्या (Purpose of Visit)' : 'Purpose of Visit / Chief Complaint'} <span class="text-red-500">*</span>
            </label>
            <input type="text" id="reg-purpose" required value="${lastDetails.purpose || 'Chest heaviness & Routine checkup'}"
                   class="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none" />

            <!-- Quick complaint chips for low-literacy users -->
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button type="button" onclick="patientUI.setComplaint('❤️ Chest Pain & High BP', '❤️')"
                      class="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 px-2 py-1 rounded-lg text-[10px] font-bold">❤️ Chest Pain</button>
              <button type="button" onclick="patientUI.setComplaint('🤒 Fever, Cough & Cold', '🤒')"
                      class="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 px-2 py-1 rounded-lg text-[10px] font-bold">🤒 Fever & Cold</button>
              <button type="button" onclick="patientUI.setComplaint('👶 Child Weakness & Vomiting', '👶')"
                      class="bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 px-2 py-1 rounded-lg text-[10px] font-bold">👶 Child Checkup</button>
              <button type="button" onclick="patientUI.setComplaint('🦴 Joint Pain & Swelling', '🦴')"
                      class="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 px-2 py-1 rounded-lg text-[10px] font-bold">🦴 Joint Pain</button>
              <button type="button" onclick="patientUI.setComplaint('💊 Diabetes & BP Routine Checkup', '💊')"
                      class="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 px-2 py-1 rounded-lg text-[10px] font-bold">💊 Routine BP/Sugar</button>
              <button type="button" onclick="patientUI.setComplaint('📋 Doctor Follow-up Visit', '📋')"
                      class="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-2 py-1 rounded-lg text-[10px] font-bold">📋 Follow-up</button>
            </div>
          </div>

          <!-- Free token indicator -->
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-amber-950 font-bold">
            <span class="flex items-center gap-1">
              <span>🎁</span>
              <span>${isHi ? 'प्रथम ३ टोकन मुफ़्त' : 'First 3 Tokens FREE'}</span>
            </span>
            <span class="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">₹0 CHARGE</span>
          </div>

          <!-- Submit Button -->
          <button type="button"
                  id="btn-confirm-reg-token"
                  onclick="patientUI.submitPatientRegistration('${doctor.id}')"
                  class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-4 rounded-2xl shadow-xl text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer">
            <span>🎟️</span>
            <span>${isHi ? `विवरण दर्ज करें व टोकन #${nextTokNumber} लें` : `CONFIRM & GET OPD TOKEN #${nextTokNumber}`}</span>
            <span>➔</span>
          </button>
        </form>
      </div>
    `;
  }

  setComplaint(text, icon = '🩺') {
    const input = document.getElementById('reg-purpose');
    if (input) {
      input.value = text;
      input.dataset.icon = icon;
    }
  }

  submitPatientRegistration(docId) {
    try {
      const name = document.getElementById('reg-name')?.value?.trim() || "Gurpreet Singh";
      const age = parseInt(document.getElementById('reg-age')?.value) || 45;
      const gender = document.getElementById('reg-gender')?.value || "Male";
      const place = document.getElementById('reg-place')?.value?.trim() || "Moga (GT Road)";
      const phone = document.getElementById('reg-phone')?.value?.trim() || "98765-43210";
      const purposeInput = document.getElementById('reg-purpose');
      const purpose = purposeInput?.value?.trim() || "Chest heaviness & Routine checkup";
      const purposeIcon = purposeInput?.dataset?.icon || "❤️";

      const modal = document.getElementById('patient-reg-modal');
      if (modal) modal.remove();

      if (window.sound) {
        window.sound.playSuccessSound();
      }

      window.appState.bookUserToken(docId, {
        name,
        age,
        gender,
        place,
        phone,
        purpose,
        purposeIcon
      });

      window.appState.setPatientScreen('token-confirm');
    } catch (err) {
      console.error("Error submitting registration:", err);
      const modal = document.getElementById('patient-reg-modal');
      if (modal) modal.remove();
      window.appState.setPatientScreen('token-confirm');
    }
  }

  goToTokenConfirm() {
    window.appState.setPatientScreen('token-confirm');
  }

  goToLiveTracking() {
    window.appState.setPatientScreen('live-track');
  }

  // --- SCREEN: MY TOKEN (Dedicated Screen) ---
  renderMyToken() {
    const isHi = window.appState.state.language === 'hi';
    const userToken = window.appState.state.userToken;

    if (!userToken) {
      // Empty state: No active token booked yet
      const html = `
        <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
          <!-- Top Header -->
          <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md flex items-center justify-between">
            <button onclick="patientUI.goHome()" class="text-white hover:bg-white/20 p-2 rounded-xl text-xl font-bold transition">
              ←
            </button>
            <div class="text-center">
              <span class="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">${isHi ? 'मेरा टोकन' : 'MY TOKEN'}</span>
              <h2 class="text-base font-black">${isHi ? 'सक्रिय टोकन स्थिति' : 'Token Status'}</h2>
            </div>
            <button onclick="patientUI.toggleLanguage()" class="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
              ${isHi ? 'EN' : 'हिंदी'}
            </button>
          </div>

          <div class="p-5 flex-1 flex flex-col justify-between items-center text-center space-y-6">
            <div class="my-auto space-y-4">
              <div class="w-24 h-24 mx-auto rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-5xl text-slate-400 shadow-inner">
                📋
              </div>

              <div>
                <h3 class="text-xl font-black text-slate-900">
                  ${isHi ? 'अभी कोई टोकन बुक नहीं है' : 'No Active Token Booked Yet'}
                </h3>
                <p class="text-xs sm:text-sm font-medium text-slate-600 mt-1.5 max-w-xs mx-auto">
                  ${isHi ? 'आपने आज के लिए कोई ओपीडी टोकन नहीं लिया है। घर बैठे 30 सेकंड में डॉक्टर का टोकन लें।' : 'You have not booked an OPD token for today yet. Select a doctor to get your token from home.'}
                </p>
              </div>

              <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 font-semibold max-w-xs mx-auto">
                🎁 ${isHi ? 'प्रथम ३ टोकन 100% मुफ़्त हैं (First 3 Free)!' : 'First 3 tokens are 100% FREE!'}
              </div>
            </div>

            <!-- Action buttons -->
            <div class="w-full space-y-3">
              <!-- Book New Token -->
              <button onclick="patientUI.goToDoctorSelection()"
                      class="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black py-4 rounded-2xl shadow-lg border-2 border-emerald-500 text-sm sm:text-base uppercase tracking-wide flex items-center justify-center gap-2 transition">
                <span>🩺</span>
                <span>${isHi ? 'डॉक्टर चुनें व टोकन बुक करें' : 'Choose Doctor & Book Token'}</span>
                <span>➔</span>
              </button>

              <!-- 1-Click Quick Demo Token for testing -->
              <button onclick="patientUI.loadDemoToken()"
                      class="w-full bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black py-3.5 rounded-2xl shadow border border-amber-400 text-xs sm:text-sm flex items-center justify-center gap-2 transition">
                <span>⚡</span>
                <span>${isHi ? 'त्वरित डेमो टोकन लोड करें' : 'Load Instant Demo Token'}</span>
              </button>

              <button onclick="patientUI.goHome()"
                      class="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-2xl text-xs transition">
                ← ${isHi ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Back to Home'}
              </button>
            </div>
          </div>
        </div>
      `;
      this.container.innerHTML = html;
      return;
    }

    // Active Token Exists: Show Token Pass & Options
    const docQueue = window.appState.state.doctorQueues[userToken.doctorId] || { currentToken: 18 };
    const peopleBefore = Math.max(0, userToken.tokenNumber - docQueue.currentToken);
    const isServing = docQueue.currentToken === userToken.tokenNumber;

    const html = `
      <div class="patient-screen flex flex-col h-full bg-slate-50 text-slate-900 overflow-y-auto">
        <!-- Top Header -->
        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-md flex items-center justify-between">
          <button onclick="patientUI.goHome()" class="text-white hover:bg-white/20 p-2 rounded-xl text-xl font-bold transition">
            ←
          </button>
          <div class="text-center">
            <span class="text-[11px] text-emerald-100 font-bold uppercase tracking-wider">${isHi ? 'मेरा टोकन' : 'MY TOKEN'}</span>
            <h2 class="text-base font-black">${userToken.doctorName}</h2>
          </div>
          <button onclick="patientUI.toggleLanguage()" class="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-bold">
            ${isHi ? 'EN' : 'हिंदी'}
          </button>
        </div>

        <div class="p-4 flex-1 space-y-4">
          <!-- Active Token Card -->
          <div class="bg-white rounded-3xl p-5 shadow-lg border-2 ${isServing ? 'border-red-500 ring-4 ring-red-200 animate-pulse' : 'border-teal-500'} text-center relative">
            <div class="inline-block bg-teal-100 text-teal-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              ${isServing ? (isHi ? '🚨 आपकी बारी है!' : '🚨 YOUR TURN NOW!') : (isHi ? 'कतार में सक्रिय' : 'ACTIVE IN QUEUE')}
            </div>

            <!-- Big Number -->
            <div class="my-2">
              <span class="text-6xl sm:text-7xl font-black font-mono text-slate-900">
                #${userToken.tokenNumber}
              </span>
              <div class="text-sm font-extrabold text-teal-800 mt-1">${userToken.doctorName}</div>
              <div class="text-xs text-slate-500 font-semibold">${userToken.hospitalName} • Room ${userToken.roomNumber}</div>
            </div>

            <!-- Quick Metrics -->
            <div class="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
              <div class="bg-slate-50 p-2 rounded-xl">
                <span class="text-[10px] text-slate-500 font-bold block">${this.t('currentToken')}</span>
                <span class="text-xl font-black text-slate-900 block">#${docQueue.currentToken}</span>
              </div>
              <div class="bg-slate-50 p-2 rounded-xl">
                <span class="text-[10px] text-slate-500 font-bold block">${this.t('peopleBeforeYou')}</span>
                <span class="text-xl font-black text-amber-600 block">${peopleBefore}</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="space-y-2.5">
            <button onclick="patientUI.goToLiveTracking()"
                    class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base uppercase tracking-wider transition">
              <span>🔔</span>
              <span>${isHi ? 'लाइव कतार ट्रैक करें' : 'Track Live Queue'}</span>
              <span>➔</span>
            </button>

            <button onclick="patientUI.goToTokenConfirm()"
                    class="w-full bg-teal-50 hover:bg-teal-100 text-teal-800 border-2 border-teal-300 font-black py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition">
              <span>🎟️</span>
              <span>${isHi ? 'पूरा टोकन पास देखें' : 'View Full Token Pass'}</span>
            </button>

            <button onclick="patientUI.cancelUserToken()"
                    class="w-full bg-slate-100 hover:bg-red-50 text-red-600 font-bold py-2.5 rounded-2xl text-xs transition">
              ${isHi ? 'टोकन रद्द करें' : 'Cancel My Token'}
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  loadDemoToken() {
    window.sound.playSuccessSound();
    window.appState.bookUserToken('doc-rajesh');
    window.appState.setPatientScreen('my-token');
  }

  cancelUserToken() {
    const isHi = window.appState.state.language === 'hi';
    if (confirm(isHi ? 'क्या आप इस टोकन को रद्द करना चाहते हैं?' : 'Do you want to cancel this token?')) {
      window.appState.state.userToken = null;
      window.appState.saveState();
      this.render();
    }
  }

  goToMyToken() {
    window.appState.setPatientScreen('my-token');
  }

  goToHelp() {
    window.appState.setPatientScreen('help');
  }

  toggleLanguage() {
    const nextLang = window.appState.state.language === 'en' ? 'hi' : 'en';
    window.appState.setLanguage(nextLang);
  }
}

// Global patient UI instance
window.patientUI = new PatientUI();
