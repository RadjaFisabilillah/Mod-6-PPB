import { supabase } from "../config/supabaseClient.js";

// Middleware untuk memverifikasi token Supabase JWT
export const protectRoute = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Memverifikasi token menggunakan Supabase Auth
    // Supabase menggunakan "Service Role Key" di backend, yang memungkinkan kita
    // memverifikasi token pengguna dengan aman.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) {
      // Token tidak valid atau error lainnya
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    // Menyimpan objek user ke request untuk digunakan di controller (opsional, tapi baik)
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error during authentication." });
  }
};
