import { getSessionID, runOnlyOnAndroid, runOnlyOnIOS, sleepFor } from ".";
import { SupportedPlatformsType } from "./open_app";
import { User, Username } from "../../../types/testing";
import { DeviceWrapper } from "../../../types/DeviceWrapper";

export const newUser = async (
  device: DeviceWrapper,
  userName: Username,
  platform: SupportedPlatformsType
): Promise<User> => {
  // Click create session ID
  const createSessionId = "Create session ID";
  await device.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: createSessionId,
  });
  await device.clickOnByAccessibilityID(createSessionId);
  // Wait for animation to generate session id
  await device.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Session ID",
    maxWait: 8000,
  });
  // save session id as variable
  const sessionID = await getSessionID(platform, device);

  console.log(`${userName}s sessionID found: "${sessionID}" "${platform}"`);
  // TODO add 'allow notifications' function here for android API 34
  // Click continue on session Id creation
  await device.clickOnByAccessibilityID("Continue");
  // Input username
  await device.inputText("accessibility id", "Enter display name", userName);
  // Click continue
  await device.clickOnByAccessibilityID("Continue");
  // Choose message notification options
  // Want to choose 'Slow Mode' so notifications don't interrupt test
  await runOnlyOnAndroid(platform, () =>
    device.clickOnByAccessibilityID("Slow mode notifications option")
  );
  await device.clickOnByAccessibilityID("Continue with settings");
  // Need to add Don't allow notifications dismiss here
  await runOnlyOnIOS(platform, () =>
    device.clickOnByAccessibilityID("Don’t Allow")
  );
  await sleepFor(1000);
  await runOnlyOnAndroid(platform, () =>
    device.clickOnElementAll({
      strategy: "id",
      selector: `com.android.permissioncontroller:id/permission_allow_button`,
      text: "Allow",
    })
  );
  // Click on 'continue' button to open recovery phrase modal
  await device.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Continue",
  });
  await device.clickOnByAccessibilityID("Continue");
  // Long Press the recovery phrase to reveal recovery phrase
  await device.longPress("Recovery Phrase");
  // Save recovery phrase as variable
  const recoveryPhrase = await device.grabTextFromAccessibilityId(
    "Recovery Phrase"
  );
  console.log(`${userName}s recovery phrase is "${recoveryPhrase}"`);
  // Exit Modal
  await device.clickOnByAccessibilityID("Navigate up");

  return { userName, sessionID, recoveryPhrase };
};
