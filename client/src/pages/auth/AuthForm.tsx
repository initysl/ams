import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { Button } from '../../components/ui/button';
import { Loader } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Define types for register data
interface RegisterData {
  name: string;
  email: string;
  department: string;
  matricNumber?: string | null;
  password: string;
  confirmPassword: string;
  profilePicture?: File | null;
}

const AuthForm: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string>('');
  const navigate = useNavigate();

  // Use the auth context
  const { login } = useAuth();

  // Handle image change from Profilebox
  const handleImageChange = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, and PNG files are allowed');
      return;
    }
    setProfilePicture(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  // === Login Mutation using AuthContext ===
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      return login(credentials);
    },
    onSuccess: () => {
      navigate('/dashboard/home');
    },
    // onError: (err: ApiError) => {
    //   toast.error(`Sign in failed: ${err.response?.data?.message}`);
    // },
  });

  // === Register Mutation ===
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('department', data.department);
      formData.append(
        'matricNumber',
        data.matricNumber?.match(/^\d{4}\/\d+$/) ? data.matricNumber : '',
      );
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      return api.post('auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: (res) => {
      toast.success(`${res.data.message}`);
      setProfilePicture(null);
      setPreviewURL('');
      // Automatically switch to sign in form after successful registration
      setIsSignIn(true);
    },
    onError: (err: ApiError) => {
      toast.error(`Registration failed: ${err.response?.data?.message}`);
    },
  });

  const handleLoginSubmit = (data: { email: string; password: string }) => {
    loginMutation.mutate(data);
  };

  const handleRegisterSubmit = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  return (
    <>
      <SEO
        title='Login - AttendEase'
        description='Access your AttendEase account to manage attendance, generate QR codes, and view detailed reports.'
        canonical='https://amsqr.up.railway.app/auth'
        robots='noindex, nofollow' // Don't index login pages
      />
      <div className='flex justify-center items-center min-h-svh p-2'>
        <div className='bg-white p-8 rounded-xl rounded-bl-xl shadow-2xl max-w-2xl transition-all duration-500'>
          <div className='text-center space-y-2 mb-10'>
            <h1 className='text-4xl font-bold text-gray-800'>
              Welcome to <span className='text-green-600'>AttendEase</span>
            </h1>
            <p className='text-gray-500'>
              {isSignIn
                ? 'Sign in to manage your attendance'
                : 'Create an account to get started'}
            </p>
          </div>

          <h2 className='text-2xl font-bold text-green-600 mb-6'>
            {isSignIn ? 'Sign In' : 'Register'}
          </h2>

          {isSignIn ? (
            <LoginForm
              onSubmit={handleLoginSubmit}
              isPending={loginMutation.isPending}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegisterSubmit}
              isPending={registerMutation.isPending}
              previewURL={previewURL || `${import.meta.env.VITE_API_URL}at.jpg`}
              onImageChange={handleImageChange}
            />
          )}

          <div className='flex flex-col items-center mt-8 space-y-5'>
            <Button
              type='submit'
              form={isSignIn ? 'login-form' : 'register-form'}
              className='bg-green-600 hover:bg-green-700 text-white font-semibold p-5 w-full max-w-sm shadow-lg cursor-pointer'
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {loginMutation.isPending || registerMutation.isPending ? (
                <Loader className='h-5 w-5 animate-spin' />
              ) : isSignIn ? (
                'Sign In'
              ) : (
                'Register'
              )}
            </Button>

            <p className='text-sm text-gray-600'>
              {isSignIn ? "Don't have an account?" : 'Already have an account?'}
              <button
                type='button'
                onClick={() => setIsSignIn(!isSignIn)}
                className='text-blue-600 hover:underline ml-1'
              >
                {isSignIn ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthForm;
