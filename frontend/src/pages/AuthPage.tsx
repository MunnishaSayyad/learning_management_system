import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";

import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";

import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

import { useAuth } from "@/context/AuthContext";
import axios from "axios";

interface SignInForm {
  useremail: string;
  password: string;
}

interface SignUpForm {
  username: string;
  useremail: string;
  password: string;
  confirmPassword: string;

}

const signInSchema = yup.object({
  useremail: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});


const signUpSchema = yup.object({
  username: yup.string().required("Username is required"),
  useremail: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string()
    .required("Password is required")
    .min(8, "Minimum 8 characters")
    .matches(/[A-Z]/, "Include uppercase")
    .matches(/[a-z]/, "Include lowercase")
    .matches(/[0-9]/, "Include number")
    .matches(/[@$!%*?&]/, "Include special character"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});



export default function AuthPage() {
  const [tab, setTab] = useState("signin");
  const { signInUser, signUpUser, googleLogin, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);


  const {
    register: registerIn,
    handleSubmit: handleSignIn,
    formState: { errors: signInErrors },
  } = useForm<SignInForm>({ resolver: yupResolver(signInSchema) });

  const {
    register: registerUp,
    handleSubmit: handleSignUp,
    formState: { errors: signUpErrors },
    watch: watchSignUp,
  } = useForm<SignUpForm>({ resolver: yupResolver(signUpSchema) });

  const passwordValue = watchSignUp("password");
  const confirmPasswordValue = watchSignUp("confirmPassword");

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return "Weak";
    if (strength <= 4) return "Medium";
    return "Strong";
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case "Weak":
        return "text-red-500";
      case "Medium":
        return "text-yellow-500";
      case "Strong":
        return "text-green-600";
      default:
        return "";
    }
  };


  const onSignUp = async (data: SignUpForm) => {
    try {
      const response = await signUpUser(data);

      if (response.success) {
        setTab("signin");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          toast.error("Too many attempts please try again after 15 minutes");
        } else {
          toast.error(err.response?.data?.message || err.response?.data?.error || "Login failed");

        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };


  const onSignIn = async (data: SignInForm) => {
    try {
      await signInUser(data); // ✅ await this
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          toast.error("Too many attempts please try again after 15 minutes");
        } else {
          toast.error(err.response?.data?.message || err.response?.data?.error || "Login failed");

        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };


  interface GoogleJwtPayload {
    name: string;
    email: string;
    sub: string;
  }

  const handleGoogleAuth = async (credentialResponse: CredentialResponse) => {
    try {
      const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential!);
      const googleUser = {
        username: decoded.name,
        useremail: decoded.email,
        googleId: decoded.sub,
      };

      console.log("Google user:", googleUser);
      await googleLogin(googleUser);
    } catch (error) {
      console.log(error);
    }
  };

  console.log(loading);


  return (
    <div className="flex flex-col h-100 items-center justify-center">


      <main className="flex items-center justify-center flex-1 w-full m-2">
        <Tabs value={tab} onValueChange={setTab} className="w-[500px] m-2">
          <TabsList className="grid w-full grid-cols-2 m-4">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* ---- Sign In ---- */}
          <TabsContent value="signin">
            <Card className="p-4 space-y-2">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Use email or Google account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignIn(onSignIn)} className="space-y-2">
                  <input
                    {...registerIn("useremail")}
                    placeholder="Email"
                    className="w-full p-2 border rounded dark:bg-gray-900"
                  />
                  <p className="text-red-500 text-sm">
                    {signInErrors.useremail?.message}
                  </p>

                  <div className="relative">
                    <input
                      {...registerIn("password")}
                      type={showSignInPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full p-2 border rounded pr-10 dark:bg-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showSignInPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  <p className="text-red-500 text-sm">
                    {signInErrors.password?.message}
                  </p>

                  <button
                    type="submit"
                    className={`w-full bg-black text-white py-2 rounded ${loading ? "bg-black/50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>

                </form>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  OR
                </div>
                <div className="mt-4 w-full">
                  <div className="w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleAuth}
                      onError={() => toast.error("Google Login Failed")}
                      width="100%"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- Sign Up ---- */}
          <TabsContent value="signup">
            <Card className="p-4 space-y-2">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp(onSignUp)} className="space-y-2">
                  <input
                    {...registerUp("username")}
                    placeholder="Username"
                    className="w-full p-2 border rounded dark:bg-gray-900"
                  />
                  <p className="text-red-500 text-sm">
                    {signUpErrors.username?.message}
                  </p>

                  <input
                    {...registerUp("useremail")}
                    placeholder="Email"
                    className="w-full p-2 border rounded dark:bg-gray-900"
                  />
                  <p className="text-red-500 text-sm">
                    {signUpErrors.useremail?.message}
                  </p>

                  <div className="relative">
                    <input
                      {...registerUp("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className="w-full p-2 border rounded pr-10 dark:bg-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>


                  {passwordValue && (
                    <p className={`text-sm font-medium ${getPasswordStrengthColor(getPasswordStrength(passwordValue))}`}>
                      Password Strength: {getPasswordStrength(passwordValue)}
                    </p>
                  )}

                  <p className="text-red-500 text-sm">{signUpErrors.password?.message}</p>

                  <div className="relative">
                    <input
                      {...registerUp("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      className="w-full p-2 border rounded pr-10 dark:bg-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>

                  {confirmPasswordValue && !signUpErrors.confirmPassword && (
                    <p className={`text-sm font-medium ${confirmPasswordValue === passwordValue ? "text-green-600" : "text-red-500"}`}>
                      {confirmPasswordValue === passwordValue ? "Passwords match ✅" : "Passwords do not match ❌"}
                    </p>
                  )}

                  <p className="text-red-500 text-sm">{signUpErrors.confirmPassword?.message}</p>


                  <button
                    type="submit"
                    className={`w-full bg-black text-white py-2 rounded ${loading ? "bg-black/50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                  >
                    {loading ? "Signing up..." : "Sign Up"}
                  </button>
                  <div className="mt-4 w-full">
                    <div className="w-full">
                      <GoogleLogin
                        onSuccess={handleGoogleAuth}
                        onError={() => toast.error("Google Login Failed")}
                        width="100%"
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}