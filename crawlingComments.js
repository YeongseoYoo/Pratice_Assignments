import fs from "fs/promises";
import axios from "axios";
import mongoose from "mongoose";
import Campaign from "./Campaign.js"; // Assuming Campaign is exported as default from Campaign.js
import Comment from "./Comment.js";

async function fetchFunding(campaignId) {
  try {
    const productList = [];
    const baseUrl = `https://www.wadiz.kr/web/reward/api/comments/campaigns/${campaignId}`;
    const params = {
      page: 0,
      size: 10,
      commentGroupType: "CAMPAIGN",
      rewardCommentType: "",
    };
    const response = await axios.get(baseUrl, { params });

    const data = response.data;
    const comments = data.data.content;

    // Get the ObjectId of the campaign
    const campaign = await Campaign.findOne({ campaignId: campaignId });
    const campaignObjectId = campaign._id;

    comments.forEach((funding) => {
      const body = funding.body;
      const commentType = funding.commentType;
      const nickName = funding.nickName;
      const whenCreated = funding.whenCreated;
      const commentReplys = funding.commentReplys; // Keep as array
      const depth = funding.depth;

      productList.push({
        body,
        campaignId: campaignObjectId,
        commentType,
        nickName,
        whenCreated,
        commentReplys,
        depth,
      });
    });

    return productList;
  } catch (error) {
    console.error("Error fetching funding:", error);
    return [];
  }
}

async function fetchAndSaveAllFundingComments() {
  try {
    const allProductList = [];

    // Connect to MongoDB
    await mongoose.connect(
      "mongodb+srv://admin:admin1234@yscluster.y1tyjoy.mongodb.net/wadiz",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("Connected to MongoDB.");

    // 캠페인 모델 정의
    const CampaignModel = mongoose.model("Campaign");

    // 모든 캠페인 가져오기
    const campaigns = await CampaignModel.find();

    // 각 캠페인에 대한 댓글 가져오기
    for (const campaign of campaigns) {
      const campaignId = campaign.campaignId;
      console.log(`Fetching comments for campaign: ${campaignId}`);
      const productList = await fetchFunding(campaignId);
      allProductList.push(...productList);
    }

    // Save all comments to JSON file
    await fs.writeFile(
      "fetched_Comment.json",
      JSON.stringify(allProductList, null, 2)
    );
    console.log("Data saved to JSON file.");

    // Save all comments to MongoDB
    await Comment.insertMany(allProductList);
    console.log("Data saved to MongoDB.");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");

    return allProductList;
  } catch (error) {
    console.error("Error fetching and saving funding comments:", error);
    return [];
  }
}

// Fetch and save all funding comments
fetchAndSaveAllFundingComments();
