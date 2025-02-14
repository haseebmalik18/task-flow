import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/context/AuthContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import FormError from "../../components/common/FormError";
import { useState } from "react";

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    mode: "onBlur",
  });

  const [error, setError] = useState<string>("");

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (error) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      {}
      <div className="animate-[fadeIn_0.5s_ease-in] bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-[#2563eb]/10 hover:shadow-xl transition-shadow duration-300">
        <div className="text-center mb-8">
          {}
          <h1 className="text-4xl font-bold text-[#2563eb] transform hover:scale-105 transition-transform duration-200">
            TaskFlow
          </h1>
          <p className="text-[#3b82f6]/80 mt-2 animate-[fadeIn_0.8s_ease-in]">
            Welcome back
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && <FormError error={error} />}

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
            rules={{ required: "Password is required" }}
          />

          {}
          <Button
            type="submit"
            fullWidth
            className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 shadow-lg hover:shadow-xl active:shadow-md"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-center text-[#1e293b]/80">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-[#2563eb] font-medium hover:text-[#2563eb]/80 relative inline-block after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-[#2563eb]/20 after:left-0 after:-bottom-0.5 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
