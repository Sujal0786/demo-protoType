// Central Reactive State Store for OPD Prototype (Frontend Only)

class AppState {
  constructor() {
    this.STORAGE_KEY = 'opd_frontend_prototype_v2';
    this.CHANNEL_NAME = 'opd_channel_sync_v2';
    this.listeners = [];
    this.broadcastChannel = null;

    this.initBroadcast();
    this.loadInitialState();
  }

  initBroadcast() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel(this.CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'SYNC_STATE') {
            this.state = event.data.payload;
            this.notifyListeners('SYNC');
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not available", e);
    }

    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.loadFromStorage();
        this.notifyListeners('STORAGE_SYNC');
      }
    });
  }

  loadInitialState() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        return;
      } catch (e) {
        console.warn("Corrupt saved state, resetting", e);
      }
    }
    this.resetToInitial(false);
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.state = JSON.parse(saved);
      }
    } catch (e) {}
  }

  saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'SYNC_STATE', payload: this.state });
      } catch (e) {}
    }
    this.notifyListeners('STATE_CHANGED');
  }

  resetToInitial(triggerNotify = true) {
    this.state = {
      language: 'en', // 'en' | 'hi'
      currentView: 'dual', // 'dual' | 'patient' | 'hospital'
      patientScreen: 'welcome', // 'welcome' | 'hospitals' | 'doctors' | 'doctor-detail' | 'token-confirm' | 'live-track' | 'token-called' | 'help'
      selectedHospitalId: 'hosp-1',
      selectedDoctorId: 'doc-rajesh',
      hospitalActiveDoctorId: 'doc-rajesh',
      hospitalIsLoggedIn: true,
      hospitalStaffName: "Reception Desk",
      userToken: null, // Holds { tokenNumber: 25, doctorId: 'doc-rajesh', hospitalId: 'hosp-1', ... }
      userBookedCount: 0, // First 3 free, then ₹10
      isQueuePaused: false,

      // Doctor Queues matching user specification
      doctorQueues: {
        'doc-rajesh': {
          doctorId: 'doc-rajesh',
          doctorName: 'Dr. Rajesh Sharma',
          currentToken: 18,
          totalTokens: 48,
          waitingCount: 7,
          completedCount: 20,
          queue: [
            { tokenNumber: 18, patientName: "Sukhwinder Singh", doctorName: "Dr. Sharma", status: "CALLING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 19, patientName: "Aarti Devi", doctorName: "Dr. Sharma", status: "WAITING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 20, patientName: "Harpreet Kaur", doctorName: "Dr. Sharma", status: "WAITING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 21, patientName: "Patient A", doctorName: "Dr. Sharma", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 22, patientName: "Patient B", doctorName: "Dr. Sharma", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 23, patientName: "Patient C", doctorName: "Dr. Sharma", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 24, patientName: "Patient D", doctorName: "Dr. Sharma", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 25, patientName: "Patient E (Waiting)", doctorName: "Dr. Sharma", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 26, patientName: "Baldev Raj", doctorName: "Dr. Sharma", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 27, patientName: "Kiran Bala", doctorName: "Dr. Sharma", status: "WAITING", fee: 10, isFree: false, isUser: false }
          ]
        },
        'doc-neha': {
          doctorId: 'doc-neha',
          doctorName: 'Dr. Neha Gupta',
          currentToken: 11,
          totalTokens: 24,
          waitingCount: 4,
          completedCount: 10,
          queue: [
            { tokenNumber: 11, patientName: "Baby Aarav", doctorName: "Dr. Gupta", status: "CALLING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 12, patientName: "Baby Simran", doctorName: "Dr. Gupta", status: "WAITING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 13, patientName: "Master Rohan", doctorName: "Dr. Gupta", status: "WAITING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 14, patientName: "Baby Ananya", doctorName: "Dr. Gupta", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 15, patientName: "Master Kabir", doctorName: "Dr. Gupta", status: "WAITING", fee: 10, isFree: false, isUser: false }
          ]
        },
        'doc-amit': {
          doctorId: 'doc-amit',
          doctorName: 'Dr. Amit Kumar',
          currentToken: 16,
          totalTokens: 32,
          waitingCount: 6,
          completedCount: 15,
          queue: [
            { tokenNumber: 16, patientName: "Joginder Pal", doctorName: "Dr. Kumar", status: "CALLING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 17, patientName: "Sunita Rani", doctorName: "Dr. Kumar", status: "WAITING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 18, patientName: "Mohinder Singh", doctorName: "Dr. Kumar", status: "WAITING", fee: 0, isFree: true, isUser: false },
            { tokenNumber: 19, patientName: "Poonam Sharma", doctorName: "Dr. Kumar", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 20, patientName: "Deepak Verma", doctorName: "Dr. Kumar", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 21, patientName: "Rajinder Kaur", doctorName: "Dr. Kumar", status: "WAITING", fee: 10, isFree: false, isUser: false },
            { tokenNumber: 22, patientName: "Vijay Kumar", doctorName: "Dr. Kumar", status: "WAITING", fee: 10, isFree: false, isUser: false }
          ]
        }
      }
    };

    if (triggerNotify) {
      this.saveState();
    } else {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(reason = '') {
    this.listeners.forEach(cb => {
      try {
        cb(this.state, reason);
      } catch (e) {
        console.error("State listener error:", e);
      }
    });
  }

  // --- ACTIONS ---

  setLanguage(lang) {
    this.state.language = lang;
    this.saveState();
  }

  setCurrentView(view) {
    this.state.currentView = view;
    this.saveState();
  }

  setPatientScreen(screen) {
    this.state.patientScreen = screen;
    this.saveState();
  }

  selectHospital(hospId) {
    this.state.selectedHospitalId = hospId;
    this.state.patientScreen = 'doctors';
    this.saveState();
  }

  selectDoctor(docId) {
    this.state.selectedDoctorId = docId;
    this.state.patientScreen = 'doctor-detail';
    this.saveState();
  }

  setHospitalActiveDoctor(docId) {
    this.state.hospitalActiveDoctorId = docId;
    this.saveState();
  }

  // Patient clicks "GET MY TOKEN"
  bookUserToken(doctorId = 'doc-rajesh') {
    const docQueue = this.state.doctorQueues[doctorId];
    if (!docQueue) return null;

    // Check pricing: first 3 free, then ₹10
    this.state.userBookedCount += 1;
    const isFree = this.state.userBookedCount <= 3;
    const fee = isFree ? 0 : 10;

    // In demo flow, assign Token #25 for Dr. Rajesh Sharma as specified in prompt
    let tokenNum = 25;
    if (doctorId !== 'doc-rajesh') {
      tokenNum = docQueue.currentToken + docQueue.waitingCount + 1;
    }

    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId) || MOCK_DOCTORS[0];
    const hospital = MOCK_HOSPITALS.find(h => h.id === doctor.hospitalId) || MOCK_HOSPITALS[0];

    const newToken = {
      tokenNumber: tokenNum,
      patientName: "You (घर से मरीज)",
      doctorName: doctor.nameEn,
      doctorId: doctor.id,
      hospitalName: hospital.nameEn,
      roomNumber: doctor.roomNumber,
      status: "WAITING",
      fee: fee,
      isFree: isFree,
      isUser: true,
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.state.userToken = newToken;

    // Synchronize to hospital queue!
    const existingIndex = docQueue.queue.findIndex(item => item.tokenNumber === tokenNum);
    if (existingIndex >= 0) {
      docQueue.queue[existingIndex] = newToken;
    } else {
      docQueue.queue.push(newToken);
    }

    // Sort queue by tokenNumber
    docQueue.queue.sort((a, b) => a.tokenNumber - b.tokenNumber);
    docQueue.waitingCount = docQueue.queue.filter(t => t.tokenNumber > docQueue.currentToken).length;
    docQueue.totalTokens = Math.max(docQueue.totalTokens, tokenNum);

    // Switch patient screen to token-confirm
    this.state.patientScreen = 'token-confirm';
    this.saveState();

    return newToken;
  }

  // Hospital staff clicks "CALL NEXT PATIENT" or "CALL NEXT TOKEN"
  callNextToken(doctorId) {
    const targetDocId = doctorId || this.state.hospitalActiveDoctorId;
    const docQueue = this.state.doctorQueues[targetDocId];
    if (!docQueue) return null;

    const current = docQueue.currentToken;
    const nextTokenNum = current + 1;

    // Mark previous current token as COMPLETED
    const prevTok = docQueue.queue.find(t => t.tokenNumber === current);
    if (prevTok) {
      prevTok.status = "COMPLETED";
    }

    // Mark next token as CALLING
    docQueue.currentToken = nextTokenNum;
    docQueue.completedCount += 1;
    docQueue.waitingCount = Math.max(0, docQueue.waitingCount - 1);

    const callingTok = docQueue.queue.find(t => t.tokenNumber === nextTokenNum);
    if (callingTok) {
      callingTok.status = "CALLING";
    }

    // Check if user's token is reached!
    if (this.state.userToken && this.state.userToken.doctorId === targetDocId) {
      if (this.state.userToken.tokenNumber === nextTokenNum) {
        this.state.userToken.status = "CALLING";
        this.state.patientScreen = 'token-called';
      }
    }

    this.saveState();
    return nextTokenNum;
  }

  // Hospital staff clicks RECALL TOKEN
  recallCurrentToken(doctorId) {
    const targetDocId = doctorId || this.state.hospitalActiveDoctorId;
    const docQueue = this.state.doctorQueues[targetDocId];
    if (!docQueue) return;

    if (window.sound) {
      window.sound.playHospitalChime();
      const doc = MOCK_DOCTORS.find(d => d.id === targetDocId);
      const isHi = this.state.language === 'hi';
      const msg = isHi
        ? `टोकन नंबर ${docQueue.currentToken}, कृपया ${doc ? doc.room : 'कमरे'} में डॉक्टर के पास जाएं।`
        : `Token number ${docQueue.currentToken}, please proceed to room ${doc ? doc.roomNumber : ''}.`;
      setTimeout(() => {
        window.sound.speak(msg, isHi ? 'hi-IN' : 'en-IN');
      }, 900);
    }
    this.notifyListeners('RECALL');
  }

  // Hospital staff toggles PAUSE QUEUE
  togglePauseQueue() {
    this.state.isQueuePaused = !this.state.isQueuePaused;
    this.saveState();
  }

  // Calculate pricing breakdown for hospital display
  calculatePricingBreakdown() {
    let totalTokensAllDocs = 0;
    Object.values(this.state.doctorQueues).forEach(dq => {
      totalTokensAllDocs += dq.totalTokens;
    });

    // Pricing Model: First 3 tokens FREE, then ₹10 / token
    const freeTokensCount = Math.min(3, totalTokensAllDocs);
    const paidTokensCount = Math.max(0, totalTokensAllDocs - 3);
    const totalPlatformCharge = paidTokensCount * 10;

    return {
      totalTokens: totalTokensAllDocs,
      freeTokensCount,
      paidTokensCount,
      platformFeePerToken: 10,
      totalPlatformCharge
    };
  }
}

// Global App State Instance
window.appState = new AppState();
