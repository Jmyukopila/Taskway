import { useMemo } from 'react'
// no date utils needed

const DIAS_ABR = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES_ABR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function fechaInicioRango(rango) {
  const d = new Date()
  if (rango === 'all') return new Date(2020, 0, 1)
  d.setDate(d.getDate() - rango + 1)
  return d
}

function fechaToStr(fecha) {
  return fecha.toISOString().slice(0, 10)
}

function generarDias(rango) {
  const dias = []
  const hoyDate = new Date()
  for (let i = rango - 1; i >= 0; i--) {
    const d = new Date(hoyDate)
    d.setDate(d.getDate() - i)
    dias.push(fechaToStr(d))
  }
  return dias
}

function generarSemanas(rango) {
  const semanas = []
  const hoyDate = new Date()
  const inicio = new Date(hoyDate)
  inicio.setDate(inicio.getDate() - rango + 1)
  const lunesInicio = new Date(inicio)
  lunesInicio.setDate(inicio.getDate() - ((inicio.getDay() + 6) % 7))

  let sem = 1
  const d = new Date(lunesInicio)
  while (d <= hoyDate) {
    const lunes = new Date(d)
    const domingo = new Date(d)
    domingo.setDate(d.getDate() + 6)
    semanas.push({
      label: `S${sem}`,
      inicio: fechaToStr(lunes),
      fin: fechaToStr(domingo)
    })
    d.setDate(d.getDate() + 7)
    sem++
  }
  return semanas
}

function generarMeses() {
  const meses = []
  const d = new Date()
  for (let i = 11; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1)
    meses.push({
      label: MESES_ABR[m.getMonth()],
      year: m.getFullYear(),
      month: m.getMonth()
    })
  }
  return meses
}

