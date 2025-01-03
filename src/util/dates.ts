export function FormatDateMMDDYYYY(date: string) {
  return date.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$2/$3/$1")
}

export function getMinutes24hTime(time: string) {
  const val = time.match(/^([01]\d|2[0-3])(:)([0-5]\d)$/) || [time]
  if (val.length > 1) {
    const hr = parseInt(val[1])
    const mn = parseInt(val[3])

    return hr * 60 + mn
  } else {
    return NaN
  }
}

export function Format24hTime(time: string) {
  const val = time.match(/^([01]\d|2[0-3])(:)([0-5]\d)$/) || [time]
  if (val.length > 1) {
    const ampm = parseInt(val[1]) < 12 ? 'AM' : 'PM'
    const hr = parseInt(val[1]) % 12 === 0 ? 12 : parseInt(val[1]) % 12
    const mn = val[3]
    return `${hr}:${mn} ${ampm}`
  } else {
    return time
  }
}

export function GetActiveDayAcronyms(dayBits: number) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  if (dayBits == 0) return days
  const daysAcronyms = [];
  for (let i = 0; i < days.length; i++) {
    if (dayBits & (1 << i)) daysAcronyms.push(days[i])
  }
  return daysAcronyms
}

export function getActiveDayBits(acronyms: string[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const dayBits = days.reduce<number>((prev, curr, index) => {
    if (acronyms.includes(curr)) {
      return prev + (1 << (index))
    }
    return prev
  }, 0)

  return dayBits

}
