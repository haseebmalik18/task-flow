import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../components/context/AuthContext";
import Button from "../../components/common/Button";
import FormError from "../../components/common/FormError";

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async () => {
    try {
      const code = verificationCode.join("");
      const response = await verifyEmail(email, code);

      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError("Invalid verification code");
      setVerificationCode(["", "", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
    }
  };

  const handleResend = async () => {
    setIsResending(true);

    setCountdown(15);
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="animate-[fadeIn_0.5s_ease-in] bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-[#2563eb]/10 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2563eb]">Verify Email</h1>
          <p className="text-[#3b82f6]/80 mt-2">
            Enter the 6-digit code sent to
            <br />
            <span className="font-medium text-[#1e293b]">{email}</span>
          </p>
        </div>

        {error && <FormError error={error} />}

        <div className="flex justify-center gap-2 mb-6">
          {verificationCode.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20 outline-none transition-all"
            />
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          fullWidth
          disabled={verificationCode.some((digit) => !digit)}
          className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white"
        >
          Verify Email
        </Button>

        <div className="mt-6 text-center">
          <p className="text-[#1e293b]/60 text-sm">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className={`mt-2 text-[#2563eb] hover:text-[#2563eb]/80 ${
              countdown > 0 || isResending
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isResending
              ? "Sending..."
              : countdown > 0
              ? `Resend in ${countdown}s`
              : "Resend Code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
