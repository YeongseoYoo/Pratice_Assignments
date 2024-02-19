import fs from "fs/promises";
import axios from "axios";
import mongoose from "mongoose";
import Campaign from "./Campaign.js"; // Assuming Campaign is exported as default from Campaign.js
import Comment from "./Comment.js";

async function fetchFunding(campaignId) {
  try {
    const commentList = [];
    const baseUrl = `https://www.wadiz.kr/web/reward/api/comments/campaigns/${campaignId}`;
    const params = {
      page: 0,
      size: 20,
      commentGroupType: "CAMPAIGN",
      rewardCommentType: "",
    };
    const response = await axios.get(baseUrl, { params });

    const data = response.data;
    const comments = data.data.content;

    // Get the ObjectId of the campaign
    const campaign = await Campaign.findOne({ campaignId: campaignId });
    const campaignIdString = campaign.campaignId; // Retrieve campaignId as string

    for (const comment of comments) {
      const { body, commentType, nickName, whenCreated, commentReplys, depth } =
        comment;

      const formattedReplies = [];
      for (const reply of commentReplys) {
        const { body, commonId, commentType, nickName, whenCreated } = reply;
        formattedReplies.push({
          body,
          Campaign: commonId,
          commentType,
          userNickname: nickName,
          whenCreated,
        });
      }

      commentList.push({
        body,
        // Use campaignId as string
        Campaign: campaignId,
        commentType,
        userNickname: nickName,
        whenCreated,
        commentReplys: formattedReplies,
        depth,
      });
    }

    return commentList;
  } catch (error) {
    console.error("Error fetching funding:", error);
    return [];
  }
}

async function fetchAndSaveAllFundingComments() {
  try {
    const allCommentList = [];

    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://admin:admin1234@yscluster.y1tyjoy.mongodb.net/wadiz",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB.");

    // Campaign 모델 정의
    const CampaignModel = mongoose.model("Campaign");

    // 모든 캠페인 가져오기
    const campaigns = await CampaignModel.find();

    // 각 캠페인에 대한 댓글 가져오기
    for (const campaign of campaigns) {
      const campaignId = campaign.campaignId;
      console.log(`Fetching comments for campaign: ${campaignId}`);
      const commentList = await fetchFunding(campaignId);
      allCommentList.push(...commentList);
    }

    // Save all comments to JSON file
    await fs.writeFile(
      "fetched_Comment.json",
      JSON.stringify(allCommentList, null, 2)
    );
    console.log("Data saved to JSON file.");

    // Save all comments to MongoDB
    await Comment.insertMany(allCommentList);
    console.log("Data saved to MongoDB.");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");

    return allCommentList;
  } catch (error) {
    console.error("Error fetching and saving funding comments:", error);
    return [];
  }
}

// Fetch and save all funding comments
fetchAndSaveAllFundingComments();
