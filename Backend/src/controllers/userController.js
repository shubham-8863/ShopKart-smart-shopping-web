import pool from '../config/db.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE_REGEX = /^\d{6}$/;

/**
 * GET /api/users/me
 * Retrieve the current authenticated user's profile and default address
 */
export async function getCurrentUserProfile(req, res, next) {
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
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone || null,
        address: user.address_street || null,
        city: user.address_city || null,
        state: user.address_state || null,
        pincode: user.address_pincode || null,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in getCurrentUserProfile:', error);
    next(error);
  }
}

/**
 * PUT /api/users/me
 * Update the current authenticated user's profile and default delivery address
 */
export async function updateCurrentUserProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { fullName, email, phone, address, city, state, pincode } = req.body;

    // 1. Fetch current user row from database
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

    const currentUser = rows[0];

    // 2. Validate Full Name (if provided)
    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Full name is required (minimum 2 characters).',
        });
      }
    }

    // 3. Validate Email (if provided)
    let normalizedEmail = currentUser.email;
    if (email !== undefined) {
      if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'A valid email address is required.',
        });
      }
      normalizedEmail = email.trim().toLowerCase();

      // Check email uniqueness if changed
      if (normalizedEmail !== currentUser.email) {
        const [existing] = await pool.query(
          'SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1;',
          [normalizedEmail, userId]
        );

        if (existing.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'An account with this email already exists.',
          });
        }
      }
    }

    // 4. Validate PIN Code (if provided)
    if (pincode !== undefined && pincode !== null && String(pincode).trim() !== '') {
      const cleanPin = String(pincode).trim();
      if (!PINCODE_REGEX.test(cleanPin)) {
        return res.status(400).json({
          success: false,
          message: 'PIN code must be 6 digits.',
        });
      }
    }

    // 5. Prepare sanitized values
    const cleanFullName =
      fullName !== undefined ? fullName.trim() : currentUser.full_name;
    const cleanPhone =
      phone !== undefined
        ? phone && String(phone).trim() !== ''
          ? String(phone).trim()
          : null
        : currentUser.phone;
    const cleanAddress =
      address !== undefined
        ? address && String(address).trim() !== ''
          ? String(address).trim()
          : null
        : currentUser.address_street;
    const cleanCity =
      city !== undefined
        ? city && String(city).trim() !== ''
          ? String(city).trim()
          : null
        : currentUser.address_city;
    const cleanState =
      state !== undefined
        ? state && String(state).trim() !== ''
          ? String(state).trim()
          : null
        : currentUser.address_state;
    const cleanPincode =
      pincode !== undefined
        ? pincode && String(pincode).trim() !== ''
          ? String(pincode).trim()
          : null
        : currentUser.address_pincode;

    // 6. Update in MySQL (role, id, and password_hash are NEVER modified)
    await pool.query(
      `UPDATE users 
       SET full_name = ?, email = ?, phone = ?, address_street = ?, address_city = ?, address_state = ?, address_pincode = ?
       WHERE id = ?;`,
      [
        cleanFullName,
        normalizedEmail,
        cleanPhone,
        cleanAddress,
        cleanCity,
        cleanState,
        cleanPincode,
        userId,
      ]
    );

    // 7. Return updated profile
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: userId,
        fullName: cleanFullName,
        email: normalizedEmail,
        phone: cleanPhone,
        address: cleanAddress,
        city: cleanCity,
        state: cleanState,
        pincode: cleanPincode,
        role: currentUser.role,
      },
    });
  } catch (error) {
    console.error('Error in updateCurrentUserProfile:', error);
    next(error);
  }
}
