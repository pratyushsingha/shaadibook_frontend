"use client";

import { Suspense } from "react"; // Import Suspense
import { useSearchParams } from "next/navigation";
import PlanUpdateForm from "../../../../../../components/forms/updatePlanForm";
import { Button } from "../../../../../../components/ui/button";
import Link from "next/link";

const UpdatePlanContent = () => {
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
          Update Plan <span className="font-extrabold ">{planId}</span>
        </h2>
      </div>
      <PlanUpdateForm planId={planId} />
    </section>
  );
};

const UpdatePlanPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePlanContent />
    </Suspense>
  );
};

export default UpdatePlanPage;