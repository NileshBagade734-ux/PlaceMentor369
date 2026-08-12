import { paginateQuery } from "../utils/pagination.js";

describe("Pagination Utility", () => {
  test("paginateQuery correctly formats metadata with mock model", async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    const mockModel = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockData),
      countDocuments: jest.fn().mockResolvedValue(25)
    };

    const result = await paginateQuery(mockModel, { status: "approved" }, { page: 2, limit: 10 });

    expect(result.data).toEqual(mockData);
    expect(result.pagination.totalDocs).toBe(25);
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPrevPage).toBe(true);
  });
});
