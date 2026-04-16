'use client'

import { useState, useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/hooks/use-language'

interface OtpInputProps {
  phone: string
  onBack?: () => void
}

export function OtpInput({ phone, onBack }: OtpInputProps) {
  const router = useRouter()
  const { verifyPhoneOtp, sendPhoneOtp, loading, error } = useAuth()
  const { t, direction } = useLanguage()
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (newOtp.every((digit) => digit) && newOtp.join('').length === 6) {
      handleSubmit(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = [...otp]
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    
    setOtp(newOtp)
    
    if (pastedData.length === 6) {
      handleSubmit(pastedData)
    } else {
      inputRefs.current[pastedData.length]?.focus()
    }
  }

  const handleSubmit = async (code: string) => {
    await verifyPhoneOtp(code)
    router.push('/dashboard')
  }

  const handleResend = async () => {
    await sendPhoneOtp(phone, 'recaptcha-container-resend')
    setResendTimer(60)
    setOtp(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="absolute top-4 start-4"
        >
          <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
        </Button>
        <CardTitle className="text-2xl">{t('auth.verifyOtp')}</CardTitle>
        <CardDescription>
          {t('auth.otpSent')}
          <br />
          <span className="font-mono text-foreground" dir="ltr">{phone}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-2" dir="ltr">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-xl font-mono"
              disabled={loading}
            />
          ))}
        </div>

        <Button
          onClick={() => handleSubmit(otp.join(''))}
          className="w-full"
          disabled={loading || otp.some((d) => !d)}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin me-2" />
          ) : null}
          {t('common.confirm')}
        </Button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('auth.resendOtp')} ({resendTimer}s)
            </p>
          ) : (
            <Button
              variant="link"
              onClick={handleResend}
              disabled={loading}
              className="text-sm"
            >
              {t('auth.resendOtp')}
            </Button>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <div id="recaptcha-container-resend" />
      </CardContent>
    </Card>
  )
}
