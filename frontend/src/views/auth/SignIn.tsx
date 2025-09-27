import Link from "next/link";
import LoginForm from "./components/LoginForm";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Form */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <LoginForm />
            </div>

            {/* Right side - Branding */}
            <div className="lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 lg:p-12 flex flex-col justify-center text-white">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
                <p className="text-indigo-100 text-lg leading-relaxed">
                  Sign in to continue your journey and stay connected with your
                  community.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Access your personalized timeline</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>Continue conversations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Secure and private</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-indigo-500">
                <p className="text-sm text-indigo-200">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/register"
                    className="text-white font-semibold hover:text-indigo-100 transition-colors"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
