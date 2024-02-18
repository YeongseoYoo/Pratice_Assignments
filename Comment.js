import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  body: String,
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Campaign",
  },
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
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
