// Parse ?page & ?limit query params into safe, bounded values.
const parsePageParams = (req, { defaultLimit = 20, maxLimit = 50 } = {}) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(req.query.limit, 10) || defaultLimit)
  );
  return { page, limit, skip: (page - 1) * limit };
};

// Standard paginated envelope: { data, page, limit, total, hasMore }.
const paginated = (data, total, page, limit) => ({
  data,
  page,
  limit,
  total,
  hasMore: (page - 1) * limit + data.length < total,
});

module.exports = { parsePageParams, paginated };
