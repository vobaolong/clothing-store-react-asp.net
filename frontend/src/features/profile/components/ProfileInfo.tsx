import { useState } from 'react'
import { Button, Card, Descriptions, Spin } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getMyProfile } from '@/api/profile-api'
import ProfileEditForm from '@/features/profile/components/ProfileEditForm'
import ChangePasswordForm from '@/features/profile/components/ChangePasswordForm'

export default function ProfileInfo() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.myProfile,
    queryFn: getMyProfile
  })

  if (isLoading) return <Spin />

  return (
    <Card>
      <div className='flex items-start gap-6'>
        <div className='flex-1'>
          {!editing ? (
            <>
              <div className='flex justify-between items-start'>
                <h2 className='text-xl font-semibold'>
                  {data?.fullName ?? '-'}
                </h2>
                <Button type='primary' onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              </div>
              <Descriptions column={1} size='small'>
                <Descriptions.Item label='Email'>
                  {data?.email ?? '-'}
                </Descriptions.Item>
                <Descriptions.Item label='Phone'>
                  {data?.phone ?? '-'}
                </Descriptions.Item>
              </Descriptions>
            </>
          ) : (
            <ProfileEditForm
              initial={data}
              onCancel={() => setEditing(false)}
              onSaved={async () => {
                await qc.invalidateQueries({ queryKey: QUERY_KEYS.myProfile })
                setEditing(false)
              }}
            />
          )}
        </div>
      </div>
      {!editing && <ChangePasswordForm />}
    </Card>
  )
}
