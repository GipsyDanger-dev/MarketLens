import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { researchProjectInputSchema } from "../core/research-project";

vi.mock("server-only", () => ({}));

const describeDatabase =
  process.env.RUN_DATABASE_TESTS === "true" ? describe : describe.skip;

describeDatabase("research project persistence", () => {
  let createResearchProject: typeof import("./research-project-repository").createResearchProject;
  let deleteResearchProject: typeof import("./research-project-repository").deleteResearchProject;
  let getResearchProject: typeof import("./research-project-repository").getResearchProject;
  let prisma: typeof import("./prisma").prisma;
  let projectId: string | undefined;
  afterEach(() => vi.unstubAllEnvs());

  beforeAll(async () => {
    ({ createResearchProject, deleteResearchProject, getResearchProject } =
      await import("./research-project-repository"));
    ({ prisma } = await import("./prisma"));
  });

  afterAll(async () => {
    if (projectId) {
      await prisma.researchProject
        .delete({ where: { id: projectId } })
        .catch(() => undefined);
    }

    await prisma.$disconnect();
  });

  it("creates, loads, and deletes a research project", async () => {
    const created = await createResearchProject(
      researchProjectInputSchema.parse({
        name: "Coffee shops in Jakarta",
        providerId: "openstreetmap",
        query: "coffee shop",
        locationQuery: "Jakarta, Indonesia",
        latitude: -6.2088,
        longitude: 106.8456,
        radiusMeters: 5_000,
      }),
    );
    projectId = created.id;

    expect(created.status).toBe("DRAFT");
    expect(created.maxResults).toBe(250);

    await expect(getResearchProject(created.id)).resolves.toMatchObject({
      id: created.id,
      providerId: "openstreetmap",
      query: "coffee shop",
    });

    await expect(deleteResearchProject(created.id)).resolves.toMatchObject({
      id: created.id,
    });
    projectId = undefined;
    await expect(getResearchProject(created.id)).resolves.toBeNull();
  });

  it("persists the operator cap even when a client requests more", async () => {
    vi.stubEnv("MAX_RESEARCH_RESULTS", "7");
    const created = await createResearchProject(
      researchProjectInputSchema.parse({
        name: "Bounded study",
        providerId: "openstreetmap",
        query: "cafe",
        locationQuery: "Jakarta",
        latitude: -6.2,
        longitude: 106.8,
        radiusMeters: 1000,
        maxResults: 1000,
      }),
    );
    projectId = created.id;
    expect(created.maxResults).toBe(7);
    await deleteResearchProject(created.id);
    projectId = undefined;
  });
});
