export const parsePagination = (query = {}, options = {}) => {
  const defaultPage = Number(options.defaultPage) > 0 ? Number(options.defaultPage) : 1;
  const defaultLimit = Number(options.defaultLimit) > 0 ? Number(options.defaultLimit) : 10;
  const maxLimit = Number(options.maxLimit) > 0 ? Number(options.maxLimit) : 100;

  const hasPageParam = query.page !== undefined;
  const hasLimitParam = query.limit !== undefined;
  const isPaginated = hasPageParam || hasLimitParam;

  const page = Math.max(Number(query.page) || defaultPage, 1);
  const limit = Math.min(Math.max(Number(query.limit) || defaultLimit, 1), maxLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip, isPaginated };
};

export const buildPaginationMeta = ({ total, page, limit, isPaginated }) => {
  if (!isPaginated) {
    return {
      total,
      page: 1,
      limit: total,
      totalPages: total > 0 ? 1 : 0,
    };
  }

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
