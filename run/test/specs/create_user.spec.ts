import {
  closeApp,
  openAppOnPlatformSingleDevice,
  SupportedPlatformsType,
} from "./utils/open_app";
import { newUser } from "./utils/create_account";
import { androidIt, iosIt } from "../../types/sessionIt";

async function createUser(platform: SupportedPlatformsType) {
  const { server, device } = await openAppOnPlatformSingleDevice(platform);

  await newUser(device, "User A");
  // Should verify session ID and recovery phrase are what was originally created

  await closeApp(server, device);
}

describe("User", () => {
  iosIt("Create-user", createUser);
  androidIt("Create-user", createUser);
});
