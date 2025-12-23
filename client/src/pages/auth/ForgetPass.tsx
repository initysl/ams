import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import api from '@/lib/axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader,
  ArrowLeft,
  Mail,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { AdaptiveInput } from '@/components/app-ui/adaptive-input';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const recoverSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type RecoverForm = z.infer<typeof recoverSchema>;

const ForgetPass: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    nextAttemptTime?: string;
    retryAfter?: number;
  }>({});
  const [attemptInfo, setAttemptInfo] = useState<{
    remainingAttempts?: number;
    attemptsUsed?: number;
  }>({});
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecoverForm>({
    resolver: zodResolver(recoverSchema),
    defaultValues: {
      email: '',
    },
  });

  // Update countdown timer for rate limit
  useEffect(() => {
    if (!isRateLimited || !rateLimitInfo.nextAttemptTime) return;

    const updateTimer = () => {
      const now = new Date();
      const nextAttempt = new Date(rateLimitInfo.nextAttemptTime!);
      const diff = nextAttempt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('');
        setIsRateLimited(false);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, rateLimitInfo.nextAttemptTime]);

  const recoverMutation = useMutation({
    mutationFn: async (data: RecoverForm) => {
      const response = await api.post('auth/recover', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      setSubmittedEmail(variables.email);
      setIsSuccess(true);
      setIsRateLimited(false);

      // Store attempt information
      if (data.remainingAttempts !== undefined) {
        setAttemptInfo({
          remainingAttempts: data.remainingAttempts,
          attemptsUsed: data.attemptsUsed,
        });
      }

      toast.success('Reset link sent successfully!');
    },
    onError: (error) => {
      const errorResponse = (error as any)?.response;
      const errorMessage = errorResponse?.data?.message;
      const status = errorResponse?.status;

      // Handle rate limiting (429 status)
      if (status === 429) {
        setIsRateLimited(true);
        setRateLimitInfo({
          nextAttemptTime: errorResponse.data.nextAttemptTime,
          retryAfter: errorResponse.data.retryAfter,
        });

        return;
      }

      // Handle other error scenarios
      if (
        errorMessage?.includes('not found') ||
        errorMessage?.includes('does not exist')
      ) {
        toast.error('Invalid email or password. Please check your email');
      } else if (
        errorMessage?.includes('rate limit') ||
        errorMessage?.includes('too many')
      ) {
        toast.error('Too many attempts. Please wait before trying again');
      } else {
        toast.error(
          errorMessage || 'Unable to send reset link. Please try again'
        );
      }
    },
  });

  const onSubmit = (data: RecoverForm) => {
    recoverMutation.mutate(data);
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setIsRateLimited(false);
    setSubmittedEmail('');
    setRateLimitInfo({});
    setAttemptInfo({});
    setTimeRemaining('');
    reset();
  };

  const resendLink = () => {
    if (submittedEmail) {
      recoverMutation.mutate({ email: submittedEmail });
    }
  };

  // Rate limited state
  if (isRateLimited) {
    return (
      <div className='flex justify-center items-center min-h-svh p-3'>
        <Card className='w-full max-w-md p-6 rounded-xl bg-white shadow-lg'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto'>
              <AlertTriangle className='w-8 h-8 text-red-600' />
            </div>

            <CardTitle className='text-2xl text-gray-900'>
              Too many attempts
            </CardTitle>

            <CardDescription className='text-gray-600'>
              You've reached the maximum number of password reset attempts.
            </CardDescription>

            <div className='bg-red-50 p-4 rounded-lg text-sm'>
              <div className='flex items-center justify-center space-x-2'>
                <Clock className='w-4 h-4 text-red-600 mt-0.5 shrink-0' />
                <div className='text-red-800'>
                  {timeRemaining ? (
                    <p className='font-medium'>Try again in {timeRemaining}</p>
                  ) : rateLimitInfo.retryAfter ? (
                    <p className='font-medium'>
                      Try again in {Math.ceil(rateLimitInfo.retryAfter / 60)}{' '}
                      minutes
                    </p>
                  ) : (
                    <p className='font-medium'>Try again later</p>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleTryAgain}
              variant='outline'
              className='w-full'
            >
              Try a different email
            </Button>

            <div className='pt-4 border-t'>
              <Link
                to='/auth'
                className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900'
              >
                <ArrowLeft className='w-4 h-4 mr-1' />
                Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className='flex justify-center items-center min-h-svh p-3'>
        <Card className='w-full max-w-md p-6 rounded-xl bg-white shadow-lg'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
              <CheckCircle className='w-8 h-8 text-green-600' />
            </div>

            <CardTitle className='text-2xl text-gray-900'>
              Check your email
            </CardTitle>

            <CardDescription className='text-gray-600'>
              We've sent a password reset link to
              <span className='font-medium text-gray-900 block mt-1'>
                {submittedEmail}
              </span>
            </CardDescription>

            {attemptInfo.remainingAttempts !== undefined && (
              <div className='bg-amber-50 p-3 rounded-lg text-sm'>
                <p className='text-amber-800'>
                  <span className='font-medium'>
                    {attemptInfo.remainingAttempts} attempts remaining
                  </span>
                </p>
              </div>
            )}

            <div className='flex flex-col items-center bg-blue-50 p-4 rounded-lg text-sm text-blue-800'>
              <div className='flex items-start space-x-2'>
                <div>
                  <p className='font-medium text-orange-600'>
                    Didn't receive the email?
                  </p>
                  <ul className='mt-1 space-y-1 text-xs'>
                    <li>Check your spam/junk folder</li>
                    <li>Make sure the email address is correct</li>
                    <li>The link will expire in 5 minutes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <Button
                onClick={resendLink}
                variant='outline'
                className='w-full'
                disabled={
                  recoverMutation.isPending ||
                  attemptInfo.remainingAttempts === 0
                }
              >
                {recoverMutation.isPending ? (
                  <Loader className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Mail className='h-4 w-4 mr-2' />
                )}
                {attemptInfo.remainingAttempts === 0
                  ? 'No attempts left'
                  : 'Resend email'}
              </Button>

              <Button
                onClick={handleTryAgain}
                variant='ghost'
                className='w-full text-gray-600'
              >
                Try a different email
              </Button>
            </div>

            <div className='pt-4 border-t'>
              <Link
                to='/auth'
                className='inline-flex items-center text-sm text-gray-600 hover:text-gray-900'
              >
                <ArrowLeft className='w-4 h-4 mr-1' />
                Back to login
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Initial form state
  return (
    <div className='flex justify-center items-center min-h-svh p-3'>
      <Card className='w-full max-w-md p-6 rounded-xl bg-white shadow-lg'>
        <div className='text-center mb-6'>
          <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Shield className='w-6 h-6 text-green-600' />
          </div>

          <CardTitle className='text-2xl text-gray-900 mb-2'>
            Reset your password
          </CardTitle>

          <CardDescription className='text-gray-600'>
            Enter your email address and we'll send you a link to reset your
            password.
          </CardDescription>
        </div>

        <form
          id='forget-pass'
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-6'
        >
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <AdaptiveInput
                label='Email Address'
                type='email'
                autoComplete='email'
                error={errors.email?.message}
                className='w-full'
                {...field}
              />
            )}
          />

          <Button
            type='submit'
            className='w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 shadow-sm'
            disabled={recoverMutation.isPending}
          >
            {recoverMutation.isPending ? (
              <>
                Sending...
                <Loader className='h-4 w-4 animate-spin ml-2' />
              </>
            ) : (
              <>Send reset link</>
            )}
          </Button>
        </form>

        <div className='my-6 text-center'>
          <p className='text-gray-600'>
            Remember your password?{' '}
            <Link
              to='/auth'
              className='text-blue-600 hover:text-blue-700 hover:underline font-medium'
            >
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ForgetPass;
