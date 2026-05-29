import { Form, Select } from 'antd'
import type { FormInstance } from 'antd'
import { useMemo } from 'react'
import {
  DESCRIPTION_SPEC_OPTIONS,
  type DescriptionSpecLabel
} from '@/constants/product'
import type { ProductFormValues } from '@/types'

type AdminDescriptionSpecFieldProps = {
  form: FormInstance<ProductFormValues>
  label: DescriptionSpecLabel
  index: number
}

export default function AdminDescriptionSpecField({
  form,
  label,
  index
}: AdminDescriptionSpecFieldProps) {
  const preset = DESCRIPTION_SPEC_OPTIONS[label]
  const selected = Form.useWatch(['descriptionSpecs', index, 'value'], form) as
    | string[]
    | undefined

  const options = useMemo(() => {
    const list = selected
      ? [...preset, ...selected.filter((s) => !preset.includes(s))]
      : preset
    return list.map((opt) => ({ label: opt, value: opt }))
  }, [preset, selected])

  return (
    <Form.Item
      className="flex-1 mb-0"
      name={['descriptionSpecs', index, 'value']}
    >
      <Select
        mode="multiple"
        allowClear
        placeholder="Chọn một hoặc nhiều mục"
        options={options}
        maxTagCount="responsive"
        showSearch
        optionFilterProp="label"
      />
    </Form.Item>
  )
}
