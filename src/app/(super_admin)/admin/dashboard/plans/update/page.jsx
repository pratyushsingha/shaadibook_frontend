"use client";

import { useSearchParams } from "next/navigation";
import PlanUpdateForm from "../../../../../../components/forms/updatePlanForm";
import { Button } from "../../../../../../components/ui/button";
import Link from "next/link";

const page = () => {
  const searchParams = useSearchParams();
  const planId = searchParams.get("id");
  console.log(planId);
  return (
    <section className="mx-5 my-10">
      <div className="flex space-x-3">
        <Link href="/admin/dashboard/plans">
          <Button>Back</Button>
        </Link>
        <h2 className="text-2xl font-bold mb-5">
          update Plan <span className="font-extrabold ">{planId}</span>
        </h2>
      </div>
      <PlanUpdateForm planId={planId} />
    </section>
  );
};

export default page;
