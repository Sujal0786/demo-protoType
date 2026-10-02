// Central State Manager with Multi-tab BroadcastChannel & LocalStorage Synchronization

class OPDStore {
  constructor() {
    this.channelName = 'healthcare_opd_sync_v1';
    this.broadcastChannel = null;
    this.listeners = [];

    // Local Storage Keys
    this.STORAGE_KEY_TOKENS = 'healthcare_tokens_data';
    this.STORAGE_KEY_USER = 'healthcare_user_profile';
    this.STORAGE_KEY_STATS = 'healthcare_system_stats';

    this.initBroadcast();
    this.loadState();
  }

  initBroadcast() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChannel = new BroadcastChannel(this.channelName);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingBroadcast(event.data);
        };
      }
    } catch (e) {
      console.warn("BroadcastChannel unsupported, relying on storage events", e);
    }

    // Storage fallback for older browsers / cross-origin tabs
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY_TOKENS || e.key === this.STORAGE_KEY_USER) {
        this.loadState();
        this.notify('STORAGE_SYNC', this.getState());
      }
    });
  }

  loadState() {
    // 1. Load Tokens
    const savedTokens = localStorage.getItem(this.STORAGE_KEY_TOKENS);
    if (savedTokens) {
      try {
        this.tokens = JSON.parse(savedTokens);
      } catch (e) {
        this.tokens = this.getDefaultTokens();
      }
    } else {
      this.tokens = this.getDefaultTokens();
      this.saveTokens();
    }

    // 2. Load User Profile (Tracks Free Token Allowance: 3 Free, then ₹10)
    const savedUser = localStorage.getItem(this.STORAGE_KEY_USER);
    if (savedUser) {
      try {
        this.user = JSON.parse(savedUser);
      } catch (e) {
        this.user = this.getDefaultUser();
      }
    } else {
      this.user = this.getDefaultUser();
      this.saveUser();
    }
  }

  getDefaultTokens() {
    // Seed with 2 realistic existing tokens in queue so hospital queue looks alive immediately
    return [
      {
        id: "tok-1001",
        tokenNumber: 1,
        tokenCode: "OPD-01",
        doctorId: "doc-1",
        doctorName: "Dr. Rajesh Sharma",
        roomNumber: 101,
        patientName: "Ramesh Kumar (रमेश)",
        patientPhone: "98765-XXXXX",
        status: "SERVING", // currently inside doctor's room
        isFree: true,
        fee: 0,
        createdAt: new Date(Date.now() - 25 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calledAt: new Date(Date.now() - 5 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: false
      },
      {
        id: "tok-1002",
        tokenNumber: 2,
        tokenCode: "OPD-02",
        doctorId: "doc-1",
        doctorName: "Dr. Rajesh Sharma",
        roomNumber: 101,
        patientName: "Kamla Devi (कमला)",
        patientPhone: "98123-XXXXX",
        status: "WAITING",
        isFree: true,
        fee: 0,
        createdAt: new Date(Date.now() - 10 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calledAt: null,
        isEmergency: false
      }
    ];
  }

  getDefaultUser() {
    return {
      phone: "9876543210",
      name: "Patient (मरीज)",
      tokensBookedCount: 0, // Starts at 0: Tokens 1, 2, 3 are FREE (₹0). Token 4+ = ₹10
      freeTokensLimit: 3,
      currentActiveTokenId: null
    };
  }

  saveTokens() {
    localStorage.setItem(this.STORAGE_KEY_TOKENS, JSON.stringify(this.tokens));
  }

  saveUser() {
    localStorage.setItem(this.STORAGE_KEY_USER, JSON.stringify(this.user));
  }

  broadcast(type, payload) {
    const message = { type, payload, timestamp: Date.now() };
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {
        console.warn("Broadcast post failed", e);
      }
    }
    this.notify(type, payload);
  }

  handleIncomingBroadcast(message) {
    if (!message || !message.type) return;
    this.loadState();
    this.notify(message.type, message.payload);
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    this.listeners.forEach(cb => {
      try {
        cb(event, data);
      } catch (e) {
        console.error("Listener error:", e);
      }
    });
  }

  getState() {
    return {
      tokens: this.tokens,
      user: this.user,
      stats: this.calculateStats()
    };
  }

  calculateStats() {
    const totalTokens = this.tokens.length;
    const freeTokens = this.tokens.filter(t => t.isFree).length;
    const paidTokens = this.tokens.filter(t => !t.isFree).length;
    const revenue = paidTokens * 10;
    const waitingTokens = this.tokens.filter(t => t.status === 'WAITING').length;
    const completedTokens = this.tokens.filter(t => t.status === 'COMPLETED').length;
    const servingTokens = this.tokens.filter(t => t.status === 'SERVING').length;

    return {
      totalTokens,
      freeTokens,
      paidTokens,
      revenue,
      waitingTokens,
      completedTokens,
      servingTokens
    };
  }

  // Check if next token will be free or paid
  getNextBookingPricing() {
    const nextCount = this.user.tokensBookedCount + 1;
    const isFree = nextCount <= this.user.freeTokensLimit;
    const fee = isFree ? 0 : 10;
    const freeRemaining = Math.max(0, this.user.freeTokensLimit - this.user.tokensBookedCount);

    return {
      tokenIndex: nextCount,
      isFree,
      fee,
      freeRemaining,
      freeLimit: this.user.freeTokensLimit
    };
  }

  // Patient Books a Token from Home
  bookToken(doctorId, patientName = "Self (स्वयं)", isEmergency = false) {
    const doctor = DOCTORS.find(d => d.id === doctorId) || DOCTORS[0];
    const pricing = this.getNextBookingPricing();

    // Determine next sequential token number for this doctor today
    const doctorTokens = this.tokens.filter(t => t.doctorId === doctorId);
    const nextTokenNum = doctorTokens.length + 1;
    const tokenCode = `OPD-${String(nextTokenNum).padStart(2, '0')}`;

    const newToken = {
      id: "tok-" + Date.now(),
      tokenNumber: nextTokenNum,
      tokenCode: tokenCode,
      doctorId: doctor.id,
      doctorName: doctor.nameEn,
      doctorNameHi: doctor.nameHi,
      specialtyEn: doctor.specialtyEn,
      specialtyHi: doctor.specialtyHi,
      roomNumber: doctor.roomNumber,
      room: doctor.room,
      symptomIcon: doctor.symptomIcon,
      patientName: patientName,
      patientPhone: this.user.phone,
      status: "WAITING",
      isFree: pricing.isFree,
      fee: pricing.fee,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calledAt: null,
      isEmergency: isEmergency
    };

    // Update tokens list
    this.tokens.push(newToken);
    this.saveTokens();

    // Update user profile
    this.user.tokensBookedCount += 1;
    this.user.currentActiveTokenId = newToken.id;
    this.saveUser();

    this.broadcast('TOKEN_BOOKED', { token: newToken, pricing });
    return newToken;
  }

  // Hospital Desk Calls a Token into Room
  callToken(tokenId) {
    const token = this.tokens.find(t => t.id === tokenId);
    if (!token) return null;

    // Any currently serving token for this doctor gets marked COMPLETED or returned
    this.tokens.forEach(t => {
      if (t.doctorId === token.doctorId && t.status === 'SERVING' && t.id !== tokenId) {
        t.status = 'COMPLETED';
        t.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    });

    token.status = 'SERVING';
    token.calledAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.saveTokens();
    this.broadcast('TOKEN_CALLED', { token });
    return token;
  }

  // Hospital Desk Marks Token Completed
  completeToken(tokenId) {
    const token = this.tokens.find(t => t.id === tokenId);
    if (!token) return null;

    token.status = 'COMPLETED';
    token.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.saveTokens();
    this.broadcast('TOKEN_COMPLETED', { token });
    return token;
  }

  // Hospital Desk Marks Token Skipped/Absent
  skipToken(tokenId) {
    const token = this.tokens.find(t => t.id === tokenId);
    if (!token) return null;

    token.status = 'SKIPPED';
    token.skippedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.saveTokens();
    this.broadcast('TOKEN_SKIPPED', { token });
    return token;
  }

  // Call Next Token in Queue for Doctor
  callNextForDoctor(doctorId) {
    const nextWaiting = this.tokens.find(t => t.doctorId === doctorId && t.status === 'WAITING');
    if (nextWaiting) {
      return this.callToken(nextWaiting.id);
    }
    return null;
  }

  // Reset demo data to initial state for testing
  resetDemo() {
    this.tokens = this.getDefaultTokens();
    this.user = this.getDefaultUser();
    this.saveTokens();
    this.saveUser();
    this.broadcast('DEMO_RESET', {});
  }
}

// Global store instance
window.store = new OPDStore();
