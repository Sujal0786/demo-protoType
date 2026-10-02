// Automated Interactive Demo Runner (Screen 16: "RUN DEMO")
// Walkthrough demonstrating the complete Patient + Hospital synchronization in ~60-90 seconds

class DemoRunner {
  constructor() {
    this.isRunning = false;
    this.currentStep = 0;
    this.timer = null;
    this.stepDelay = 3200; // ms per step

    this.steps = [
      {
        title: "Step 1: Patient Opens App at Home",
        desc: "Patient starts from home without traveling to the hospital.",
        action: () => {
          window.appState.resetToInitial(false);
          window.appState.setCurrentView('dual');
          window.appState.setPatientScreen('welcome');
        }
      },
      {
        title: "Step 2: Patient Selects Hospital",
        desc: "Patient taps 'Find Hospital' and selects City Care Hospital, Moga.",
        action: () => {
          window.appState.setPatientScreen('hospitals');
          setTimeout(() => {
            window.appState.selectHospital('hosp-1');
          }, 1200);
        }
      },
      {
        title: "Step 3: Patient Sees Doctor Profile Photos",
        desc: "Large doctor photos and clear waiting numbers are displayed.",
        action: () => {
          window.appState.setPatientScreen('doctors');
        }
      },
      {
        title: "Step 4: Patient Clicks Dr. Rajesh Sharma",
        desc: "Selects Heart Specialist, Room 204. Current Token: 18, Waiting: 7.",
        action: () => {
          window.appState.selectDoctor('doc-rajesh');
        }
      },
      {
        title: "Step 5: Patient Clicks 'GET MY TOKEN'",
        desc: "Generates Token #25! First 3 tokens are 100% FREE (₹0 charge).",
        action: () => {
          if (window.sound) window.sound.playSuccessSound();
          window.appState.bookUserToken('doc-rajesh');
        }
      },
      {
        title: "Step 6: Patient Sees Token Confirmation Pass",
        desc: "Token #25 is issued. 6 people ahead (~35 min wait). Patient told to wait at home.",
        action: () => {
          window.appState.setPatientScreen('token-confirm');
        }
      },
      {
        title: "Step 7: Patient Opens Live Queue Tracker",
        desc: "Shows real-time queue. Patient can sit comfortably at home.",
        action: () => {
          window.appState.setPatientScreen('live-track');
        }
      },
      {
        title: "Step 8: Hospital Dashboard Synchronizes Immediately",
        desc: "Notice the right side! Hospital OPD staff sees Token #25 in the waiting list.",
        action: () => {
          window.appState.setHospitalActiveDoctor('doc-rajesh');
        }
      },
      {
        title: "Step 9: Hospital Calls Next Token (18 → 19)",
        desc: "Staff clicks 'CALL NEXT PATIENT'. Previous token marked Done, 19 is Called.",
        action: () => {
          window.appState.callNextToken('doc-rajesh');
          if (window.sound) window.sound.playHospitalChime();
        }
      },
      {
        title: "Step 10: Hospital Calls Next Token (19 → 20)",
        desc: "Queue moves forward in real time. Patient's phone shows '5 people before you'.",
        action: () => {
          window.appState.callNextToken('doc-rajesh');
        }
      },
      {
        title: "Step 11: Hospital Calls Next Token (20 → 21 → 22)",
        desc: "Staff continues consulting patients. Token moves to #22.",
        action: () => {
          window.appState.callNextToken('doc-rajesh');
          setTimeout(() => {
            window.appState.callNextToken('doc-rajesh');
          }, 800);
        }
      },
      {
        title: "Step 12: Hospital Calls Next Token (22 → 23 → 24)",
        desc: "Patient status turns yellow: 'Please start coming to hospital now!'",
        action: () => {
          window.appState.callNextToken('doc-rajesh');
          setTimeout(() => {
            window.appState.callNextToken('doc-rajesh');
          }, 800);
        }
      },
      {
        title: "Step 13: Hospital Calls Token #25 — YOUR TURN!",
        desc: "Token #25 is active! Patient screen triggers full-screen alert + hospital chime bell!",
        action: () => {
          window.appState.callNextToken('doc-rajesh');
          // State manager automatically redirects patient to 'token-called' screen!
        }
      }
    ];
  }

  startDemo() {
    this.isRunning = true;
    this.currentStep = 0;
    this.updateBanner();
    this.executeCurrentStep();
  }

  stopDemo() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updateBanner();
  }

  executeCurrentStep() {
    if (!this.isRunning) return;

    if (this.currentStep < this.steps.length) {
      const step = this.steps[this.currentStep];
      step.action();
      this.updateBanner();

      this.timer = setTimeout(() => {
        this.currentStep++;
        this.executeCurrentStep();
      }, this.stepDelay);
    } else {
      this.isRunning = false;
      this.updateBanner();
    }
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.steps[this.currentStep].action();
      this.updateBanner();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.steps[this.currentStep].action();
      this.updateBanner();
    }
  }

  updateBanner() {
    const banner = document.getElementById('demo-progress-banner');
    if (!banner) return;

    if (!this.isRunning && this.currentStep === 0) {
      banner.classList.add('hidden');
      return;
    }

    banner.classList.remove('hidden');

    const step = this.steps[Math.min(this.currentStep, this.steps.length - 1)];
    const percent = Math.round(((this.currentStep + 1) / this.steps.length) * 100);

    banner.innerHTML = `
      <div class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white px-4 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-300">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-full bg-white text-amber-900 flex items-center justify-center font-black text-sm shadow animate-pulse">
            ${this.currentStep + 1}/${this.steps.length}
          </span>
          <div>
            <div class="text-xs sm:text-sm font-black tracking-tight">${step.title}</div>
            <div class="text-[11px] text-amber-100 font-medium">${step.desc}</div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button onclick="demoRunner.prevStep()" class="bg-black/20 hover:bg-black/30 text-white px-2 py-1 rounded-lg text-xs font-bold">
            ◀ Prev
          </button>
          ${this.isRunning ? `
            <button onclick="demoRunner.stopDemo()" class="bg-white text-amber-900 px-3 py-1 rounded-lg text-xs font-black shadow hover:bg-amber-100">
              ⏸️ Pause
            </button>
          ` : `
            <button onclick="demoRunner.startDemo()" class="bg-white text-amber-900 px-3 py-1 rounded-lg text-xs font-black shadow hover:bg-amber-100">
              ▶️ Resume
            </button>
          `}
          <button onclick="demoRunner.nextStep()" class="bg-black/20 hover:bg-black/30 text-white px-2 py-1 rounded-lg text-xs font-bold">
            Next ▶
          </button>
          <button onclick="demoRunner.stopDemo(); window.appState.resetToInitial();" class="text-white/80 hover:text-white text-xs underline ml-2">
            Exit Demo
          </button>
        </div>
      </div>
    `;
  }
}

// Global demo runner instance
window.demoRunner = new DemoRunner();
