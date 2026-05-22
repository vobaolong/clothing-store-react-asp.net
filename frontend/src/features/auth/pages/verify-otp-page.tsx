import {
  CheckCircleFilled,
  LoadingOutlined,
  MailOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Typography } from 'antd'
import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import { resendOtp, verifyOtp } from '@/api/auth-api'

const { Title, Paragraph, Text } = Typography

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 60 // seconds
const OTP_EXPIRY_SECONDS = 5 * 60 // 5 minutes

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback
  const payload = error.response?.data
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const msg = (payload as { message?: unknown }).message
    if (typeof msg === 'string' && msg.trim()) return msg.trim()
  }
  return fallback
}

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email: string =
    (location.state as { email?: string } | null)?.email ?? ''

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isVerified, setIsVerified] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [expiryLeft, setExpiryLeft] = useState(OTP_EXPIRY_SECONDS)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiryRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  // OTP expiry countdown
  useEffect(() => {
    expiryRef.current = setInterval(() => {
      setExpiryLeft((s) => {
        if (s <= 1) {
          clearInterval(expiryRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(expiryRef.current!)
  }, [])

  const startCooldown = useCallback(() => {
    setResendCooldown(RESEND_COOLDOWN)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      setIsVerified(true)
      clearInterval(expiryRef.current!)
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Mã OTP không đúng. Vui lòng thử lại.')
      )
      // Clear OTP fields and refocus first
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    }
  })

  const resendMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: () => {
      toast.success('OTP mới đã được gửi qua email!')
      setOtp(Array(OTP_LENGTH).fill(''))
      setExpiryLeft(OTP_EXPIRY_SECONDS)
      // Restart expiry timer
      clearInterval(expiryRef.current!)
      expiryRef.current = setInterval(() => {
        setExpiryLeft((s) => {
          if (s <= 1) {
            clearInterval(expiryRef.current!)
            return 0
          }
          return s - 1
        })
      }, 1000)
      startCooldown()
      inputRefs.current[0]?.focus()
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, 'Không thể gửi lại OTP. Vui lòng thử lại.')
      )
    }
  })

  const handleInput = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    // Auto-submit when last digit filled
    if (digit && index === OTP_LENGTH - 1) {
      const full = [...next].join('')
      if (full.length === OTP_LENGTH) {
        verifyMutation.mutate({ email, otpCode: full })
      }
    }
  }

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp]
        next[index] = ''
        setOtp(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0)
      inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1)
      inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH)
    const next = Array(OTP_LENGTH).fill('')
    text.split('').forEach((ch, i) => {
      next[i] = ch
    })
    setOtp(next)
    const focusIndex = Math.min(text.length, OTP_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
    if (text.length === OTP_LENGTH) {
      verifyMutation.mutate({ email, otpCode: text })
    }
  }

  const handleManualSubmit = () => {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      toast.error('Vui lòng nhập đủ 6 chữ số OTP.')
      return
    }
    verifyMutation.mutate({ email, otpCode: code })
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const isExpired = expiryLeft === 0
  const otpFilled = otp.every((d) => d !== '')

  if (isVerified) {
    return (
      <section className='mx-auto flex min-h-[72vh] w-full max-w-md items-center px-4'>
        <Card className='w-full rounded-3xl border border-slate-200 shadow-sm'>
          <div className='flex flex-col items-center gap-4 py-6 text-center'>
            <CheckCircleFilled className='text-6xl text-green-500' />
            <Title level={3} className='mb-1!'>
              Xác thực thành công!
            </Title>
            <Paragraph className='text-slate-500'>
              Email của bạn đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.
            </Paragraph>
            <Button
              type='primary'
              size='large'
              block
              onClick={() => navigate('/login', { replace: true })}
            >
              Đăng nhập ngay
            </Button>
          </div>
        </Card>
      </section>
    )
  }

  return (
    <section className='mx-auto flex min-h-[72vh] w-full max-w-md items-center px-4'>
      <Card className='w-full rounded-3xl border border-slate-200 shadow-sm'>
        <div className='mb-6 text-center'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50'>
            <MailOutlined className='text-2xl text-indigo-600' />
          </div>
          <Title level={3} className='mb-1!'>
            Xác thực email
          </Title>
          <Paragraph className='mb-0! text-slate-500'>
            Chúng tôi đã gửi mã OTP 6 chữ số đến
          </Paragraph>
          <Text strong className='text-indigo-600'>
            {email}
          </Text>
        </div>

        {/* OTP Input boxes */}
        <div className='mb-6 flex justify-center gap-2' onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              id={`otp-${index}`}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={verifyMutation.isPending || isExpired}
              className={[
                'h-12 w-12 rounded-xl border-2 text-center text-xl font-bold outline-none transition-all',
                'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200',
                digit
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-slate-200 bg-white',
                isExpired ? 'cursor-not-allowed opacity-50' : ''
              ].join(' ')}
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Expiry countdown */}
        <div className='mb-4 text-center'>
          {isExpired ? (
            <Text type='danger' className='text-sm font-medium'>
              ⚠ Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.
            </Text>
          ) : (
            <Text className='text-sm text-slate-500'>
              Mã hết hạn sau{' '}
              <span
                className={`font-mono font-semibold ${expiryLeft < 60 ? 'text-red-500' : 'text-slate-700'}`}
              >
                {formatTime(expiryLeft)}
              </span>
            </Text>
          )}
        </div>

        {/* Submit button */}
        <Button
          type='primary'
          size='large'
          block
          disabled={!otpFilled || isExpired}
          loading={verifyMutation.isPending}
          onClick={handleManualSubmit}
          className='mb-4 text-white!'
          icon={verifyMutation.isPending ? <LoadingOutlined /> : undefined}
        >
          {verifyMutation.isPending ? 'Đang xác thực...' : 'Xác thực OTP'}
        </Button>

        {/* Resend */}
        <div className='text-center text-sm text-slate-500'>
          Không nhận được mã?{' '}
          {resendCooldown > 0 ? (
            <span className='text-slate-400'>
              Gửi lại sau{' '}
              <span className='font-mono font-semibold text-slate-600'>
                {resendCooldown}s
              </span>
            </span>
          ) : (
            <button
              type='button'
              disabled={resendMutation.isPending}
              onClick={() => resendMutation.mutate({ email })}
              className='inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50'
            >
              <ReloadOutlined spin={resendMutation.isPending} />
              Gửi lại mã
            </button>
          )}
        </div>
      </Card>
    </section>
  )
}
