export interface CheerioConfig {
  xmlMode: boolean;
  quirksMode: boolean;
  baseURI: string | null;
  trimText: boolean;
  maxElements: number;
}

export const cheerioConfig: CheerioConfig = {
  xmlMode: false,
  quirksMode: false,
  baseURI: process.env.PAGEFORGEX_BASE_URI ?? null,
  trimText: true,
  maxElements: 20_000,
};
