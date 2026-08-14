"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!email) {
      setEmailError("Vui lòng nhập email");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải từ 6 ký tự");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    setIsLoading(true);
    // Giả lập gọi API đăng nhập
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 1500);
  };

  return (
    <div className="login-page-wrapper">
      <div className="soft-background">
        <div className="floating-shapes">
          <div className="soft-blob blob-1"></div>
          <div className="soft-blob blob-2"></div>
          <div className="soft-blob blob-3"></div>
          <div className="soft-blob blob-4"></div>
        </div>
      </div>

      <div className="login-container">
        <div className="soft-card">
          <div className="comfort-header">
            <div className="gentle-logo">
              <div className="logo-circle">
                <div className="comfort-icon">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path
                      d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 16a4 4 0 108 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="20" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div className="gentle-glow"></div>
              </div>
            </div>
            <h1 className="comfort-title">Chào mừng quay trở lại</h1>
            <p className="gentle-subtitle">Đăng nhập vào hệ thống CRM</p>
          </div>

          <form className="comfort-form" id="loginForm" noValidate onSubmit={handleSubmit}>
            <div className={`soft-field ${emailError ? "has-error" : ""}`}>
              <div className="field-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder=" "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label htmlFor="email">Địa chỉ Email</label>
                <div className="field-accent"></div>
              </div>
              <span className="gentle-error" id="emailError" style={{ display: emailError ? "block" : "none" }}>
                {emailError}
              </span>
            </div>

            <div className={`soft-field ${passwordError ? "has-error" : ""}`}>
              <div className="field-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label htmlFor="password">Mật khẩu</label>
                <button
                  type="button"
                  className={`gentle-toggle ${showPassword ? "show-password" : ""}`}
                  id="passwordToggle"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <div className="toggle-icon">
                    <svg className="eye-open" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 3c-4.5 0-8.3 3.8-9 7 .7 3.2 4.5 7 9 7s8.3-3.8 9-7c-.7-3.2-4.5-7-9-7z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                    <svg className="eye-closed" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M3 3l14 14M8.5 8.5a3 3 0 004 4m2.5-2.5C15 10 12.5 7 10 7c-.5 0-1 .1-1.5.3M10 13c-2.5 0-4.5-2-5-3 .3-.6.7-1.2 1.2-1.7"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </button>
                <div className="field-accent"></div>
              </div>
              <span className="gentle-error" id="passwordError" style={{ display: passwordError ? "block" : "none" }}>
                {passwordError}
              </span>
            </div>

            <div className="comfort-options">
              <label className="gentle-checkbox">
                <input type="checkbox" id="remember" name="remember" />
                <span className="checkbox-soft">
                  <div className="check-circle"></div>
                  <svg className="check-mark" width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path
                      d="M1 5l3 3 7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="checkbox-text">Ghi nhớ đăng nhập</span>
              </label>
              <a href="#" className="comfort-link">Quên mật khẩu?</a>
            </div>

            <button type="submit" className={`comfort-button ${isLoading ? "is-loading" : ""} ${isSuccess ? "is-success" : ""}`}>
              <div className="button-background"></div>
              <span className="button-text">Đăng nhập</span>
              <div className="button-loader">
                <div className="gentle-spinner">
                  <div className="spinner-circle"></div>
                </div>
              </div>
              <div className="button-glow"></div>
            </button>
          </form>

          {/* Removed social login buttons as they are usually mocked in these templates */}
          
          <div className="comfort-signup">
            <span className="signup-text">Bạn chưa có tài khoản?</span>
            <a href="#" className="comfort-link signup-link">Đăng ký</a>
          </div>

          <div className={`gentle-success ${isSuccess ? "show-success" : ""}`} id="successMessage">
            <div className="success-bloom">
              <div className="bloom-rings">
                <div className="bloom-ring ring-1"></div>
                <div className="bloom-ring ring-2"></div>
                <div className="bloom-ring ring-3"></div>
              </div>
              <div className="success-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path
                    d="M8 14l5 5 11-11"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h3 className="success-title">Thành công!</h3>
            <p className="success-desc">Đang chuyển hướng vào hệ thống...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
