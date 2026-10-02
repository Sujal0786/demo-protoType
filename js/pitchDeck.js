// Interactive In-Person Pitch Deck Modal for Doctor & Hospital OPD Visits

class DoctorPitchDeck {
  constructor() {
    this.isOpen = false;
    this.currentSlide = 0;
    this.totalSlides = 6;
    this.language = 'en'; // 'en' | 'hi'

    this.initKeyboard();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        this.nextSlide();
      } else if (e.key === 'ArrowLeft') {
        this.prevSlide();
      } else if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.currentSlide = 0;
    this.render();
  }

  close() {
    this.isOpen = false;
    const modal = document.getElementById('doctor-pitch-modal');
    if (modal) modal.remove();
  }

  toggleLanguage() {
    this.language = this.language === 'en' ? 'hi' : 'en';
    this.render();
  }

  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.render();
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.render();
    }
  }

  goToSlide(index) {
    if (index >= 0 && index < this.totalSlides) {
      this.currentSlide = index;
      this.render();
    }
  }

  launchLiveDemoFromSlide() {
    this.close();
    window.appState.setCurrentView('dual');
    window.demoRunner.startDemo();
  }

  getSlideContent() {
    const isHi = this.language === 'hi';

    const slides = [
      // SLIDE 1: THE PROBLEM
      {
        badge: isHi ? "समस्या (The Problem)" : "THE DAILY REALITY",
        badgeColor: "bg-red-950 text-red-300 border-red-800",
        title: isHi ? "ओपीडी की भीड़, लंबी लाइन और मरीजों का गुस्सा" : "Waiting Room Chaos, Long Lines & Lost Patients",
        subtitle: isHi ? "हर सुबह क्लिनिक और अस्पताल में होने वाली आम समस्याएं:" : "The friction points every doctor and hospital faces daily:",
        points: [
          {
            icon: "⏳",
            title: isHi ? "2 से 3 घंटे का लंबा इंतजार" : "2 to 3 Hours Waiting Time",
            desc: isHi ? "मरीज और उनके परिजन छोटे से वेटिंग हॉल में घंटों परेशान बैठते हैं।" : "Patients packed into congested corridors, feeling exhausted and irritated."
          },
          {
            icon: "🤯",
            title: isHi ? "रिसेप्शन स्टाफ पर भारी तनाव" : "Reception Staff Burnout",
            desc: isHi ? "दिन भर में 200 बार एक ही सवाल: 'हमारा नंबर कब आएगा?'" : "Answering 'When is my turn?' 200 times a day causes staff friction."
          },
          {
            icon: "🏃",
            title: isHi ? "मरीजों का लौट जाना" : "Patients Leaving for Other Clinics",
            desc: isHi ? "लंबी कतार और अव्यवस्था देखकर कई मरीज बिना दिखाए चले जाते हैं।" : "Frustrated by delays, walk-in patients leave for competing facilities."
          },
          {
            icon: "🦠",
            title: isHi ? "संक्रमण का खतरा" : "Cross-Infection Risk in Crowds",
            desc: isHi ? "बुखार, खांसी और बुजुर्ग मरीज एक ही जगह घंटों बैठे रहते हैं।" : "Sick patients crowded together pose cross-infection risks to elderly."
          }
        ]
      },

      // SLIDE 2: THE SOLUTION
      {
        badge: isHi ? "हमारा समाधान (The Solution)" : "THE INNOVATION",
        badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800",
        title: isHi ? "घर बैठे टोकन, सीधे डॉक्टर के कमरे में प्रवेश" : "Book Token from Home, Arrive Only When Called",
        subtitle: isHi ? "अस्पताल की कतार को डिजिटल और शांत बनाने का आधुनिक तरीका:" : "Transforming hospital waiting halls into peaceful, organized spaces:",
        points: [
          {
            icon: "🏠",
            title: isHi ? "मरीज घर से टोकन बुक करता है" : "Home Remote Token Booking",
            desc: isHi ? "बिना लाइन में लगे मरीज 30 सेकंड में मोबाइल से टोकन प्राप्त करता है।" : "Patients generate their sequential OPD token right from their living room."
          },
          {
            icon: "📱",
            title: isHi ? "लाइव कतार ट्रैकिंग (Live Queue)" : "Real-Time Transparent Queue",
            desc: isHi ? "मरीज को दिखता है: 'आपके आगे 4 लोग हैं, अनुमानित समय 30 मिनट'।" : "Mobile shows exact queue position: '4 people ahead, ~30 mins wait'."
          },
          {
            icon: "🚶",
            title: isHi ? "बारी आने पर ही अस्पताल आना" : "Just-in-Time Arrival",
            desc: isHi ? "मरीज तभी घर से निकलता है जब उसका नंबर 1-2 टोकन दूर हो।" : "Patients travel only when their turn approaches, eliminating crowded halls."
          },
          {
            icon: "🔔",
            title: isHi ? "घंटी और आवाज से स्वागत" : "Automated Bell & Room Directions",
            desc: isHi ? "अस्पताल डेस्क 1 क्लिक में बुलाता है, मरीज सीधे डॉक्टर के कमरे में जाता है।" : "Staff clicks Call Next; hospital chime sounds and patient enters room."
          }
        ]
      },

      // SLIDE 3: FOR DOCTORS & RECEPTION STAFF
      {
        badge: isHi ? "अस्पताल के लिए (For Hospital Staff)" : "HOSPITAL CONTROL CONSOLE",
        badgeColor: "bg-indigo-950 text-indigo-300 border-indigo-800",
        title: isHi ? "1-क्लिक डेस्क कंसोल: शून्य सिरदर्दी, पूरा नियंत्रण" : "1-Click OPD Console: Zero Effort, Total Control",
        subtitle: isHi ? "रिसेप्शन स्टाफ और डॉक्टर के लिए काम को बेहद आसान बनाया गया है:" : "Designed to reduce staff workload, not increase it:",
        points: [
          {
            icon: "📢",
            title: isHi ? "अगला मरीज बुलाएं (1-Click Call Next)" : "1-Click Next Patient Call",
            desc: isHi ? "बटन दबाते ही अगला टोकन स्क्रीन पर आता है और लाउडस्पीकर पर आवाज आती है।" : "One tap advances the queue, plays chime, and notifies patient mobile."
          },
          {
            icon: "🩺",
            title: isHi ? "डॉक्टर-अनुसार अलग कतारें" : "Doctor-Wise Segregated Queues",
            desc: isHi ? "हार्ट, बाल रोग और जनरल ओपीडी के लिए अलग-अलग स्वतंत्र टोकन।" : "Independent queues for Cardiologist, Pediatrician, and General OPD."
          },
          {
            icon: "🚨",
            title: isHi ? "इमरजेंसी और वॉक-इन सुविधा" : "Emergency & Walk-In Support",
            desc: isHi ? "बिना फोन वाले मरीजों के लिए रिसेप्शन सीधे काउंटर टोकन जारी कर सकता है।" : "Reception can immediately issue counter tokens for offline walk-ins."
          },
          {
            icon: "⏸️",
            title: isHi ? "कतार रोकने की सुविधा (Pause Queue)" : "Pause Queue for Emergencies",
            desc: isHi ? "यदि डॉक्टर किसी ऑपरेशन में व्यस्त हैं, तो मरीज को घर बैठे सूचना मिल जाती है।" : "If doctor is delayed, pause button broadcasts friendly delay alert."
          }
        ]
      },

      // SLIDE 4: BUILT FOR ELDERLY & LOW-LITERACY
      {
        badge: isHi ? "आसान उपयोग (Low-Literacy Friendly)" : "ACCESSIBILITY FIRST",
        badgeColor: "bg-teal-950 text-teal-300 border-teal-800",
        title: isHi ? "बुजुर्गों और अनपढ़ मरीजों के लिए सबसे सरल डिजाइन" : "Specially Designed for Elderly & Rural Patients",
        subtitle: isHi ? "कोई फॉर्म नहीं, कोई अंग्रेजी नहीं — सिर्फ फोटो, नंबर और आवाज:" : "Zero typing, zero complicated medical terms — visual and voice guided:",
        points: [
          {
            icon: "👨‍⚕️",
            title: isHi ? "डॉक्टर की बड़ी फोटो" : "Large Doctor Profile Photos",
            desc: isHi ? "मरीज डॉक्टर की फोटो पहचान कर 1 टच में टोकन ले सकता है।" : "Instant visual recognition. One tap on doctor photo generates token."
          },
          {
            icon: "❤️",
            title: isHi ? "बीमारी के सरल प्रतीक चिन्ह" : "Intuitive Symptom Icons",
            desc: isHi ? "दिल ❤️, बच्चा 👶, बुखार 🤒, हड्डी 🦴 देखकर अनपढ़ भी आसानी से समझें।" : "Heart ❤️, Child 👶, Fever 🤒 body icons eliminate literacy barriers."
          },
          {
            icon: "🔊",
            title: isHi ? "हिंदी में बोलकर बताने वाला स्पीकर" : "Text-to-Speech Hindi Audio",
            desc: isHi ? "स्पीकर बटन छूते ही पूरी जानकारी हिंदी आवाज में सुनाई देती है।" : "Every screen has a speaker button that reads instructions aloud."
          },
          {
            icon: "🟢",
            title: isHi ? "ट्रैफिक लाइट रंग संकेत" : "Color-Coded Status Guidance",
            desc: isHi ? "हरा = आराम से बैठें, पीला = अस्पताल के लिए निकलें, लाल = आपकी बारी।" : "Green = Wait at home, Yellow = Head to hospital, Red = Enter room."
          }
        ]
      },

      // SLIDE 5: ZERO SETUP COST & PRICING
      {
        badge: isHi ? "कीमत और व्यापार मॉडल" : "ZERO-RISK PRICING MODEL",
        badgeColor: "bg-amber-950 text-amber-300 border-amber-800",
        title: isHi ? "अस्पताल के लिए ₹0 खर्च • पहले 3 टोकन मरीजों के लिए मुफ़्त" : "Zero Cost for Hospital • First 3 Tokens FREE for Patients",
        subtitle: isHi ? "शून्य वित्तीय जोखिम — कोई नया कंप्यूटर या सॉफ्टवेयर खरीदने की जरूरत नहीं:" : "A transparent, win-win model with zero financial investment:",
        points: [
          {
            icon: "🎁",
            title: isHi ? "मरीजों के लिए प्रथम ३ टोकन मुफ़्त" : "First 3 Tokens Completely FREE",
            desc: isHi ? "हर मरीज पहले 3 टोकन बिल्कुल मुफ्त में इस्तेमाल कर सकता है।" : "100% free introductory tier for every patient (Zero barrier adoption)."
          },
          {
            icon: "🪙",
            title: isHi ? "मात्र ₹10 टोकन सुविधा शुल्क" : "Nominal ₹10 Platform Fee After 3",
            desc: isHi ? "4थे टोकन से मात्र ₹10 का सुविधा शुल्क, जिससे घंटों का समय और ऑटो किराया बचता है।" : "From 4th token onwards, ₹10 saves patients 2+ hours and travel hassle."
          },
          {
            icon: "💻",
            title: isHi ? "अस्पताल के लिए कोई सेटअप चार्ज नहीं" : "Zero Hardware or Setup Cost",
            desc: isHi ? "अस्पताल के मौजूदा फोन, टैबलेट या रिसेप्शन कंप्यूटर पर ब्राउज़र में तुरंत चलता है।" : "Runs on any existing receptionist phone, laptop, or waiting hall TV."
          },
          {
            icon: "📈",
            title: isHi ? "अस्पताल की साख और मरीजों में वृद्धि" : "Boosts Hospital Reputation",
            desc: isHi ? "समय बचाने वाले क्लिनिक में मरीज बार-बार आना पसंद करते हैं।" : "Delighted patients return and recommend your clinic for peaceful visits."
          }
        ]
      },

      // SLIDE 6: THE CLOSING OFFER
      {
        badge: isHi ? "निर्णय का समय (The Closing Offer)" : "7-DAY RISK-FREE PILOT",
        badgeColor: "bg-purple-950 text-purple-300 border-purple-800",
        title: isHi ? "7-दिन का निःशुल्क ट्रायल — कल सुबह से शुरू करें" : "Start a 7-Day Free Pilot Tomorrow Morning",
        subtitle: isHi ? "आज ही 2 मिनट में अपने क्लिनिक में चालू करवाएं:" : "Set up your OPD room in under 2 minutes with zero commitment:",
        points: [
          {
            icon: "⚡",
            title: isHi ? "2 मिनट में सेटअप" : "2-Minute Onboarding",
            desc: isHi ? "कोई सॉफ्टवेयर इंस्टॉल नहीं करना। हम आज ही लिंक एक्टिवेट कर देंगे।" : "No app download needed. We generate your clinic link on the spot."
          },
          {
            icon: "🪧",
            title: isHi ? "मुफ्त स्टैंडी व पोस्टर हम देंगे" : "Free QR Standees & Banners",
            desc: isHi ? "हम आपके रिसेप्शन के लिए सुंदर स्टैंडी और पंपलेट निःशुल्क उपलब्ध कराएंगे।" : "We provide reception counter QR standees and patient pamphlets for free."
          },
          {
            icon: "🤝",
            title: isHi ? "7 दिन का अनुभव देखें" : "See Waiting Hall Quiet Down",
            desc: isHi ? "अगर आपका वेटिंग हॉल 80% शांत और स्टाफ खुश न हो, तो तुरंत बंद कर दें।" : "If your waiting hall isn't 80% quieter and organized, cancel anytime."
          },
          {
            icon: "🚀",
            title: isHi ? "लाइव डेमो अभी देखें" : "Experience Live Demo Right Now",
            desc: isHi ? "नीचे दिए गए बटन को दबाकर अभी 60 सेकंड का लाइव डेमो देखें।" : "Click the button below to see the patient and hospital sync in action."
          }
        ]
      }
    ];

    return slides[this.currentSlide];
  }

  render() {
    let modal = document.getElementById('doctor-pitch-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'doctor-pitch-modal';
      modal.className = 'fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 animate-fadeIn';
      document.body.appendChild(modal);
    }

    const slide = this.getSlideContent();
    const isHi = this.language === 'hi';
    const isLastSlide = this.currentSlide === this.totalSlides - 1;

    modal.innerHTML = `
      <!-- Pitch Deck Top Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-4 max-w-6xl mx-auto w-full">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xl">
            📊
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-black text-white">OPD TOKEN LIVE — PITCH DECK</h2>
              <span class="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${slide.badgeColor} border font-bold">
                ${slide.badge}
              </span>
            </div>
            <p class="text-xs text-slate-400">Doctor & Hospital OPD Presentation Deck</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Slide Counter -->
          <span class="text-xs font-mono font-black text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            ${this.currentSlide + 1} / ${this.totalSlides}
          </span>

          <!-- Language Switcher -->
          <button onclick="doctorPitchDeck.toggleLanguage()"
                  class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1">
            <span>🌐</span>
            <span>${isHi ? 'English' : 'हिंदी'}</span>
          </button>

          <!-- Close Modal -->
          <button onclick="doctorPitchDeck.close()"
                  class="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 flex items-center justify-center text-lg font-bold transition border border-slate-700"
                  title="Close Presentation (ESC)">
            ✕
          </button>
        </div>
      </div>

      <!-- Slide Main Canvas -->
      <div class="flex-1 max-w-6xl mx-auto w-full flex flex-col justify-center py-6 sm:py-8">
        <!-- Title & Subtitle -->
        <div class="text-center mb-8 sm:mb-12">
          <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            ${slide.title}
          </h1>
          <p class="text-sm sm:text-base text-slate-400 font-medium mt-3 max-w-2xl mx-auto">
            ${slide.subtitle}
          </p>
        </div>

        <!-- 4 Grid Points -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          ${slide.points.map(pt => `
            <div class="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-5 sm:p-6 rounded-3xl shadow-xl transition flex items-start gap-4">
              <div class="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shrink-0 shadow">
                ${pt.icon}
              </div>
              <div>
                <h3 class="text-base sm:text-lg font-black text-white">${pt.title}</h3>
                <p class="text-xs sm:text-sm text-slate-400 font-medium mt-1 leading-relaxed">${pt.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Bottom Action CTA on Final Slide -->
        ${isLastSlide ? `
          <div class="mt-8 text-center animate-bounce">
            <button onclick="doctorPitchDeck.launchLiveDemoFromSlide()"
                    class="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black px-8 py-4 rounded-2xl text-base sm:text-lg shadow-2xl flex items-center gap-3 mx-auto transition border-2 border-emerald-400 active:scale-95">
              <span>🚀</span>
              <span>${isHi ? 'अभी लाइव डेमो शुरू करें (Launch Live Demo)' : 'SHOW LIVE PRODUCT DEMO TO DOCTOR'}</span>
              <span>➔</span>
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Pitch Deck Bottom Navigation Controls -->
      <div class="border-t border-slate-800 pt-4 max-w-6xl mx-auto w-full flex items-center justify-between">
        <!-- Prev Button -->
        <button onclick="doctorPitchDeck.prevSlide()"
                class="px-4 py-2.5 rounded-xl border border-slate-700 text-xs sm:text-sm font-bold transition flex items-center gap-2 ${this.currentSlide === 0 ? 'opacity-30 cursor-not-allowed text-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}"
                ${this.currentSlide === 0 ? 'disabled' : ''}>
          <span>◀</span>
          <span>${isHi ? 'पिछली स्लाइड' : 'Previous Slide'}</span>
        </button>

        <!-- Slide Dots -->
        <div class="flex items-center gap-2">
          ${Array.from({ length: this.totalSlides }).map((_, idx) => `
            <button onclick="doctorPitchDeck.goToSlide(${idx})"
                    class="w-3 h-3 rounded-full transition-all ${this.currentSlide === idx ? 'bg-indigo-500 w-8' : 'bg-slate-700 hover:bg-slate-500'}">
            </button>
          `).join('')}
        </div>

        <!-- Next / Live Demo Button -->
        ${isLastSlide ? `
          <button onclick="doctorPitchDeck.launchLiveDemoFromSlide()"
                  class="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-2 transition active:scale-95">
            <span>🎬</span>
            <span>${isHi ? 'लाइव डेमो चलाएं' : 'Launch Demo'}</span>
            <span>➔</span>
          </button>
        ` : `
          <button onclick="doctorPitchDeck.nextSlide()"
                  class="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg flex items-center gap-2 transition active:scale-95">
            <span>${isHi ? 'अगली स्लाइड' : 'Next Slide'}</span>
            <span>▶</span>
          </button>
        `}
      </div>
    `;
  }
}

// Global doctor pitch deck instance
window.doctorPitchDeck = new DoctorPitchDeck();
