/* eslint-disable no-undef */
const groupSeeds = require("../seeds/groupSeeds");
const groupService = require("../services/groupService");
const messageService = require("../services/messageService");
const groupController = require("../controllers/group/groupController");
const AppError = require("../errors/appError");

jest.mock("../services/groupService");
jest.mock("../services/messageService");
jest.mock("../errors/appError");
jest.mock("../models/groupModel");

describe("GET Find Group by ID", () => {
  let res;
  let req;
  let next;
  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: {
        groupId: 1,
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("Should return 200 and the group", async () => {
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.findGroup(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {group: groupSeeds.group},
      message: "The group was retrieved successfully.",
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should return 404 if the group does not exist", async () => {
    groupService.findGroupById.mockResolvedValue(null);

    await groupController.findGroup(req, res, next);

    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });
});

describe("PATCH Add Admin Privileges", () => {
  let req;
  let res;
  let next;
  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      params: {
        groupId: "1",
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("add privileges successfully", async () => {
    req.params.userId = "2";
    req.body = {
      addNewAdmins: false,
      inviteUsersViaLink: false,
    };

    const group = JSON.parse(JSON.stringify(groupSeeds.group));

    group.save = jest.fn().mockResolvedValue();
    groupService.findGroupById.mockResolvedValue(group);

    await groupController.addAdmin(req, res, next);
    await expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The user has been successfully promoted to admin.",
      })
    );
  });

  test("Group not found", async () => {
    groupService.findGroupById.mockResolvedValue(null);
    await groupController.addAdmin(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("The user does not have permission to add new admin ", async () => {
    req.user.id = 5;
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.addAdmin(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Unauthorized Access.The user does not have the permission to add new admin.",
      403
    );
  });

  test("The user is not member of the group", async () => {
    req.params.userId = "5";
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.addAdmin(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "User not found. The user is not member of the group.",
      404
    );
  });

  test("The user is already an admin of the group", async () => {
    req.params.userId = 1;
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.addAdmin(req, res, next);
    expect(AppError).toHaveBeenCalledWith("The user is already an admin", 400);
  });
});

describe("DELETE Remove Admin Privileges Of User", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        userId: "1",
        groupId: "1",
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Remove admin successfully", async () => {
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.save = jest.fn().mockResolvedValue();
    groupService.findGroupById.mockResolvedValue(group);

    await groupController.removeAdmin(req, res, next);
    await expect(group.save).toHaveBeenCalled();

    await expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {
        group,
      },
      message:
        "The user was successfully removed from the admin list and added back to members.",
    });
  });

  test("Group not found", async () => {
    groupService.findGroupById.mockResolvedValue(null);
    await groupController.addAdmin(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("The user does not have permission to remove admin", async () => {
    req.user.id = "9";

    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.removeAdmin(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Unauthorized action. You do not have permission to demote an admin.",
      403
    );
  });

  test("The user not found in the admin list", async () => {
    req.params.userId = "6";

    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.removeAdmin(req, res, next);
    expect(AppError).toHaveBeenCalledWith("User not found in admin list", 404);
  });

  test("Insufficient permission to remove admin", async () => {
    req.user.id = "3";
    const group = {
      ownerId: "1",
      admins: [
        {adminId: "1", superAdminId: "1"},
        {adminId: "2", superAdminId: "1"},
        {adminId: "3", superAdminId: "2"},
      ],
    };

    groupService.findGroupById.mockResolvedValue(group);
    await groupController.removeAdmin(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Insufficient Permission.", 403);
  });
});

describe("PATCH Update Group Limit", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      params: {
        groupId: "1",
      },
      body: {
        groupSize: 1000,
      },
      user: {
        id: "1",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test("Update group size successfully", async () => {
    const {group} = groupSeeds;
    group.save = jest.fn().mockResolvedValue();

    groupService.findGroupById.mockResolvedValue(group);
    await groupController.updateGroupLimit(req, res, next);
    await expect(group.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {group},
      message: "The group size has been updated successfully.",
    });
  });

  test("Group not found", async () => {
    groupService.findGroupById.mockResolvedValue(null);
    await groupController.updateGroupLimit(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("You are not the owner", async () => {
    req.user.id = "5";
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.updateGroupLimit(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Insufficient permissions. Only the group owner can update the group size.",
      403
    );
  });

  test("The new size is not valid as group contain more members than the new value", async () => {
    req.body.groupSize = 1;

    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.updateGroupLimit(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "The new size of the group is not allowed. The group contains more members than the specified size.",
      400
    );
  });
});

describe("PATCH Update Group Type", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      params: {
        groupId: "1",
      },
      body: {
        groupSize: 1000,
      },
      user: {
        id: "1",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test("Update group type successfully", async () => {
    const {group} = groupSeeds;
    req.body.groupType = "Public";
    req.save = jest.fn().mockResolvedValue();
    groupService.findGroupById.mockResolvedValue(group);

    await groupController.updateGroupType(req, res, next);
    await expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      data: {group},
      message: "The group type has been updated successfully",
    });
  });

  test("Group not found", async () => {
    groupService.findGroupById.mockResolvedValue(null);
    await groupController.updateGroupType(req, res, next);

    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("You are not the owner", async () => {
    req.user.id = "5";
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);

    await groupController.updateGroupType(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Insufficient permissions. Only the group owner can update the group type.",
      403
    );
  });
});

describe("GET Retrieve Member List", () => {
  let req;
  let res;
  let next;
  let group;
  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        groupId: "1",
      },
      body: {
        groupSize: 1000,
      },
      user: {
        id: "1",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    group = JSON.parse(JSON.stringify(groupSeeds.populatedGroup));
  });

  test("retrieve list successfully (Admin send to the request)", async () => {
    const mockPopulateTwo = jest.fn().mockResolvedValue(group);
    const mockPopulateOne = jest.fn().mockReturnValue({
      populate: mockPopulateTwo,
    });
    groupService.findGroupById = jest.fn().mockReturnValue({
      populate: mockPopulateOne,
    });

    await groupController.membersList(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",

        message: "The list of members has been retrieved successfully.",
      })
    );
  });

  test("retrieve list successfully (Regular Member send to the request)", async () => {
    const mockPopulateTwo = jest.fn().mockResolvedValue(group);
    const mockPopulateOne = jest.fn().mockReturnValue({
      populate: mockPopulateTwo,
    });
    groupService.findGroupById = jest.fn().mockReturnValue({
      populate: mockPopulateOne,
    });

    req.user.id = "2";

    await groupController.membersList(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",

        message: "The list of members has been retrieved successfully.",
      })
    );
  });

  test("Group not found", async () => {
    const mockPopulateTwo = jest.fn().mockResolvedValue(null);
    const mockPopulateOne = jest.fn().mockReturnValue({
      populate: mockPopulateTwo,
    });
    groupService.findGroupById = jest.fn().mockReturnValue({
      populate: mockPopulateOne,
    });
    await groupController.membersList(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("Not authorized to get member list", async () => {
    req.user.id = 4;

    const mockPopulateTwo = jest.fn().mockResolvedValue(group);
    const mockPopulateOne = jest.fn().mockReturnValue({
      populate: mockPopulateTwo,
    });
    groupService.findGroupById = jest.fn().mockReturnValue({
      populate: mockPopulateOne,
    });
    await groupController.membersList(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      "Forbidden Action. You are not member of that group",
      403
    );
  });
});

describe("GET Retrieve Admin List", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        groupId: "1",
      },
      body: {
        groupSize: 1000,
      },
      user: {
        id: "1",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    group = JSON.parse(JSON.stringify(groupSeeds.populatedGroup));
  });

  test("Retrieve Admin List Successfully (Admin who send the request)", async () => {
    const populate = jest.fn().mockResolvedValue(group);
    groupService.findGroupById.mockReturnValue({
      populate,
    });
    await groupController.adminsList(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The list of admins has been retrieved successfully.",
      })
    );
  });

  test("Retrieve Admin List Successfully (Regular Member who send the request)", async () => {
    req.user.id = "2";
    const populate = jest.fn().mockResolvedValue(group);
    groupService.findGroupById.mockReturnValue({
      populate,
    });
    await groupController.adminsList(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The list of admins has been retrieved successfully.",
      })
    );
  });

  test("Group not found", async () => {
    const populate = jest.fn().mockResolvedValue(null);
    groupService.findGroupById.mockReturnValue({
      populate,
    });

    await groupController.adminsList(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("Not authorized to get member list", async () => {
    req.user.id = 4;
    const populate = jest.fn().mockResolvedValue(group);
    groupService.findGroupById.mockReturnValue({
      populate,
    });

    await groupController.adminsList(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      "Forbidden Action. You are not member of that group",
      403
    );
  });
});

describe("PATCH Mute Notification", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        groupId: "1",
      },
      body: {
        mute: true,
      },
      user: {
        id: "1",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  test("Mute or Unmute notification successfully", async () => {
    const {group} = groupSeeds;
    group.save = jest.fn().mockResolvedValue();

    groupService.findGroupById.mockResolvedValue(group);
    await groupController.muteNotification(req, res, next);

    await expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The member has updated his mute notification successfully.",
      })
    );
  });

  test("Group not found", async () => {
    groupService.findGroupById.mockResolvedValue(null);
    await groupController.muteNotification(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("You are not a member of the group", async () => {
    req.user.id = "5";
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.muteNotification(req, res, next);
    expect(AppError).toHaveBeenCalledWith("User not found in the group", 404);
  });
});

describe("PATCH Update Member Permission", () => {
  let req;
  let res;
  let next;
  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        groupId: "1",
        memberId: "2",
      },
      body: {
        sendMessages: true,
        sendMedia: {
          photos: false,
        },
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Update member permission successfully", async () => {
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.save = jest.fn().mockResolvedValue();

    groupService.findGroupById.mockResolvedValue(group);
    await groupController.updateMemberPermission(req, res, next);

    await expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The user's permissions have been updated successfully.",
      })
    );
  });

  test("Group not found", async () => {
    groupService.findGroupById.mockResolvedValue(null);
    await groupController.updateMemberPermission(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("Missing Permission to update member permission", async () => {
    req.user.id = "5";
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.updateMemberPermission(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Forbidden access. You do not have admin permissions to update member permissions.",
      403
    );
  });

  test("Member not found", async () => {
    req.params.memberId = "5";
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.updateMemberPermission(req, res, next);
    expect(AppError).toHaveBeenCalledWith("User not found in the group", 404);
  });
});

describe("PATCH Update Admin Permission", () => {
  let req;
  let res;
  let next;
  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        groupId: "1",
        adminId: "1",
      },
      body: {
        sendMessages: true,
        sendMedia: {
          photos: false,
        },
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Update admin permission successfully", async () => {
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.save = jest.fn().mockResolvedValue();

    groupService.findGroupById.mockResolvedValue(group);
    await groupController.updateAdminPermission(req, res, next);

    await expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The admin's permissions have been updated successfully.",
      })
    );
  });

  test("Group not found", async () => {
    groupService.findGroupById.mockResolvedValue(null);
    await groupController.updateAdminPermission(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("Missing Permission to update admin permission", async () => {
    req.user.id = "5";
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.updateAdminPermission(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Forbidden access. You don't have the permission to change the admin's permissions.",
      403
    );
  });

  test("Admin not found", async () => {
    req.params.adminId = "5";
    groupService.findGroupById.mockResolvedValue(groupSeeds.group);
    await groupController.updateAdminPermission(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Admin not found. The provided id is not an admin ID.",
      404
    );
  });
});

describe("PATCH Update Group Basic Info", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        groupId: "1",
      },
      body: {
        groupName: "New Group Name",
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Update group basic info successfully", async () => {
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.save = jest.fn().mockResolvedValue();

    groupService.findGroupById.mockResolvedValue(group);
    await groupController.updateGroupBasicInfo(req, res, next);

    await expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The group information has been updated successfully.",
      })
    );
  });

  test("Group not found", async () => {
    groupService.findGroupById.mockResolvedValue(null);
    await groupController.updateGroupBasicInfo(req, res, next);
    expect(AppError).toHaveBeenCalledWith("Group not found", 404);
  });

  test("Missing permission to update group info", async () => {
    req.user.id = "2";
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.groupPermissions.changeChatInfo = false;

    groupService.findGroupById.mockResolvedValue(group);
    await groupController.updateGroupBasicInfo(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Forbidden access. You do not have permission to change the group's information.",
      403
    );
  });

  test("User is not member of the group", async () => {
    req.user.id = "5";
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.groupPermissions.changeChatInfo = true;
    groupService.findGroupById.mockResolvedValue(group);
    await groupController.updateGroupBasicInfo(req, res, next);
    expect(AppError).toHaveBeenCalledWith("User not found in the group", 404);
  });

  test("Not authorized to update group info", async () => {
    req.user.id = "2";
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.groupPermissions.changeChatInfo = true;

    groupService.findGroupById.mockResolvedValue(group);
    await groupController.updateGroupBasicInfo(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Forbidden access. You do not have permission to change the group's information.",
      403
    );
  });
});

