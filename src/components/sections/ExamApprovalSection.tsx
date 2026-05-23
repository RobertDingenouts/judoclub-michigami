'use client'

import { useState, useEffect } from 'react'
import { approveExam, failExam } from '@/lib/actions/diploma-actions'

interface ExamAttempt {
  id: string
  memberId: string
  beltLevel: string
  status: string
  examDate: Date | null
  examiner: string | null
  overallScore: number | null
  notes: string | null
  member?: {
    firstName: string
    lastName: string
  }
}

interface ExamApprovalSectionProps {
  userId?: string
  userRole?: string
}

export function ExamApprovalSection({ userId, userRole }: ExamApprovalSectionProps) {
  const [exams, setExams] = useState<ExamAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedExam, setSelectedExam] = useState<ExamAttempt | null>(null)

  useEffect(() => {
    if (userId) {
      fetchExams()
    } else {
      setLoading(false)
    }
  }, [userId])

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams/pending')
      if (res.ok) {
        const data = await res.json()
        setExams(data.exams || [])
      }
    } catch (error) {
      console.error('Fetch exams error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (examId: string) => {
    setProcessingId(examId)
    setMessage(null)

    try {
      const result = await approveExam(examId)

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setSelectedExam(null)
        // Refresh the list
        fetchExams()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Er ging iets mis' })
    } finally {
      setProcessingId(null)
    }
  }

  const handleFail = async (examId: string) => {
    if (!confirm('Weet je zeker dat je dit examen wilt afwijzen? Dit kan niet ongedaan worden.')) {
      return
    }

    setProcessingId(examId)
    setMessage(null)

    try {
      const result = await failExam(examId)

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        setSelectedExam(null)
        fetchExams()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Er ging iets mis' })
    } finally {
      setProcessingId(null)
    }
  }

  // Only instructors/admins can see this section
  const isInstructor = userRole === 'INSTRUCTOR' || userRole === 'ADMIN'

  if (!isInstructor) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 text-white shadow-lg relative overflow-hidden">
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">Examen Goedkeuren</h1>
        <p className="text-white/80 mt-1 text-xs sm:text-sm">Beoordeel en goedkeur judo examens</p>
        <div className="w-10 sm:w-12 md:w-16 h-0.5 sm:h-1 bg-white/30 rounded-full mt-2 sm:mt-3" />
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-[#a90000] border-t-transparent rounded-full" />
        </div>
      )}

      {/* No pending exams */}
      {!loading && exams.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center space-y-3">
          <div className="text-4xl">✅</div>
          <h3 className="font-bold text-gray-700">Geen examens om te beoordelen</h3>
          <p className="text-sm text-gray-500">
            Alle examens zijn al beoordeeld. Nieuwe examens verschijnen hier zodra ze ingediend worden.
          </p>
        </div>
      )}

      {/* Pending exams list */}
      {!loading && exams.length > 0 && (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden border transition ${
                selectedExam?.id === exam.id ? 'border-[#a90000] ring-2 ring-[#a90000]/20' : 'border-gray-100'
              }`}
            >
              <div
                className="p-4 sm:p-5 cursor-pointer"
                onClick={() => setSelectedExam(selectedExam?.id === exam.id ? null : exam)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {exam.member?.firstName} {exam.member?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">Examen: {exam.beltLevel}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      exam.status === 'SCHEDULED'
                        ? 'bg-yellow-100 text-yellow-800'
                        : exam.status === 'COMPLETED_PASSED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {exam.status === 'SCHEDULED'
                      ? 'In afwachting'
                      : exam.status === 'COMPLETED_PASSED'
                      ? 'Goedgekeurd'
                      : 'Afgekeurd'}
                  </span>
                </div>

                {/* Expanded details */}
                {selectedExam?.id === exam.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Score:</div>
                      <div className="font-medium">{exam.overallScore ?? '-'}/100</div>
                      <div className="text-gray-500">Datum:</div>
                      <div className="font-medium">
                        {exam.examDate ? new Date(exam.examDate).toLocaleDateString('nl-NL') : '-'}
                      </div>
                      <div className="text-gray-500">Examinator:</div>
                      <div className="font-medium">{exam.examiner || '-'}</div>
                    </div>

                    {exam.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                        <span className="font-medium text-gray-700">Notities:</span> {exam.notes}
                      </div>
                    )}

                    {/* Actions */}
                    {exam.status === 'SCHEDULED' && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApprove(exam.id)
                          }}
                          disabled={processingId === exam.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {processingId === exam.id ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <>✓ Goedkeuren & Diploma maken</>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFail(exam.id)
                          }}
                          disabled={processingId === exam.id}
                          className="px-4 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                        >
                          Afwijzen
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
