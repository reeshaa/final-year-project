import SwitchTheme from "@/components/SwitchTheme";
import { useReadLocalStorage } from "usehooks-ts";

export function Navbar(): JSX.Element {
  const theme = useReadLocalStorage<string>("theme");

  return (
    <div className="flex justify-between w-full p-2">
      <div className="flex flex-row items-center justify-center mx-4">
        <a className="flex flex-row items-start justify-center" href="/">
          <img
            src={
              theme === "night"
                ? "/images/rit-white.png"
                : "/images/rit-cropped.png"
            }
            alt="RIT Logo"
            className="h-14"
          />
        </a>
      </div>
      <SwitchTheme />
    </div>
  );
}