describe("GET Download Media", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      params: {
        groupId: "1",
        messageId: "1",
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("admin is allowed to download media ", async () => {
    req.userType = "admin";
    req.userIndex = 0;

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    req.group = group;

    messageService.findMessage.mockResolvedValue(message);
    await groupController.downloadMedia(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
      })
    );
  });

  test("Regular Member is allowed to download media ", async () => {
    req.userType = "member";
    req.userIndex = 0;
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    req.group = group;

    messageService.findMessage.mockResolvedValue(message);
    await groupController.downloadMedia(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
      })
    );
  });

  test("The user is not member of the group", async () => {
    await groupController.downloadMedia(req, res, next);
    expect(AppError).toHaveBeenCalledWith("User not found in the group", 404);
  });

  test("The message is not found", async () => {
    req.userType = "admin";
    req.userIndex = 0;

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    messageService.findMessage.mockResolvedValue(null);
    await groupController.downloadMedia(req, res, next);

    expect(AppError).toHaveBeenCalledWith("Message not found", 404);
  });

  test("The required message does not belong to the group", async () => {
    req.userType = "admin";
    req.userIndex = 0;

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    message.chatId = "2";

    messageService.findMessage.mockResolvedValue(message);
    await groupController.downloadMedia(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      "Message not found in the group",
      404
    );
  });

  test("The message type is not media", async () => {
    req.userType = "admin";
    req.userIndex = 0;

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    message.mediaUrl = null;

    messageService.findMessage.mockResolvedValue(message);
    await groupController.downloadMedia(req, res, next);

    expect(AppError).toHaveBeenCalledWith("Media not found", 404);
  });

  test("The member does not have permission to download video media", async () => {
    req.userType = "member";
    req.userIndex = 0;

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.members[0].permissions.downloadVideos = false;
    req.group = group;

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    message.messageType = "video";

    messageService.findMessage.mockResolvedValue(message);
    await groupController.downloadMedia(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      `You don't have permission to download video media`,
      403
    );
  });

  test("The member does not have permission to download audio media", async () => {
    req.userType = "member";
    req.userIndex = 0;

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.members[0].permissions.downloadVoiceMessages = false;
    req.group = group;

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    message.messageType = "audio";

    messageService.findMessage.mockResolvedValue(message);
    await groupController.downloadMedia(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      `You don't have permission to download audio media`,
      403
    );
  });

  test("The group permission to download video media is disabled", async () => {
    req.userType = "member";
    req.userIndex = 0;

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.groupPermissions.downloadVideos = false;
    req.group = group;

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    message.messageType = "video";

    messageService.findMessage.mockResolvedValue(message);
    await groupController.downloadMedia(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      `You don't have permission to download video media`,
      403
    );
  });

  test("The group permission to download audio media is disabled", async () => {
    req.userType = "member";
    req.userIndex = 0;

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.groupPermissions.downloadVoiceMessages = false;
    req.group = group;

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    message.messageType = "audio";

    messageService.findMessage.mockResolvedValue(message);
    await groupController.downloadMedia(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      `You don't have permission to download audio media`,
      403
    );
  });
});

