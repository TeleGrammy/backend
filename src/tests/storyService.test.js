/* eslint-disable node/no-unpublished-require */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

const Story = require("../models/story");
const User = require("../models/user");
const {getBasicProfileInfo} = require("../services/userProfileService");
const {generateSignedUrl} = require("../middlewares/AWS");
const storyService = require("../services/storyService");

jest.mock("../models/story");
jest.mock("../models/user");
jest.mock("../services/userProfileService");
jest.mock("../middlewares/AWS");

describe("Story Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new story", async () => {
      const data = {
        userId: "123",
        content: "Test story",
        mediaKey: "media123",
        mediaType: "image",
      };
      Story.create.mockResolvedValue(data);

      const result = await storyService.create(data);

      expect(Story.create).toHaveBeenCalledWith(data);
      expect(result).toEqual(data);
    });
  });

  describe("getStoriesByUserId", () => {
    it("should return stories of a user", async () => {
      const userId = "123";
      const stories = [{_id: "1", userId, expiresAt: Date.now() + 1000}];
      Story.find.mockReturnValue({sort: jest.fn().mockResolvedValue(stories)});

      const result = await storyService.getStoriesByUserId(userId);

      expect(Story.find).toHaveBeenCalledWith({
        userId,
        expiresAt: {$gte: Date.now()},
      });
      expect(result).toEqual(stories);
    });
  });

  describe("getStoryById", () => {
    it("should return a story by ID", async () => {
      const id = "123";
      const story = {_id: id, expiresAt: Date.now() + 1000};
      Story.findOne.mockResolvedValue(story);

      const result = await storyService.getStoryById(id);

      expect(Story.findOne).toHaveBeenCalledWith({
        _id: id,
        expiresAt: {$gt: Date.now()},
      });
      expect(result).toEqual(story);
    });
  });

  describe("getStoriesOfContacts", () => {
    it("should return stories of contacts", async () => {
      const userId = "123";
      const page = 1;
      const limit = 10;
      const contacts = [{contactId: {_id: "contact1"}}];
      const stories = [
        {
          _id: "story1",
          userId: "contact1",
          mediaKey: "media123",
          viewers: {viewer1: {viewerId: "viewer1"}},
        },
      ];

      // Mock Mongoose populate chain
      const mockPopulate = jest.fn().mockResolvedValue({contacts});
      User.findById.mockReturnValue({populate: mockPopulate});

      Story.aggregate.mockResolvedValue([{_id: "contact1", stories}]);
      getBasicProfileInfo.mockResolvedValue({name: "Contact1"});
      generateSignedUrl.mockResolvedValue("signed-url");

      const result = await storyService.getStoriesOfContacts(
        userId,
        page,
        limit
      );

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(mockPopulate).toHaveBeenCalledWith("contacts.contactId");
      expect(Story.aggregate).toHaveBeenCalled();
      expect(getBasicProfileInfo).toHaveBeenCalledWith("contact1");
      expect(generateSignedUrl).toHaveBeenCalledWith("media123", 15 * 60);
      expect(result).toEqual([
        {
          _id: "contact1",
          stories: [
            {
              _id: "story1",
              userId: "contact1",
              media: "signed-url",
              viewers: {
                viewer1: {viewerId: "viewer1", profile: {name: "Contact1"}},
              },
            },
          ],
          profile: {name: "Contact1"},
        },
      ]);
    });
  }); // Closing the 'it' block for "getStoriesOfContacts"

  describe("deleteStoryById", () => {
    it("should delete a story by ID", async () => {
      const id = "123";
      Story.findByIdAndDelete.mockResolvedValue({_id: id});

      const result = await storyService.deleteStoryById(id);

      expect(Story.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual({_id: id});
    });
  });

  describe("updateStoryViewers", () => {
    it("should update story viewers", async () => {
      const storyId = "story1";
      const userId = "user1";
      const updatedStory = {
        _id: storyId,
        viewers: {[userId]: {viewedAt: new Date(), viewerId: userId}},
      };

      Story.findByIdAndUpdate.mockResolvedValue(updatedStory);

      const result = await storyService.updateStoryViewers(storyId, userId);

      expect(Story.findByIdAndUpdate).toHaveBeenCalledWith(
        storyId,
        {
          $set: {
            [`viewers.${userId}`]: {
              viewedAt: expect.any(Date),
              viewerId: userId,
            },
          },
        },
        {new: true, runValidators: true}
      );
      expect(result).toEqual(updatedStory);
    });
  });
});
