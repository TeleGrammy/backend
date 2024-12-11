const mongoose = require("mongoose");
const Channel = require("../channel");
const Chat = require("../chat");
const Message = require("../message");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://telegrammysw:UnLP2DUUz5GHdbp8@cluster0.g0jfd.mongodb.net/development",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB");

    // Create a Channel
    const channel = await Channel.create({
      name: "Welcome Channel",
      description: "This is a demo channel",
      privacy: "Public",
    });
    console.log("Created Channel:", channel);

    // Create a Chat for the Channel
    const chat = await Chat.create({
      channelId: channel._id,
      isChannel: true,
    });
    console.log("Created Chat:", chat);

    // Add Messages to Channel Chat
    const channelMessages = [];
    for (let i = 1; i <= 3; i++) {
      // eslint-disable-next-line no-await-in-loop
      const message = await Message.create({
        senderId: new mongoose.Types.ObjectId(),
        chatId: chat._id,
        messageType: "text",
        content: `This is message ${i} in the channel`,
        isPost: true,
      });
      channelMessages.push(message);
    }
    console.log("Created Channel Messages:", channelMessages);

    // Create Threads for Channel Messages
    // eslint-disable-next-line no-restricted-syntax
    for (const channelMessage of channelMessages) {
      // Add Messages to each Thread
      const threadMessages = [];
      for (let j = 1; j <= 2; j++) {
        const threadMessage = await Message.create({
          senderId: new mongoose.Types.ObjectId(),
          chatId: chat._id,
          messageType: "text",
          parentPost: channelMessage._id,
          isPost: false,
          content: `This is message ${j} in thread of message ${channelMessage._id}`,
        });
        threadMessages.push(threadMessage);
      }
      console.log(
        `Created Messages for Thread ${channelMessage._id}:`,
        threadMessages
      );
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the seed script
seedDatabase();
