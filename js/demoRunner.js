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
        title: "Step 1: Patient Opens City Care Hospital Portal",
        desc: "Direct single hospital portal link. No 'Find Hospital' directory needed.",
        action: () => {
          window.appState.resetToInitial(false);
          window.appState.setCurrentView('dual');
          window.appState.setPatientScreen('welcome');
        }
      },
      {
        title: "Step 2: 3 Physical Patients Arrive at Hospital Reception Desk",
        desc: "Patients present at front desk. Receptionist uses OPD Token Desk without disturbing clinic software.",
        action: () => {
          window.hospitalUI.showToast("🏥 3 physical patients arrived at reception counter!");
        }
      },
      {
        title: "Step 3: Nurse Increments Queue (+3 Walk-Ins) into Hospital DB",
        desc: "Tokens #19, #20, #21 allocated to Walk-In patients. Next online token will now be #22!",
        action: () => {
          window.hospitalUI.addWalkIns(3);
        }
      },
      {
        title: "Step 4: Online Patient at Home Selects Dr. Rajesh Sharma",
        desc: "Patient at home sees current token #18, 3 walk-ins waiting ahead, and Next Token #22!",
        action: () => {
          window.appState.selectDoctor('doc-rajesh');
        }
      },
      {
        title: "Step 5: Patient Books From Home & Nurse Reception Rings!",
        desc: "Gurpreet Singh books Token #22 from home. Reception console rings phone chime notification & pops up incoming patient card in Hospital DB!",
        action: () => {
          if (window.sound) window.sound.playSuccessSound();
          window.appState.bookUserToken('doc-rajesh', {
            name: "Gurpreet Singh",
            age: 45,
            gender: "Male",
            place: "Moga (GT Road)",
            phone: "98765-43210",
            purpose: "Chest heaviness & Routine checkup",
            purposeIcon: "❤️"
          });
        }
      },
      {
        title: "Step 6: Patient Token Pass Shows 3 Reception Patients Ahead",
        desc: "Token #22 Pass confirms: 3 people ahead at hospital reception. No waiting in line!",
        action: () => {
          window.appState.setPatientScreen('token-confirm');
        }
      },
      {
        title: "Step 7: Hospital OPD Desk Shows Unified Hybrid Queue",
        desc: "Hospital DB stores both Walk-Ins (#19, #20, #21) and Online Booking (#22) in exact sequence!",
        action: () => {
          if (window.hospitalUI) window.hospitalUI.dismissIncomingAlert(true);
          window.appState.setHospitalActiveDoctor('doc-rajesh');
          setTimeout(() => {
            window.hospitalUI.showPatientDetailsModal(22, 'doc-rajesh');
            setTimeout(() => {
              const modal = document.getElementById('patient-details-modal');
              if (modal) modal.remove();
            }, 2200);
          }, 600);
        }
      },
      {
        title: "Step 8: Hospital Calls Walk-In Token #19",
        desc: "Staff calls Token #19. Walk-in patient enters consultation room.",
        action: () => {
          window.appState.callNextToken('doc-rajesh');
          if (window.sound) window.sound.playHospitalChime();
        }
      },
      {
        title: "Step 9: Hospital Calls Walk-In Tokens #20 & #21",
        desc: "Queue advances smoothly. Online patient at home sees their turn approaching!",
        action: () => {
          window.appState.callNextToken('doc-rajesh');
          setTimeout(() => {
            window.appState.callNextToken('doc-rajesh');
          }, 800);
        }
      },
      {
        title: "Step 10: Hospital Calls Token #22 — ONLINE PATIENT TURN!",
        desc: "Token #22 is active! Patient's phone triggers alarm bell chime and voice alert!",
        action: () => {
          window.appState.callNextToken('doc-rajesh');
          // State manager automatically alerts and transitions patient screen!
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
