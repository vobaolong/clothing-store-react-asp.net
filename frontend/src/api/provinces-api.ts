import axios from 'axios'

type RawAddressItem = Record<string, unknown>

const provincesClient = axios.create({
  baseURL: 'https://tinhthanhpho.com/api/v1',
})

export type ProvinceOption = {
  code: string
  name: string
}

export type WardOption = ProvinceOption

const toText = (...values: unknown[]) =>
  values
    .find((value) => typeof value === 'string' && value.trim().length > 0)
    ?.toString()
    ?.trim() ?? ''

const toCode = (...values: unknown[]) =>
  values
    .find((value) => value !== null && value !== undefined)
    ?.toString()
    ?.trim() ?? ''

const normalizeProvince = (item: RawAddressItem): ProvinceOption => ({
  code: toCode(item.provinceId, item.code, item.id),
  name: toText(item.provinceName, item.name, item.fullName, item.title),
})

const normalizeWard = (item: RawAddressItem): WardOption => ({
  code: toCode(item.wardCode, item.code, item.id),
  name: toText(item.wardName, item.name, item.fullName, item.title),
})

const normalizeSearchResult = (item: RawAddressItem): WardOption => ({
  code: toCode(item.wardCode, item.code, item.id),
  name: toText(item.wardName, item.ward, item.name),
})

const asArray = (data: unknown): RawAddressItem[] => {
  if (Array.isArray(data))
    return data.filter(
      (x): x is RawAddressItem => Boolean(x) && typeof x === 'object',
    )
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data))
      return obj.data.filter(
        (x): x is RawAddressItem => Boolean(x) && typeof x === 'object',
      )
    if (Array.isArray(obj.results))
      return obj.results.filter(
        (x): x is RawAddressItem => Boolean(x) && typeof x === 'object',
      )
    if (Array.isArray(obj.items))
      return obj.items.filter(
        (x): x is RawAddressItem => Boolean(x) && typeof x === 'object',
      )
  }
  return []
}

export const getProvinces = async (
  keyword?: string,
  limit: number = 100,
  page: number = 1,
): Promise<ProvinceOption[]> => {
  const { data } = await provincesClient.get('/new-provinces', {
    params: {
      keyword: keyword || undefined,
      limit,
      page,
    },
  })
  return asArray(data)
    .map(normalizeProvince)
    .filter((x) => x.code && x.name)
}

export const getWardsByProvinceId = async (
  provinceId: string,
  keyword?: string,
  limit: number = 200,
  page: number = 1,
): Promise<WardOption[]> => {
  const { data } = await provincesClient.get(
    `/new-provinces/${provinceId}/wards`,
    {
      params: {
        keyword: keyword || undefined,
        limit,
        page,
      },
    },
  )
  return asArray(data)
    .map(normalizeWard)
    .filter((x) => x.code && x.name)
}

export const searchNewAddress = async (
  keyword: string,
  limit: number = 20,
): Promise<WardOption[]> => {
  const { data } = await provincesClient.get('/search-new-address', {
    params: {
      keyword,
      limit,
    },
  })
  return asArray(data)
    .map(normalizeSearchResult)
    .filter((x) => x.code && x.name)
}
