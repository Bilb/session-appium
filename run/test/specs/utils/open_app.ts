/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  androidCapabilities,
  getAndroidCapabilities,
  getAndroidUdid,
} from "./capabilities_android";
import { CapabilitiesIndexType, getIosCapabilities } from "./capabilities_ios";
import { installAppToDeviceName, runScriptAndLog } from "./utilities";

import * as androidDriver from "appium-uiautomator2-driver";
import * as iosDriver from "appium-xcuitest-driver";

import { DriverOpts } from "appium/build/lib/appium";
import { DeviceWrapper } from "../../../types/DeviceWrapper";
import {
  getAdbFullPath,
  getAvdManagerFullPath,
  getEmulatorFullPath,
} from "./binaries";
import { sleepFor } from "./sleep_for";
import { compact } from "lodash";
import { linkedDevice } from "./link_device";
import { newUser } from "./create_account";
import { User } from "../../../types/testing";
import { newContact } from "./create_contact";

const APPIUM_PORT = 4728;
export const APPIUM_IOS_PORT = 8110;

export type SupportedPlatformsType = "android" | "ios";

/* ******************Command to run Appium Server: *************************************
./node_modules/.bin/appium server --use-drivers=uiautomator2,xcuitest --port 8110 --use-plugins=execute-driver --allow-cors
*/

// Basic test environment is 3 devices (device1, device2, device3) and 2 users (userA, userB)
// Device 1 and 3 are linked devices by userA
export const createBasicTestEnvironment = async (
  platform: SupportedPlatformsType
): Promise<{
  devices: DeviceWrapper[];
  Alice: User;
  Bob: User;
  closeApp(): Promise<void>;
}> => {
  const [device1, device2, device3] = await openAppMultipleDevices(platform, 3);
  const userA = await linkedDevice(device1, device3, "Alice", platform);
  const userB = await newUser(device2, "Bob", platform);
  await newContact(platform, device1, userA, device2, userB);
  const closeApp = async (): Promise<void> => {
    await Promise.all([
      compact([device1, device2, device3]).map((d) => d.deleteSession()),
    ]);
    console.info("sessions closed");
  };
  return {
    devices: [device1, device2, device3],
    Alice: userA,
    Bob: userB,
    closeApp,
  };
};

export const setUp1o1TestEnvironment = async (
  platform: SupportedPlatformsType
) => {
  const [device1, device2, device3] = await openAppMultipleDevices(platform, 3);
  const userA = await linkedDevice(device1, device3, "Alice", platform);
  const userB = await newUser(device2, "Bob", platform);
  await newContact(platform, device1, userA, device2, userB);

  return { device1, device2, device3, userA, userB };
};

export const openAppMultipleDevices = async (
  platform: SupportedPlatformsType,
  numberOfDevices: number
): Promise<DeviceWrapper[]> => {
  // Create an array of promises for each device
  const devicePromises = Array.from({ length: numberOfDevices }, (_, index) =>
    openAppOnPlatform(platform, index as CapabilitiesIndexType)
  );

  // Use Promise.all to wait for all device apps to open
  const apps = await Promise.all(devicePromises);

  //  Map the result to return only the device objects
  return apps.map((app) => app.device);
};

const openAppOnPlatform = async (
  platform: SupportedPlatformsType,
  capabilitiesIndex: CapabilitiesIndexType
): Promise<{
  device: DeviceWrapper;
}> => {
  console.warn("starting capabilitiesIndex", capabilitiesIndex, platform);
  return platform === "ios"
    ? openiOSApp(capabilitiesIndex)
    : openAndroidApp(capabilitiesIndex);
};

export const openAppOnPlatformSingleDevice = async (
  platform: SupportedPlatformsType
): Promise<{
  device: DeviceWrapper;
}> => {
  return openAppOnPlatform(platform, 0);
};

export const openAppTwoDevices = async (
  platform: SupportedPlatformsType
): Promise<{
  device1: DeviceWrapper;
  device2: DeviceWrapper;
}> => {
  const [app1, app2] = await Promise.all([
    openAppOnPlatform(platform, 0),
    openAppOnPlatform(platform, 1),
  ]);

  return { device1: app1.device, device2: app2.device };
};

export const openAppThreeDevices = async (
  platform: SupportedPlatformsType
): Promise<{
  device1: DeviceWrapper;
  device2: DeviceWrapper;
  device3: DeviceWrapper;
}> => {
  const [app1, app2, app3] = await Promise.all([
    openAppOnPlatform(platform, 0),
    openAppOnPlatform(platform, 1),
    openAppOnPlatform(platform, 2),
  ]);

  return {
    device1: app1.device,
    device2: app2.device,
    device3: app3.device,
  };
};

export const openAppFourDevices = async (
  platform: SupportedPlatformsType
): Promise<{
  device1: DeviceWrapper;
  device2: DeviceWrapper;
  device3: DeviceWrapper;
  device4: DeviceWrapper;
}> => {
  const [app1, app2, app3, app4] = await Promise.all([
    openAppOnPlatform(platform, 0),
    openAppOnPlatform(platform, 1),
    openAppOnPlatform(platform, 2),
    openAppOnPlatform(platform, 3),
  ]);

  return {
    device1: app1.device,
    device2: app2.device,
    device3: app3.device,
    device4: app4.device,
  };
};

async function createAndroidEmulator(emulatorName: string) {
  const createCmd = `echo "no" | ${getAvdManagerFullPath()} create avd --name ${emulatorName} -k 'system-images;android-31;google_apis;arm64-v8a' --force --skin pixel_5`;
  console.warn(createCmd);
  await runScriptAndLog(createCmd);
  return emulatorName;
}

