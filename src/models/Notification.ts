import mongoose, { Document, Schema, Model } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Schema.Types.ObjectId;
  message: string;
  read: boolean;
  link?: string; 
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: true, 
  }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
