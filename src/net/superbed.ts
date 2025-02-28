//! 聚合图床
import md5 from 'md5'

const USER_ID = import.meta.env.VITE_BED_USER_ID ?? ''
const TOKEN = import.meta.env.VITE_BED_TOKEN ?? ''

export type UploadImgsResult = {
  err: number
  id: string
  url: string
  size: number
  name: string
  ids: string[]
  urls: string[]
  sizes: number[]
  names: string[]
}

function getSign(): string {
  return md5(`${USER_ID}-${TOKEN}-${Date.now()}`)
}

export async function uploadImgs2Bed(imgs: File[]): Promise<UploadImgsResult> {
  const ts = Date.now()
  const sign = md5(`${USER_ID}-${TOKEN}-${ts}`)

  const form = new FormData()
  form.append('id', USER_ID)
  form.append('ts', ts.toString())
  form.append('sign', sign)
  imgs.forEach((file, i) => {
    form.append(`file${i}`, file)
  })

  const resp = await fetch('https://api.superbed.cn/upload', {
    method: 'POST',
    body: form
  })

  const data = resp.json()

  return data
}

export async function postMemes(imgs: UploadImgsResult) {}
