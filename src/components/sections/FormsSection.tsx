export function FormsSection() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate">Formulieren</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Downloadbare formulieren</p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-lg mt-2 sm:mt-3" />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-[#e9e0cf] p-8 text-center">
        <p className="text-gray-500">Formulieren worden binnenkort toegevoegd.</p>
      </div>
    </div>
  );
}
