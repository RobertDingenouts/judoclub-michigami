'use client';

import { useState, useMemo } from 'react';
import { Mail, Phone, ChevronRight, ChevronLeft, Check, X, User, Calendar, Clock, MapPin } from 'lucide-react';
import { contactInfo } from '@/data/contact';

// --- Types ---
interface FormData {
  // Step 1
  judokaName: string;
  judokaAge: string;
  // Step 3
  preferredDay: string;
  // Step 4
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}

interface FormErrors {
  [key: string]: string;
}

// --- Helpers ---
function getGroupInfo(age: number) {
  if (age >= 6 && age <= 9) {
    return {
      groupName: 'Groep 1',
      ageRange: '6 t/m 9 jaar',
      time: '18:45 - 19:45',
      location: 'De Knotwilg, Steenbergen',
      day: 'vrijdag',
    };
  } else if (age >= 10) {
    return {
      groupName: 'Groep 2+',
      ageRange: '9 jaar en ouder',
      time: '19:45 - 20:45',
      location: 'De Knotwilg, Steenbergen',
      day: 'vrijdag',
    };
  } else {
    return {
      groupName: 'Algemene training',
      ageRange: 'Alle leeftijden',
      time: '19:00 - 20:00',
      location: 'De Vossenkuil, Oud-Vossemeer',
      day: 'woensdag',
    };
  }
}

function getWhatsAppLink(formData: FormData, groupInfo: ReturnType<typeof getGroupInfo>) {
  const text = encodeURIComponent(
    `Hoi! Ik wil graag een proefles judo aanvragen.\n\n` +
    `Naam judoka: ${formData.judokaName}\n` +
    `Leeftijd: ${formData.judokaAge} jaar\n` +
    `Groep: ${groupInfo.groupName}\n` +
    `Voorkeur dag: ${formData.preferredDay === 'woensdag' ? 'Woensdag' : 'Vrijdag'}\n` +
    `Ouder/verantwoordelijke: ${formData.parentName}\n` +
    `Telefoon: ${formData.parentPhone}`
  );
  return `https://wa.me/31${contactInfo.whatsapp.slice(1)}?text=${text}`;
}

function getMailtoLink(formData: FormData, groupInfo: ReturnType<typeof getGroupInfo>) {
  const subject = encodeURIComponent(`Proefles aanvraag - ${formData.judokaName} (${formData.judokaAge} jaar)`);
  const body = encodeURIComponent(
    `Beste Judoclub Michigami,\n\n` +
    `Ik wil graag een proefles judo aanvragen.\n\n` +
    `Naam judoka: ${formData.judokaName}\n` +
    `Leeftijd: ${formData.judokaAge} jaar\n` +
    `Auto-geselecteerde groep: ${groupInfo.groupName} (${groupInfo.ageRange})\n` +
    `Voorkeur trainingsdag: ${formData.preferredDay === 'woensdag' ? 'Woensdag' : 'Vrijdag'}\n` +
    `${groupInfo.time} — ${groupInfo.location}\n\n` +
    `Ouder/verantwoordelijke: ${formData.parentName}\n` +
    `Telefoon: ${formData.parentPhone}\n` +
    `Email: ${formData.parentEmail}\n\n` +
    `Alvast bedankt!\n` +
    `${formData.parentName}`
  );
  return `mailto:${contactInfo.email}?subject=${subject}&body=${body}`;
}

// --- Step Components ---
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
            i < currentStep ? 'w-6 sm:w-8 bg-[#a90000]' : i === currentStep ? 'w-6 sm:w-8 bg-[#c00000]' : 'w-3 sm:w-4 bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function Step1_JudokaInfo({ data, onChange }: { data: FormData; onChange: (field: string, value: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[#8c0000] text-base sm:text-lg text-center">Informatie over de judoka</h3>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Naam van de judoka</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={data.judokaName}
            onChange={(e) => onChange('judokaName', e.target.value)}
            placeholder="Voornaam en achternaam"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e8eaed] focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000] outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Leeftijd</label>
        <input
          type="number"
          min="4"
          max="99"
          value={data.judokaAge}
          onChange={(e) => onChange('judokaAge', e.target.value)}
          placeholder="Bijv. 8"
          className="w-full px-4 py-2.5 rounded-xl border border-[#e8eaed] focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000] outline-none transition-all text-sm"
        />
      </div>
    </div>
  );
}

