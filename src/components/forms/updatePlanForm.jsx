import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePlan from "../../store/usePlan";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/loader/Loader";

const PlanUpdateForm = ({ planId }) => {
  const { toast } = useToast();
  const {
    getPlanDetailsById,
    planDetailsLoading,
    updatePlan,
    updatePlanLoading,
    plan,
  } = usePlan();

  const form = useForm({
    defaultValues: {
      name: plan?.name || "",
      features: Array.isArray(plan?.features)
        ? plan.features.map((feature) => ({ value: feature }))
        : [{ value: "" }],
      status: plan?.status || "ACTIVE",
      isPopular: plan?.isPopular || false,
      price: plan?.price || 0,
      duration: plan?.duration || 0,
      cashfreePlanId: plan?.cashfree_plan_id || "",
      type: plan?.type || "BASIC",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  const handleSubmit = async (data) => {
    const response = await updatePlan(planId, {
      ...data,
      features: data.features.map((feature) => feature.value),
    });
    if (response) {
      toast({
        title: "Plan updated successfully",
      });
    }
  };

  useEffect(() => {
    getPlanDetailsById(planId);
  }, [planId, getPlanDetailsById]);

  if (planDetailsLoading) return <Loader />;
  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Update Plan {plan.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
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

            <FormField
              control={form.control}
              name="features"
              render={() => (
                <FormItem>
                  <FormLabel>Features</FormLabel>
                  <FormDescription>
                    Enter each feature on a new line
                  </FormDescription>
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <FormControl>
                        <Input
                          placeholder="Enter feature"
                          {...form.register(`features.${index}.value`)}
                          defaultValue={item.value}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        className="ml-2 bg-red-500 text-white"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => append({ value: "" })}
                    className="mt-2 w-full"
                  >
                    Add Feature
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plan status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input disabled placeholder="Enter plan price" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (in days)</FormLabel>
                  <FormControl>
                    <Input disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cashfreePlanId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cashfree Plan Id</FormLabel>
                  <FormControl>
                    <Input disabled {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      Mark this plan as popular to highlight it to users
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button
              disabled={updatePlanLoading}
              type="submit"
              className="w-full"
            >
              {updatePlanLoading && <Loader2 className="animate-spin" />}
              Update Plan
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PlanUpdateForm;
