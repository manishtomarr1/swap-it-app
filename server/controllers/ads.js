import User from "../modals/user.js";
import { nanoid } from "nanoid";
import Ad from "../modals/ad.js";
import * as config from "../config.js";
import slugify from "slugify";
import { ObjectId } from "mongoose";

export const create = async (req, res) => {
  try {
    console.log(req.body, "data come");
    console.log(req.body.imageUrls[0].Location, "photosssssss");
    let photos = [];
    // Check if req.body.imageUrls is defined and is an array
    if (Array.isArray(req.body.imageUrls) && req.body.imageUrls.length > 0) {
      photos = req.body.imageUrls.map((photo) => String(photo.Location)); // Use map on req.body.imageUrls
    } else {
      // Handle the case when imageUrls is not an array or is empty
      console.log("No image URLs provided in the request.");
      // You can choose to return an error response or handle it as needed.
      // For example:
      return res
        .status(400)
        .json({ error: "No image URLs provided in the request." });
    }
    const userLongitude = req.body.userLongitude;
    const userLatitude = req.body.userLatitude;

    const adData = {
      photos,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      importantFor: req.body.itemFor,
      buyAt: req.body.buyAtDate,
      preferItemsForSwapping: req.body.swappingItems,
      location: {
        type: "Point",
        coordinates: [userLatitude, userLongitude],
      },
      slug: slugify(nanoid(6)),
      postedBy: req.body.user_id, // Assuming 'user_id' is provided in the request
      city: req.body.location,
    };

    console.log(adData, "??????????????????????????");

    const ad = new Ad(adData);
    await ad.save();

    // Make user role seller
    const user = await User.findByIdAndUpdate(
      req.body.user_id, // Assuming 'user_id' is provided in the request
      {
        // Add code to update user role if needed
      },
      { new: true }
    );

    res.json({
      ad,
      user,
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong. Try again..." });
  }
};

export const uploadImages = async (req, res) => {
  try {
    console.log(">>>>>>>>>>>>>>>api hit>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log(req.body);
    const { image } = req.body;
    const base64Image = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];

    //image params

    const params = {
      //* params we nee dto upload to s3
      Bucket: "swapitbucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Image,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };
    config.S_3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
        console.log(data);
        res.send(data);
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "upload failed! try again." });
  }
};
export const userAds = async (req, res) => {
  console.log("api hit<<<<<<<<<<<<<<<<<<<<<<<<<<<userAds");
  try {
    const { user_id } = req.query; // Retrieve user_id from query parameters

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required." });
    }

    // Find all ads posted by the user with the given user_id
    const userAds = await Ad.find({ postedBy: user_id });

    res.json(userAds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Try again..." });
  }
};

export const recentAds = async (req, res) => {
  try {
    const newestAds = await Ad.find({})
      .sort({ createdAt: -1 })
      .limit(4)
      .populate({
        path: "postedBy",
        select: "name profilePicture",
      });

    res.json(newestAds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const highlyEnquired = async (req, res) => {
  try {
    // Find the top 4 ads based on totalEnquiry in descending order
    const top4Ads = await Ad.find()
      .sort({ totalEnquiry: -1 })
      .limit(4)
      .populate("postedBy");

    res.json(top4Ads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve top ads" });
  }
};

export const highleyRated = async (req, res) => {
  try {
    // Find the top 4 ads based on rating in descending order
    const top4RatedAds = await Ad.find()
      .sort({ totalRating: -1 }) // Sort by rating in descending order
      .limit(4)
      .populate("postedBy");

    res.json(top4RatedAds);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve top rated ads" });
  }
};

export const addToWishlist = async (req, res) => {
  console.log("userId:", req.body.userId); // Add this line for debugging

  try {
    const user = await User.findByIdAndUpdate(
      req.body.userId,
      {
        $addToSet: { wishlist: req.body.adId }, //*this is avoid duplicate id
      },
      { new: true }
    );

    if (!user) {
      console.log("User not found"); // Add this line for debugging
      return res.status(404).json({ error: "User not found" });
    }

    const { ...rest } = user._doc;
    res.json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteFromWishlist = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.userId,
      {
        $pull: { wishlist: req.body.adId },
      },
      { new: true }
    );
    const { ...rest } = user._doc;
    res.json(rest);
  } catch (err) {
    console.log(err);
  }
};

export const wishlist = async (req, res) => {
  try {
    const userId = req.query.userId;
    const user = await User.findById(userId);
    const ads = await Ad.find({ _id: user.wishlist })
      .sort({
        createdAt: -1,
      })
      .populate("postedBy");
    res.json(ads);
  } catch (err) {
    console.log(err);
  }
};

export const adDetails = async (req, res) => {
  try {
    const ad = await Ad.findOne({ slug: req.params.slug }).populate(
      "postedBy",
      "name username email phone location profilePicture city"
    );

    let relatedAds = [];

    relatedAds = await Ad.find({
      _id: { $ne: ad._id },
      city: ad.city,
    }).populate(
      "postedBy",
      "name username email phone location profilePicture city"
    );

    if (relatedAds.length === 0) {
      relatedAds = await Ad.find({
        _id: { $ne: ad._id },
        category: ad.category,
      }).populate(
        "postedBy",
        "name username email phone location profilePicture city"
      );
    }

    if (relatedAds.length === 0) {
      relatedAds = await Ad.find({
        _id: { $ne: ad._id },
        importantFor: ad.importantFor,
      }).populate(
        "postedBy",
        "name username email phone location profilePicture city"
      );
    }

    res.json({ ad, related: relatedAds });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "An error occurred" });
  }
};

export const addToEnquried = async (req, res) => {
  console.log("userId:", req.body.userId); // Add this line for debugging

  try {
    const user = await User.findByIdAndUpdate(
      req.body.userId,
      {
        $addToSet: { enquriedAds: req.body.adId },
      },
      { new: true }
    );

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const { ...rest } = user._doc;
    res.json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const enquiredAds = async (req, res) => {
  console.log(req.query.userId);
  try {
    const user = await User.findById(req.query.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const ads = await Ad.find({ _id: user.enquriedAds })
      .sort({
        createdAt: -1,
      })
      .populate("postedBy");
    res.json(ads);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  console.log(req.body);
  try {
    const { senderId, receiverId, content, wishlist } = req.body;

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    sender.messages.push({ sender: senderId, receiver: receiverId, content });
    receiver.messages.push({ sender: senderId, receiver: receiverId, content });

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { currentUserId } = req.params;

    const userMessages = await User.findById(
      currentUserId,
      "messages"
    ).populate("messages.sender messages.receiver");

    const relevantMessages = userMessages.messages
      .filter((message) => {
        return (
          message.sender._id.toString() === currentUserId ||
          message.receiver._id.toString() === currentUserId
        );
      })
      .map((message) => {
        const otherUser =
          message.sender._id.toString() === currentUserId
            ? message.receiver.toObject()
            : message.sender.toObject();

        return {
          ...message.toObject(),
          user: otherUser,
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);

    res.status(200).json(relevantMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendSwapRequest = async (req, res) => {
  try {
    const { senderUserId, receiverUserId, adId, senderAdId } = req.body;

    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    const senderAd = await Ad.findById(senderAdId);
    if (!senderAd) {
      return res.status(404).json({ message: "Sender Ad not found" });
    }

    const notification = {
      sender: senderUserId,
      inquiryAd: adId,
      senderAd: senderAdId,
      timestamp: new Date(),
    };

    const receiverUser = await User.findByIdAndUpdate(receiverUserId, {
      $push: { notifications: notification },
    });

    res.status(200).json({ message: "Swap request sent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSwapRequest = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate(
      "notifications.sender notifications.inquiryAd notifications.senderAd"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = user.notifications[0];

    if (notification === "") {
      return res.status(200).json({ message: "No Notifications for the user" });
    }

    if (notification.content) {
      console.log(notification, "notification");
      const content = {};
      content.content = notification.content;
      content.timestamp = notification.timestamp; // Convert to Date object if needed
      res.status(200).json(content);
    } else {
      console.log(notification, "noooototottoottotoototto");
      const senderAd = await Ad.findById(notification.senderAd).populate(
        "postedBy"
      );

      const swapInfo = {
        senderName: notification.sender.name,
        senderAdName: notification.inquiryAd
          ? notification.inquiryAd.name
          : "N/A",
        receiverName: user.name,
        receiverAdName: notification.senderAd.title,
        senderAdDetails: notification.inquiryAd,
        timestamp: notification.timestamp,
      };

      res.status(200).json(swapInfo);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const confirmNotification = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (user.notifications.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    const notification = user.notifications[0];
    console.log(notification, "notification");

    const senderId = notification.sender;

    const sender = await User.findById(senderId);

    const updatedContent = `${user.name} accept your swapping request.`;

    const senderNotification = {
      sender: null,
      inquiryAd: null,
      senderAd: null,
      content: updatedContent,
      timestamp: Date.now(),
    };

    sender.notifications[0] = senderNotification;

    const inquiryAdId = notification.inquiryAd;
    const senderAdId = notification.senderAd;

    await Ad.findByIdAndUpdate(inquiryAdId, { isSold: true });
    await Ad.findByIdAndUpdate(senderAdId, { isSold: true });

    user.notifications.shift();

    await user.save();
    await sender.save();

    return res.json({ message: "Notification confirmed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const declineNotification = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (user.notifications.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    const notification = user.notifications[0];

    const senderId = notification.sender;

    const sender = await User.findById(senderId);

    const updatedContent = `${user.name} declined your swapping request.`;

    const senderNotification = {
      sender: null,
      inquiryAd: null,
      senderAd: null,
      content: updatedContent,
      timestamp: Date.now(),
    };

    sender.notifications[0] = senderNotification;

    user.notifications.shift();

    await sender.save();
    await user.save();

    return res.json({ message: "Notification declined successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    // Retrieve the user ID from the URL parameters
    const userId = req.body.userId;
    console.log(userId)

    // Check if the user with the specified ID exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      name,
      mobileNumber,
      email,
      location,
      userLatitude,
      userLongitude,
      photo,
    } = req.body;

    // Update the user information
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          mobileNumber,
          email,
          location: {
            type: 'Point',
            coordinates: [parseFloat(userLongitude), parseFloat(userLatitude)],
          },
          profilePicture: photo.Location,
          city: location,
        },
      },
      { new: true }
    );

    // Check if the update was successful
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    // No need to save again, as 'findByIdAndUpdate' already does that

    // Send a response with the updated user
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const search =  async (req, res) => {
  try {
    const { query, category, ageGroup, city } = req.body;
    console.log(req.body)

    // Build your query based on the provided parameters
    const searchQuery = {
      title: { $regex: new RegExp(query, 'i') }, // Case-insensitive search on title
      category: category || { $exists: true }, // Filter by category if provided
      importantFor: ageGroup || { $exists: true }, // Filter by age group if provided
      city: city || { $exists: true }, // Filter by city if provided
    };

    const results = await Ad.find(searchQuery).populate('postedBy');
    res.json({ results });
  } catch (error) {
    console.error('Error handling search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
