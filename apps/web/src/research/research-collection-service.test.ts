import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { researchProjectInputSchema } from "../core/research-project";
import { ProviderRegistry } from "../providers/registry";
import type { PlaceProvider } from "../providers/types";

vi.mock("server-only", () => ({}));

const describeDatabase =
  process.env.RUN_DATABASE_TESTS === "true" ? describe : describe.skip;

const candidate = {
  providerId: "test-provider",
  externalId: "node/42",
  name: "  Kopi Kità ",
  category: "Coffee Shop",
  providerTypes: ["amenity:cafe"],
  address: " Jl. Kemang No. 10 ",
  city: "Jakarta",
  district: null,
  country: "ID",
  latitude: -6.2000004,
  longitude: 106.7999996,
  phone: null,
  website: null,
  sourceUrl: "https://example.test/node/42",
  businessStatus: null,
  collectedAt: new Date("2026-08-27T00:00:00.000Z"),
  rawData: { id: 42 },
};

describeDatabase("research collection service", () => {
  let createResearchProject: typeof import("../lib/research-project-repository").createResearchProject;
  let deleteResearchProject: typeof import("../lib/research-project-repository").deleteResearchProject;
  let prisma: typeof import("../lib/prisma").prisma;
  let getResearchDataQuality: typeof import("../lib/research-collection-repository").getResearchDataQuality;
  let runResearchCollection: typeof import("./research-collection-service").runResearchCollection;
  let retryResearchCollection: typeof import("./research-collection-service").retryResearchCollection;
  const projectIds: string[] = [];

  beforeAll(async () => {
    ({ createResearchProject, deleteResearchProject } =
      await import("../lib/research-project-repository"));
    ({ prisma } = await import("../lib/prisma"));
    ({ getResearchDataQuality } =
      await import("../lib/research-collection-repository"));
    ({ runResearchCollection, retryResearchCollection } =
      await import("./research-collection-service"));
  });

  afterAll(async () => {
    await Promise.all(
      projectIds.map((id) => deleteResearchProject(id).catch(() => undefined)),
    );
    await prisma.$disconnect();
  });

  it("persists candidates and upserts repeated collection runs", async () => {
    const project = await createProject(createResearchProject, "test-provider");
    projectIds.push(project.id);
    const registry = registryFor({
      search: async () => ({ places: [candidate] }),
    });

    await expect(
      runResearchCollection(project.id, { registry }),
    ).resolves.toMatchObject({
      projectStatus: "READY",
      jobStatus: "READY",
      totalDiscovered: 1,
      totalProcessed: 1,
      totalFailed: 0,
      progress: 100,
    });
    await retryResearchCollection(project.id, { registry });

    await expect(
      prisma.researchProject.findUniqueOrThrow({
        where: { id: project.id },
        include: { places: { include: { snapshots: true } }, jobs: true },
      }),
    ).resolves.toMatchObject({
      status: "READY",
      places: [
        {
          externalId: "node/42",
          name: "Kopi Kità",
          normalizedName: "kopi kita",
          category: "cafe",
          address: "jalan kemang nomor 10",
          latitude: -6.2,
          longitude: 106.8,
          snapshots: [{}, {}],
        },
      ],
      jobs: [{ status: "READY" }, { status: "READY" }],
    });
    await expect(getResearchDataQuality(project.id)).resolves.toMatchObject({
      totalPlaces: 1,
      completeRecords: 1,
      duplicatePrimaryIdentities: 0,
      fieldCompletenessPercent: 67,
      recordCompletenessPercent: 100,
    });
  });

  it("records a provider failure and permits an explicit retry", async () => {
    const project = await createProject(createResearchProject, "test-provider");
    projectIds.push(project.id);
    const search = vi
      .fn<PlaceProvider["search"]>()
      .mockRejectedValueOnce(new Error("provider unavailable"))
      .mockResolvedValueOnce({ places: [candidate] });
    const registry = registryFor({ search });

    await expect(
      runResearchCollection(project.id, { registry }),
    ).resolves.toMatchObject({
      projectStatus: "FAILED",
      jobStatus: "FAILED",
      error: "provider unavailable",
    });
    await expect(
      retryResearchCollection(project.id, { registry }),
    ).resolves.toMatchObject({
      projectStatus: "READY",
      jobStatus: "READY",
      totalProcessed: 1,
    });
  });
});

async function createProject(
  create: typeof import("../lib/research-project-repository").createResearchProject,
  providerId: string,
) {
  return create(
    researchProjectInputSchema.parse({
      name: "Coffee shops in Jakarta",
      providerId,
      query: "coffee shop",
      locationQuery: "Jakarta, Indonesia",
      latitude: -6.2088,
      longitude: 106.8456,
      radiusMeters: 5_000,
    }),
  );
}

function registryFor(
  overrides: Pick<PlaceProvider, "search">,
): ProviderRegistry {
  const registry = new ProviderRegistry();
  registry.register({
    id: "test-provider",
    name: "Test Provider",
    capabilities: {
      textSearch: true,
      nearbySearch: true,
      details: false,
      ratings: false,
      reviewCounts: false,
      phone: false,
      website: false,
      openingHours: false,
    },
    ...overrides,
  });

  return registry;
}
