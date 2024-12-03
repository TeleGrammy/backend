const User = require("../user");
const Group = require("../group");
const Channel = require("../channel");
const Membership = require("../memberShip");

const seedData = async () => {
  try {
    // Fetch the specific users by their IDs
    const userIds = await User.find({
      _id: {
        $in: [
          "671d44667e9678b9429b2ee0",
          "671d3c3fa99c593917b9c977",
          "671e85689afbfbc5840bc109",
        ],
      },
    });

    if (userIds.length !== 3) {
      throw new Error("Could not find all specified users.");
    }

    // Create a group and a channel
    const group = new Group({
      name: "Sample Group",
      description: "A sample group description.",
      privacy: "Private",
      addingMembersPolicy: "Admins",
    });
    await group.save();

    const channel = new Channel({
      name: "Sample Channel",
      description: "A sample channel description.",
      privacy: "Public",
      addingMembersPolicy: "Admins",
    });
    await channel.save();

    // Create memberships for each user
    await Membership.create([
      {
        userId: userIds[0]._id,
        entityId: group._id,
        entityType: "Group",
        role: "Admin",
      },
      {
        userId: userIds[0]._id,
        entityId: channel._id,
        entityType: "Channel",
        role: "Admin",
      },
      {
        userId: userIds[1]._id,
        entityId: group._id,
        entityType: "Group",
        role: "Member",
      },
      {
        userId: userIds[2]._id,
        entityId: channel._id,
        entityType: "Channel",
        role: "Subscriber",
      },
    ]);

    console.log("Seed data has been successfully inserted!");
  } catch (error) {
    console.error("Error while seeding data:", error);
  }
};

// Export the seedData function to use in other parts of your app
module.exports = {seedData};