export default function useDashboardData(tasks, habits, rango) {
  return useMemo(() => {
    const inicioRango = fechaInicioRango(rango)
    const inicioStr = fechaToStr(inicioRango)
    const rangoNumerico = rango === 'all' ? 365 * 10 : rango

    // === Tareas completadas en el rango ===
    const completadas = tasks.filter(t => {
      if (!t.completada || !t.completadaEn) return false
      return t.completadaEn >= inicioStr
    })

    const totalCompletadas = completadas.length

    // === Tareas pendientes en el rango ===
    const pendientes = tasks.filter(t => {
      if (t.completada) return false
      return t.fecha >= inicioStr || !t.fecha
    })
    const totalPendientes = pendientes.length

    // === Tasa de éxito ===
    const totalEnRango = completadas.length + pendientes.length
    const tasaExito = totalEnRango > 0 ? Math.round((completadas.length / totalEnRango) * 100) : 0

    // === Promedio diario ===
    const promedioDiario = rangoNumerico > 0 ? (completadas.length / rangoNumerico).toFixed(1) : '0'

    // === Tasks por día (line chart) ===
    const dias = rango === 'all' ? generarMeses().map(m => `${m.year}-${String(m.month + 1).padStart(2, '0')}`) : generarDias(rangoNumerico)

    const tasksPorDia = dias.map(d => {
      return rango === 'all'
        ? completadas.filter(t => t.completadaEn && t.completadaEn.startsWith(d)).length
        : completadas.filter(t => t.completadaEn === d).length
    })

    const tasksChartData = dias.map((d, i) => {
      let label
      if (rango === 'all') {
        const partes = d.split('-')
        label = MESES_ABR[parseInt(partes[1]) - 1]
      } else if (rangoNumerico <= 14) {
        const dObj = new Date(d + 'T12:00:00')
        label = DIAS_ABR[dObj.getDay()]
      } else {
        const dObj = new Date(d + 'T12:00:00')
        label = `${dObj.getDate()}/${dObj.getMonth() + 1}`
      }
      return { label, value: tasksPorDia[i] }
    })

    // === Tasks por semana (para el mes) ===
    const semanas = generarSemanas(rangoNumerico)
    const tasksPorSemana = semanas.map(sem => {
      return completadas.filter(t => t.completadaEn && t.completadaEn >= sem.inicio && t.completadaEn <= sem.fin).length
    })
    const tasksSemanaData = semanas.map((sem, i) => ({
      label: sem.label,
      value: tasksPorSemana[i]
    }))

    // === Tasks por mes (para el año) ===
    const meses = generarMeses()
    const tasksPorMes = meses.map(m => {
      const prefijo = `${m.year}-${String(m.month + 1).padStart(2, '0')}`
      return completadas.filter(t => t.completadaEn && t.completadaEn.startsWith(prefijo)).length
    })
    const tasksMesData = meses.map((m, i) => ({
      label: m.label,
      value: tasksPorMes[i]
    }))

    // === Habits por día ===
    const habitsPorDia = dias.map(d => {
      let count = 0
      if (rango === 'all') {
        habits.forEach(h => {
          Object.keys(h.completions || h.completations || {}).forEach(f => {
            if (f.startsWith(d)) count++
          })
        })
      } else {
        habits.forEach(h => {
          const comps = h.completions || h.completations || {}
          if (comps[d]) count++
        })
      }
      return count
    })
    const habitsChartData = dias.map((d, i) => ({
      label: tasksChartData[i].label,
      value: habitsPorDia[i]
    }))

    // === Racha actual (días consecutivos con al menos 1 completación de tarea o hábito) ===
    let rachaActual = 0
    for (let i = 0; i < 365; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const str = fechaToStr(d)
      const algunaTask = completadas.some(t => t.completadaEn === str)
      let algunHabito = false
      habits.forEach(h => {
        const comps = h.completions || h.completations || {}
        if (comps[str]) algunHabito = true
      })
      if (algunaTask || algunHabito) {
        rachaActual++
      } else {
        break
      }
    }

    // === Racha máxima ===
    const fechasCompletadas = new Set()
    completadas.forEach(t => { if (t.completadaEn) fechasCompletadas.add(t.completadaEn) })
    habits.forEach(h => {
      const comps = h.completions || h.completations || {}
      Object.keys(comps).forEach(f => fechasCompletadas.add(f))
    })

    const fechasOrd = [...fechasCompletadas].sort()
    let rachaMax = 0
    let rachaTemp = 1
    for (let i = 1; i < fechasOrd.length; i++) {
      const d1 = new Date(fechasOrd[i - 1] + 'T12:00:00')
      const d2 = new Date(fechasOrd[i] + 'T12:00:00')
      const diff = (d2 - d1) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        rachaTemp++
      } else {
        rachaMax = Math.max(rachaMax, rachaTemp)
        rachaTemp = 1
      }
    }
    rachaMax = Math.max(rachaMax, rachaTemp)

    // === Día más productivo ===
    const diaCounts = {}
    completadas.forEach(t => {
      if (t.completadaEn) {
        const dia = new Date(t.completadaEn + 'T12:00:00').getDay()
        diaCounts[dia] = (diaCounts[dia] || 0) + 1
      }
    })
    let diaMasProductivo = '-'
    let maxCount = 0
    Object.entries(diaCounts).forEach(([dia, count]) => {
      if (count > maxCount) { maxCount = count; diaMasProductivo = DIAS_ABR[parseInt(dia)] }
    })

    // === Hábito con mejor racha ===
    let mejorHabito = { nombre: '-', racha: 0 }
    habits.forEach(h => {
      const comps = h.completions || h.completations || {}
      let cont = 0
      for (let i = 0; i < 365; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const str = fechaToStr(d)
        if (comps[str]) cont++
        else break
      }
      if (cont > mejorHabito.racha) mejorHabito = { nombre: h.nombre, racha: cont }
    })

    // === Rachas por hábito ===
    const rachaPorHabit = habits.map(h => {
      const comps = h.completions || h.completations || {}
      let cont = 0
      for (let i = 0; i < 365; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const str = fechaToStr(d)
        if (comps[str]) cont++
        else break
      }
      return { nombre: h.nombre, racha: cont, color: h.color }
    })

    // === Tasks por prioridad ===
    const tasksPorPrioridad = {
      alta: pendientes.filter(t => t.prioridad === 'alta').length + completadas.filter(t => t.prioridad === 'alta').length,
      media: pendientes.filter(t => t.prioridad === 'media').length + completadas.filter(t => t.prioridad === 'media').length,
      baja: pendientes.filter(t => t.prioridad === 'baja').length + completadas.filter(t => t.prioridad === 'baja').length
    }

    // === Días sin completar en el período ===
    let diasSinCompletar = 0
    for (let i = 0; i < rangoNumerico; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const str = fechaToStr(d)
      if (str >= inicioStr) {
        const alguna = completadas.some(t => t.completadaEn === str)
        let algunHab = false
        habits.forEach(h => {
          const comps = h.completions || h.completations || {}
          if (comps[str]) algunHab = true
        })
        if (!alguna && !algunHab) diasSinCompletar++
      }
    }

    // === Rango label ===
    const rangoLabel = rango === 7 ? '7 días' : rango === 30 ? '30 días' : rango === 90 ? '90 días' : rango === 365 ? 'este año' : 'todo'

    return {
      rachaActual,
      rachaMax,
      totalCompletadas,
      totalPendientes,
      totalHistorico: tasks.filter(t => t.completada).length,
      tasaExito,
      promedioDiario: parseFloat(promedioDiario),
      diaMasProductivo,
      mejorHabito: mejorHabito.nombre,
      rachaMejorHabito: mejorHabito.racha,
      tasksChartData,
      tasksSemanaData,
      tasksMesData,
      habitsChartData,
      tasksPorPrioridad,
      rachaPorHabit,
      diasSinCompletar,
      completadasEnRango: totalCompletadas,
      pendientesEnRango: totalPendientes,
      rango,
      rangoLabel
    }
  }, [tasks, habits, rango])
}
