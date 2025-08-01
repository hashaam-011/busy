'use client'

import { useState, useRef } from 'react'
import { Upload, Send, MessageCircle, Mail, FileText, User, Building, GraduationCap } from 'lucide-react'
import axios from 'axios'

interface CVData {
  name?: string
  email?: string
  phone?: string
  positions?: Array<{
    title: string
    company: string
    duration?: string
  }>
  skills?: string[]
  education?: Array<{
    degree: string
    institution: string
    year?: string
  }>
}

interface Message {
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function Home() {
  const [cvData, setCvData] = useState<CVData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState('')
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: ''
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'email'>('chat')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    const formData = new FormData()
    formData.append('cv', file)

    try {
      const response = await axios.post(`${API_BASE}/api/parse-cv`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setCvData(response.data.data)
      addMessage('assistant', `CV parsed successfully! Found ${response.data.data.positions?.length || 0} positions and ${response.data.data.skills?.length || 0} skills.`)
    } catch (error: any) {
      addMessage('assistant', `Error parsing CV: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAskQuestion = async () => {
    if (!question.trim()) return

    const userMessage = question
    setQuestion('')
    addMessage('user', userMessage)
    setLoading(true)

    try {
      const response = await axios.post(`${API_BASE}/api/ask-cv-question`, {
        question: userMessage
      })

      addMessage('assistant', response.data.answer)
    } catch (error: any) {
      addMessage('assistant', `Error: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.body) {
      alert('Please fill in all email fields')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_BASE}/api/send-email`, emailForm)
      alert(response.data.message)
      setEmailForm({ to: '', subject: '', body: '' })
    } catch (error: any) {
      alert(`Error sending email: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { type, content, timestamp: new Date() }])
  }

  const suggestedQuestions = [
    "What was my last position?",
    "What skills do I have?",
    "What's my work experience?",
    "What's my education background?",
    "What's my contact information?"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              MCP CV & Email Server
            </h1>
            <p className="text-gray-600">
              Upload your CV, ask questions, and send emails
            </p>
          </div>

          {/* CV Upload Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">CV Upload</h2>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Upload your CV (PDF or TXT format)
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Choose File'}
              </button>
            </div>

            {/* CV Data Display */}
            {cvData && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {cvData.name && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-semibold">Name</span>
                    </div>
                    <p className="text-sm">{cvData.name}</p>
                  </div>
                )}

                {cvData.email && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Mail className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-semibold">Email</span>
                    </div>
                    <p className="text-sm">{cvData.email}</p>
                  </div>
                )}

                {cvData.positions && cvData.positions.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Building className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="font-semibold">Latest Position</span>
                    </div>
                    <p className="text-sm">{cvData.positions[0].title}</p>
                    <p className="text-xs text-gray-600">{cvData.positions[0].company}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-6 py-3 text-center font-medium ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chat with CV
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 px-6 py-3 text-center font-medium ${
                  activeTab === 'email'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Send Email
              </button>
            </div>

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Ask questions about your CV</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {suggestedQuestions.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => setQuestion(q)}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">No messages yet. Upload a CV and start asking questions!</p>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-3 ${
                          message.type === 'user' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div
                          className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))
                  )}
                  {loading && (
                    <div className="text-left">
                      <div className="inline-block bg-white text-gray-800 border px-4 py-2 rounded-lg">
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                    placeholder="Ask a question about your CV..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={loading || !question.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Send Email Notification</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To
                    </label>
                    <input
                      type="email"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="recipient@example.com"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Email subject"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Body
                    </label>
                    <textarea
                      value={emailForm.body}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Email body content..."
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleSendEmail}
                    disabled={loading || !emailForm.to || !emailForm.subject || !emailForm.body}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}