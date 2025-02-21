const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../middlewares/log");
const expressAsyncHandler = require("express-async-handler");

const updateUserProfile = expressAsyncHandler(async (req, res) => {
  const updates = { ...req.body };

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (updatedUser) {
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      department: updatedUser.department,
      matricNumber: updatedUser.matricNumber,
      email: updatedUser.email,
      token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {
        expiresIn: "5d",
      }),
    });
    logger.info(
      `User updated: ${updatedUser.email}, ${updatedUser.matricNumber}`
    );
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteUserProfile = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("Account not found");
  }

  await User.deleteOne({ _id: req.user._id });
  logger.info(`User deleted: ${user.email}, ${user.matricNumber}`);
  res.json({ message: "Account deleted successfully" });
});

module.exports = {
  updateUserProfile,
  deleteUserProfile,
};
