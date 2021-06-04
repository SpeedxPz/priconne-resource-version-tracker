
export const writeLog = (message: string) => {
  console.log(`[${(new Date()).toISOString()}] ${message}`)
}