const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "The user id is required"],
  },
  joinedAt: {
    type: Date,
    default: Date.now(),
  },
  leftAt: {
    type: Date,
    default: null,
  },
  mute: {
    type: Boolean,
    default: false,
  },
  muteUntil: {
    type: Date,
    default: null,
  },
  permissions: {
    sendMessages: {
      type: Boolean,
      default: true,
    },
    sendMedia: {
      photos: {
        type: Boolean,
        default: true,
      },
      videos: {
        type: Boolean,
        default: true,
      },
      files: {
        type: Boolean,
        default: true,
      },
      music: {
        type: Boolean,
        default: true,
      },
      voiceMessages: {
        type: Boolean,
        default: true,
      },
      videoMessages: {
        type: Boolean,
        default: true,
      },
      stickers: {
        type: Boolean,
        default: true,
      },
      polls: {
        type: Boolean,
        default: true,
      },
      embedLinks: {
        type: Boolean,
        default: true,
      },
    },
    addUsers: {
      type: Boolean,
      default: true,
    },
    pinMessages: {
      type: Boolean,
      default: true,
    },
    changeChatInfo: {
      type: Boolean,
      default: true,
    },
  },
});

const adminSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "The user id is required"],
  },
  joinedAt: {
    type: Date,
  },
  leftAt: {
    type: Date,
    default: null,
  },
  adminAt: {
    type: Date,
    default: Date.now(),
  },
  superAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  mute: {
    type: Boolean,
    default: false,
  },
  muteUntil: {
    type: Date,
    default: null,
  },
  customTitle: {
    type: String,
    default: "Admin",
  },
  permissions: {
    changeGroupInfo: {
      type: Boolean,
      default: true,
    },
    deleteMessages: {
      type: Boolean,
      default: true,
    },
    banUsers: {
      type: Boolean,
      default: true,
    },
    addUsers: {
      type: Boolean,
      default: true,
    },
    inviteUsersViaLink: {
      type: Boolean,
      default: true,
    },
    pinMessages: {
      type: Boolean,
      default: true,
    },
    postStories: {
      type: Boolean,
      default: true,
    },
    editStories: {
      type: Boolean,
      default: true,
    },
    deleteStories: {
      type: Boolean,
      default: true,
    },
    manageLiveStreams: {
      type: Boolean,
      default: true,
    },
    addNewAdmins: {
      type: Boolean,
      default: true,
    },
    remainAnonymous: {
      type: Boolean,
      default: true,
    },
  },
});

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The group name is required..."],
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  groupType: {
    type: String,
    enum: ["Public", "Private"],
    default: "Private",
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "The owner id is required."],
  },
  groupPermission: {
    sendTextMessages: {
      type: Boolean,
      default: true,
    },
    sendMedia: {
      type: {
        photos: {
          type: Boolean,
          default: true,
        },
        videos: {
          type: Boolean,
          default: true,
        },
        files: {
          type: Boolean,
          default: true,
        },
        music: {
          type: Boolean,
          default: true,
        },
        voiceMessages: {
          type: Boolean,
          default: true,
        },
        videoMessages: {
          type: Boolean,
          default: true,
        },
        stickers: {
          type: Boolean,
          default: true,
        },
        polls: {
          type: Boolean,
          default: true,
        },
        embedLinks: {
          type: Boolean,
          default: true,
        },
      },
    },
    addUsers: {
      type: Boolean,
      default: true,
    },
    pinMessages: {
      type: Boolean,
      default: true,
    },
    changeChatInfo: {
      type: Boolean,
      default: true,
    },
  },
  groupSizeLimit: {
    type: Number,
    default: 200000,
  },
  members: {
    type: [memberSchema],
  },
  admins: {
    type: [adminSchema],
  },
  leftMembers: [
    {
      memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: [true, "The user is already admin of the group."],
      },
      leftAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
});

const Group = mongoose.model("Group", groupSchema);
const GroupAdmin = mongoose.model("GroupAdmin", adminSchema);
const GroupMember = mongoose.model("GroupMember", memberSchema);

module.exports = {
  Group,
  GroupAdmin,
  GroupMember,
};