function Step2_GroupSelection({ age }: { age: string }) {
  const groupInfo = getGroupInfo(parseInt(age) || 0);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[#8c0000] text-base sm:text-lg text-center">Jouw groep</h3>

      {parseInt(age) >= 4 ? (
        <div className="bg-gradient-to-br from-[#fdf6f6] to-white rounded-2xl p-4 sm:p-5 border border-[#a90000]/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#a90000] to-[#c00000] text-white flex items-center justify-center">
              <Check className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#8c0000] text-base sm:text-lg">{groupInfo.groupName}</h4>
              <p className="text-xs sm:text-sm text-gray-500">{groupInfo.ageRange}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-[#a90000] flex-shrink-0" />
              <span>{groupInfo.day === 'woensdag' ? 'Woensdagavond' : 'Vrijdagavond'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-4 h-4 text-[#a90000] flex-shrink-0" />
              <span>{groupInfo.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-[#a90000] flex-shrink-0" />
              <span>{groupInfo.location}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 italic">
            Deze groep is automatisch geselecteerd op basis van de leeftijd. Je kunt later nog een voorkeur aangeven.
          </p>
        </div>
      ) : (
        <div className="bg-[#fff2f2] rounded-2xl p-4 sm:p-5 text-center border border-[#a90000]/10">
          <p className="text-sm text-gray-700">
            Geef de leeftijd van de judoka in om automatisch de juiste groep te zien.
          </p>
        </div>
      )}
    </div>
  );
}

function Step3_PreferredDay({ data, onChange }: { data: FormData; onChange: (field: string, value: string) => void }) {
  const days = [
    {
      key: 'woensdag',
      label: 'Woensdagavond',
      time: '19:00 - 20:00',
      location: 'De Vossenkuil, Oud-Vossemeer',
      icon: '🥋',
    },
    {
      key: 'vrijdag',
      label: 'Vrijdagavond',
      time: '18:45 - 20:45',
      location: 'De Knotwilg, Steenbergen',
      icon: '🥋',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[#8c0000] text-base sm:text-lg text-center">Voorkeur trainingsdag</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {days.map((day) => {
          const isSelected = data.preferredDay === day.key;
          return (
            <button
              key={day.key}
              onClick={() => onChange('preferredDay', day.key)}
              className={`relative rounded-2xl p-4 sm:p-5 text-left transition-all border-2 ${
                isSelected
                  ? 'border-[#a90000] bg-gradient-to-br from-[#fdf6f6] to-white shadow-md'
                  : 'border-[#e8eaed] bg-white hover:border-[#a90000]/40'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#a90000] text-white flex items-center justify-center">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              )}
              <div className="text-2xl mb-2">{day.icon}</div>
              <h4 className="font-bold text-[#8c0000] text-sm sm:text-base">{day.label}</h4>
              <p className="text-xs text-gray-500 mt-1">{day.time}</p>
              <p className="text-xs text-gray-500">{day.location}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step4_Confirmation({ data, onChange }: { data: FormData; onChange: (field: string, value: string) => void }) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[#8c0000] text-base sm:text-lg text-center">Contactgegevens ouder/verantwoordelijke</h3>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Naam ouder/verantwoordelijke</label>
        <input
          type="text"
          value={data.parentName}
          onChange={(e) => onChange('parentName', e.target.value)}
          placeholder="Uw volledige naam"
          className="w-full px-4 py-2.5 rounded-xl border border-[#e8eaed] focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000] outline-none transition-all text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Telefoonnummer</label>
        <input
          type="tel"
          value={data.parentPhone}
          onChange={(e) => onChange('parentPhone', e.target.value)}
          placeholder="Bijv. 0612345678"
          className="w-full px-4 py-2.5 rounded-xl border border-[#e8eaed] focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000] outline-none transition-all text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Email (optioneel)</label>
        <input
          type="email"
          value={data.parentEmail}
          onChange={(e) => onChange('parentEmail', e.target.value)}
          placeholder="uw@email.nl"
          className="w-full px-4 py-2.5 rounded-xl border border-[#e8eaed] focus:ring-2 focus:ring-[#a90000]/30 focus:border-[#a90000] outline-none transition-all text-sm"
        />
      </div>
    </div>
  );
}

function Step5_Summary({ data, onSubmit }: { data: FormData; onSubmit: () => void }) {
  const groupInfo = getGroupInfo(parseInt(data.judokaAge) || 0);

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-[#8c0000] text-base sm:text-lg text-center">Bijna klaar! Controleer je gegevens</h3>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-[#fdf6f6] to-white rounded-2xl p-4 sm:p-5 border border-[#a90000]/10 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-[#a90000] flex-shrink-0" />
          <span className="font-medium text-gray-700">{data.judokaName}</span>
          <span className="text-gray-500">({data.judokaAge} jaar)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-[#a90000] flex-shrink-0" />
          <span className="text-gray-700">{groupInfo.groupName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-[#a90000] flex-shrink-0" />
          <span className="text-gray-700">
            {data.preferredDay === 'woensdag' ? 'Woensdagavond' : 'Vrijdagavond'} — {groupInfo.time}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-[#a90000] flex-shrink-0" />
          <span className="text-gray-700">{groupInfo.location}</span>
        </div>
        <hr className="border-[#e8eaed]" />
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-[#a90000] flex-shrink-0" />
          <span className="text-gray-700">{data.parentPhone}</span>
        </div>
        {data.parentEmail && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-[#a90000] flex-shrink-0" />
            <span className="text-gray-700">{data.parentEmail}</span>
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="space-y-3">
        <button
          onClick={onSubmit}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#a90000] to-[#c00000] text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base hover:from-[#8c0000] hover:to-[#a00000] transition-all shadow-md hover:shadow-lg"
        >
          <Mail className="w-4 h-4" />
          Verstuur via email
        </button>

        <div className="text-center text-xs text-gray-500">of</div>

        <a
          href={getWhatsAppLink(data, groupInfo)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg"
        >
          <Phone className="w-4 h-4" />
          Verstuur via WhatsApp
        </a>

        <p className="text-xs text-gray-500 text-center">
          Je wordt doorgestuurd naar je email client of WhatsApp. De proefles aanvraag wordt dan verstuurd naar de club.
        </p>
      </div>
    </div>
  );
}

// --- Main Component ---
export function TrialLessonForm({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    judokaName: '',
    judokaAge: '',
    preferredDay: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
  });

  const totalSteps = 5;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case 1: return formData.judokaName.trim().length > 0 && parseInt(formData.judokaAge) >= 4;
      case 2: return parseInt(formData.judokaAge) >= 4; // Auto-step, just review
      case 3: return formData.preferredDay !== '';
      case 4: return formData.parentName.trim().length > 0 && formData.parentPhone.trim().length >= 10;
      default: return true;
    }
  }, [step, formData]);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    const groupInfo = getGroupInfo(parseInt(formData.judokaAge) || 0);
    window.open(getMailtoLink(formData, groupInfo), '_blank');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[#e8eaed] overflow-hidden max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] p-4 sm:p-5 text-white relative overflow-hidden">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <h2 className="text-base sm:text-lg font-bold">Proefles Aanvragen</h2>
        <p className="text-white/80 text-xs sm:text-sm mt-1">Vul het formulier in en we nemen contact met je op</p>
      </div>

      {/* Step Indicator */}
      <div className="px-4 sm:px-6 pt-4">
        <StepIndicator currentStep={step} totalSteps={totalSteps} />
      </div>

      {/* Form Content */}
      <div className="px-4 sm:px-6 pb-4">
        {step === 1 && <Step1_JudokaInfo data={formData} onChange={handleChange} />}
        {step === 2 && <Step2_GroupSelection age={formData.judokaAge} />}
        {step === 3 && <Step3_PreferredDay data={formData} onChange={handleChange} />}
        {step === 4 && <Step4_Confirmation data={formData} onChange={handleChange} />}
        {step === 5 && <Step5_Summary data={formData} onSubmit={handleSubmit} />}
      </div>

      {/* Navigation */}
      {step < totalSteps && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-[#e8eaed] text-gray-600 hover:bg-gray-50 transition-all text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Vorige
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center gap-1 flex-1 justify-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              canProceed
                ? 'bg-gradient-to-r from-[#a90000] to-[#c00000] text-white hover:from-[#8c0000] hover:to-[#a00000] shadow-md'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {step === totalSteps - 1 ? 'Volgende' : 'Volgende'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
