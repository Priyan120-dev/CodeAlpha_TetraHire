const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const CandidateProfile = require('../models/CandidateProfile');
const EmployerProfile = require('../models/EmployerProfile');
const { sendResponse } = require('../utils/response');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../utils/customError');

// Token helpers
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const saveRefreshToken = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // matches 7d duration
  await RefreshToken.create({ userId, token, expiresAt });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, companyName } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new BadRequestError('User already registered with this email.');
    }

    if (role === 'employer' && !companyName) {
      throw new BadRequestError('Company name is required for Employer registration.');
    }

    // Save user
    const user = await User.create({ name, email, password, role });

    // Initialize profile
    if (role === 'candidate') {
      await CandidateProfile.create({ userId: user._id });
    } else if (role === 'employer') {
      await EmployerProfile.create({ userId: user._id, companyName });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await saveRefreshToken(user._id, refreshToken);

    return sendResponse(res, 201, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await saveRefreshToken(user._id, refreshToken);

    return sendResponse(res, 200, 'Login successful', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token rotation
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required.');
    }

    // Verify token exists in database
    const savedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!savedToken) {
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      // If verification failed, cleanup database token
      await RefreshToken.deleteOne({ token: refreshToken });
      throw new UnauthorizedError('Invalid or expired refresh token.');
    }

    // Rotate token: delete old, generate new access and refresh
    await RefreshToken.deleteOne({ token: refreshToken });

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('User associated with token no longer exists.');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await saveRefreshToken(user._id, newRefreshToken);

    return sendResponse(res, 200, 'Token refreshed successfully', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out / Invalidate Refresh Token
// @route   POST /api/auth/logout
// @access  Public (Requires Refresh Token)
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new BadRequestError('Refresh token is required to log out.');
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    return sendResponse(res, 200, 'Logged out successfully. Session invalidated.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    let profile = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ userId: user._id });
    } else if (user.role === 'employer') {
      profile = await EmployerProfile.findOne({ userId: user._id });
    }

    return sendResponse(res, 200, 'Profile retrieved successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, education, experience, skills, bio, website, companySize, industry, description, profileImage, linkedin, github } = req.body;

    // Update main User details (e.g., Name)
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    if (name) {
      user.name = name;
    }
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }
    await user.save();

    let profile = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = new CandidateProfile({ userId: user._id });
      }
      if (phone !== undefined) profile.phone = phone;
      if (location !== undefined) profile.location = location;
      if (education !== undefined) profile.education = education;
      if (experience !== undefined) profile.experience = experience;
      if (skills !== undefined) profile.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
      if (bio !== undefined) profile.bio = bio;
      if (linkedin !== undefined) profile.linkedin = linkedin;
      if (github !== undefined) profile.github = github;
      await profile.save();
    } else if (user.role === 'employer') {
      profile = await EmployerProfile.findOne({ userId: user._id });
      if (!profile) {
        profile = new EmployerProfile({ userId: user._id, companyName: user.name });
      }
      if (website !== undefined) profile.website = website;
      if (companySize !== undefined) profile.companySize = companySize;
      if (industry !== undefined) profile.industry = industry;
      if (location !== undefined) profile.location = location;
      if (description !== undefined) profile.description = description;
      await profile.save();
    }

    return sendResponse(res, 200, 'Profile updated successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, 'Password updated successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError('No user registered with this email.');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and store in database with 10m expiry
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Stub email response containing plain reset token for testing
    return sendResponse(res, 200, 'Password reset token generated. Use it to reset password.', {
      resetToken,
      message: `Send PUT to /api/auth/reset-password/${resetToken} with newPassword`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;

    // Hash parameter token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token.');
    }

    // Set new password and clear token fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return sendResponse(res, 200, 'Password reset successful. You can now log in.');
  } catch (error) {
    next(error);
  }
};
