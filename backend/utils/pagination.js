/**
 * Reusable Mongoose pagination and limit/offset query builder.
 *
 * @param {Object} model - Mongoose Model
 * @param {Object} query - Filter object
 * @param {Object} options - { page: 1, limit: 10, sort: { createdAt: -1 }, populate: "" }
 */
export async function paginateQuery(model, query = {}, options = {}) {
  const page = Math.max(1, parseInt(options.page || 1, 10));
  const limit = Math.min(100, Math.max(1, parseInt(options.limit || 10, 10)));
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  let reqQuery = model.find(query).sort(sort).skip(skip).limit(limit);

  if (options.populate) {
    reqQuery = reqQuery.populate(options.populate);
  }

  const [data, totalDocs] = await Promise.all([
    reqQuery.exec(),
    model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalDocs / limit);

  return {
    data,
    pagination: {
      totalDocs,
      totalPages,
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}
