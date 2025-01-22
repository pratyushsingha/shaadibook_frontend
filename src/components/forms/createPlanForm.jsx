import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import usePlan from "../../store/usePlan";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const createPlanSchema = z.object({
  name: z.string().min(1, {
    message: "Plan name is required.",
  }),
  features: z
    .array(
      z.string().min(1, {
        message: "Each feature must have at least 1 character.",
      })
    )
    .min(1, {
      message: "At least one feature is required.",
    }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Please enter a valid price.",
  }),
  type: z.enum(["BASIC", "PRO", "ADVANCE"], {
    required_error: "Please select a plan type.",
  }),
  interval: z.coerce.number().min(1, {
    message: "Interval must be at least 1.",
  }),
  intervalType: z.enum(["MONTH", "YEAR"], {
    required_error: "Please select an interval type.",
  }),
  isPopular: z.boolean().default(false),
  planType: z.enum(["PERIODIC", "ON_DEMAND"], {
    required_error: "Please select a plan type.",
  }),
});

export default function PlanForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { createPlan, loading, error } = usePlan();
  const form = useForm({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: "",
      features: [""],
      price: "",
      isPopular: false,
      planType: "PERIODIC",
      intervalType: "MONTH",
      interval: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const planType = form.watch("planType");

  const onSubmit = async (data) => {
    if (planType === "ON_DEMAND") {
      data = {
        ...data,
        interval: null,
        intervalType: null,
      };
    }
    const response = await createPlan(data);
    if (response) {
      toast({
        title: "Plan created successfully",
      });
      router.push("/admin/dashboard/plans");
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: error || "An error occurred",
      });
    }
  }, [error, toast]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter plan name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="planType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERIODIC">Recurring</SelectItem>
                        <SelectItem value="ON_DEMAND">One Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormItem>
              <FormLabel>Features</FormLabel>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <FormControl>
                    <Input
                      {...form.register(`features.${index}`)}
                      placeholder={`Feature ${index + 1}`}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}{" "}
              <Button
                type="button"
                variant="secondary"
                onClick={() => append("")}
              >
                Add Feature
              </Button>
              <FormMessage />
            </FormItem>
            {planType === "PERIODIC" && (
              <>
                <FormField
                  control={form.control}
                  name="interval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter interval"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intervalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MONTH">Month</SelectItem>
                          <SelectItem value="YEAR">Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="isPopular"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Popular Plan</FormLabel>
                    <FormDescription>
                      This plan will be highlighted to users
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="ADVANCE">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {loading && <Loader2 className="animate-spin" />}
              Create Plan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
