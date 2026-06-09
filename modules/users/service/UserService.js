import bcrypt from 'bcryptjs';
import userRepository from '../repository/UserRepository';
import { generateToken } from '@/lib/auth';

class UserService {
  async register(userData) {
    const { email, password, name, phone, cep, street, number, complement, neighborhood, city, state } = userData;

    // Validate required fields
    if (!email || !password || !name) {
      throw new Error('Email, password and name are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password length
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with customer role by default
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      phone: phone || null,
      role: 'customer',
      cep: cep || null,
      street: street || null,
      number: number || null,
      complement: complement || null,
      neighborhood: neighborhood || null,
      city: city || null,
      state: state || null,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(email, password) {
    // Validate required fields
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async getAllUsers() {
    const users = await userRepository.findAll();
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    }));
  }
}

export default new UserService();
