import { androidIt } from "../../types/sessionIt";
import { newUser } from "./utils/create_account";
import { newContact } from "./utils/create_contact";
import { findElementByClass } from "./utils/find_elements_stragegy";
import { sleepFor } from "./utils/index";
import {
  closeApp,
  openAppTwoDevices,
  SupportedPlatformsType,
} from "./utils/open_app";

async function sendImage(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);

  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  const testMessage = "Testing-image-1";
  const replyMessage = `Replying to image from ${userA.userName}`;

  await newContact(platform, device1, userA, device2, userB);

  await device1.clickOnElement("Attachments button");

  await sleepFor(100);

  await device1.clickOnElement("Documents folder");

  const elements = await findElementByClass(
    device1,
    "android.widget.CompoundButton"
  );
  const imageButton = await device1.findMatchingTextInElementArray(
    elements,
    "Images"
  );
  if (!imageButton) {
    throw new Error("imageButton was not found in android");
  }
  await device1.click(imageButton?.ELEMENT);
  // await device1.clickOnElement("Show roots");
  await device1.clickOnElementXPath(
    `/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/androidx.drawerlayout.widget.DrawerLayout/android.view.ViewGroup/android.widget.FrameLayout/android.widget.FrameLayout[2]/android.widget.LinearLayout/android.view.ViewGroup/androidx.recyclerview.widget.RecyclerView/androidx.cardview.widget.CardView[2]`
  );
  // await clickOnElementXPath(
  //   device1,
  //   `/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/androidx.drawerlayout.widget.DrawerLayout/android.view.ViewGroup/android.widget.FrameLayout/android.widget.FrameLayout[2]/android.widget.LinearLayout/android.view.ViewGroup/androidx.recyclerview.widget.RecyclerView/androidx.cardview.widget.CardView[2]/androidx.cardview.widget.CardView/android.widget.RelativeLayout/android.widget.FrameLayout[1]`
  // );

  await device2.clickOnElement("Untrusted attachment message");
  await sleepFor(500);
  // User B - Click on 'download'
  await device2.clickOnElement("Download media");

  // NEED TO WAIT FOR A FIX
  // Reply to message
  // await sleepFor(5000);
  // Need to wait for solution
  // await device2.longPress("Media message");
  // await device2.clickOnElement("Reply to message");
  // await sendMessage(device2, replyMessage);
  // await device1.waitForTextElementToBePresent("Message Body", replyMessage);
  // Close app and server
  await closeApp(device1, device2);
}

async function sendVideo(platform: SupportedPlatformsType) {
  // Test sending a video
  // open devices
  const { device1, device2 } = await openAppTwoDevices(platform);
  // create user a and user b
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  const testMessage = "Testing-video-1";
  const replyMessage = `Replying to video from ${userA.userName}`;
  // create contact
  await newContact(platform, device1, userA, device2, userB);
  // Push image to device for selection
  // Click on attachments button
  await device1.clickOnElement("Attachments button");
  // Select images button/tab
  await sleepFor(100);
  // Check if android or ios (android = documents folder/ ios = images folder)
  // await device1.clickOnElement("Images folder");
  await device1.clickOnElement("Documents folder");
  // Select 'continue' on alert
  // Session would like to access your photos

  // Select video
  await device1.clickOnElementXPath(
    `/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.ViewGroup/androidx.drawerlayout.widget.DrawerLayout/android.view.ViewGroup/android.widget.FrameLayout/android.widget.FrameLayout[2]/android.widget.LinearLayout/android.view.ViewGroup/androidx.recyclerview.widget.RecyclerView/androidx.cardview.widget.CardView[3]/androidx.cardview.widget.CardView/android.widget.RelativeLayout`
  );
  // Check if the 'Tap to download media' config appears
  // User B - Click on untrusted attachment message
  await device2.clickOnElement("Untrusted attachment message");
  await sleepFor(1000);
  // User B - Click on 'download'
  await device2.clickOnElement("Download media");

  // NEED TO WAIT FOR A FIX
  // Reply to message
  // await sleepFor(5000);
  // await device2.longPress("Media message");
  // await device2.clickOnElement("Reply to message");
  // await sendMessage(device2, replyMessage);
  // await device1.waitForTextElementToBePresent("Message Body", replyMessage);
  // Close app and server
  await closeApp(device1, device2);
}

async function sendVoiceMessage(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  // create user a and user b
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  const replyMessage = `Replying to voice message from ${userA.userName}`;
  await newContact(platform, device1, userA, device2, userB);
  // Select voice message button to activate recording state
  await device1.longPress("New voice message");

  await device1.clickOnElement("CONTINUE");
  // await pressAndHold(device1, "New voice message");

  await device1.waitForElementToBePresent("Voice message");

  await device2.clickOnElement("Untrusted attachment message");
  await sleepFor(200);
  await device2.clickOnElement("Download");

  // NEED TO WAIT FOR A FIX
  // await sleepFor(1500);
  // await device2.longPress("Voice message");
  // await device2.clickOnElement("Reply to message");
  // await sendMessage(device2, replyMessage);
  // await device1.waitForTextElementToBePresent("Message Body", replyMessage);

  await closeApp(device1, device2);
}

