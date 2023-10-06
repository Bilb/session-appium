import { androidIt } from "../../types/sessionIt";
import { sleepFor } from "./utils";
import { newUser } from "./utils/create_account";
import { createGroup } from "./utils/create_group";
import {
  SupportedPlatformsType,
  closeApp,
  openAppThreeDevices,
} from "./utils/open_app";
import { runScriptAndLog } from "./utils/utilities";

async function sendImageGroup(platform: SupportedPlatformsType) {
  const testGroupName = "Message checks for groups";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create contact between User A and User B
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  const replyMessage = `Replying to image from ${userA.userName}`;
  await device1.clickOnElement("Attachments button");
  // Wait for page to load
  await sleepFor(100);
  await device1.clickOnElement("Documents folder");
  // Sort files into categories (images)
  const mediaButtons = await device1.findElementsByClass(
    "android.widget.CompoundButton"
  );
  const imageButton = await device1.findMatchingTextInElementArray(
    mediaButtons,
    "Images"
  );
  if (!imageButton) {
    throw new Error("imageButton was not found in android");
  }
  await device1.click(imageButton.ELEMENT);
  const testImage = await device1.doesElementExist({
    strategy: "id",
    selector: "android:id/title",
    maxWait: 2000,
    text: "test_image.jpg",
  });
  if (!testImage) {
    await runScriptAndLog(
      `adb -s emulator-5554 push 'run/test/specs/media/test_image.jpg' /storage/emulated/0/Download`,
      true
    );
  }
  // Wait for image to appear on screen
  await sleepFor(100);
  await device1.clickOnTextElementById("android:id/title", "test_image.jpg");
  // Wait for image to appear in conversation screen
  await sleepFor(500);
  await device2.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Media message",
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Media message",
  });

  // Reply to image from user B
  // Waiting for image to load
  await sleepFor(1000);
  await device2.longPress("Media message");
  await device2.clickOnElement("Reply to message");
  await device2.sendMessage(replyMessage);
  await device1.clickOnElementAll({
    strategy: "id",
    selector: `network.loki.messenger:id/scrollToBottomButton`,
  });
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  await device3.clickOnElementAll({
    strategy: "id",
    selector: `network.loki.messenger:id/scrollToBottomButton`,
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });

  // Close server and devices
  await closeApp(device1, device2, device3);
}

async function sendVideoGroup(platform: SupportedPlatformsType) {
  // Test sending a video
  // open devices
  const testGroupName = "Message checks for groups";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create contact between User A and User B
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  const replyMessage = `Replying to video from ${userA.userName} in ${testGroupName}`;
  // Click on attachments button
  await device1.clickOnElement("Attachments button");
  await sleepFor(100);
  // Select images button/tab
  await device1.clickOnElement("Documents folder");
  // Select video
  const mediaButtons = await device1.findElementsByClass(
    "android.widget.CompoundButton"
  );
  const videosButton = await device1.findMatchingTextInElementArray(
    mediaButtons,
    "Videos"
  );
  if (!videosButton) {
    throw new Error("videosButton was not found");
  }
  await device1.click(videosButton.ELEMENT);
  const testVideo = await device1.doesElementExist({
    strategy: "id",
    selector: "android:id/title",
    maxWait: 1000,
    text: "test_video.mp4",
  });
  if (!testVideo) {
    // Adds video to downloads folder if it isn't already there
    await runScriptAndLog(
      `adb -s emulator-5554 push 'run/test/specs/media/test_video.mp4' /storage/emulated/0/Download`,
      true
    );
  }
  await sleepFor(100);
  await device1.clickOnTextElementById("android:id/title", "test_video.mp4");
  // Reply to message
  await device2.waitForTextElementToBePresent({
    strategy: "id",
    selector: "network.loki.messenger:id/play_overlay",
    maxWait: 8000,
  });
  await device3.waitForTextElementToBePresent({
    strategy: "id",
    selector: "network.loki.messenger:id/play_overlay",
    maxWait: 8000,
  });

  await device2.longPress("Media message");
  await device2.clickOnElement("Reply to message");
  await device2.sendMessage(replyMessage);
  await sleepFor(2000);
  await device1.clickOnElementAll({
    strategy: "id",
    selector: `network.loki.messenger:id/scrollToBottomButton`,
  });
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  await device3.clickOnElementAll({
    strategy: "id",
    selector: `network.loki.messenger:id/scrollToBottomButton`,
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  // Close app and server
  await closeApp(device1, device2, device3);
}

async function sendVoiceMessageGroup(platform: SupportedPlatformsType) {
  // open devices
  const testGroupName = "Message checks for groups";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create contact between User A and User B
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  const replyMessage = `Replying to voice message from ${userA.userName} in ${testGroupName}`;
  // Select voice message button to activate recording state
  await device1.longPress("New voice message");

  await device1.clickOnElement("Continue");
  await device1.clickOnElementXPath(
    `/hierarchy/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.ScrollView/android.widget.LinearLayout/android.widget.LinearLayout/android.widget.LinearLayout[2]/android.widget.Button[1]`
  );
  await device1.pressAndHold("New voice message");
  await device2.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Voice message",
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Voice message",
  });
  await device2.longPress("Voice message");
  await device2.clickOnElement("Reply to message");
  await device2.sendMessage(replyMessage);
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });

  await closeApp(device1, device2, device3);
}

