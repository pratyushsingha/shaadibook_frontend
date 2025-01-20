"use client";
import { useEffect } from "react";
import ActionCard from "@/components/ActionCard";
import { Users, Wallet } from "lucide-react";
import { DataTable } from "../../../../components/tables/data-table";
import { subscriberColumns } from "../../../../components/tables/subscribers/subscriberColumn";
import useSubscription from "@/store/useSubscription";
import useAuth from "@/store/useAuth";

const page = () => {
  const {
    getAdminSubscriptionSummary,
    subscriptionSummaryLoader,
    subscriptionSummaryError,
    subscriptionSummary,
    getSubscriptionHistoryForSuperAdmin,
    subscriptionHistoryLoader,
    subscriptionHistoryError,
    subscriptionHistory,
  } = useSubscription();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getAdminSubscriptionSummary();
      getSubscriptionHistoryForSuperAdmin();
    }
  }, []);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-[#F8F9FA]">
      <div className="grid gap-4 md:grid-cols-6">
        {subscriptionSummary.paymentStats?.map((card, index) => (
          <ActionCard
            key={index}
            title={card.title}
            description={card.description}
            icon={<Wallet />}
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-8">
        {subscriptionSummary.userStats?.map((stat, index) => (
          <ActionCard
            key={index}
            title={stat.title}
            description={stat.description}
            icon={<Users />}
          />
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-bold">Subscribers</h2>
      </div>
      <DataTable columns={subscriberColumns} data={subscriptionHistory} />
    </div>
  );
};

export default page;
