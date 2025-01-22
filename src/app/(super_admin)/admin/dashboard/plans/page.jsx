"use client";
import React, { useEffect } from "react";
import { DataTable } from "../../../../../components/tables/data-table";
import usePlan from "../../../../../store/usePlan";
import { planColumns } from "../../../../../components/tables/plans/planColumns";
import Loader from "@/components/loader/Loader";
const Page = () => {
  const { getAllPlans, loading, error, plans } = usePlan();

  useEffect(() => {
    getAllPlans();
  }, [getAllPlans]);

  return (
    <div className="container mx-auto my-5 p-5 bg-white rounded shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Plans</h2>
      {loading && <Loader />}
      {error && <Alert type="error" message={error.message} />}
      {!loading && !error && plans.length === 0 && (
        <p className="text-gray-500">No plans available.</p>
      )}
      {!loading && !error && plans.length > 0 && (
        <DataTable columns={planColumns} data={plans} createBtnTxt={true} />
      )}
    </div>
  );
};

export default Page;
