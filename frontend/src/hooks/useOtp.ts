import { useCallback, useEffect, useRef, useState } from 'react'
import {
  OTP_LENGTH,
  OTP_EXPIRY_SECONDS,
  OTP_RESEND_COOLDOWN_SECONDS
} from '@/constants/otp.constant'

export function useOtp(
  expirySeconds = OTP_EXPIRY_SECONDS,
  resendSeconds = OTP_RESEND_COOLDOWN_SECONDS
) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [resendDown, setResendDown] = useState(0)
  const [expiryLeft, setExpiryLeft] = useState(expirySeconds)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const downRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiryRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

  const startDown = useCallback(() => {
    setResendDown(resendSeconds)
    if (downRef.current) clearInterval(downRef.current)
    downRef.current = setInterval(() => {
      setResendDown((s) => {
        if (s <= 1) {
          clearInterval(downRef.current!)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [resendSeconds])

  return {
    otp,
    setOtp,
    resendDown,
    startDown,
    expiryLeft,
    setExpiryLeft,
    inputRefs,
    expiryRef
  }
}
