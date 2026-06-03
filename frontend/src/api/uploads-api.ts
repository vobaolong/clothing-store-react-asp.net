import { apiClient, apiData } from '@/api/api-client'
import { API_ENDPOINTS } from '@/constants/api-endpoints.constant'
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
    return apiData(apiClient.post(API_ENDPOINTS.uploads.image, formData))
  } catch (error: unknown) {
    const errorMessage = getApiErrorMessage(error)
    throw new Error(errorMessage)
  }
}
