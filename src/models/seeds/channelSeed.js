const mongoose = require("mongoose");
const Channel = require("../channel");
const Chat = require("../chat");
const Message = require("../message");
const Thread = require("../thread");

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb+srv://telegrammysw:UnLP2DUUz5GHdbp8@cluster0.g0jfd.mongodb.net/development", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // // Clear existing data
    // await Channel.deleteMany({});
    // await Chat.deleteMany({});
    // await Message.deleteMany({});
    // await Thread.deleteMany({});
    // console.log("Cleared existing data");

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
    });
    console.log("Created Chat:", chat);

    // Add Messages to Channel Chat
    const channelMessages = [];
    for (let i = 1; i <= 3; i++) {
      const message = await Message.create({
        senderId: new mongoose.Types.ObjectId(),
        chatId: chat._id,
        messageType: "text",
        content: `This is message ${i} in the channel`,
      });
      channelMessages.push(message);
    }
    console.log("Created Channel Messages:", channelMessages);

    // Create Threads for Channel Messages
    const threads = [];
    for (const channelMessage of channelMessages) {
      const threadChat = await Chat.create({
        channelId: channel._id, // Same channel
      });

      const thread = await Thread.create({
        messageId: channelMessage._id,
        channelChatId: chat._id,
        chatId: threadChat._id,
      });

      threads.push(thread);

      // Add Messages to each Thread
      const threadMessages = [];
      for (let j = 1; j <= 2; j++) {
        const threadMessage = await Message.create({
          senderId: new mongoose.Types.ObjectId(),
          chatId: threadChat._id,
          messageType: "text",
          content: `This is message ${j} in thread of message ${channelMessage._id}`,
        });
        threadMessages.push(threadMessage);
      }
      console.log(`Created Messages for Thread ${thread._id}:`, threadMessages);
    }

    // Add Another Thread Manually
    const extraThreadChat = await Chat.create({
      channelId: channel._id,
    });

    const extraThread = await Thread.create({
      messageId: channelMessages[0]._id, // Link to the first message
      channelChatId: chat._id,
      chatId: extraThreadChat._id,
    });

    threads.push(extraThread);

    // Add Messages to the Extra Thread
    const extraThreadMessages = [];
    for (let k = 1; k <= 3; k++) {
      const extraMessage = await Message.create({
        senderId: new mongoose.Types.ObjectId(),
        chatId: extraThreadChat._id,
        messageType: "text",
        content: `This is extra message ${k} in extra thread of message ${channelMessages[0]._id}`,
      });
      extraThreadMessages.push(extraMessage);
    }
    console.log(
      `Created Extra Messages for Thread ${extraThread._id}:`,
      extraThreadMessages
    );

    // Update Channel with Threads
    channel.threads = threads.map((thread) => thread._id);
    await channel.save();
    console.log("Updated Channel with Threads:", channel);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
  }
};

// Run the seed script
seedDatabase();
