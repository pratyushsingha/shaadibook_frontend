"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const referenceId = searchParams.get("reference");
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      clearTimeout(confettiTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f7fa] flex flex-col">
      {showConfetti && (
        <div className="fixed inset-0 z-50">
          <Confetti
            width={dimensions.width}
            height={dimensions.height}
            recycle={true}
            numberOfPieces={200}
          />
        </div>
      )}
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="mb-8">
            <div className="w-20 h-20 bg-[#663399] rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Your eAlbum credits have been added successfully.
          </p>

          <div className="bg-[#f8f7fa] rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Reference ID
            </h3>
            <p className="text-lg font-mono text-[#663399] break-all">
              {referenceId}
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              href="/"
              className="bg-[#663399] hover:bg-[#7a4bac] text-white font-semibold py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#663399] focus:ring-opacity-50"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
