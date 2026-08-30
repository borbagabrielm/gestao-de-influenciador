// Corrige nomes de cidade com encoding quebrado (export do Meta costuma salvar
// UTF-8 relido como Latin-1 e regravado, ex: "SÃ£o Paulo" em vez de "São Paulo")
export function fixMojibake(str) {
  if (!str || !str.includes('Ã')) return str
  try {
    const bytes = Uint8Array.from([...str].map(c => c.charCodeAt(0) & 0xff))
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return str
  }
}

const GENDER_LABEL = { F: 'Feminino', M: 'Masculino' }

export function parseCityCSV(rows) {
  return rows
    .filter(r => r['Audience City'] && r['Followers'] != null && r['Followers'] !== '')
    .map(r => ({ label: fixMojibake(r['Audience City']), value: Number(r['Followers']) * 100 }))
    .sort((a, b) => b.value - a.value)
}

export function parseAgeCSV(rows) {
  return rows
    .filter(r => r['Age'] && r['Followers'] != null && r['Followers'] !== '')
    .map(r => ({ label: r['Age'], value: Number(r['Followers']) * 100 }))
}

export function parseGenderCSV(rows) {
  const valid = rows.filter(r => r['Gender'] && r['Followers'] != null && r['Followers'] !== '')
  const total = valid.reduce((s, r) => s + Number(r['Followers']), 0) || 1
  return valid.map(r => ({
    label: GENDER_LABEL[r['Gender']] || r['Gender'],
    value: (Number(r['Followers']) / total) * 100,
  }))
}

export const AUDIENCE_TYPES = {
  city:   { label: 'Cidades', headerHint: 'Audience City', parser: parseCityCSV },
  age:    { label: 'Faixa etária', headerHint: 'Age', parser: parseAgeCSV },
  gender: { label: 'Gênero', headerHint: 'Gender', parser: parseGenderCSV },
}
