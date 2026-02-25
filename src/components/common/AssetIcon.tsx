import Image, { StaticImageData } from "next/image";

export const AssetIcon = ({
  icon,
  name,
  size = "20px",
}: {
  icon: string | StaticImageData;
  name: string;
  size?: string;
}) => {
  return (
    <div
      className={`w-[${size}] h-[${size}] bg-tertiary rounded-full overflow-hidden`}
    >
      <Image
        src={icon}
        alt={name}
        width={0}
        height={0}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
