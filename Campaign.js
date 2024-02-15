import mongoose from 'mongoose';

// Define schema
const campaignSchema = new mongoose.Schema({
    categoryName: String,
    campaignId: String,
    title: String,
    totalBackedAmount: Number,
    photoUrl: String,
    nickName: String,
    coreMessage: String,
    whenOpen: String,
    achievementRate: Number
});

// Define model
const Campaign = mongoose.model("Campaign", campaignSchema);

export default Campaign;
