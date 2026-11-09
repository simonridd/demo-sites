import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { lstatSync, readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

const matrix = JSON.parse(readFileSync('skill-capabilities.json', 'utf8'))
const names = new Set()
const features = new Set()
function file(path) {
  assert(typeof path === 'string' && path && !isAbsolute(path) &&
    !relative(process.cwd(), resolve(path)).startsWith('..'), `Unsafe capability path: ${path}`)
  assert(lstatSync(path).isFile(), `Expected regular file: ${path}`)
  return readFileSync(path, 'utf8')
}
for (const [name, dir] of Object.entries(matrix.skills)) {
  const body = file(dir + '/SKILL.md')
  const header = body.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
  assert.equal(header.match(/^name:\s*['"]?([a-z0-9-]+)['"]?\s*$/m)?.[1], name, dir)
  assert.match(header, /^description:\s*\S/m)
  names.add(name)
  for (const match of body.matchAll(/\]\(((?:assets|references|scripts)\/[^ )#]+)(?:#[^ )]*)?\)/g)) {
    const target = resolve(dir, match[1])
    assert(!relative(resolve(dir), target).startsWith('..'), 'Skill link escapes its directory')
    file(relative(process.cwd(), target))
  }
}
for (const row of matrix.capabilities) {
  assert(row.id && !features.has(row.id) && row.sources.length > 0, 'Missing or duplicate capability evidence')
  assert(row.owner === 'appOnly' || names.has(row.owner), 'Unknown capability owner: ' + row.id)
  for (const path of row.sources) file(path)
  features.add(row.id)
}
for (const name of names) assert(matrix.capabilities.some((row) => row.owner === name), 'Unmapped skill: ' + name)
const base = process.argv[2]
if (base) {
  assert.match(base, /^[a-f0-9]{40}$/)
  const output = execFileSync('git', ['diff', '--name-only', '-z', base + '...HEAD'], { encoding: 'utf8' })
  const changed = output.split('\0')
  for (const row of matrix.capabilities) {
    const product = row.sources.filter((path) => !/(?:^|\/)(?:docs|tests?)\/|\.(?:md|test\.[^/]+)$/i.test(path))
    if (!product.some((path) => changed.includes(path))) continue
    const dir = matrix.skills[row.owner]
    assert(changed.includes('skill-capabilities.json') || (dir && changed.some((path) => path.startsWith(dir + '/'))),
      `Review and update the owning skill or document the compatibility decision in skill-capabilities.json for ${row.id}`)
  }
}
console.log(`PASS ${names.size} skill identities and ${features.size} capability mappings`)
