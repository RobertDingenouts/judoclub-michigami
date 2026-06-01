'use client'

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/signin'
  }
  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h3.771v7zM15 5H9v7h6V5z" clipRule="evenodd" />
      </svg>
      Uitloggen
    </button>
  )
}
