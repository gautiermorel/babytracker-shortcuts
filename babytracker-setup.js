const KC_PREFIX = "BABYTRACKER_"

await saveSecret("TARGET_DEVICE_UUID", "Device UUID")
await saveSecret("PASSWORD", "Password", true)
await saveSecret("EMAIL", "Email")

console.log("Secrets saved!")

const notification = new Notification()
notification.title = "BabyTracker"
notification.body = "Secrets saved!"
await notification.schedule()

Script.complete()

async function saveSecret (name, label, secure = false) {
  const alert = new Alert()
  alert.title = "Configuration BabyTracker"
  alert.message = label

  if (secure) {
    alert.addSecureTextField(label)
  } else {
    alert.addTextField(label)
  }

  alert.addAction("Enregistrer")
  alert.addCancelAction("Annuler")

  const result = await alert.present()

  if (result === -1) {
    throw new Error("Configuration annulée")
  }

  const value = alert.textFieldValue(0).trim()

  if (!value) {
    throw new Error(`${label} vide`)
  }

  Keychain.set(KC_PREFIX + name, value)
}
