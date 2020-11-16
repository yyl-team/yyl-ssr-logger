import fs from 'fs'
import path from 'path'
export function mkdirSync(toFile: string) {
  const tPath = toFile.replace(/[/\\]$/, '')
  const r = []
  ;(function deep(iPath) {
    if (fs.existsSync(iPath) || /[/\\]$/.test(iPath)) {
    } else {
      deep(path.dirname(iPath))
      fs.mkdirSync(iPath)
      r.push(iPath)
    }
  })(tPath)
  return r
}
