import { useMutation } from '@tanstack/react-query'
import { Button, Card, Typography } from 'antd'
import {
  MailOutlined,
  ReloadOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { resendOtp, verifyOtp } from '@/api/auth-api'
import { useOtp } from '@/hooks/useOtp'
import OtpInput from '@/components/auth/OtpInput'
import { OTP_LENGTH, OTP_EXPIRY_SECONDS } from '@/constants/otp.constant'
import { lp } from '@/utils/language-path'

const { Title, Paragraph, Text } = Typography

export default function VerifyOtpPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const email: string =
    (location.state as { email?: string } | null)?.email ?? ''

  const {
    otp,
    setOtp,
    resendDown,
    startDown,
    expiryLeft,
    setExpiryLeft,
    inputRefs,
    expiryRef
  } = useOtp()

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: () => {
      toast.success(t('auth.verifySuccess'))
      clearInterval(expiryRef.current!)
      navigate(lp('/login'), { replace: true })
    },
    onError: () => {
      toast.error(t('auth.otpInvalid'))
      setOtp(Array(OTP_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    }
  })

  const resendMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: () => {
      toast.success(t('auth.otpResent'))
      setOtp(Array(OTP_LENGTH).fill(''))
      setExpiryLeft(OTP_EXPIRY_SECONDS)
      startDown()
      inputRefs.current[0]?.focus()
    },
    onError: () => toast.error(t('auth.otpResendFailed'))
  })

  const handleManualSubmit = () => {
    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      toast.error(t('auth.pleaseEnterFullOtp'))
      return
    }
    verifyMutation.mutate({ email, otpCode: code })
  }

  return (
    <section className="mx-auto flex min-h-[72vh] w-full max-w-md items-center px-4">
      <Card className="w-full rounded-3xl border shadow-sm border-slate-200">
        <div className="mb-6 text-center">
          <div className="flex justify-center items-center mx-auto mb-4 w-14 h-14 bg-indigo-50 rounded-full">
            <MailOutlined className="text-2xl text-indigo-600" />
          </div>
          <Title level={3}>{t('auth.verifyEmail')}</Title>
          <Paragraph className="text-slate-500">
            {t('auth.otpSentTo')}
          </Paragraph>
          <Text strong className="text-indigo-600">
            {email}
          </Text>
        </div>

        <OtpInput
          otp={otp}
          onChange={(i, v) => {
            const next = [...otp]
            next[i] = v
            setOtp(next)
          }}
          onKeyDown={() => {}}
          inputRefs={inputRefs}
          disabled={verifyMutation.isPending || expiryLeft === 0}
        />

        <Button
          type="primary"
          size="large"
          block
          disabled={expiryLeft === 0}
          loading={verifyMutation.isPending}
          onClick={handleManualSubmit}
          icon={verifyMutation.isPending ? <LoadingOutlined /> : undefined}
        >
          {verifyMutation.isPending
            ? t('auth.verifying')
            : t('auth.verifyOtpButton')}
        </Button>

        <div className="text-sm text-center text-slate-500 mt-4">
          {t('auth.didNotReceiveCode')}{' '}
          {resendDown > 0 ? (
            <span className="text-slate-400">
              {t('auth.resendAfter', { s: resendDown })}
            </span>
          ) : (
            <button
              type="button"
              disabled={resendMutation.isPending}
              onClick={() => resendMutation.mutate({ email })}
              className="inline-flex gap-1 items-center font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              <ReloadOutlined spin={resendMutation.isPending} />{' '}
              {t('auth.resendCode')}
            </button>
          )}
        </div>
      </Card>
    </section>
  )
}
