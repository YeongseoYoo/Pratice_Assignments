import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  body: String,
  campaign_ObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
    field: "campaignId",
  },
  campaignId: String,
  commentType: String,
  nickName: String,
  whenCreated: Date,
  commentReplys: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  depth: Number,
  // Add field for storing replies to this comment
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
