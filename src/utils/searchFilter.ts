interface SearchFilter {
  $or: { [key: string]: { $regex: string; $options: string } }[];
}

/**
 * Creates a Mongoose $or search filter for multiple fields
 * @param search - search string
 * @param fields - array of field names to search
 * @returns Mongoose filter object
 */
export const searchFilter = (search = "", fields: string[] = []): Partial<SearchFilter> => {
  if (!search || !fields.length) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    })),
  };
};
