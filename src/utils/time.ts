export function formatDateTime(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`
}

export function formatElapsedTime(startTime: number, endTime: number): string {
  const elapsedMilliseconds: number = endTime - startTime

  const hours: number = Math.floor(elapsedMilliseconds / 3600000)
  const minutes: number = Math.floor((elapsedMilliseconds % 3600000) / 60000)
  const seconds: number = Math.floor((elapsedMilliseconds % 60000) / 1000)
  const milliseconds: number = elapsedMilliseconds % 1000

  const hoursText = hours.toString().padStart(2, '0')
  const minutesText = minutes.toString().padStart(2, '0')
  const secondsText = seconds.toString().padStart(2, '0')
  const millisecondsText = milliseconds.toString().padStart(3, '0')

  return `${hoursText}:${minutesText}:${secondsText}.${millisecondsText}`
}
