import { uploadImage } from '@/api/uploads-api'
import type { UploadFile } from 'antd'

export async function resolveFilesToUrls(
  files: UploadFile[],
): Promise<string[]> {
  const urls: string[] = []
  for (const f of files) {
    if (f.status === 'removed') continue
    if (f.originFileObj) {
      const uploaded = await uploadImage(f.originFileObj, 'products')
      urls.push(uploaded.url)
    } else if (f.url?.trim()) {
      urls.push(f.url.trim())
    }
  }
  return [...new Set(urls.filter(Boolean))]
}

export async function uploadAllVariantImages(
  colorGalleryFiles: Record<string, UploadFile[]>,
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {}
  for (const [colorName, files] of Object.entries(colorGalleryFiles)) {
    result[colorName] = await resolveFilesToUrls(files)
  }
  return result
}
