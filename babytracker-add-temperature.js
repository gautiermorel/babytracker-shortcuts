const baseUrl = "https://prodapp.babytrackers.com"
const KC_PREFIX = "BABYTRACKER_"

// Pick your own baby
const babyUUID = '84F124F4-3848-4029-B754-1FB0C2585F8A' // Louis
const targetDeviceUUID = getSecret("TARGET_DEVICE_UUID")
const password = getSecret("PASSWORD")
const email = getSecret("EMAIL")

const temperatureValue = parseTemperature(args.shortcutParameter || '37')

const headers = {
  "User-Agent": "BabyTracker/273 CFNetwork/3860.600.12 Darwin/25.5.0",
  "Content-Type": "application/json",
}

const sessionReq = new Request(`${baseUrl}/session`)
sessionReq.method = "POST"
sessionReq.headers = headers

sessionReq.body = JSON.stringify({
  Device: {
    DeviceUUID: targetDeviceUUID
  },
  AppInfo: {
    AppType: 0,
    AccountType: 0
  },
  Password: password,
  EmailAddress: email
})

const sessionRaw = await sessionReq.loadString()

const cookie = sessionReq.response.cookies && sessionReq.response.cookies.length > 0
  ? sessionReq.response.cookies.map(c => `${c.name}=${c.value}`).join("; ")
  : ""


if (sessionReq.response.statusCode !== 200) {
  throw new Error("SESSION HTTP " + sessionReq.response.statusCode + "\n" + sessionRaw)
}

const devicesReq = new Request(`${baseUrl}/account/device`)
devicesReq.method = "GET"
devicesReq.headers = {
  ...headers,
  Cookie: cookie
}

const devicesRaw = await devicesReq.loadString()

if (devicesReq.response.statusCode !== 200) {
  throw new Error("DEVICE HTTP " + devicesReq.response.statusCode + "\n" + devicesRaw)
}

const devices = JSON.parse(devicesRaw)
const device = devices.find(d => d.DeviceUUID === targetDeviceUUID)

if (!device) {
  throw new Error("Device cible introuvable")
}

const syncId = Number(device.LastSyncID) + 1

const now = new Date()
const appTime = formatAppDate(now)

const transaction = {
  temperature: {
    value: temperatureValue,
    englishMeasure: "false",
    BCObjectType: "TemperatureMeasure"
  },
  BCObjectType: "Temperature",
  note: '',
  time: appTime,
  timezone: 3600,
  newFlage: "true",
  pictureLoaded: "true",
  pictureNote: [],
  timestamp: appTime,
  baby: {
    objectID: babyUUID,
  },
  objectID: uuidv4().toUpperCase()
}

const transactionBase64 = Data
  .fromString(JSON.stringify(transaction))
  .toBase64String()

const txReq = new Request(`${baseUrl}/account/transaction`)
txReq.method = "POST"
txReq.headers = {
  ...headers,
  Cookie: cookie
}

txReq.body = JSON.stringify({
  OPCode: 0,
  Transaction: transactionBase64,
  SyncID: syncId
})

const txResult = await txReq.loadString()

if (txReq.response.statusCode < 200 || txReq.response.statusCode >= 300) {
  throw new Error("TRANSACTION HTTP " + txReq.response.statusCode + "\n" + txResult)
}

const displayedTemperature = temperatureValue.toFixed(1).replace(".", ",")
const output = `La température de Louis a été prise: ${displayedTemperature}°C`

Script.setShortcutOutput(output)
Script.complete()

/*********************************/

function formatAppDate (date) {
  const pad = n => String(n).padStart(2, "0")

  return (
    date.getUTCFullYear() + "-" +
    pad(date.getUTCMonth() + 1) + "-" +
    pad(date.getUTCDate()) + " " +
    pad(date.getUTCHours()) + ":" +
    pad(date.getUTCMinutes()) + ":" +
    pad(date.getUTCSeconds()) +
    " +0000"
  )
}

function uuidv4 () {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === "x" ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function parseTemperature (input) {
  let raw = String(input ?? "").trim()

  raw = raw
    .replace(",", ".")
    .replace("°", "")
    .replace(/degrees?/i, "")
    .replace(/degrés?/i, "")
    .replace(/[^\d.]/g, "")

  const value = parseFloat(raw)

  if (isNaN(value)) {
    throw new Error("Température invalide : " + input)
  }

  return Math.round(value * 10) / 10
}

function getSecret (name) {
  const key = KC_PREFIX + name

  if (!Keychain.contains(key)) {
    throw new Error(`Secret manquant : ${key}. Lance d'abord BabyTracker Setup.`)
  }

  return Keychain.get(key)
}