async function startAndroidEmulator(emulatorName: string) {
  await runScriptAndLog(`echo "hw.lcd.density=440" >> ~/.android/avd/${emulatorName}.avd/config.ini
  `);
  const startEmulatorCmd = `${getEmulatorFullPath()} @${emulatorName} -no-snapshot`;
  console.warn(`${startEmulatorCmd} & ; disown`);
  await runScriptAndLog(
    startEmulatorCmd // -netdelay none -no-snapshot -wipe-data
  );
}

async function isEmulatorRunning(emulatorName: string) {
  const failedWith = await runScriptAndLog(
    `${getAdbFullPath()} -s ${emulatorName} get-state;`
  );

  return (
    !failedWith ||
    !(failedWith.includes("error") || failedWith.includes("offline"))
  );
}

async function waitForEmulatorToBeRunning(emulatorName: string) {
  let start = Date.now();
  let found = false;

  do {
    found = await isEmulatorRunning(emulatorName);
    await sleepFor(500);
  } while (Date.now() - start < 25000 && !found);

  if (!found) {
    console.error("plop");
    throw new Error("timedout waiting for emulator to start");
    return;
  }

  start = Date.now();

  do {
    const bootedOrNah = await runScriptAndLog(
      `${getAdbFullPath()} -s  "${emulatorName}" shell getprop sys.boot_completed;`
    );

    found = bootedOrNah.includes("1");

    await sleepFor(500);
  } while (Date.now() - start < 25000 && !found);

  return found;
}

const openAndroidApp = async (
  capabilitiesIndex: CapabilitiesIndexType
): Promise<{
  device: DeviceWrapper;
}> => {
  const targetName = getAndroidUdid(capabilitiesIndex);
  const actualCapabilitiesIndex =
    capabilitiesIndex + 4 * parseInt(process.env.TEST_PARALLEL_INDEX || "0");
  if (isNaN(actualCapabilitiesIndex)) {
    console.warn(
      "actualCapabilities worker is not a number",
      actualCapabilitiesIndex
    );
  } else {
    console.warn("actualCapabilities worker", actualCapabilitiesIndex);
  }
  const emulatorAlreadyRunning = await isEmulatorRunning(targetName);
  console.warn("emulatorAlreadyRunning", targetName, emulatorAlreadyRunning);
  if (!emulatorAlreadyRunning) {
    await createAndroidEmulator(targetName);
    void startAndroidEmulator(targetName);
  }
  await waitForEmulatorToBeRunning(targetName);
  console.log(targetName, " emulator booted");

  await installAppToDeviceName(
    androidCapabilities.androidAppFullPath,
    targetName
  );
  const driver = (androidDriver as any).AndroidUiautomator2Driver;
  const capabilities = getAndroidCapabilities(
    actualCapabilitiesIndex as CapabilitiesIndexType
  );
  console.log(
    `Android App Full Path: ${
      getAndroidCapabilities(capabilitiesIndex)["alwaysMatch"]["appium:app"]
    }`
  );

  const opts: DriverOpts = {
    address: `http://localhost:${APPIUM_PORT}`,
  } as DriverOpts;

  const device: DeviceWrapper = new driver(opts);
  const udid = getAndroidUdid(capabilitiesIndex);
  console.log(`udid: ${udid}`);
  const wrappedDevice = new DeviceWrapper(device, udid);

  await runScriptAndLog(`adb -s ${targetName} shell settings put global heads_up_notifications_enabled 0
    `);
  await runScriptAndLog(`adb -s ${targetName} shell settings put global window_animation_scale 0
    `);
  await runScriptAndLog(`adb -s ${targetName} shell settings put global transition_animation_scale 0
    `);
  await runScriptAndLog(`adb -s ${targetName} shell settings put global animator_duration_scale 0
    `);

  console.warn("1");
  await wrappedDevice.createSession(capabilities);
  console.warn("2");
  await (device as any).updateSettings({
    ignoreUnimportantViews: false,
    allowInvisibleElements: true,
    enableMultiWindows: true,
  });
  console.warn("3");
  return { device: wrappedDevice };
};

const openiOSApp = async (
  capabilitiesIndex: CapabilitiesIndexType
): Promise<{
  device: DeviceWrapper;
}> => {
  console.warn("openiOSApp");

  // Calculate the actual capabilities index for the current worker
  const actualCapabilitiesIndex =
    capabilitiesIndex + 4 * parseInt(process.env.TEST_PARALLEL_INDEX || "0");

  const opts: DriverOpts = {
    address: `http://localhost:${APPIUM_PORT}`,
  } as DriverOpts;

  const driver = (iosDriver as any).XCUITestDriver;

  const device: unknown = new driver(opts);
  const capabilities = getIosCapabilities(
    actualCapabilitiesIndex as CapabilitiesIndexType
  );
  const udid = capabilities.alwaysMatch["appium:udid"] as string;
  const wrappedDevice = new DeviceWrapper(device, udid);

  await wrappedDevice.createSession(capabilities);

  return { device: wrappedDevice };
};

export const closeApp = async (
  device1?: DeviceWrapper,
  device2?: DeviceWrapper,
  device3?: DeviceWrapper,
  device4?: DeviceWrapper,
  device5?: DeviceWrapper,
  device6?: DeviceWrapper,
  device7?: DeviceWrapper,
  device8?: DeviceWrapper
) => {
  await Promise.all(
    compact([
      device1,
      device2,
      device3,
      device4,
      device5,
      device6,
      device7,
      device8,
    ]).map((d) => d.deleteSession())
  );

  console.info("sessions closed");
};
