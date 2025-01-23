"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";

const PaymentCallbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = searchParams.get("order_id");

    console.log(orderId);

    if (!orderId) {
      console.error("Missing order details");
      router.push("/payment/failure");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await api.post("/payment/verify-payment", {
          order_id: orderId,
        });

        console.log(response);
        if (response.data.success) {
          console.log(response.data);
          router.push("/payment/success");
        } else {
          console.log(response.data);
          router.push("/payment/failure");
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        router.push("/payment/failure");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return <div>Processing payment...</div>;
};

const PaymentCallback = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
};

export default PaymentCallback;