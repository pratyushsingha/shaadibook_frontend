'use client'

import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const pricingTiers = [
    { name: "STARTER", price: 160, credits: 5, books: 5 },
    { name: "BUSINESS", price: 300, credits: 10, books: 10 },
    { name: "ULTIMATE", price: 1250, credits: 50, books: 50 },
    { name: "PREMIUM", price: 9000, credits: 500, books: 500 },
]

export default function BuyCreditsModal() {
    return (
        <DialogContent className="max-w-7xl max-h-max">
            <DialogHeader>
                <div className="flex items-center justify-between">
                    <DialogTitle>Buy Credits ( Credits are used to create eAlbum (ebook) project )</DialogTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
                <div className="flex gap-2 bg-purple-50 p-4 rounded-lg">
                    <Input
                        placeholder="Enter Coupon Code"
                        className="max-w-xs bg-white"
                    />
                    <Button variant="secondary" className="bg-purple-600 text-white hover:bg-purple-700">
                        Redeem
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4  bg-purple-50 p-4 rounded-lg px-28 ">
                    {pricingTiers.map((tier) => (
                        <Card key={tier.name} className="border-2">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-medium text-center">{tier.name}</h3>
                                        <div className="text-2xl font-bold text-center">
                                            Rs. {tier.price}
                                        </div>
                                    </div>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center">
                                            • {tier.credits} Credits ({tier.credits} eAlbum)
                                        </li>
                                        <li className="flex items-center">
                                            • Create {tier.books} eBook(s)/eAlbum
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full bg-purple-600 text-white hover:bg-purple-700">
                                    Buy
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2 text-sm text-gray-600 border-t pt-4">
                <p>Credit's will be deducted when you create ealbum(ebook) project.</p>
                <div className="flex items-center justify-between">
                    <button className="hover:underline">
                        - How credits will be deducted?
                    </button>
                    <button className="text-purple-600 hover:underline">
                        Refund Policy
                    </button>
                </div>
            </div>
        </DialogContent>
    )
}

