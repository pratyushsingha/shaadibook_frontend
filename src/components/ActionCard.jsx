import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ActionCard = ({
  icon,
  title,
  description,
  descriptionBg = "text-gray-500",
  href,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href); // Redirect programmatically
    }
  };

  const cardContent = (
    <Card
      className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 border border-purple-500 ${
        href ? "hover:shadow-md" : ""
      }`}
      onClick={handleClick}
    >
      <div className="rounded-full bg-purple-100 p-2">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className={`text-sm ${descriptionBg}`}>{description}</p>
      </div>
    </Card>
  );

  // Wrap the Card in a Link only if href is provided
  return href ? <Link href={href}>{cardContent}</Link> : cardContent;
};

export default ActionCard;