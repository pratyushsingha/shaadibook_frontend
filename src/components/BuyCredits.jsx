"use client";
import { useEffect, useState } from "react";

import { Check, Sparkles, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import usePlan from "@/store/usePlan";
import useAuth from "@/store/useAuth";
import { useToast } from "@/hooks/use-toast";
import { load } from "@cashfreepayments/cashfree-js";
import useSubscription from "../store/useSubscription";

export default function BuyCreditsModal({ setDialogOpen }) {
  const { toast } = useToast();
  const { plans, loading: paymentLoader, error, fetchActivePlans } = usePlan();
  const {
    createSubscription,
    loading: subscriptionLoader,
    error: subscriptionError,
  } = useSubscription();
  const { user, loading } = useAuth();
  const [planId, setPlanId] = useState("");

  const subscriptionHandler = async (e, planId) => {
    e.preventDefault();
    setDialogOpen((prev) => !prev);

    try {
      const subscription = await createSubscription(planId);
      console.log(subscription);
      const cashfree = window.Cashfree({
        mode: "sandbox",
      });
      if (subscription.isRecurring) {
        cashfree.subscriptionsCheckout({
          subsSessionId: subscription.session_id,
          redirectTarget: "_modal",
        });
      } else {
        cashfree.checkout({
          paymentSessionId: subscription.session_id,
          redirectTarget: "_self",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchActivePlans();
  }, []);

  if (loading) return <DialogContent>Loading...</DialogContent>;

  return (
    <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="text-2xl font-bold">
            Choose Your Perfect Plan
          </DialogTitle>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex gap-2 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg shadow-sm">
          <Input
            placeholder="Enter Coupon Code"
            className="max-w-xs bg-white"
          />
          <Button
            variant="secondary"
            className="bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
          >
            Redeem
          </Button>
        </div>

        <div className="space-y-12">
          {plans.map((tier) => (
            <div key={tier.category} className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                {tier.category === "Basic" ? (
                  <Star className="w-6 h-6 text-purple-600" />
                ) : tier.category === "Pro" ? (
                  <Sparkles className="w-6 h-6 text-purple-600" />
                ) : (
                  <Crown className="w-6 h-6 text-purple-600" />
                )}
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {tier.category}
                </h2>
                {tier.features && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    {tier.features}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tier.plans.map((plan, index) => (
                  <Card
                    key={index}
                    className={`border-2 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      plan.isPopular
                        ? "border-purple-400 shadow-md"
                        : "hover:border-purple-200"
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardContent className="pt-6 flex-grow">
                      <div className="h-full flex flex-col">
                        <div className="space-y-3">
                          <div className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            ₹{plan.price.toLocaleString()}
                          </div>
                          {plan.duration > 0 && (
                            <p className="text-center text-gray-600 font-medium">
                              {plan.duration === 30
                                ? "Monthly"
                                : plan.duration === 180
                                ? "Bi-Monthly"
                                : plan.duration === 90
                                ? "Quarterly"
                                : "Yearly"}{" "}
                              Plan
                            </p>
                          )}
                          {plan.deposit && (
                            <p className="text-center text-sm font-medium text-purple-600">
                              Min. Deposit: ₹{plan.deposit.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="flex-grow">
                          <ul className="space-y-3 text-sm mt-6">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-600">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="mt-auto pb-6">
                      <Button
                        disabled={paymentLoader}
                        onClick={(e) => subscriptionHandler(e, plan.id)}
                        className={`w-full shadow-sm ${
                          plan.isPopular
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            : "bg-white text-white border-2 border-purple-600 hover:bg-purple-50"
                        }`}
                      >
                        {planId === plan.id ? "Processing..." : "Buy Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-gray-600 border-t pt-4">
        <p>
          Choose the plan that best suits your needs. All plans include 24/7
          support.
        </p>
        <div className="flex items-center justify-between">
          <button className="hover:underline flex items-center gap-1">
            <span>View Plan Details</span>
          </button>
          <button className="text-purple-600 hover:underline">
            Refund Policy
          </button>
        </div>
      </div>
    </DialogContent>
  );
}
