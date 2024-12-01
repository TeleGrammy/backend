const User = require("../user");

const seedUsers = async () => {
  const users = [
    {
      username: "user1",
      email: "user1@example.com",
      password: "password123", // Make sure to hash this in a real scenario
      phone: "1234567890",
      picture: "http://example.com/picture1.jpg",
      bio: "Hello, I'm User 1!",
      status: "active",
    },
    {
      username: "user2",
      email: "user2@example.com",
      password: "password456",
      phone: "0987654321",
      picture: "http://example.com/picture2.jpg",
      bio: "Hi there, I'm User 2!",
      status: "inactive",
    },
    {
      username: "user3",
      email: "user3@example.com",
      password: "password789",
      phone: "5555555555",
      picture: "http://example.com/picture3.jpg",
      bio: "Greetings, I'm User 3!",
      status: "banned",
    },
  ];

  try {
    // Clear existing users
    await User.deleteMany({});

    // Insert sample users into the database
    await User.insertMany(users);
    console.log("Sample users seeded successfully!");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

module.exports = seedUsers;
