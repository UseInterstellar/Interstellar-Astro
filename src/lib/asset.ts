export const ASSET_URL =
  "https://raw.githubusercontent.com/UseInterstellar/Interstellar-Assets/main";

export type Asset = {
  name: string;
  image: string;
  link?: string;
  links?: { name: string; url: string }[];
  say?: string;
  custom?: boolean;
  partial?: boolean | string;
  error?: boolean | string;
  blank?: boolean | string;
};