async function sendGif(platform: SupportedPlatformsType) {
  // Test sending a video
  // open devices and server
  const { device1, device2 } = await openAppTwoDevices(platform);
  // create user a and user b
  const [userA, userB] = await Promise.all([
    newUser(device1, "User A", platform),
    newUser(device2, "User B", platform),
  ]);
  const testMessage = "Testing-GIF-1";
  const replyMessage = `Replying to GIF from ${userA.userName}`;
  // create contact
  await newContact(platform, device1, userA, device2, userB);
  // Click on attachments button
  await device1.clickOnElement("Attachments button");
  // Select GIF tab

  await device1.clickOnElement("GIF button");
  await device1.clickOnElement("OK");

  // Select gif
  await sleepFor(3000);
  await device1.clickOnElementXPath(
    `(//XCUIElementTypeImage[@name="gif cell"])[1]`
  );
  // Check if the 'Tap to download media' config appears
  // Click on config
  await device2.clickOnElement("Untrusted attachment message");
  await sleepFor(500);
  // Click on 'download'
  await device2.clickOnElement("Download");
  // NEED TO WAIT FOR A FIX
  // Reply to message
  // await sleepFor(3000);
  // await device2.longPressMessage(testMessage);
  // // Check reply came through on device1
  // await device2.clickOnElement("Reply to message");
  // await sendMessage(device2, replyMessage);
  // await device1.waitForTextElementToBePresent("Message Body", replyMessage);
  // Close app
  await closeApp(device1, device2);
}

async function sendLongMessage(platform: SupportedPlatformsType) {
  const longText =
    "Mauris sapien dui, sagittis et fringilla eget, tincidunt vel mauris. Mauris bibendum quis ipsum ac pulvinar. Integer semper elit vitae placerat efficitur. Quisque blandit scelerisque orci, a fringilla dui. In a sollicitudin tortor. Vivamus consequat sollicitudin felis, nec pretium dolor bibendum sit amet. Integer non congue risus, id imperdiet diam. Proin elementum enim at felis commodo semper. Pellentesque magna magna, laoreet nec hendrerit in, suscipit sit amet risus. Nulla et imperdiet massa. Donec commodo felis quis arcu dignissim lobortis. Praesent nec fringilla felis, ut pharetra sapien. Donec ac dignissim nisi, non lobortis justo. Nulla congue velit nec sodales bibendum. Nullam feugiat, mauris ac consequat posuere, eros sem dignissim nulla, ac convallis dolor sem rhoncus dolor. Cras ut luctus risus, quis viverra mauris.";
  // Sending a long text message
  // Open device and server
  const { device1, device2 } = await openAppTwoDevices(platform);
  // Create user A and User B
  const [userA, userB] = await Promise.all([
    newUser(device1, "User A", platform),
    newUser(device2, "User B", platform),
  ]);
  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  // Send a long message from User A to User B
  await device1.sendMessage(longText);
  // Reply to message (User B to User A)
  const sentMessage = await device2.replyToMessage(userA, longText);
  // Check reply came through on device1
  await device1.findMessageWithBody(sentMessage);
  // Close app
  await closeApp(device1, device2);
}

async function sendLink(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);

  // Create two users
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);
  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  // Send a link
  await device1.inputText("Message input box", `https://nerdlegame.com/`);
  // Accept dialog for link preview
  await device1.clickOnElement("Enable");
  // No preview on first send
  await device1.clickOnElement("Send message button");
  await device1.waitForElementToBePresent("Message sent status: Sent");
  // Send again for image
  await device1.inputText("Message input box", `https://nerdlegame.com/`);
  await sleepFor(100);
  await device1.clickOnElement("Send message button");
  // Make sure link works (dialog pop ups saying are you sure?)

  // Make sure image preview is available in device 2
  await device2.waitForTextElementToBePresent(
    "Message Body",
    `https://nerdlegame.com/`
  );
  await closeApp(device1, device2);
}

async function unsendMessage(platform: SupportedPlatformsType) {
  const { device1, device2 } = await openAppTwoDevices(platform);
  // Create two users
  const [userA, userB] = await Promise.all([
    newUser(device1, "Alice", platform),
    newUser(device2, "Bob", platform),
  ]);

  // Create contact
  await newContact(platform, device1, userA, device2, userB);
  // send message from User A to User B
  const sentMessage = await device1.sendMessage(
    "Checking unsend functionality"
  );
  // await sleepFor(1000);
  await device2.waitForTextElementToBePresent("Message Body", sentMessage);
  console.log("Doing a long click on" + `${sentMessage}`);
  // Select and long press on message to delete it
  await device1.longPressMessage(sentMessage);
  // Select Delete icon
  await device1.clickOnElement("Delete message");
  // Select 'Delete for me and User B'
  await device1.clickOnElement("Delete for everyone");
  // Look in User B's chat for alert 'This message has been deleted?'
  await device2.waitForElementToBePresent("Deleted message");

  // Excellent
  await closeApp(device1, device2);
}

describe("Message checks android", async () => {
  await androidIt("Send image and reply test", sendImage);
  await androidIt("Send video and reply test", sendVideo);
  await androidIt("Send voice message test", sendVoiceMessage);
  // await androidIt("Send document and reply test", sendDocument);
  await androidIt("Send link test", sendLink);
  await androidIt("Send GIF and reply", sendGif);
  await androidIt("Send long text and reply test", sendLongMessage);
  await androidIt("Unsend message", unsendMessage);
  // await androidIt("Delete message", deleteMessage);
});
// Link preview without image
// Link preview with image
// Media saved notification
// Send doc
// Delete message
