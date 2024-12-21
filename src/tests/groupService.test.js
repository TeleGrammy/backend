/* eslint-disable no-undef */
const groupService = require("../services/groupService");
const Group = require("../models/groupModel");

jest.mock("../models/groupModel");

describe("Create Group", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should create a group", async () => {
    const newGroup = {
      name: "Group Name",
      image: "Group Image",
      ownerId: "Owner Id",
    };
    const result = {
      ...newGroup,
      admins: [
        {
          adminId: newGroup.ownerId,
          joinedAt: expect.any(Number),
          customTitle: "Owner",
          superAdminId: newGroup.ownerId,
          permissions: {
            postStories: false,
            editStories: false,
            deleteStories: false,
            remainAnonymous: false,
          },
        },
      ],
    };

    Group.create.mockReturnValue(result);

    const group = await groupService.createGroup(
      newGroup.name,
      newGroup.image,
      newGroup.ownerId
    );

    expect(group).toMatchObject(result);
  });
});

describe("Delete Group", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should delete a group", async () => {
    const filter = {_id: "Group Id"};
    Group.deleteOne.mockReturnValue({deletedCount: 1});

    const result = await groupService.deleteGroup(filter);

    expect(result).toEqual({deletedCount: 1});
  });
});

describe("Find Group By Id", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should find a group by id", async () => {
    const groupId = "Group Id";
    const group = {name: "Group Name"};

    Group.findById.mockReturnValue(group);

    const result = await groupService.findGroupById(groupId);

    expect(result).toEqual(group);
  });
});

describe("Find And Update Group", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should find and update a group", async () => {
    const groupId = "Group Id";
    const newData = {name: "New Name"};
    const options = {new: true};
    const group = {name: "Group Name"};

    Group.findByIdAndUpdate.mockReturnValue(group);

    const result = await groupService.findAndUpdateGroup(
      groupId,
      newData,
      options
    );

    expect(result).toEqual(group);
  });
});

describe("Update Participant", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should update a participant", async () => {
    const groupId = "Group Id";
    const arrayField = "admins";
    const userField = "admins._id";
    const userFilter = "Admin Id";
    const newData = {customTitle: "Admin"};
    const options = {new: true};
    const user = {customTitle: "Owner"};

    Group.findByIdAndUpdate.mockReturnValue(user);

    const result = await groupService.updateParticipant(
      groupId,
      arrayField,
      userField,
      userFilter,
      newData,
      options
    );

    expect(result).toEqual(user);
  });
});

describe("Find Group", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should find a group Without populatedOptions", async () => {
    const filter = {name: "Group Name"};
    const group = {name: "Group Name"};

    Group.findOne.mockReturnValue(group);

    const result = await groupService.findGroup(filter);

    expect(result).toEqual(group);
  });

  test("Should find a group With populatedOptions", async () => {
    const filter = {name: "Group Name"};
    const populateOptions = {path: "admins"};
    const group = {name: "Group Name"};

    const populateOne = jest.fn().mockReturnValue(group);
    Group.findOne.mockReturnValue({populate: populateOne});

    const result = await groupService.findGroup(filter, populateOptions);

    expect(result).toEqual(group);
  });
});
