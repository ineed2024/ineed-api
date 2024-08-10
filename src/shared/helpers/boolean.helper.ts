export function BooleanTransformHelper({ value }) {
  if (value === null) return null;

  return ['true', '1', true, 1].includes(value);
}
