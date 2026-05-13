'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, ExternalLink } from 'lucide-react';
import { membershipInfo } from '@/data/membership';

export function SignupConfirmationModal({ open, onClose, signupUrl }: { open: boolean; onClose: () => void; signupUrl: string }) {
  const [confirmed, setConfirmed] = useState(false);

  // Reset confirmation state when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setConfirmed(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={() => handleOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] p-4 sm:p-5 text-white relative">
                <button
                  onClick={() => handleOpenChange(false)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-300" />
                  <h2 className="text-base sm:text-lg font-bold">Weet je zeker dat je lid wilt worden?</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Warning message */}
                <div className="bg-[#fff8e1] border border-[#f9a825]/30 rounded-xl p-3 text-sm text-gray-700">
                  <strong>Advies:</strong> Volg eerst{' '}
                  <span className="font-bold text-[#27ae60]">{membershipInfo.trialLessons}</span>{' '}
                  om te bekijken of judo iets voor jou is!
                </div>

                {/* Cost summary */}
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-sm">Kosten overzicht:</h3>
                  {membershipInfo.tiers.filter(t => t.name === 'Jeugd' || t.name === 'Volwassenen').map((tier) => (
                    <div key={tier.name} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-700">{tier.name} ({tier.targetAudience})</span>
                      <span className="font-bold" style={{ color: '#a90000' }}>{tier.price} <span className="font-normal text-gray-500">{tier.pricePeriod}</span></span>
                    </div>
                  ))}
                  {membershipInfo.tiers.filter(t => t.name === 'Extra kosten' || t.name === 'Verzekering').map((tier) => (
                    <div key={tier.name} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-700">{tier.name}</span>
                      <span className="font-bold" style={{ color: '#a90000' }}>{tier.price} <span className="font-normal text-gray-500">{tier.pricePeriod}</span></span>
                    </div>
                  ))}
                </div>

                {/* Confirmation checkbox */}
                <label
                  onClick={() => setConfirmed(!confirmed)}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    confirmed ? 'border-[#a90000] bg-[#fdf6f6]' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    confirmed ? 'bg-[#a90000] text-white' : 'border-2 border-gray-300'
                  }`}>
                    {confirmed && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-sm text-gray-700">
                    Ik begrijp dat ik eerst <strong>{membershipInfo.trialLessons}</strong> kan volgen en akkoord ga met de bovenstaande kosten.
                  </span>
                </label>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition-all ${
                      confirmed
                        ? 'bg-gradient-to-r from-[#a90000] to-[#c00000] text-white hover:from-[#8c0000] hover:to-[#a00000] shadow-md hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => {
                      if (!confirmed) e.preventDefault();
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Doorgaan naar inschrijfformulier
                  </a>

                  <button
                    onClick={() => handleOpenChange(false)}
                    className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-medium text-sm hover:bg-gray-200 transition-all"
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