describe("PATCH Update Group Permission", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        groupId: "1",
      },
      body: {
        sendMessages: true,
        sendMedia: {
          photos: false,
        },
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Update group permission successfully", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.save = jest.fn().mockResolvedValue();
    req.group = group;

    await groupController.updateGroupPermission(req, res, next);

    await expect(group.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The group permissions have been updated successfully.",
      })
    );
  });

  test("User is not the admin in the group", async () => {
    req.userIndex = 0;
    req.userType = "member";

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    await groupController.updateGroupPermission(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      "Forbidden access. You do not have permission to change the group's permissions.",
      403
    );
  });
});

describe("GET Retrieve Group Permissions", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();

    req = {
      params: {
        groupId: "1",
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Retrieve group permissions successfully", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    await groupController.getGroupPermissions(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
      })
    );
  });

  test("User is not the admin in the group", async () => {
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    await groupController.getGroupPermissions(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "You are not member of the group",
      404
    );
  });
});

describe("GET Retrieve User Info", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      params: {
        groupId: "1",
        messageId: "1",
      },
      user: {
        id: "1",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Retrieve user info successfully (Admin Data)", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    await groupController.getUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
      })
    );
  });

  test("Retrieve user info successfully (Regular Member Data)", async () => {
    req.userIndex = 0;
    req.userType = "member";

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    await groupController.getUserInfo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
      })
    );
  });

  test("The user is not member of the group", async () => {
    await groupController.getUserInfo(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "You are not member of the group",
      404
    );
  });
});

