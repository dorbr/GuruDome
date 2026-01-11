import mongoose, { Schema, model, models } from 'mongoose';

// User Schema (Synced with Firebase)
const UserSchema = new Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date },
    bannedReason: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Guru Schema
const GuruSchema = new Schema({
    instagramUrl: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profileImage: { type: String }, // URL of the scraped profile image
    bio: { type: String },
    category: { type: String },
    socialHandles: {
        twitter: { type: String },
        youtube: { type: String },
        tiktok: { type: String },
        website: { type: String },
    },
    ratingStats: {
        averageRating: { type: Number, default: 0 },
        totalReviews: { type: Number, default: 0 },
        ratingDistribution: {
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 },
        }
    },
    performanceMetrics: {
        trustworthiness: { type: Number, default: 0 }, // 0-5
        valueForMoney: { type: Number, default: 0 },   // 0-5
        authenticity: { type: Number, default: 0 },    // 0-5
    },
    aiSummary: {
        summary: { type: String }, // General summary of reviews
        backgroundCheck: { type: String }, // Potential red flags / scam warnings
        lastUpdated: { type: Date },
    },
    performanceHistory: [{
        date: { type: Date, default: Date.now },
        totalReviews: { type: Number },
        averageRating: { type: Number },
        trustworthiness: { type: Number },
        valueForMoney: { type: Number },
        authenticity: { type: Number },
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Review Schema
const ReviewSchema = new Schema({
    userId: { type: String, required: true }, // Using Firebase UID for simplicity, or could be ObjectId ref
    guruId: { type: Schema.Types.ObjectId, ref: 'Guru', required: true },
    title: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String },
    detailedRatings: {
        trustworthiness: { type: Number, min: 1, max: 5 },
        valueForMoney: { type: Number, min: 1, max: 5 },
        authenticity: { type: Number, min: 1, max: 5 },
    },
    aiAnalysis: {
        isFake: { type: Boolean },
        confidence: { type: Number }, // 0-100
        reasoning: { type: String },
        analyzedAt: { type: Date }
    },
    isScam: { type: Boolean, default: false },
    isPurchased: { type: Boolean, default: false },
    // Moderation fields
    isHidden: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

// Review Report Schema - for tracking reported reviews
const ReviewReportSchema = new Schema({
    reviewId: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
    reporterId: { type: String, required: true }, // Firebase UID
    reason: {
        type: String,
        enum: ['false_information', 'offensive_content', 'spam', 'other'],
        required: true
    },
    description: { type: String },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed', 'removed'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
});

// Bug Report Schema - for tracking application bugs
const BugReportSchema = new Schema({
    reporterId: { type: String }, // Optional, logged-in user ID
    description: { type: String, required: true },
    screenshotUrl: { type: String }, // Optional screenshot URL
    pageUrl: { type: String }, // Page where the bug was reported
    userAgent: { type: String }, // Browser info
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite upon recompilation
if (process.env.NODE_ENV === 'development' && models.Review) {
    delete models.Review;
    delete models.Guru;
    delete models.User;
    delete models.ReviewReport;
    delete models.BugReport;
}

const User = models.User || model('User', UserSchema);
const Guru = models.Guru || model('Guru', GuruSchema);
const Review = models.Review || model('Review', ReviewSchema);
const ReviewReport = models.ReviewReport || model('ReviewReport', ReviewReportSchema);
const BugReport = models.BugReport || model('BugReport', BugReportSchema);

export { User, Guru, Review, ReviewReport, BugReport };
