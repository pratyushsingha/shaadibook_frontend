"use client";

import { Check, Sparkles, Star, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const pricingTiers = [
  {
    category: "Basic",
    description: "Only Photos",
    icon: Star,
    plans: [
      {
        price: 1000,
        deposit: 5000,
        features: ["500 Photos Upload"],
      },
      {
        price: 2000,
        features: ["Unlimited Photos Upload"],
      },
      {
        price: 3500,
        popular: true,
        features: [
          "Unlimited Photos Upload",
          "100 Face Recognition",
          "Portfolio Images - 50",
        ],
      },
    ],
  },
  {
    category: "Pro",
    icon: Sparkles,
    plans: [
      {
        price: 5400,
        duration: "3 Months",
        features: [
          "Unlimited Events",
          "Unlimited Photos Upload",
          "QR Code Design",
          "E-Album",
          "Album Photo Selection",
        ],
      },
      {
        price: 9600,
        duration: "6 Months",
        popular: true,
        features: [
          "Unlimited Events",
          "Unlimited Photos Upload",
          "QR Code Design",
          "E-Album",
          "Album Photo Selection",
        ],
      },
      {
        price: 18000,
        duration: "1 Year",
        features: [
          "Unlimited Events",
          "Unlimited Photos Upload",
          "QR Code Design",
          "E-Album",
          "Album Photo Selection",
        ],
      },
    ],
  },
  {
    category: "Advance",
    icon: Crown,
    plans: [
      {
        price: 8500,
        duration: "3 Months",
        features: [
          "Unlimited Events",
          "Unlimited Photos Upload",
          "Face Recognition",
          "QR Code Design",
          "E-Album",
          "Photos Selection",
          "High Quality Photos Download",
        ],
      },
      {
        price: 16000,
        duration: "6 Months",
        features: [
          "Unlimited Events",
          "Unlimited Photos Upload",
          "Face Recognition",
          "QR Code Design",
          "E-Album",
          "Photos Selection",
          "High Quality Photos Download",
        ],
      },
      {
        price: 30000,
        duration: "1 Year",
        popular: true,
        features: [
          "Unlimited Events",
          "Unlimited Photos Upload",
          "Face Recognition",
          "QR Code Design",
          "E-Album",
          "Photos Selection",
          "High Quality Photos Download",
        ],
      },
    ],
  },
];

export default function BuyCreditsModal() {
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
          {pricingTiers.map((tier) => (
            <div key={tier.category} className="space-y-4">
              <div className="flex items-center gap-3 pb-2">
                <tier.icon className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {tier.category}
                </h2>
                {tier.description && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-800"
                  >
                    {tier.description}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tier.plans.map((plan, index) => (
                  <Card
                    key={index}
                    className={`border-2 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      plan.popular
                        ? "border-purple-400 shadow-md"
                        : "hover:border-purple-200"
                    }`}
                  >
                    {plan.popular && (
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
                          {plan.duration && (
                            <p className="text-center text-gray-600 font-medium">
                              {plan.duration}
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
                        className={`w-full shadow-sm ${
                          plan.popular
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                            : "bg-white text-white border-2 border-purple-600 hover:bg-purple-50"
                        }`}
                      >
                        Select Plan
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
