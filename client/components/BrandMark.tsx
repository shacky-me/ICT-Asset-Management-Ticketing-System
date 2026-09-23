import Image from "next/image";
import CoatOfArms from "@/app/assets/COA.svg";

type Props = {
  variant?: "inline" | "stacked";
};

// Coat of arms plus live text, so the wordmark uses the app font.
export default function BrandMark({ variant = "inline" }: Props) {
  if (variant === "stacked") {
    return (
      <div className="flex items-center gap-2">
        <Image
          src={CoatOfArms}
          alt="Coat of Arms of Kenya"
          className="h-10 w-10 shrink-0"
        />
        <div className="leading-tight">
          <p className="text-base font-bold tracking-wide text-slate-900">
            SDJHRCA
          </p>
          <p className="text-xs text-slate-500">ICT Department</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src={CoatOfArms}
        alt="Coat of Arms of Kenya"
        className="h-9 w-9 shrink-0"
      />
      <p className="text-base font-bold tracking-wide text-slate-900">
        SDJHRCA
        <span className="mx-2 font-normal text-slate-300">|</span>
        <span className="font-semibold text-slate-700">ICT Department</span>
      </p>
    </div>
  );
}
