import { useState } from 'react'
import emailjs from '@emailjs/browser'

const empty = { name: '', email: '', message: '' }
const field =
  'mt-2 block w-full rounded-xl border border-sky-100 bg-white px-4 py-3 text-slate-800 placeholder:text-slate-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'

export default function Contact() {
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState('') // '', 'sending', 'success', 'error'

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await emailjs.send('service_2u9o19w', 'template_b5ii9hc', form, { publicKey: 'SNpVJoSK24uL7yaBH' })
      setStatus('success')
      setForm(empty)
    } catch (err) {
      console.error('Failed to send message:', err)
      setStatus('error')
    }
    setTimeout(() => setStatus(''), 5000)
  }

  return (
    <>
      <p className="mb-8 leading-relaxed">
        Working on something in LLMs, computer vision or AI agents, or just want to say hello? Send me a message.
      </p>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            Name
            <input name="name" autoComplete="name" required value={form.name} onChange={onChange} placeholder="Your name" className={field} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Email
            <input name="email" type="email" autoComplete="email" required value={form.email} onChange={onChange} placeholder="you@example.com" className={field} />
          </label>
        </div>
        <label className="block text-sm font-semibold text-slate-800">
          Message
          <textarea name="message" rows="5" required value={form.message} onChange={onChange} placeholder="Your message..." className={`${field} resize-none`} />
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <button
            disabled={status === 'sending'}
            className="rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-sky-800 disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending...' : 'Send message'}
          </button>
          <p aria-live="polite" className="text-sm font-medium">
            {status === 'success' && <span className="text-emerald-700">Message sent. Thank you!</span>}
            {status === 'error' && <span className="text-red-700">Couldn't send. Please try again or email me.</span>}
          </p>
        </div>
      </form>
    </>
  )
}
