import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Helper to generate signed JWT tokens
 */
function generateToken(payload) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is missing.');
  }

  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * POST /api/auth/register
 * Register a new customer account
 */
export async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required (minimum 2 characters).',
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password is required and must be at least 6 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();
    const cleanPhone = phone && typeof phone === 'string' ? phone.trim() : null;

    // 2. Check duplicate email
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1;',
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 3. Hash password using bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Insert user (Role is ALWAYS forced to 'customer' to prevent privilege escalation)
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role)
       VALUES (?, ?, ?, ?, 'customer');`,
      [cleanFullName, normalizedEmail, passwordHash, cleanPhone]
    );

    const userId = result.insertId;

    // 5. Generate JWT token
    const token = generateToken({
      id: userId,
      email: normalizedEmail,
      role: 'customer',
    });

    // 6. Return response
    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: userId,
          fullName: cleanFullName,
          email: normalizedEmail,
          phone: cleanPhone,
          role: 'customer',
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate existing user and return JWT
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Query user by email
    const [rows] = await pool.query(
      `SELECT id, full_name, email, password_hash, phone, role
       FROM users
       WHERE email = ?
       LIMIT 1;`,
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 4. Return user profile + token (excluding password_hash)
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Retrieve currently authenticated user's profile
 */
export async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, full_name, email, phone, address_street, address_city, address_state, address_pincode, role
       FROM users
       WHERE id = ?
       LIMIT 1;`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    const user = rows[0];

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address_street,
          city: user.address_city,
          state: user.address_state,
          pincode: user.address_pincode,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    next(error);
  }
}