describe("GET The Admin retrieve another member permission", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.resetAllMocks();
    req = {
      params: {
        groupId: "1",
        messageId: "1",
      },
      user: {
        id: "2",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Retrieve member permission successfully", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    await groupController.getMemberPermission(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The member's permissions have been retrieved successfully.",
      })
    );
  });

  test("The user who send the request is not admin of the group", async () => {
    await groupController.getMemberPermission(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "You are not admin of the group",
      404
    );
  });

  test("The user whose permission will be retrieved is not member of the group", async () => {
    req.userIndex = 0;
    req.userType = "admin";
    req.params.userId = "5";
    const group = JSON.parse(JSON.stringify(groupSeeds.group));
    req.group = group;

    await groupController.getMemberPermission(req, res, next);
    expect(AppError).toHaveBeenCalledWith("User not found in the group", 404);
  });
});

describe("PATCH Pin Message", () => {
  let req;
  let res;
  let next;
  let group;

  beforeEach(() => {
    jest.resetAllMocks();
    group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.save = jest.fn().mockResolvedValue();
    req = {
      params: {
        groupId: "1",
        messageId: "1",
      },
      user: {
        id: "1",
      },
      group,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Pin message successfully", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    messageService.findMessage.mockResolvedValue(message);
    await groupController.pinMessage(req, res, next);

    await expect(group.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The message has been pinned successfully.",
      })
    );
  });

  test("The user who send the request is not admin of the group", async () => {
    await groupController.pinMessage(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Forbidden access. You do not have permission to pin a message.",
      403
    );
  });

  test("The message is not found", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    messageService.findMessage.mockResolvedValue(null);
    await groupController.pinMessage(req, res, next);

    expect(AppError).toHaveBeenCalledWith("Message not found", 404);
  });

  test("The user does not have the permission to pin a message", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    group.admins[0].permissions.pinMessages = false;

    await groupController.pinMessage(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      "You don't have permission to pin a message",
      403
    );
  });

  test("The message is already pinned", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    group.pinnedMessages.push(message._id);

    messageService.findMessage.mockResolvedValue(message);
    await groupController.pinMessage(req, res, next);

    expect(AppError).toHaveBeenCalledWith("Message is already pinned", 400);
  });

  test("No capacity to pin more messages", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    group.pinnedMessages.push("10");
    group.pinnedMessages.push("2");
    group.pinnedMessages.push("3");
    group.pinnedMessages.push("4");
    group.pinnedMessages.push("5");

    const message = JSON.parse(JSON.stringify(groupSeeds.message));
    messageService.findMessage.mockResolvedValue(message);
    await groupController.pinMessage(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      "You can't pin more than 5 messages",
      400
    );
  });
});

