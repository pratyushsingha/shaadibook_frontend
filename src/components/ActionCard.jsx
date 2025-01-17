import { Card } from "@/components/ui/card";

const ActionCard = ({
  icon,
  title,
  description,
  descriptionBg = "text-gray-500",
}) => {
  return (
    <Card className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 border border-purple-500">
      <div className="rounded-full bg-purple-100 p-2">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className={`text-sm ${descriptionBg}`}>{description}</p>
      </div>
    </Card>
  );
};

export default ActionCard;
