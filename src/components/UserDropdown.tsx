'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogoutButton } from './LogoutButton';
import { BELT_LABELS_NL, BELT_COLORS } from '@/lib/student-progress-types';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  currentBelt: string | null;
  imageUrl: string | null;
  member: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    joinDate: string | null;
    currentBelt: string | null;
    emergencyContactName: string | null;
    emergencyContactPhone: string | null;
    medicalNotes: string | null;
  } | null;
}

export function UserDropdown({ onSectionChange }: { onSectionChange?: (section: string) => void }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3 w-20 bg-gray-200 animate-pulse rounded" />
          <div className="h-2 w-12 bg-gray-100 animate-pulse rounded mt-1" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <a
        href="/signin"
        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white transition-colors shadow-sm hover:opacity-90"
        style={{ backgroundColor: '#a90000' }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12a9 9 0 0118 0" />
        </svg>
        Inloggen / Registreren
      </a>
    );
  }

  const displayName = user.member?.firstName || user.name || user.email.split('@')[0];
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const belt = user.member?.currentBelt || user.currentBelt;
  const beltColor = belt ? BELT_COLORS[belt] || '#999' : '#999';
  const beltLabel = belt ? (BELT_LABELS_NL[belt] || belt) : '';

  const isAdmin = user.role === 'ADMIN';

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full"
      >
        {/* Avatar circle */}
        <div
          className="relative flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold text-white flex-shrink-0 shadow-sm border-2 overflow-hidden"
          style={{
            backgroundColor: user.imageUrl ? 'transparent' : beltColor,
            borderColor: user.imageUrl ? beltColor : (beltColor === '#ffffff' ? '#e0e0e0' : 'rgba(255,255,255,0.3)'),
          }}
          title={beltLabel || 'Lid'}
        >
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
        </div>

        {/* User info (desktop sidebar) */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{displayName}</p>
          <p className="text-[10px] text-gray-400 truncate">
            {beltLabel || 'Lid'}
            {isAdmin ? ' · Admin' : ''}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-bottom-2">
          <div className="p-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800 px-2 py-1">{displayName}</p>
            <p className="text-xs text-gray-400 px-2 pb-1">{user.email}</p>
            {beltLabel && (
              <div className="flex items-center gap-1.5 px-2 py-1">
                <div
                  className="w-4 h-1 rounded-full"
                  style={{ backgroundColor: beltColor }}
                />
                <span className="text-xs text-gray-500">{beltLabel}</span>
              </div>
            )}
          </div>

          <div className="py-1">
            {/* Profile */}
            <a
              href="/leden/profiel/bewerken"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#fdf6f6] hover:text-[#a90000] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profiel & Instellingen
            </a>

            {/* Diplomas */}
            <a
              href="/leden/diploma's"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-[#fdf6f6] hover:text-[#a90000] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mijn Diploma&apos;s
            </a>

            {/* Admin Dashboard — only for admins */}
            {isAdmin && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <a
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-[#a90000] font-medium hover:bg-[#fdf6f6] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                  Admin Dashboard
                </a>
              </>
            )}

            <div className="my-1 border-t border-gray-100" />

            {/* Logout */}
            <div className="px-3 py-1">
              <LogoutButton onLogout={() => { setOpen(false); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for mobile — just an avatar button.
 * Opens a bottom sheet with user options.
 */
export function MobileUserAvatar({ onSectionChange }: { onSectionChange?: (section: string) => void }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) return null;

  const displayName = user.member?.firstName || user.name || user.email.split('@')[0];
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const belt = user.member?.currentBelt || user.currentBelt;
  const beltColor = belt ? BELT_COLORS[belt] || '#999' : '#999';

  return (
    <div className="relative group">
      <button
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md border-2 overflow-hidden"
        style={{
          backgroundColor: user.imageUrl ? 'transparent' : beltColor,
          borderColor: user.imageUrl ? beltColor : (beltColor === '#ffffff' ? '#ddd' : 'rgba(255,255,255,0.3)'),
        }}
        title={displayName}
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {/* Tooltip-style dropdown on hover/focus — mobile friendly tap target */}
      <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
        <div className="p-2 border-b border-gray-100 bg-[#fdf6f6]">
          <p className="text-xs font-semibold text-gray-800">{displayName}</p>
        </div>
        <div className="py-1">
          <a href="/leden/profiel/bewerken" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-[#fdf6f6] hover:text-[#a90000]">
            👤 Profiel
          </a>
          <a href="/leden/diploma's" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-[#fdf6f6] hover:text-[#a90000]">
            🏅 Diploma&apos;s
          </a>
          {user.role === 'ADMIN' && (
            <a href="/admin" className="flex items-center gap-2 px-3 py-2 text-xs text-[#a90000] font-medium hover:bg-[#fdf6f6]">
              ⚙️ Admin
            </a>
          )}
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.refresh();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-red-600"
          >
            🚪 Uitloggen
          </button>
        </div>
      </div>
    </div>
  );
}
