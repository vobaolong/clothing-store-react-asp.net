import { API_ENDPOINTS } from '@/constants/api-endpoints'
import { apiClient } from '@/services/api-client'
import { getApiErrorMessage } from '@/utils/error-handler'

export type UploadedImage = {
  url: string
  publicId: string
}

export const uploadImage = async (
  file: File,
  folder:
    | 'products'
    | 'categories'
    | 'banners'
    | 'users'
    | 'general' = 'general'
): Promise<UploadedImage> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  try {
    const { data } = await apiClient.post(API_ENDPOINTS.uploads.image, formData)
    return data.data as UploadedImage
  } catch (error: unknown) {
    const errorMessage = getApiErrorMessage(error)
    throw new Error(errorMessage)
  }
}
