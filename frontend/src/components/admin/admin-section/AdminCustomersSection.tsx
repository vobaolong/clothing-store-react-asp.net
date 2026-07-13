import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input, DatePicker, Select } from 'antd'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import {
  getAdminCustomers,
  lockAdminCustomer,
  unlockAdminCustomer
} from '@/api/admin-api'
import { QUERY_KEYS } from '@/constants/query-keys.constant'
import { useAdmin } from '@/context/AdminContext'
import { CustomerTier } from '@/enums'
import type { Customer, DateRangeType } from '@/types'

import { useFilteredCustomers } from '@/hooks/useFilteredCustomers'

import LockCustomerModal from '@/components/admin/admin-modal/LockCustomerModal'
import AdminCustomerTable from '../admin-table/AdminCustomerTable'

const TIER_OPTIONS = [
  { value: '', label: 'Tất cả hạng' },
  ...Object.values(CustomerTier).map((t) => ({ value: t, label: t }))
]

export default function AdminCustomersSection() {
  const { t } = useTranslation()
  const { refresh } = useAdmin()

  const [filters, setFilters] = useState({
    search: '',
    tier: '',
    dateRange: null as DateRangeType
  })

  const [lockState, setLockState] = useState({
    target: null as Customer | null,
    reason: undefined as string | undefined
  })

  const customersQuery = useQuery({
    queryKey: QUERY_KEYS.adminCustomers,
    queryFn: () => getAdminCustomers(filters.tier || undefined)
  })

  const filteredData = useFilteredCustomers({
    data: customersQuery.data,
    search: filters.search,
    dateRange: filters.dateRange
  })

  const { mutateAsync: lockCustomer, isPending: isLocking } = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      lockAdminCustomer(id, { reason }),
    onSuccess: async () => {
      toast.success(t('admin.customerLocked'))
      setLockState({ target: null, reason: undefined })
      await refresh()
      customersQuery.refetch()
    },
    onError: () => toast.error(t('admin.customerLockFailed'))
  })

  const { mutate: unlockCustomer } = useMutation({
    mutationFn: (id: string) => unlockAdminCustomer(id),
    onSuccess: async () => {
      toast.success(t('admin.customerUnlocked'))
      await refresh()
      customersQuery.refetch()
    },
    onError: () => toast.error(t('admin.customerUnlockFailed'))
  })

  const handleLockOpen = useCallback((customer: Customer) => {
    setLockState({ target: customer, reason: undefined })
  }, [])

  const handleUnlock = useCallback(
    (customer: Customer) => {
      unlockCustomer(customer.id)
    },
    [unlockCustomer]
  )

  const handleLockConfirm = useCallback(async () => {
    if (!lockState.target) return
    await lockCustomer({
      id: lockState.target.id,
      reason: lockState.reason?.trim() || undefined
    })
  }, [lockState.target, lockState.reason, lockCustomer])

  const handleCancelLock = useCallback(() => {
    if (!isLocking) {
      setLockState((prev) => ({ ...prev, target: null }))
    }
  }, [isLocking])

  const handleChangeReason = useCallback((value: string) => {
    setLockState((prev) => ({ ...prev, reason: value }))
  }, [])

  return (
    <div className="space-y-3!">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input.Search
          allowClear
          className="w-96!"
          placeholder={t('admin.searchCustomersPlaceholder')}
          value={filters.search}
          onChange={({ target: { value } }) =>
            setFilters((prev) => ({ ...prev, search: value }))
          }
        />
        <Select
          value={filters.tier}
          onChange={(val) => setFilters((prev) => ({ ...prev, tier: val }))}
          options={TIER_OPTIONS}
          className="w-40!"
        />
        <DatePicker.RangePicker
          value={filters.dateRange}
          onChange={(dates) =>
            setFilters((prev) => ({
              ...prev,
              dateRange: dates ? [dates[0], dates[1]] : null
            }))
          }
          placeholder={[t('admin.filterDateFrom'), t('admin.filterDateTo')]}
          className="w-full sm:w-auto"
        />
      </div>

      <AdminCustomerTable
        dataSource={filteredData}
        loading={customersQuery.isLoading}
        onLockOpen={handleLockOpen}
        onUnlock={handleUnlock}
      />

      <LockCustomerModal
        target={lockState.target}
        reason={lockState.reason}
        isLocking={isLocking}
        onCancel={handleCancelLock}
        onChangeReason={handleChangeReason}
        onConfirm={handleLockConfirm}
      />
    </div>
  )
}
