import { Award, BookOpen, CheckCircle2, Radio, Users } from "lucide-react";

/**
 * Decorative hero artwork: a stylised BGSB LMS workspace in the portal's
 * Atlassian palette (blue rail, grey sidebar, cards, chart, progress).
 */
export function HeroIllustration() {
  const bars = [38, 55, 46, 70, 62, 84, 76];
  const courses = [
    ["Business & Management", 72, "bg-[#0052CC]"],
    ["Data Science & AI", 48, "bg-[#6554C0]"],
    ["Accounting & Finance", 90, "bg-[#36B37E]"],
  ] as const;
  return (
    <div
      role="img"
      aria-label="Preview of the BGSB LMS learning workspace"
      className="ds-hero-art relative select-none"
    >
      <div className="relative flex aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-[0_20px_32px_-8px_rgba(9,30,66,0.25),0_0_1px_rgba(9,30,66,0.31)]">
        {/* Global rail */}
        <div className="flex w-[9%] flex-col items-center gap-[6%] bg-[#0747A6] py-[4%]">
          <span className="aspect-square w-[60%] rounded-[3px] bg-white" />
          <span className="aspect-square w-[42%] rounded-full bg-white/25" />
          <span className="aspect-square w-[42%] rounded-full bg-white/25" />
          <span className="mt-auto aspect-square w-[48%] rounded-full bg-[#FF8B00]" />
        </div>
        {/* Sidebar */}
        <div className="hidden w-[24%] flex-col gap-[5%] bg-[#F4F5F7] px-[3%] py-[4%] sm:flex">
          <span className="h-2 w-3/4 rounded-full bg-[#172B4D]/70" />
          <span className="h-1.5 w-1/2 rounded-full bg-[#97A0AF]" />
          <div className="mt-[8%] space-y-[10%]">
            {[1, 0, 0, 0, 0].map((on, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 rounded-[3px] px-1.5 py-1 ${on ? "bg-[#EBECF0]" : ""}`}
              >
                <span className={`size-2.5 rounded-[2px] ${on ? "bg-[#0052CC]" : "bg-[#97A0AF]"}`} />
                <span className={`h-1.5 flex-1 rounded-full ${on ? "bg-[#0052CC]" : "bg-[#C1C7D0]"}`} />
              </div>
            ))}
          </div>
        </div>
        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col gap-[4%] p-[4%]">
          <div className="flex items-center justify-between">
            <span className="h-2.5 w-2/5 rounded-full bg-[#172B4D]" />
            <span className="h-4 w-[18%] rounded-[3px] bg-[#0052CC]" />
          </div>
          <div className="grid grid-cols-3 gap-[4%]">
            {[
              [Users, "1,248", "text-[#0052CC] bg-[#DEEBFF]"],
              [BookOpen, "38", "text-[#403294] bg-[#EAE6FF]"],
              [Award, "86%", "text-[#006644] bg-[#E3FCEF]"],
            ].map(([Icon, value, tone], i) => {
              const I = Icon as typeof Users;
              return (
                <div key={i} className="rounded-[3px] border border-[#DFE1E6] p-[8%]">
                  <span className={`grid size-5 place-items-center rounded-[3px] ${tone as string}`}>
                    <I className="size-3" />
                  </span>
                  <b className="mt-1.5 block text-[clamp(10px,1.6vw,18px)] font-bold leading-none text-[#172B4D]">
                    {value as string}
                  </b>
                </div>
              );
            })}
          </div>
          <div className="grid flex-1 grid-cols-5 gap-[4%]">
            <div className="col-span-3 flex flex-col rounded-[3px] border border-[#DFE1E6] p-[5%]">
              <span className="h-1.5 w-1/3 rounded-full bg-[#42526E]" />
              <div className="mt-auto flex h-[70%] items-end gap-[6%]">
                {bars.map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-t-[2px] ${i === bars.length - 2 ? "bg-[#0052CC]" : "bg-[#B3D4FF]"}`}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-2 flex flex-col justify-between gap-1.5 rounded-[3px] border border-[#DFE1E6] p-[6%]">
              {courses.map(([name, value, tone]) => (
                <div key={name}>
                  <span className="block truncate text-[clamp(7px,0.85vw,10px)] font-medium text-[#42526E]">
                    {name}
                  </span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#EBECF0]">
                    <span style={{ width: `${value}%` }} className={`block h-full rounded-full ${tone}`} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating flags */}
      <div className="absolute -bottom-5 -left-3 flex items-center gap-2.5 rounded-[3px] bg-white px-3 py-2.5 shadow-[0_8px_12px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.31)] sm:-left-6">
        <CheckCircle2 className="size-5 fill-[#36B37E] text-white" />
        <span className="text-xs font-semibold text-[#172B4D] sm:text-sm">Certificate earned</span>
      </div>
      <div className="absolute -right-3 top-[34%] flex items-center gap-2 rounded-[3px] bg-white px-3 py-2 shadow-[0_8px_12px_rgba(9,30,66,0.15),0_0_1px_rgba(9,30,66,0.31)] sm:-right-6">
        <span className="grid size-6 place-items-center rounded-full bg-[#FFEBE6] text-[#DE350B]">
          <Radio className="size-3.5" />
        </span>
        <span className="text-xs font-semibold text-[#172B4D]">
          Live class <span className="font-normal text-[#6B778C]">· 10:00</span>
        </span>
      </div>
    </div>
  );
}
