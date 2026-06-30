# BabyTracker Scriptable Shortcuts

Add Siri Shortcuts to **BabyTracker** using **Scriptable** and **Apple Shortcuts**.

This project currently provides a shortcut for quickly logging your baby's temperature directly from Siri, without opening the BabyTracker app.

## Requirements

You'll need the following apps installed on your iPhone:

* **BabyTracker**

  * https://babytrackers.com/babytracker_ios.html
  * http://itunes.apple.com/app/appName/id779656557
* **Scriptable**

  * https://scriptable.app
* **Apple Shortcuts**

  * https://apps.apple.com/us/app/shortcuts/id915249334

## Finding your Device UUID and Baby UUID

The setup script requires values that are not exposed by the BabyTracker application.

These can be obtained by inspecting the application's network traffic.

### Requirements

* [Charles Proxy](https://www.charlesproxy.com/)
* An iPhone with BabyTracker installed
* SSL Proxying enabled in Charles (recommended)

### Steps

1. Install and configure Charles Proxy.
2. Configure your iPhone to use Charles as its HTTP/HTTPS proxy.
3. Enable SSL Proxying for the BabyTracker API.
4. Launch the BabyTracker app and sign in.
5. Monitor the requests sent by the application.

The values can typically be found in the following requests:

| Value                | Where to look                                                              |
| -------------------- | -------------------------------------------------------------------------- |
| `TARGET_DEVICE_UUID` | `/session` request payload (`Device.DeviceUUID`)                           |
| `BABY_UUID`          | Temperature, feeding, diaper, or other activity payloads (`baby.objectID`) |

Once you've collected these values, run `babytracker-setup.js` and enter them when prompted.

> **Note**
> These values are specific to your BabyTracker account and device.
>
> They should be treated as sensitive information and should never be committed to source control or shared publicly.



## Installation

Import the following scripts into Scriptable:

* `babytracker-setup.js`
* `babytracker-add-temperature.js`

## Initial Setup

Run the following script once:

```text
babytracker-setup.js
```

The setup wizard will ask for:

* BabyTracker email
* BabyTracker password
* Device UUID
* Native Token

These values are securely stored in the iOS Keychain and won't need to be entered again.

## Create the Shortcut

Create a new shortcut in the **Shortcuts** app with the following actions:

1. **Ask for Text**

   * Prompt: `What's the temperature?`

2. **Run Script**

   * Script: `babytracker-add-temperature.js`
   * Input: **Provided Input**

3. **Speak Text**

   * Speak the script output

Your shortcut should look similar to this:

![Shortcut example](assets/shortcut-example.png)

## Example

Say:

> "Hey Siri, log a temperature."

Siri will ask:

> "What's the temperature?"

Answer:

> "37.4"

The script will record the temperature in BabyTracker and return:

> "Done! 37.4°C has been recorded for Louis."

## Security

Your BabyTracker credentials are **not stored in the script**.

They are securely saved in the **iOS Keychain** by the setup script.

## Disclaimer

This project is not affiliated with or endorsed by BabyTracker.

It relies on the APIs currently used by the iOS application and may require updates if those APIs change.