async function sendDocumentGroup(platform: SupportedPlatformsType) {
  const testGroupName = "Message checks for groups";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create contact between User A and User B
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  const replyMessage = `Replying to document from ${userA.userName} in ${testGroupName}`;
  await device1.clickOnElement("Attachments button");
  await sleepFor(100);
  await device1.clickOnElement("Documents folder");
  const mediaButtons = await device1.findElementsByClass(
    "android.widget.CompoundButton"
  );
  const documentsButton = await device1.findMatchingTextInElementArray(
    mediaButtons,
    "Documents"
  );
  if (!documentsButton) {
    throw new Error("documentsButton was not found");
  }
  await device1.click(documentsButton.ELEMENT);
  const testDocument = await device1.doesElementExist({
    strategy: "id",
    selector: "android:id/title",
    maxWait: 1000,
    text: "test_file.pdf",
  });
  if (!testDocument) {
    await runScriptAndLog(
      `adb -s emulator-5554 push 'run/test/specs/media/test_file.pdf' /storage/emulated/0/Download`,
      true
    );
  }
  await sleepFor(100);
  await device1.clickOnTextElementById("android:id/title", "test_file.pdf");
  // Reply to message
  await sleepFor(1000);
  await device2.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Document",
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Document",
  });
  await device2.longPress("Document");
  await device2.clickOnElement("Reply to message");
  await device2.sendMessage(replyMessage);
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  // Close app and server
  await closeApp(device1, device2, device3);
}

async function sendLinkGroup(platform: SupportedPlatformsType) {
  const testGroupName = "Message checks for groups";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create contact between User A and User B
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  const testLink = `https://nerdlegame.com/`;
  // Send a link
  await device1.inputText("accessibility id", "Message input box", testLink);
  // Accept dialog for link preview
  await device1.clickOnElement("Enable");
  // No preview on first send
  await device1.clickOnElement("Send message button");
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message sent status: Sent",
    maxWait: 20000,
  });
  await device2.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: testLink,
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: testLink,
  });
  await device2.replyToMessage(userA, testLink);
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: `${userA.userName} message reply`,
  });
  await closeApp(device1, device2, device3);
}

async function sendGifGroup(platform: SupportedPlatformsType) {
  const testGroupName = "Message checks for groups";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create contact between User A and User B
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  const replyMessage = `Replying to GIF from ${userA.userName}`;
  // Click on attachments button
  await device1.clickOnElement("Attachments button");
  // Select GIF tab
  await device1.clickOnElement("GIF button");
  await device1.clickOnElementAll({
    strategy: "accessibility id",
    selector: "Continue",
  });
  // Select gif
  await sleepFor(3000);
  await device1.clickOnElementXPath(
    `/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.RelativeLayout/android.widget.ScrollView/androidx.viewpager.widget.ViewPager/android.widget.FrameLayout/androidx.recyclerview.widget.RecyclerView/android.widget.FrameLayout[1]`
  );
  // Reply to message
  await sleepFor(5000);
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Media message",
  });
  await device2.longPress("Media message");
  // Check reply came through on device1
  await device2.clickOnElement("Reply to message");
  await device2.sendMessage(replyMessage);
  await device1.clickOnElementAll({
    strategy: "id",
    selector: `network.loki.messenger:id/scrollToBottomButton`,
  });
  await device1.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  await device3.clickOnElementAll({
    strategy: "id",
    selector: `network.loki.messenger:id/scrollToBottomButton`,
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: replyMessage,
  });
  // Close app
  await closeApp(device1, device2, device3);
}
/* COMMENTED OUT UNTIL BUG FOR SCROLL TO BOTTOM IS FIXED */

