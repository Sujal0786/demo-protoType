// Central Reactive State Store for OPD Prototype (Frontend Only)

class AppState {
  constructor() {
    this.STORAGE_KEY = 'opd_frontend_prototype_v3';
    this.CHANNEL_NAME = 'opd_channel_sync_v3';
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
            this.notifyListeners(event.data.reason || 'SYNC', event.data.extraData);
          }
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel not available", e);
    }

    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        const oldAlertTime = this.state?.incomingTokenAlert?.timestamp;
        this.loadFromStorage();
        const newAlert = this.state?.incomingTokenAlert;
        if (newAlert && newAlert.timestamp !== oldAlertTime) {
          this.notifyListeners('NEW_ONLINE_TOKEN', newAlert.token);
        } else {
          this.notifyListeners('STORAGE_SYNC');
        }
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

  saveState(reason = 'STATE_CHANGED', extraData = null) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'SYNC_STATE',
          payload: this.state,
          reason,
          extraData
        });
      } catch (e) {}
    }
    this.notifyListeners(reason, extraData);
  }

  resetToInitial(triggerNotify = true) {
    this.state = {
      language: 'en', // 'en' | 'hi'
      currentView: 'dual', // 'dual' | 'patient' | 'hospital'
      patientScreen: 'welcome', // 'welcome' | 'doctors' | 'doctor-detail' | 'token-confirm' | 'live-track' | 'token-called' | 'help'
      selectedHospitalId: 'hosp-1',
      selectedDoctorId: 'doc-rajesh',
      hospitalActiveDoctorId: 'doc-rajesh',
      hospitalIsLoggedIn: true,
      hospitalStaffName: "Reception Desk",
      userToken: null, // Holds online booked token
      userBookedCount: 0, // First 3 free, then ₹10
      isQueuePaused: false,

      // Doctor Queues with Hybrid Walk-In + Online support
      doctorQueues: {
        'doc-rajesh': {
          doctorId: 'doc-rajesh',
          doctorName: 'Dr. Rajesh Sharma',
          currentToken: 18,
          totalTokens: 18,
          waitingCount: 0,
          completedCount: 17,
          queue: [
            {
              tokenNumber: 18,
              patientName: "Sukhwinder Singh",
              age: 54,
              gender: "Male",
              place: "Moga (GT Road)",
              phone: "98765-11221",
              purpose: "Chest tightness & High BP",
              purposeIcon: "❤️",
              doctorName: "Dr. Sharma",
              status: "CALLING",
              fee: 0,
              isFree: true,
              isUser: false,
              isWalkIn: false,
              source: "PHYSICAL",
              bookedAt: "09:15 AM"
            }
          ]
        },
        'doc-neha': {
          doctorId: 'doc-neha',
          doctorName: 'Dr. Neha Gupta',
          currentToken: 11,
          totalTokens: 11,
          waitingCount: 0,
          completedCount: 10,
          queue: [
            {
              tokenNumber: 11,
              patientName: "Baby Aarav",
              age: 4,
              gender: "Male",
              place: "Kotkapura",
              phone: "98761-22334",
              purpose: "High fever & persistent cough",
              purposeIcon: "👶",
              doctorName: "Dr. Gupta",
              status: "CALLING",
              fee: 0,
              isFree: true,
              isUser: false,
              isWalkIn: false,
              source: "PHYSICAL",
              bookedAt: "09:20 AM"
            }
          ]
        },
        'doc-amit': {
          doctorId: 'doc-amit',
          doctorName: 'Dr. Amit Kumar',
          currentToken: 16,
          totalTokens: 16,
          waitingCount: 0,
          completedCount: 15,
          queue: [
            {
              tokenNumber: 16,
              patientName: "Joginder Pal",
              age: 51,
              gender: "Male",
              place: "Moga Camp",
              phone: "98150-11223",
              purpose: "Viral fever & body chills",
              purposeIcon: "🤒",
              doctorName: "Dr. Kumar",
              status: "CALLING",
              fee: 0,
              isFree: true,
              isUser: false,
              isWalkIn: false,
              source: "PHYSICAL",
              bookedAt: "09:10 AM"
            }
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

  notifyListeners(reason = '', extraData = null) {
    this.listeners.forEach(cb => {
      try {
        cb(this.state, reason, extraData);
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

  // Calculate the next sequential token number across online and walk-in patients
  getNextAvailableToken(doctorId) {
    const targetDocId = doctorId || this.state.hospitalActiveDoctorId || 'doc-rajesh';
    const docQueue = this.state.doctorQueues[targetDocId];
    if (!docQueue) return 1;

    const maxInQueue = docQueue.queue && docQueue.queue.length > 0
      ? docQueue.queue.reduce((max, t) => Math.max(max, t.tokenNumber), 0)
      : 0;

    return Math.max(docQueue.currentToken || 0, maxInQueue, docQueue.totalTokens || 0) + 1;
  }

  // Nurse adds physical walk-in patients arriving at hospital reception desk
  addWalkInPatients(doctorId = 'doc-rajesh', count = 1, customDetails = null) {
    const targetDocId = doctorId || this.state.hospitalActiveDoctorId || 'doc-rajesh';
    const docQueue = this.state.doctorQueues[targetDocId];
    if (!docQueue) return [];

    const doctor = MOCK_DOCTORS.find(d => d.id === targetDocId) || MOCK_DOCTORS[0];
    const hospital = MOCK_HOSPITALS.find(h => h.id === doctor.hospitalId) || MOCK_HOSPITALS[0];
    const createdTokens = [];

    for (let i = 0; i < count; i++) {
      const nextNum = this.getNextAvailableToken(targetDocId);
      const defaultName = count === 1
        ? (customDetails?.name || `Walk-in Patient #${nextNum} (Hospital DB)`)
        : `Walk-in Patient #${nextNum} (Reception DB)`;

      const walkInToken = {
        tokenNumber: nextNum,
        patientName: customDetails?.name && count === 1 ? customDetails.name : defaultName,
        age: customDetails?.age || (36 + ((nextNum * 3) % 30)),
        gender: customDetails?.gender || (nextNum % 2 === 0 ? "Female" : "Male"),
        place: customDetails?.place || "Physical Reception Desk",
        phone: customDetails?.phone || "Reception Counter",
        purpose: customDetails?.purpose || "OPD Walk-in Consultation",
        purposeIcon: "🏥",
        doctorName: doctor.nameEn,
        doctorId: doctor.id,
        hospitalName: hospital.nameEn,
        roomNumber: doctor.roomNumber,
        status: "WAITING",
        fee: 0,
        isFree: true,
        isUser: false,
        isWalkIn: true,
        source: "RECEPTION_WALKIN",
        bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      docQueue.queue.push(walkInToken);
      docQueue.totalTokens = Math.max(docQueue.totalTokens || 0, nextNum);
      createdTokens.push(walkInToken);
    }

    docQueue.queue.sort((a, b) => a.tokenNumber - b.tokenNumber);
    docQueue.waitingCount = docQueue.queue.filter(t => t.tokenNumber > docQueue.currentToken).length;

    this.saveState();
    return createdTokens;
  }

  // Quick reset to Token #18 calling in room for doctor presentation / pitch
  resetDoctorQueueTo18(doctorId = 'doc-rajesh') {
    const docQueue = this.state.doctorQueues[doctorId];
    if (!docQueue) return;

    docQueue.currentToken = 18;
    docQueue.totalTokens = 18;
    docQueue.waitingCount = 0;
    docQueue.completedCount = 17;
    docQueue.queue = [
      {
        tokenNumber: 18,
        patientName: "Sukhwinder Singh",
        age: 54,
        gender: "Male",
        place: "Moga (GT Road)",
        phone: "98765-11221",
        purpose: "Chest tightness & High BP",
        purposeIcon: "❤️",
        doctorName: "Dr. Sharma",
        status: "CALLING",
        fee: 0,
        isFree: true,
        isUser: false,
        isWalkIn: false,
        source: "PHYSICAL",
        bookedAt: "09:15 AM"
      }
    ];

    if (this.state.userToken && this.state.userToken.doctorId === doctorId) {
      this.state.userToken = null;
    }
    this.state.patientScreen = 'welcome';
    this.saveState();
  }

  // Patient clicks "GET MY TOKEN" from home
  bookUserToken(doctorId = 'doc-rajesh', patientDetails = null) {
    const docQueue = this.state.doctorQueues[doctorId];
    if (!docQueue) return null;

    // Check pricing: first 3 free, then ₹10
    this.state.userBookedCount += 1;
    const isFree = this.state.userBookedCount <= 3;
    const fee = isFree ? 0 : 10;

    // Dynamically calculate the next available token number in the hybrid queue!
    const tokenNum = this.getNextAvailableToken(doctorId);

    const doctor = MOCK_DOCTORS.find(d => d.id === doctorId) || MOCK_DOCTORS[0];
    const hospital = MOCK_HOSPITALS.find(h => h.id === doctor.hospitalId) || MOCK_HOSPITALS[0];

    const details = patientDetails || {
      name: "Gurpreet Singh (घर से मरीज)",
      age: 45,
      gender: "Male",
      place: "Moga (GT Road)",
      phone: "98765-43210",
      purpose: "Chest pain & Routine checkup",
      purposeIcon: "❤️"
    };

    const newToken = {
      tokenNumber: tokenNum,
      patientName: details.name || "Gurpreet Singh",
      age: details.age || 45,
      gender: details.gender || "Male",
      place: details.place || "Moga (GT Road)",
      phone: details.phone || "98765-43210",
      purpose: details.purpose || "Consultation & Checkup",
      purposeIcon: details.purposeIcon || "🩺",
      doctorName: doctor.nameEn,
      doctorId: doctor.id,
      hospitalName: hospital.nameEn,
      roomNumber: doctor.roomNumber,
      status: "WAITING",
      fee: fee,
      isFree: isFree,
      isUser: true,
      isWalkIn: false,
      source: "ONLINE_HOME",
      bookedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bookedTimestamp: Date.now()
    };

    this.state.userToken = newToken;
    this.state.lastPatientDetails = details;
    this.state.latestNewOnlineToken = newToken;
    this.state.incomingTokenAlert = {
      token: newToken,
      doctorId: doctorId,
      timestamp: Date.now()
    };

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
    this.saveState('NEW_ONLINE_TOKEN', newToken);

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
