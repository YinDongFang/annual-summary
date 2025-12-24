import { nanoid } from 'nanoid'

// 生成唯一的分享码（8位字符）
export function generateShareCode(): string {
  return nanoid(8)
}

