import { describe, expect, it } from "vitest";

import { businessDirectoryLines } from "./pdf";
import type { ResearchReport } from "./types";

const report = {
  places: [
    {
      name: "Kopi Kita",
      address: "Jl. Test 10",
      phone: "+62 341 123456",
      website: "https://kopikita.example",
      socialLinks: { instagram: "https://www.instagram.com/kopikita" },
    },
  ],
} as unknown as ResearchReport;

describe("businessDirectoryLines", () => {
  it("includes provider-supplied contact and social links", () => {
    expect(businessDirectoryLines(report)).toEqual([
      "Kopi Kita: Jl. Test 10 · +62 341 123456 · https://kopikita.example · https://www.instagram.com/kopikita",
    ]);
  });
});
