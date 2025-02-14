// src/pages/auth/Register.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import FormError from "../../components/common/FormError";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();
  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    try {
      if (data.password !== data.confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      const message = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      setIsSuccess(true);
      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        navigate("/verify", { state: { email: data.email } });
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Registration failed");
      }
    }
  };

  const passwordValidation = {
    required: "Password is required",
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="animate-[fadeIn_0.5s_ease-in] bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-[#2563eb]/10 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2563eb] transform hover:scale-105 transition-transform duration-200">
            Join TaskFlow
          </h1>
          <p className="text-[#3b82f6]/80 mt-2 animate-[fadeIn_0.8s_ease-in]">
            Create your account
          </p>
        </div>

        {isSuccess ? (
          <div className="p-4 bg-[#22c55e]/10 rounded-md text-[#22c55e] text-center animate-[fadeIn_0.5s_ease-in]">
            Registration successful! Check your email for verification.
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <FormError error={error} />}

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                register={register}
                error={errors.firstName?.message}
                rules={{ required: "First name is required" }}
              />

              <Input
                label="Last Name"
                name="lastName"
                register={register}
                error={errors.lastName?.message}
                rules={{ required: "Last name is required" }}
              />
            </div>

            <Input
              label="Email"
              type="email"
              name="email"
              register={register}
              error={errors.email?.message}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Invalid email address",
                },
              }}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              register={register}
              error={errors.password?.message}
              rules={passwordValidation}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              register={register}
              error={errors.confirmPassword?.message}
              rules={{
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              }}
            />

            <Button
              type="submit"
              fullWidth
              className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 shadow-lg hover:shadow-xl active:shadow-md mt-6"
            >
              Create Account
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-[#1e293b]/80">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#2563eb] font-medium hover:text-[#2563eb]/80 relative inline-block after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-[#2563eb]/20 after:left-0 after:-bottom-0.5 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