describe("PATCH Unpin Message", () => {
  let req;
  let res;
  let next;
  let group;
  let message;
  beforeEach(() => {
    jest.resetAllMocks();
    message = JSON.parse(JSON.stringify(groupSeeds.message));
    group = JSON.parse(JSON.stringify(groupSeeds.group));
    group.pinnedMessages.push(message._id);
    group.save = jest.fn().mockResolvedValue();
    req = {
      params: {
        groupId: "1",
        messageId: "1",
      },
      user: {
        id: "1",
      },
      group,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test("Unpin Message Successfully", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    await groupController.unpinMessage(req, res, next);

    await expect(group.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        message: "The message has been unpinned successfully.",
      })
    );
  });

  test("The user who send the request is not admin of the group", async () => {
    await groupController.unpinMessage(req, res, next);
    expect(AppError).toHaveBeenCalledWith(
      "Forbidden access. You do not have permission to pin a message.",
      403
    );
  });

  test("The user does not have the permission to pin a message", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    group.admins[0].permissions.pinMessages = false;

    await groupController.unpinMessage(req, res, next);

    expect(AppError).toHaveBeenCalledWith(
      "You don't have permission to unpin a message",
      403
    );
  });

  test("The message is already pinned", async () => {
    req.userIndex = 0;
    req.userType = "admin";

    group.pinnedMessages.pop();

    messageService.findMessage.mockResolvedValue(message);
    await groupController.unpinMessage(req, res, next);

    expect(AppError).toHaveBeenCalledWith("Message is not pinned", 400);
  });
});