// async function sendLongMessageGroup(platform: SupportedPlatformsType) {
//   const testGroupName = "Message checks for groups";
//   const { device1, device2, device3 } = await openAppThreeDevices(platform);
//   // Create users A, B and C
//   const [userA, userB, userC] = await Promise.all([
//     newUser(device1, "Alice", platform),
//     newUser(device2, "Bob", platform),
//     newUser(device3, "Charlie", platform),
//   ]);
//   // Create contact between User A and User B
//   await createGroup(
//     platform,
//     device1,
//     userA,
//     device2,
//     userB,
//     device3,
//     userC,
//     testGroupName
//   );
//   const longText =
//     "Mauris sapien dui, sagittis et fringilla eget, tincidunt vel mauris. Mauris bibendum quis ipsum ac pulvinar. Integer semper elit vitae placerat efficitur. Quisque blandit scelerisque orci, a fringilla dui. In a sollicitudin tortor. Vivamus consequat sollicitudin felis, nec pretium dolor bibendum sit amet. Integer non congue risus, id imperdiet diam. Proin elementum enim at felis commodo semper. Pellentesque magna magna, laoreet nec hendrerit in, suscipit sit amet risus. Nulla et imperdiet massa. Donec commodo felis quis arcu dignissim lobortis. Praesent nec fringilla felis, ut pharetra sapien. Donec ac dignissim nisi, non lobortis justo. Nulla congue velit nec sodales bibendum. Nullam feugiat, mauris ac consequat posuere, eros sem dignissim nulla, ac convallis dolor sem rhoncus dolor. Cras ut luctus risus, quis viverra mauris.";
//   // Sending a long text message
//   const replyMessage = `${userA.userName} message reply`;
//   await device1.inputText("accessibility id", "Message input box", longText);
//   // Click send
//   await device1.clickOnElement("Send message button");
//   // await device1.clickOnElementAll({
//   //   strategy: "id",
//   //   selector: `network.loki.messenger:id/scrollToBottomButton`,
//   // });
//   await device1.waitForElementToBePresent({
//     strategy: "accessibility id",
//     selector: `Message sent status: Sent`,
//     maxWait: 50000,
//   });

//   await device2.waitForTextElementToBePresent({
//     strategy: "accessibility id",
//     selector: "Message body",
//     text: longText,
//   });
//   await device3.waitForTextElementToBePresent({
//     strategy: "accessibility id",
//     selector: "Message body",
//     text: longText,
//   });
//   await device1.clickOnElementAll({
//     strategy: "id",
//     selector: `network.loki.messenger:id/scrollToBottomButton`,
//   });
//   await device2.replyToMessage(userA, longText);
//   await device1.clickOnElementAll({
//     strategy: "id",
//     selector: `network.loki.messenger:id/scrollToBottomButton`,
//   });
//   await device1.waitForTextElementToBePresent({
//     strategy: "accessibility id",
//     selector: "Message body",
//     text: replyMessage,
//   });
//   // Waiting for scroll to bottom to appear/be active
//   await sleepFor(100);
//   await device3.clickOnElementAll({
//     strategy: "id",
//     selector: `network.loki.messenger:id/scrollToBottomButton`,
//   });
//   await device3.waitForTextElementToBePresent({
//     strategy: "accessibility id",
//     selector: "Message body",
//     text: replyMessage,
//   });
//   // Close app
//   await closeApp(device1, device2, device3);
// }

async function deleteMessageGroup(platform: SupportedPlatformsType) {
  const testGroupName = "Message checks for groups";
  const { device1, device2, device3 } = await openAppThreeDevices(platform);
  // Create users A, B and C
  const [userA, userB, userC] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
    newUser(device3, "Charlie", platform),
  ]);
  // Create contact between User A and User B
  await createGroup(
    platform,
    device1,
    userA,
    device2,
    userB,
    device3,
    userC,
    testGroupName
  );
  const sentMessage = await device1.sendMessage(
    "Checking unsend functionality"
  );
  await device2.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: sentMessage,
  });
  await device3.waitForTextElementToBePresent({
    strategy: "accessibility id",
    selector: "Message body",
    text: sentMessage,
  });
  // Select and long press on message to delete it
  await device1.longPressMessage(sentMessage);
  // Select Delete icon
  await device1.clickOnElement("Delete message");
  // Select 'Delete for everyone'
  await device1.clickOnElement("Delete just for me");
  await sleepFor(1000);
  await device1.hasTextElementBeenDeleted("Message body", sentMessage);
  // Excellent
  await closeApp(device1, device2, device3);
}

describe("Message checks android", () => {
  androidIt("Send image to group", sendImageGroup);
  androidIt("Send video to group", sendVideoGroup);
  androidIt("Send voice message to group", sendVoiceMessageGroup);
  androidIt("Send document to group", sendDocumentGroup);
  androidIt("Send link to group", sendLinkGroup);
  androidIt("Send GIF to group", sendGifGroup);
  // androidIt("Send long message to group", sendLongMessageGroup);
  // androidIt("Unsend message in group", unsendMessageGroup);
  androidIt("Delete message in group", deleteMessageGroup);
});
