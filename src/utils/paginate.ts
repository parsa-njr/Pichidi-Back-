import { Request } from "express";
import { Model, Document } from "mongoose";

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    first_page_url: string;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    links: PaginationLink[];
  } | null;
}

interface PaginateOptions {
  searchFilter?: Record<string, any>;
  sort?: Record<string, 1 | -1>;
  populate?: string | string[];
  baseFilter?: Record<string, any>;
}

/**
 * Generic paginate function for Mongoose models
 */
const paginate = async <T extends Document>(
  req: Request,
  model: Model<T>,
  options: PaginateOptions = {}
): Promise<PaginationResult<T>> => {
  const { searchFilter = {}, sort = { createdAt: -1 }, populate = "", baseFilter = {} } = options;

  const combinedFilter = { ...baseFilter, ...searchFilter };

  const page = parseInt(req.query.page as string) || 1;
  const perPage = parseInt(req.query.per_page as string) || 10;
  const skip = (page - 1) * perPage;

  // If no pagination requested, return all results
  if (!req.query.page && !req.query.per_page) {
    let query = model.find(combinedFilter).sort(sort);
    if (populate) query = query.populate(populate);
    const all = await query.lean();
    return { data: all, pagination: null };
  }

  const total = await model.countDocuments(combinedFilter);

  let query = model.find(combinedFilter).sort(sort).skip(skip).limit(perPage);
  if (populate) query = query.populate(populate);

  const results = await query.lean();

  const lastPage = Math.ceil(total / perPage);

  const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}`;
  const createPageUrl = (p: number) => `${baseUrl}?page=${p}&per_page=${perPage}`;

  const links: PaginationLink[] = [];

  links.push({
    url: page > 1 ? createPageUrl(page - 1) : null,
    label: "&laquo; قبلی",
    active: false,
  });

  for (let i = 1; i <= lastPage; i++) {
    links.push({
      url: createPageUrl(i),
      label: `${i}`,
      active: i === page,
    });
  }

  links.push({
    url: page < lastPage ? createPageUrl(page + 1) : null,
    label: "بعدی &raquo;",
    active: false,
  });

  return {
    data: results,
    pagination: {
      current_page: page,
      per_page: perPage,
      total,
      from: skip + 1,
      to: skip + results.length,
      first_page_url: createPageUrl(1),
      last_page: lastPage,
      last_page_url: createPageUrl(lastPage),
      next_page_url: page < lastPage ? createPageUrl(page + 1) : null,
      prev_page_url: page > 1 ? createPageUrl(page - 1) : null,
      path: baseUrl,
      links,
    },
  };
};

export default paginate;
