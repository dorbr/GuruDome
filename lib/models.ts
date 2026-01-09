import mongoose, { Schema, model, models } from 'mongoose';

// User Schema (Synced with Firebase)
const UserSchema = new Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String },
    photoURL: { type: String },
    createdAt: { type: Date, default: Date.now },
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
    isScam: { type: Boolean, default: false },
    isPurchased: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite upon recompilation
if (process.env.NODE_ENV === 'development' && models.Review) {
    delete models.Review;
    delete models.Guru;
    delete models.User;
}

const User = models.User || model('User', UserSchema);
const Guru = models.Guru || model('Guru', GuruSchema);
const Review = models.Review || model('Review', ReviewSchema);

export { User, Guru, Review };
