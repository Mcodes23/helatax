import Notification from "../../models/Notification.js";

// @desc    Get user notifications
// @route   GET /api/v1/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(10); // Limit to last 10 to keep it fast

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a notification (Internal Helper)
export const createNotification = async (userId, message, type = "INFO") => {
  try {
    await Notification.create({ user: userId, message, type });
  } catch (error) {
    console.error("Notification Error:", error);
  }
};
