import { useState } from 'react';
import {
  Check,
  Users,
  Calendar,
  ArrowRightCircle,
  QrCode,
  Clock8,
  ListCheck,
  ChartLine,
  TabletSmartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/images/at.jpg';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';

const SplashScreen = () => {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next'); // "next" or "prev"

  const screens = [
    {
      title: 'Dive into the world of automated attendance management.',
      description:
        'Track attendance with ease and manage your records in one centralized platform.',
      icon: <Calendar className='text-white' size={28} />,
      bgColor: 'bg-green-500',
    },
    {
      title: 'Track attendance in real-time, effortlessly',
      description:
        "Keep track of students' attendance and get insights on participation patterns.",
      icon: <Users className='text-white' size={28} />,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Say hello to accuracy and efficiency!',
      description: 'Your digital attendance solution starts here!',
      icon: <QrCode className='text-white' size={28} />,
      bgColor: 'bg-green-500',
    },
  ];

  const navigate = useNavigate();

  const handleNext = () => {
    if (isAnimating) return;

    if (currentScreen < 2) {
      setDirection('next');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentScreen((prev) => prev + 1);
        setTimeout(() => setIsAnimating(false), 50);
      }, 300);
    } else {
      navigate('/auth');
    }
  };

  const goToScreen = (index: any) => {
    if (isAnimating || index === currentScreen) return;
    setDirection(index > currentScreen ? 'next' : 'prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentScreen(index);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  // Animation classes
  const getContentAnimationClass = () => {
    if (!isAnimating) return 'opacity-100 translate-x-0';
    return direction === 'next'
      ? 'opacity-0 translate-x-full'
      : 'opacity-0 -translate-x-full';
  };

  return (
    <>
      <SEO
        title='AttendEase - Attendance Management System'
        description='Dive into the world of automated attendance management.Track attendance in real-time, effortlessly.Your digital attendance solution starts here!'
        keywords='QR attendance, automated attendance, student attendance, attendance management system, digital attendance, institutions management'
        canonical='https://amsqr.up.railway.app/'
        author='Yusuf Lawal'
      />
      <div className='flex flex-col h-svh bg-white'>
        {/* Header */}
        <header className='p-4 sm:p-6 flex items-center justify-center'>
          <h1 className='text-3xl sm:text-4xl tracking-wide font-bold text-green-600'>
            AttendEase
          </h1>
        </header>

        {/* Content */}
        <div className='flex-1 flex flex-col px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full'>
          {/* Screen content */}
          <div className='flex-1 flex flex-col relative overflow-hidden'>
            {/* Animated container */}
            <div
              className={`absolute inset-0 flex flex-col transition-all duration-300 ease-in-out transform ${getContentAnimationClass()}`}
            >
              {/* Image/illustration section */}
              <div className='flex-1 flex items-center justify-center relative mb-4 sm:mb-8'>
                {currentScreen === 0 && (
                  <div className='relative'>
                    <div className='absolute -left-12 sm:-left-16 top-8'>
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${screens[currentScreen].bgColor} flex items-center justify-center animate-pulse`}
                      >
                        {screens[currentScreen].icon}
                      </div>
                    </div>

                    <div className='h-52 w-52  rounded-full bg-neutral-100 flex items-center justify-center'>
                      <div className='w-52 h-52  rounded-full bg-neutral-200 flex items-center justify-center'>
                        <img
                          src={logo}
                          alt='App logo; A boy with attendance sheets'
                        />
                      </div>
                    </div>

                    <div className='absolute -right-10 sm:-right-12 bottom-8'>
                      <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-400 flex items-center justify-center'>
                        <TabletSmartphone size={32} className='text-white' />
                      </div>
                    </div>
                  </div>
                )}

                {currentScreen === 1 && (
                  <div className='relative'>
                    <div className='absolute -left-16 sm:-left-20 top-0'>
                      <div className='w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-green-100 flex items-center justify-center'>
                        <div className='w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-green-400'></div>
                      </div>
                    </div>

                    <div className='h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-neutral-100 flex items-center justify-center'>
                      <div className='w-28 h-28 sm:w-32 sm:h-32 rounded flex items-center justify-center'>
                        <div className='flex items-center justify-center gap-1 sm:gap-2'>
                          <div className='h-16 w-12 sm:h-20 sm:w-16 bg-neutral-800 rounded-xl flex items-end justify-center pb-2 '>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-500 flex items-center justify-center '>
                              <ListCheck size={32} className='text-white' />
                            </div>
                          </div>
                          <div className='h-16 w-12 sm:h-20 sm:w-16 bg-neutral-800 rounded-xl flex items-end justify-center pb-2'>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-500 flex items-center justify-center mb-5'>
                              <Clock8 size={32} className='text-white' />
                            </div>
                          </div>
                          <div className='h-16 w-12 sm:h-20 sm:w-16 bg-neutral-800 rounded-xl flex items-end justify-center pb-2'>
                            <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500 flex items-center justify-center animate-pulse'>
                              <ChartLine size={32} className='text-white' />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='absolute -right-14 sm:-right-16 bottom-4'>
                      <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-100 flex items-center justify-center'>
                        <div className='w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-blue-400'></div>
                      </div>
                    </div>
                  </div>
                )}

                {currentScreen === 2 && (
                  <div className='relative w-full'>
                    <div className='flex flex-col items-start w-full max-w-xs mx-auto gap-3 sm:gap-4 text-sm  text-neutral-500'>
                      <div className='w-full bg-neutral-100 text-neutral-500 rounded-xl p-3 flex items-center transform transition-all hover:scale-105 duration-300'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500 flex items-center justify-center mr-3'>
                          <QrCode size={18} className='text-white' />
                        </div>
                        <div className='flex-1'>
                          <span>Generate dynamic QR Code</span>
                        </div>
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${screens[currentScreen].bgColor} flex items-center justify-center ml-2 `}
                        >
                          <Check size={14} className='text-white' />
                        </div>
                      </div>

                      <div className='w-full bg-neutral-100 text-neutral-500 rounded-xl p-3 flex items-center transform transition-all hover:scale-105 duration-300'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500 flex items-center justify-center mr-3'>
                          <Users size={18} className='text-white' />
                        </div>
                        <div className='flex-1'>
                          <span>View attendance record</span>
                        </div>
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${screens[currentScreen].bgColor} flex items-center justify-center ml-2`}
                        >
                          <Check size={14} className='text-white' />
                        </div>
                      </div>

                      <div className='w-full bg-neutral-100 text-neutral-500 rounded-xl p-3 flex items-center transform transition-all hover:scale-105 duration-300'>
                        <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-600 flex items-center justify-center mr-3'>
                          <Calendar size={32} className='text-white' />
                        </div>
                        <div className='flex-1'>
                          <span>Real-time attendance trend</span>
                        </div>
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${screens[currentScreen].bgColor} flex items-center justify-center ml-2`}
                        >
                          <Check size={14} className='text-white' />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text content */}
              <div className='mb-8 sm:mb-16'>
                <h2 className='text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 whitespace-pre-line'>
                  {screens[currentScreen].title}
                </h2>
                <p className='text-sm sm:text-base text-neutral-500 mb-6'>
                  {screens[currentScreen].description}
                </p>
              </div>
            </div>
          </div>

          {/* Pagination indicator */}
          <div className='flex justify-center mb-4 sm:mb-6'>
            {screens.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 mx-1 rounded-full cursor-pointer transition-all duration-300 ${
                  currentScreen === index
                    ? 'bg-green-600 w-4'
                    : 'bg-neutral-200 hover:bg-neutral-300'
                }`}
                onClick={() => goToScreen(index)}
              />
            ))}
          </div>

          {/* Button */}
          <div className='mb-6 sm:mb-8'>
            <Button
              onClick={handleNext}
              className={`w-full py-3 rounded-full flex items-center justify-center ${screens[currentScreen].bgColor} text-white transform transition-all duration-300 hover:brightness-110 hover:shadow-lg active:scale-95`}
            >
              {currentScreen < 2 ? 'Next' : 'Get Started'}
              <ArrowRightCircle size={16} className='ml-2 animate-pulse' />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SplashScreen;
