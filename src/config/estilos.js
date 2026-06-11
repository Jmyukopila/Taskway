export const FAMILIAS = [
  {
    key: 'clasico',
    name: 'Clasico',
    desc: 'Iconos geometricos y universales',
    variantes: null,
    svgProps: { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  },
  {
    key: 'flora',
    name: 'Flora',
    desc: 'Iconos suaves y decorativos',
    variantes: [
      {
        key: 'rosas',
        name: 'Rosas',
        desc: 'Tonos rosas y formas florales',
        svgProps: { strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
        colors: {
          teal: '#EC4899',
          'teal-hover': '#F472B6',
          purple: '#BE185D',
          'purple-hover': '#E11D48',
          muted: '#A1A1AA',
          border: '#3f2a3a',
          success: '#86EFAC',
          warning: '#FBBF24',
          danger: '#F43F5E'
        }
      },
      {
        key: 'corazones',
        name: 'Corazones',
        desc: 'Rojos y formas de corazon',
        svgProps: { strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
        colors: {
          teal: '#E84855',
          'teal-hover': '#F43F5E',
          purple: '#FB7185',
          'purple-hover': '#FDA4AF',
          muted: '#A1A1AA',
          border: '#3a2a2e',
          success: '#86EFAC',
          warning: '#FBBF24',
          danger: '#E84855'
        }
      },
      {
        key: 'kawaii',
        name: 'Kawaii',
        desc: 'Pasteles y formas redondeadas',
        svgProps: { strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
        colors: {
          teal: '#C084FC',
          'teal-hover': '#D8B4FE',
          purple: '#38BDF8',
          'purple-hover': '#7DD3FC',
          muted: '#A1A1AA',
          border: '#2e2a3a',
          success: '#86EFAC',
          warning: '#FDE68A',
          danger: '#FCA5A5'
        }
      }
    ]
  },
  {
    key: 'acero',
    name: 'Acero',
    desc: 'Iconos audaces y angulares',
    variantes: [
      {
        key: 'guerra',
        name: 'Guerra',
        desc: 'Oscuro, rojo sangre y dorado',
        svgProps: { strokeWidth: 2.5, strokeLinecap: 'square', strokeLinejoin: 'miter' },
        colors: {
          teal: '#DC2626',
          'teal-hover': '#EF4444',
          purple: '#F59E0B',
          'purple-hover': '#FBBF24',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#DC2626'
        }
      },
      {
        key: 'deporte',
        name: 'Deporte',
        desc: 'Verde cancha, blanco y dorado',
        svgProps: { strokeWidth: 2.5, strokeLinecap: 'square', strokeLinejoin: 'miter' },
        colors: {
          teal: '#059669',
          'teal-hover': '#10B981',
          purple: '#FBBF24',
          'purple-hover': '#FCD34D',
          success: '#22C55E',
          warning: '#FBBF24',
          danger: '#DC2626'
        }
      },
      {
        key: 'tech',
        name: 'Tech',
        desc: 'Azul electrico, cian y gris acero',
        svgProps: { strokeWidth: 2.5, strokeLinecap: 'square', strokeLinejoin: 'miter' },
        colors: {
          teal: '#3B82F6',
          'teal-hover': '#60A5FA',
          purple: '#06B6D4',
          'purple-hover': '#22D3EE',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444'
        }
      }
    ]
  }
]

export function getFamilia(key) {
  if (!FAMILIAS || FAMILIAS.length === 0) return null
  return FAMILIAS.find(f => f.key === key) || FAMILIAS[0]
}

export function getVariante(familiaKey, varianteKey) {
  const fam = getFamilia(familiaKey)
  if (!fam?.variantes) return null
  return fam.variantes.find(v => v.key === varianteKey) || fam.variantes[0]
}

export function getSvgProps(familiaKey, varianteKey) {
  if (varianteKey) {
    const v = getVariante(familiaKey, varianteKey)
    if (v?.svgProps) return v.svgProps
  }
  const fam = getFamilia(familiaKey)
  if (!fam) return { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return fam.svgProps || { strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
}

export function getIconLookupKey(familiaKey, varianteKey) {
  return varianteKey ? `${familiaKey}.${varianteKey}` : familiaKey
}
