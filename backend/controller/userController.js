import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

//register user if doesnt exists
export const registerUser = async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    //validation of all required details
    if (!email || !name || !password || !role) {
      return res.json({ success: false, message: "All field required!" });
    }
    if (password.length < 7) {
      return res.json({
        success: false,
        message: "Password must be greater than 7 digit!",
      });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists!" });
    }
    //if all validation passes

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

  //after refistering mail will be sent
  await sendEmail(
  email,  "Welcome to Our App ",
  `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px;">

      <h2 style="color: #2c3e50;">Welcome, ${user.name}!</h2>

      <p style="font-size: 16px; color: #555;">
        Your account has been successfully created with us.
      </p>

      <p style="font-size: 16px; color: #555;">
        You can now log in and access your dashboard, updates, and services.
      </p>

      <div style="margin: 20px 0; padding: 15px; background: #eef6ff; border-left: 4px solid #3498db;">
        <p style="margin: 0; font-size: 15px;">
          <strong>Email:</strong> ${email}
        </p>
      </div>

      <p style="font-size: 16px; color: #555;">
        If you did not create this account, please ignore this email.
      </p>

      <hr style="margin: 20px 0;" />

      <p style="font-size: 14px; color: #999;">
        Thank you,<br/>
      </p>

    </div>
  </div>
  `
);
    res
      .status(201)
      .json({ success: true, message: "User registered successfully!", emailMessage: "Email sent succesfully!" });


  } catch (err) {
    console.log("Error registering", err);
    res.status(500).json({ success: false, message: "Error registering user" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password} = req.body;
    if ((!email || !password)) {
      return res.json({ success: false, message: "All field required!" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //check if pass matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password doesnt matches!!",
      });
    }
    //so upto here user is their email exists and pass matches too so need to give a token
    const token = await jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
     const { password: _, ...userWithoutPassword } = user.toJSON();

    res.status(201).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.log("Error logging in", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

//get users info
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.log("Error getting user details", err);

    return res.status(500).json({
      success: false,
      message: "Error getting user info!",
    });
  }
};

///user can change password here
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = req.user;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password required",
      });
    }

    if(oldPassword === newPassword){
       return res.status(400).json({
        success: false,
        message: "Same password caannot be updated!",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });

  } catch (err) {
    console.log("Error changing password", err);

    return res.status(500).json({
      success: false,
      message: "Error changing password",
    });
  }
};
